import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ApiException } from 'src/common/exceptions/api.exception';
import { PaperQuestionDto } from './dto/qa.dto';
import { PaperPermissionsDto } from './dto/paper-permission.dto';
import { QuestionTypeEnum } from './dto/question-type.enum';
import { AnswerSheetService } from 'src/answer-sheet/answer-sheet.service';
import { AnswerSheetCorrectAnswerType } from 'src/answer-sheet/dto/answer-sheet-correct-answer.dto';
import { Paper, PaperDocument } from './schema/paper.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Question,
  QuestionDocument,
} from 'src/question/schema/question.schema';
@Injectable()
export class PaperService {
  constructor(
    private _prisma: PrismaService,
    private _answerSheetService: AnswerSheetService,
    @InjectModel(Paper.name)
    private _paperModel: Model<Paper>,
    @InjectModel(Question.name)
    private _questionModel: Model<Question>,
  ) {}

  private _queryPaperPermissionWhere = (userId: number) => ({
    $or: [
      { userId },
      {
        $and: [
          { 'permissions.accessibleByUserIds': { $exists: true } },
          { 'permissions.accessibleByUserIds': { $in: [userId] } },
        ],
      },
      {
        $and: [
          { 'permissions.public': { $exists: true } },
          { 'permissions.public': true },
        ],
      },
    ],
  });

  async create(
    userId: number,
    { paperQuestions, permissions }: CreatePaperDto,
  ) {
    await this._validatePermissions(permissions);
    await this._validateQuestions(userId, paperQuestions);
    const data = { userId, paperQuestions, permissions };
    const paper = new this._paperModel(data);
    await paper.save();
    return paper;
  }

  findAll(userId: number) {
    const papers = this._paperModel
      .find(this._queryPaperPermissionWhere(userId), {
        permissions: 0,
      })
      .sort({
        _id: -1,
      })
      .exec();
    return papers;
  }

  async findOne(userId: number, id: mongoose.Types.ObjectId) {
    const paperRecord = await this._paperModel.findOne({
      ...this._queryPaperPermissionWhere(userId),
      _id: id,
    });
    if (!paperRecord) {
      throw new ApiException('Paper not found', HttpStatus.NOT_FOUND);
    }
    if (paperRecord.userId !== userId) {
      const { permissions: _, ...rest } = paperRecord;
      return rest;
    }
    return paperRecord;
  }

  async update(
    userId: number,
    id: mongoose.Types.ObjectId,
    { paperQuestions, permissions }: UpdatePaperDto,
  ) {
    const existingPaper: PaperDocument | null = await this._paperModel.findOne({
      _id: id,
      userId,
    });
    if (!existingPaper) {
      throw new ApiException('Paper not found', HttpStatus.NOT_FOUND);
    }
    await this._validatePermissions(permissions);
    await this._validateQuestions(userId, paperQuestions);

    const updateData: Partial<Paper> = {};
    if (paperQuestions !== undefined) {
      updateData.paperQuestions = paperQuestions;
    }
    if (permissions !== undefined) {
      updateData.permissions = permissions;
    }

    const paper = await this._paperModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true },
    );

    if (!paper) {
      throw new ApiException(
        'Paper update failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return paper;
  }

  remove(userId: number, id: mongoose.Types.ObjectId) {
    return this._paperModel.deleteMany({ _id: id, userId });
  }

  private async _validateQuestions(
    userId: number,
    paperQuestions: PaperQuestionDto[] | undefined,
  ) {
    if (!paperQuestions) return;
    const uniqueQuestionIds = new Set(paperQuestions.map((q) => q.questionId));
    const questions: QuestionDocument[] = await this._questionModel.find({
      userId,
      _id: { $in: [...uniqueQuestionIds] },
    });
    if (questions.length !== uniqueQuestionIds.size) {
      throw new ApiException(
        'Contains a question that does not exist or has no permissions',
        HttpStatus.BAD_REQUEST,
      );
    }

    const questionMap: Map<mongoose.Types.ObjectId, QuestionDocument> = new Map(
      questions.map((q) => [q._id, q]),
    );
    for (const { questionId, answerIds, correctAnswerIds } of paperQuestions) {
      const questionDocument = questionMap.get(questionId);
      if (!questionDocument) {
        continue;
      }
      if (
        !answerIds.every((answerId) => questionDocument.answers.has(answerId))
      ) {
        throw new ApiException(
          'Answer must belongs to the question',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (
        !correctAnswerIds.every((correctId) =>
          questionDocument.answers.has(correctId),
        )
      ) {
        throw new ApiException(
          'Correct answer must be in the answer list',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async _validatePermissions(permissions?: PaperPermissionsDto) {
    if (!permissions) return;
    if (permissions?.public) return;
    if (
      permissions?.accessibleByUserIds &&
      permissions.accessibleByUserIds.length > 0
    ) {
      const users = await this._prisma.userEntity.findMany({
        where: { id: { in: permissions.accessibleByUserIds } },
      });

      if (users.length !== permissions.accessibleByUserIds.length) {
        throw new ApiException(
          'One or more user IDs do not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async take(userId: number, id: mongoose.Types.ObjectId) {
    const paper: PaperDocument | null = await this._paperModel.findById(id);
    if (!paper) {
      throw new ApiException('Paper not found', HttpStatus.NOT_FOUND);
    }
    const { paperQuestions, permissions } = paper;
    if (permissions && paper.userId !== userId) {
      if (!permissions?.public) {
        if (permissions?.accessibleByUserIds) {
          if (!permissions.accessibleByUserIds.includes(userId)) {
            throw new ApiException('Paper not found', HttpStatus.NOT_FOUND);
          }
        }
      }
    }

    const questionsToTake: Record<string, any>[] = [];
    const paperAnswers: AnswerSheetCorrectAnswerType[] = [];

    let qaOrder = 0;
    for (const {
      questionId,
      questionType,
      score,
      answerIds,
      correctAnswerIds,
    } of paperQuestions) {
      qaOrder++;
      const questionToTake: Record<string, any> = {
        order: qaOrder,
        questionType,
      };
      const correctAnswers: AnswerSheetCorrectAnswerType = {
        order: qaOrder,
        questionId,
        questionType,
        score,
      };

      const question = await this._questionModel.findById(questionId);
      if (!question) {
        throw new ApiException('Question not found', HttpStatus.NOT_FOUND);
      }
      questionToTake.questionText = question.questionText;
      const answers = question.answers;

      const qaToTakeAnswers: any[] = [];
      switch (questionType) {
        case QuestionTypeEnum.SINGLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_CHOICE:
          for (const answerId of answerIds) {
            if (answers.has(answerId)) {
              const answerText = answers.get(answerId);
              qaToTakeAnswers.push({ id: answerId, answerText });
            }
          }
          questionToTake.answers = qaToTakeAnswers;
          correctAnswers.choiceAnswerIds = correctAnswerIds;
          break;
        case QuestionTypeEnum.FILL_IN_BLANK:
          for (const answerId of correctAnswerIds) {
            if (answers.has(answerId)) {
              const answerText = answers.get(answerId);
              qaToTakeAnswers.push(answerText);
            }
          }
          correctAnswers.fillInBlankAnswers = qaToTakeAnswers;
          break;
        case QuestionTypeEnum.TRUE_FALSE: // not support yet
          break;
      }

      questionsToTake.push(questionToTake);
      paperAnswers.push(correctAnswers);
    }

    const { id: answerSheetId } = await this._answerSheetService.create({
      userId,
      correctAnswers: paperAnswers,
    });
    return { questions: questionsToTake, answerSheetId };
  }
}
