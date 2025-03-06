import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DifyGenerateQuestionsReqType } from './dto/generate-questions.req.dify.type';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { DifyStatus } from './dto/dify.status.enum';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AiRecordStatus, Prisma } from '@prisma/client';
import { DifyGenerateQuestionsResType } from './dto/generate-questions.res.dify.type';
import { DifyEvent } from './dto/event.dify.type';
@Injectable()
export class DifyService {
  private readonly generateQuestionsApiKey: string;
  private readonly workflowApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @InjectPinoLogger(DifyService.name) private readonly logger: PinoLogger,
  ) {
    this.generateQuestionsApiKey = configService.get<string>(
      'DIFY_GENERATE_QUESTIONS_API_KEY',
      '',
    );
    this.workflowApiUrl = configService.get<string>(
      'DIFY_WORKFLOW_API_URL',
      '',
    );
  }

  async generateQuestionsByPdf(
    userId: number,
    {
      url,
      fileId,
      targetLanguage,
      numberOfQuestions,
    }: DifyGenerateQuestionsReqType,
  ): Promise<DifyGenerateQuestionsResType[]> {
    if (!this.workflowApiUrl || !this.generateQuestionsApiKey) return [];

    // prepare request body
    const inputs: any = {
      pdf_file: {
        transfer_method: 'remote_url',
        url,
        type: 'document',
      },
    };
    if (numberOfQuestions) {
      inputs.number_of_questions = numberOfQuestions;
    }
    if (targetLanguage) {
      inputs.target_language = targetLanguage;
    }
    const body = {
      inputs,
      response_mode: 'streaming',
      user: userId.toString(),
    };

    const r = await this.prismaService.aiRecordEntity.create({
      data: {
        requestBody: {
          fileId,
          targetLanguage,
          numberOfQuestions,
        } as Prisma.JsonObject,
        userId,
        serviceName: 'generate_questions_by_pdf',
        fileId,
        status: AiRecordStatus.PROCESSING,
      },
    });

    try {
      const res = await this.requestWorkflow(body);
      const buffer = await this.waitForStream(res);
      const { events, error } = this.parseStream(buffer);

      const updateData: Prisma.AiRecordEntityUpdateInput = {
        result: events as Prisma.JsonArray,
      };

      if (error.length > 0) {
        updateData.error = error.join('\n');
        updateData.status = AiRecordStatus.FAILED;
        this.logger.warn(
          `Generate questions by pdf failed, AI record id: ${r.id}`,
        );
      }

      if (events && events.length > 0) {
        const lastEvent = events[events.length - 1];
        // tokens
        updateData.tokens = lastEvent.data.total_tokens;
        // status
        if (
          error.length === 0 &&
          lastEvent.data.status === DifyStatus.SUCCEEDED
        ) {
          updateData.status = AiRecordStatus.SUCCESS;
        } else {
          updateData.status = AiRecordStatus.FAILED;
          this.logger.warn(
            `Generate questions by pdf failed, AI record id: ${r.id}`,
          );
        }
      } else {
        updateData.status = AiRecordStatus.FAILED;
        this.logger.warn(
          `Generate questions by pdf failed, AI record id: ${r.id}`,
        );
      }

      await this.prismaService.aiRecordEntity.update({
        where: { id: r.id },
        data: updateData,
      });

      if (updateData.status === AiRecordStatus.SUCCESS) {
        return events[events.length - 1].data.outputs
          .question_list as DifyGenerateQuestionsResType[];
      }
      return [];
    } catch (e) {
      this.logger.error(
        `Generate questions by pdf failed, AI record id: ${r.id}, error: ${e.message}`,
      );
      await this.prismaService.aiRecordEntity.update({
        where: { id: r.id },
        data: {
          status: AiRecordStatus.FAILED,
          error: e.message,
        },
      });
      return [];
    }
  }

  private async requestWorkflow(body: object) {
    const headers = {
      Authorization: `Bearer ${this.generateQuestionsApiKey}`,
      'Content-Type': 'application/json',
    };
    const res = fetch(this.workflowApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return res;
  }

  private async waitForStream(res: Response) {
    const stream = res.body?.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(new TextDecoder().decode(chunk));
        },
        flush(controller) {
          controller.terminate();
        },
      }),
    );
    if (!stream) {
      throw new Error('No dify stream');
    }
    const reader = stream.getReader();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += value;
    }
    return buffer;
  }

  private parseStream(buffer: string) {
    const bufferParts = buffer.split('\n\ndata: ');
    const events: DifyEvent[] = [];
    const error: string[] = [];
    for (const bufferPart of bufferParts) {
      const jsonStart = bufferPart.indexOf('{');
      const jsonEnd = bufferPart.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = bufferPart.substring(jsonStart, jsonEnd + 1);
        try {
          const eventJson = JSON.parse(jsonString);
          events.push(eventJson);
        } catch {
          error.push(bufferPart);
        }
      }
    }
    return { events, error };
  }
}
