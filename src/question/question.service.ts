import { Injectable, NotFoundException } from '@nestjs/common';
import { Question, QuestionDocument } from './schema/question.schema';
import mongoose, { ClientSession, Model } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionStatus } from './dto/question-status.enum';
import { PaperStatus } from 'src/paper/dto/paper-status.enum';
import { Paper } from 'src/paper/schema/paper.schema';
import { CloudflareOssService } from 'src/shared/oss/cloudflare/cloudflare-oss.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { DifyGenerateQuestionsReqType } from 'src/ai/dify/dto/generate-questions.req.dify.type';
import { DifyService } from 'src/ai/dify/dify.service';
import { GenerateQuestionsDto } from './dto/generate-question.dto';
@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
    @InjectModel(Paper.name)
    private readonly paperModel: Model<Paper>,
    private readonly cloudflareOssService: CloudflareOssService,
    private readonly prismaService: PrismaService,
    private readonly difyService: DifyService,
  ) {}

  public async getQuestions(userId: number) {
    return this.questionModel.find({ userId });
  }

  create(userId: number, dto: CreateQuestionDto) {
    const answers = new Map<string, string>();
    dto.answers.map((text) => {
      answers.set(uuidv4().replaceAll('-', ''), text);
    });

    const question = new this.questionModel({
      userId,
      ...dto,
      answers,
    });
    return question.save();
  }

  delete(id: string, userId: number) {
    return this.questionModel.findOneAndDelete({
      _id: id,
      userId,
      status: QuestionStatus.UNUSED,
    });
  }

  async update(userId: number, id: string, dto: UpdateQuestionDto) {
    const r: QuestionDocument | null = await this.questionModel.findOne({
      userId,
      _id: id,
    });
    if (!r) {
      throw new NotFoundException('Question not found or no permission');
    }
    const currentAnswers = r.answers;
    if (dto.deleteAnswerIds) {
      dto.deleteAnswerIds.forEach((id) => currentAnswers.delete(id));
    }
    if (dto.newAnswers) {
      dto.newAnswers.forEach((text) =>
        currentAnswers.set(uuidv4().replaceAll('-', ''), text),
      );
    }
    if (dto.remainAnswers) {
      for (const key in dto.remainAnswers) {
        currentAnswers.set(key, dto.remainAnswers[key]);
      }
    }
    const updateData: any = { answers: currentAnswers };
    if (dto.questionText) {
      updateData.questionText = dto.questionText;
    }
    if (dto.difficulty) {
      updateData.difficulty = dto.difficulty;
    }
    return this.questionModel.findOneAndUpdate(
      { userId, _id: id },
      updateData,
      {
        new: true,
      },
    );
  }

  async updateStatusWhenAddedToPaper(
    session: ClientSession,
    paperId: mongoose.Types.ObjectId,
    questionIds: mongoose.Types.ObjectId[],
  ) {
    await this.questionModel.updateMany(
      {
        _id: { $in: questionIds },
      },
      [
        {
          $set: {
            paperIds: {
              $cond: {
                if: { $isArray: '$paperIds' },
                then: {
                  $setUnion: [
                    '$paperIds',
                    [new mongoose.Types.ObjectId(paperId)],
                  ],
                },
                else: [paperId],
              },
            },
            status: {
              $cond: {
                if: { $eq: ['$status', QuestionStatus.UNUSED] },
                then: QuestionStatus.ADDED_TO_PAPER,
                else: '$status',
              },
            },
          },
        },
      ],
      { session },
    );
  }

  /**
   * Updates the status of questions when updating a paper.
   *
   * This method handles three main scenarios:
   * 1. Removes paper reference from questions that are no longer in the paper
   * 2. Updates status of questions based on their remaining paper references
   * 3. Adds paper reference to newly added questions
   *
   * The question status will be updated according to these rules:
   * - If a question has no paper references: UNUSED
   * - If a question is referenced by a locked paper: ANSWERED
   * - If a question is only referenced by unlocked papers: ADDED_TO_PAPER
   *
   * @param session - Mongoose client session for transaction
   * @param paperId - ObjectId of the paper being updated
   * @param newQuestionIds - Array of question IDs that will be in the updated paper
   * @param currentQuestionIds - Array of question IDs currently in the paper
   */
  async updateQuestionStatusForUpdatePaper(
    session: ClientSession,
    paperId: mongoose.Types.ObjectId,
    newQuestionIds: mongoose.Types.ObjectId[],
    currentQuestionIds: mongoose.Types.ObjectId[],
  ) {
    const removedQuestionIds = currentQuestionIds.filter(
      (id) => !newQuestionIds.includes(id),
    );
    const addedQuestionIds = newQuestionIds.filter(
      (id) => !currentQuestionIds.includes(id),
    );
    await Promise.all([
      this.updateStatusWhenRemoveFromPaper(
        session,
        paperId,
        removedQuestionIds,
      ),
      this.updateStatusWhenAddedToPaper(session, paperId, addedQuestionIds),
    ]);
  }

  async updateStatusWhenRemoveFromPaper(
    session: ClientSession,
    paperId: mongoose.Types.ObjectId,
    deleteQuestionIds: mongoose.Types.ObjectId[],
  ) {
    await this.questionModel.updateMany(
      { _id: { $in: deleteQuestionIds } },
      { $pull: { paperIds: new mongoose.Types.ObjectId(paperId) } },
      { session },
    );

    // Fetch all questions that need status updates
    const questionsToUpdate = await this.questionModel.find(
      {
        _id: { $in: deleteQuestionIds },
      },
      null,
      { session },
    );

    // Get all related papers
    const relatedPaperIds = [
      ...new Set(questionsToUpdate.flatMap((q) => q.paperIds)),
    ];
    const relatedPapers =
      relatedPaperIds.length > 0
        ? await this.paperModel.find(
            {
              _id: { $in: relatedPaperIds },
            },
            null,
            { session },
          )
        : [];

    // Create a map of paper statuses
    const paperStatusMap = new Map(
      relatedPapers.map((paper) => [paper._id, paper.status]),
    );

    // Determine new status for each question
    const bulkOps = questionsToUpdate.map((question) => {
      let newStatus: QuestionStatus;

      if (question.paperIds.length === 0) {
        newStatus = QuestionStatus.UNUSED;
      } else {
        const hasLockedPaper = question.paperIds.some(
          (paperId) => paperStatusMap.get(paperId) === PaperStatus.LOCKED,
        );
        newStatus = hasLockedPaper
          ? QuestionStatus.ANSWERED_IN_PAPER
          : QuestionStatus.ADDED_TO_PAPER;
      }

      return {
        updateOne: {
          filter: { _id: question._id },
          update: { $set: { status: newStatus } },
        },
      };
    });

    if (bulkOps.length > 0) {
      await this.questionModel.bulkWrite(bulkOps, { session });
    }
  }

  async generateQuestions(userId: number, dto: GenerateQuestionsDto) {
    const file = await this.prismaService.uploadFileEntity.findUnique({
      where: { user: { id: userId }, id: dto.fileId },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const signedUrl = await this.cloudflareOssService.getSignedUrl(file.file);
    const generateQuestionsDto: DifyGenerateQuestionsReqType = {
      url: signedUrl,
      fileId: file.id,
    };
    if (dto.numberOfQuestions) {
      generateQuestionsDto.numberOfQuestions = dto.numberOfQuestions;
    }
    if (dto.targetLanguage) {
      generateQuestionsDto.targetLanguage = dto.targetLanguage;
    }
    const questions = await this.difyService.generateQuestionsByPdf(
      userId,
      generateQuestionsDto,
    );
    if (questions.length === 0) {
      return `Generate questions failed`;
    }
    for (const q of questions) {
      const answers = [q.correctAnswer, ...q.wrongAnswers];
      await this.create(userId, {
        questionText: q.question,
        answers,
        relatedFileId: file.id,
      });
    }
    return `Generate ${questions.length} questions successfully`;
  }
}
