import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { PaperQuestionDto } from './dto/paper-question.dto';
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
import { PaperQuestionDetailDto } from './dto/paper-question-detail.dto';
import { QuestionService } from 'src/question/question.service';
import { PaperStatus } from './dto/paper-status.enum';
import { shuffle } from 'src/shared/utils/array.utils';
@Injectable()
export class PaperService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionService: QuestionService,
    private readonly answerSheetService: AnswerSheetService,
    @InjectModel(Paper.name)
    private readonly paperModel: Model<Paper>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}

  private queryPaperPermissionWhere = (userId: number) => ({
    $or: [
      { userId },
      {
        $and: [
          { 'permissions.accessibleByUserIds': { $exists: true } },
          { 'permissions.accessibleByUserIds': { $in: [userId] } },
          { status: { $ne: PaperStatus.DRAFT } },
        ],
      },
      {
        $and: [
          { 'permissions.public': { $exists: true } },
          { 'permissions.public': true },
          { status: { $ne: PaperStatus.DRAFT } },
        ],
      },
    ],
  });

  async create(
    userId: number,
    {
      paperName,
      shuffleQuestions,
      paperQuestions,
      permissions,
    }: CreatePaperDto,
  ) {
    const session = await this.paperModel.db.startSession();

    try {
      session.startTransaction();

      await this.validatePermissions(permissions);
      await this.validateQuestions(userId, paperQuestions);

      const data = {
        userId,
        paperName,
        paperQuestions,
        permissions,
        shuffleQuestions,
      };
      const paper = new this.paperModel(data);
      await paper.save({ session });

      await this.questionService.updateStatusWhenAddedToPaper(
        session,
        paper._id,
        paperQuestions.map((q) => q.questionId),
      );

      await session.commitTransaction();
      return paper;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  findAll(userId: number) {
    const papers = this.paperModel
      .find(this.queryPaperPermissionWhere(userId), {
        permissions: 0,
      })
      .sort({
        _id: -1,
      })
      .exec();
    return papers;
  }

  async findOne(userId: number, id: mongoose.Types.ObjectId) {
    const paperRecord = await this.paperModel.findOne({
      ...this.queryPaperPermissionWhere(userId),
      _id: id,
    });

    if (!paperRecord) {
      throw new NotFoundException('Paper not found');
    }

    const paperQuestionDetails = await Promise.all(
      paperRecord.paperQuestions.map(async (question) => {
        const questionRecord = await this.questionModel.findOne({
          _id: question.questionId,
        });

        if (!questionRecord) {
          throw new NotFoundException('Question not found');
        }

        return {
          questionId: question.questionId,
          questionType: question.questionType,
          score: question.score,
          correctAnswerIds: question.correctAnswerIds,
          questionText: questionRecord.questionText,
          answers: Object.fromEntries(questionRecord.answers),
        } as PaperQuestionDetailDto;
      }),
    );

    const result = {
      ...paperRecord.toObject(),
      paperQuestions: paperQuestionDetails,
    };

    if (paperRecord.userId !== userId) {
      const { permissions, ...rest } = result;
      return rest;
    }
    return result;
  }

  async update(
    userId: number,
    id: mongoose.Types.ObjectId,
    {
      paperName,
      shuffleQuestions,
      paperQuestions,
      permissions,
      status,
    }: UpdatePaperDto,
  ) {
    const session = await this.paperModel.db.startSession();

    try {
      session.startTransaction();

      const existingPaper: PaperDocument | null = await this.paperModel.findOne(
        {
          _id: id,
          userId,
        },
        null,
        { session },
      );
      if (!existingPaper) {
        throw new NotFoundException('Paper not found');
      }
      if (
        existingPaper.status === PaperStatus.LOCKED &&
        (paperQuestions !== undefined || status !== undefined)
      ) {
        throw new ForbiddenException('Paper is locked');
      }

      await this.validatePermissions(permissions);
      await this.validateQuestions(userId, paperQuestions);

      if (paperName !== undefined) {
        existingPaper.paperName = paperName;
      }
      if (paperQuestions !== undefined) {
        await this.questionService.updateQuestionStatusForUpdatePaper(
          session,
          id,
          paperQuestions.map((q) => q.questionId),
          existingPaper.paperQuestions.map((q) => q.questionId),
        );
        existingPaper.paperQuestions = paperQuestions;
      }
      if (permissions !== undefined) {
        existingPaper.permissions = permissions;
      }
      if (shuffleQuestions !== undefined) {
        existingPaper.shuffleQuestions = shuffleQuestions;
      }
      if (status !== undefined) {
        existingPaper.status = status;
      }
      await existingPaper.save({ session });

      await session.commitTransaction();
      return existingPaper;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async remove(userId: number, id: mongoose.Types.ObjectId) {
    const session = await this.paperModel.db.startSession();
    session.startTransaction();
    try {
      const paper = await this.paperModel.findOne({ _id: id, userId }, null, {
        session,
      });
      if (!paper) {
        throw new NotFoundException('Paper not found');
      }
      await this.questionService.updateStatusWhenRemoveFromPaper(
        session,
        id,
        paper.paperQuestions.map((q) => q.questionId),
      );
      await paper.deleteOne({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async validateQuestions(
    userId: number,
    paperQuestions: PaperQuestionDto[] | undefined,
  ) {
    if (!paperQuestions) return;
    const uniqueQuestionIds = new Set(paperQuestions.map((q) => q.questionId));
    const questions: QuestionDocument[] = await this.questionModel.find({
      userId,
      _id: { $in: [...uniqueQuestionIds] },
    });
    if (questions.length !== uniqueQuestionIds.size) {
      throw new NotFoundException(
        'Contains a question that does not exist or has no permissions',
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
        throw new UnprocessableEntityException(
          'Answer must belongs to the question',
        );
      }
      if (
        !correctAnswerIds.every((correctId) =>
          questionDocument.answers.has(correctId),
        )
      ) {
        throw new UnprocessableEntityException(
          'Correct answer must be in the answer list',
        );
      }
    }
  }

  private async validatePermissions(permissions?: PaperPermissionsDto) {
    if (!permissions) return;
    if (permissions?.public) return;
    if (
      permissions?.accessibleByUserIds &&
      permissions.accessibleByUserIds.length > 0
    ) {
      const users = await this.prisma.userEntity.findMany({
        where: { id: { in: permissions.accessibleByUserIds } },
      });

      if (users.length !== permissions.accessibleByUserIds.length) {
        throw new NotFoundException('One or more user IDs do not exist');
      }
    }
  }

  async take(userId: number, id: mongoose.Types.ObjectId) {
    const paper: PaperDocument | null = await this.paperModel.findOne({
      _id: id,
      status: { $ne: PaperStatus.DRAFT },
    });
    if (!paper) {
      throw new NotFoundException('Paper not found');
    }
    const { shuffleQuestions, permissions } = paper;

    if (permissions && paper.userId !== userId) {
      if (!permissions?.public) {
        if (permissions?.accessibleByUserIds) {
          if (!permissions.accessibleByUserIds.includes(userId)) {
            throw new NotFoundException('Paper not found');
          }
        }
      }
    }

    const questionsToTake: Record<string, any>[] = [];
    const paperAnswers: AnswerSheetCorrectAnswerType[] = [];

    let paperQuestions = paper.paperQuestions;
    if (shuffleQuestions) {
      paperQuestions = shuffle(paperQuestions);
    }
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

      const question = await this.questionModel.findById(questionId);
      if (!question) {
        throw new NotFoundException('Question not found');
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

    const { id: answerSheetId } = await this.answerSheetService.create({
      userId,
      correctAnswers: paperAnswers,
    });
    paper.status = PaperStatus.LOCKED;
    await paper.save();
    return { questions: questionsToTake, answerSheetId };
  }
}
