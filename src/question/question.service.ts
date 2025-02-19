import { Injectable } from '@nestjs/common';
import { Question } from './schema/question.schema';
import { Model } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

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
}
