import { BadRequestException, Injectable } from '@nestjs/common';
import { Question, QuestionDocument } from './schema/question.schema';
import { Model } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UpdateQuestionDto } from './dto/update-question.dto';
@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private _questionModel: Model<Question>,
  ) {}

  public async getQuestions(userId: number) {
    return this._questionModel.find({ userId });
  }

  create(userId: number, dto: CreateQuestionDto) {
    const answers = new Map<string, string>();
    dto.answers.map((text) => {
      answers.set(uuidv4(), text);
    });

    const question = new this._questionModel({
      userId,
      ...dto,
      answers,
    });
    return question.save();
  }

  delete(id: string, userId: number) {
    return this._questionModel.findOneAndDelete({ _id: id, userId });
  }

  async update(userId: number, id: string, dto: UpdateQuestionDto) {
    const r: QuestionDocument | null = await this._questionModel.findOne({
      userId,
      _id: id,
    });
    if (!r) {
      throw new BadRequestException('Question not found or no permission');
    }
    const currentAnswers = r.answers;
    if (dto.deleteAnswerIds) {
      dto.deleteAnswerIds.forEach((id) => currentAnswers.delete(id));
    }
    if (dto.newAnswers) {
      dto.newAnswers.forEach((text) => currentAnswers.set(uuidv4(), text));
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
    return this._questionModel.findOneAndUpdate(
      { userId, _id: id },
      updateData,
      {
        new: true,
      },
    );
  }
}
