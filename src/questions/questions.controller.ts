import { Controller, Get } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
    constructor(private _questionsService: QuestionsService) { }

    @Get('list')
    async getQuestion() {
        return this._questionsService.getQuestions()
    }
}
