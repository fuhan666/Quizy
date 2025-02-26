import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiException } from 'src/common/exceptions/api.exception';

interface ValidatorErrorResponse {
  message: string[];
  error: string;
  statusCode: number;
}

/* eslint-disable */
function isValidatorErrorResponse(obj: any): obj is ValidatorErrorResponse {
  return (
    Array.isArray(obj.message) &&
    obj.message.every((msg: unknown) => typeof msg === 'string') &&
    typeof obj.error === 'string' &&
    typeof obj.statusCode === 'number'
  );
}
/* eslint-enable */

@Catch(Error)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof ApiException) {
      this.handleApiException(exception, response);
    } else if (exception instanceof HttpException) {
      this.handleHttpException(exception, response);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.handlePrismaKnownError(exception, response);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      this.handleResponse(response, HttpStatus.BAD_REQUEST, 'Bad requests');
    } else {
      console.error(exception);
      this.handleResponse(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal server error',
      );
    }
  }

  private handleApiException(exception: ApiException, response: any): void {
    this.handleResponse(
      response,
      HttpStatus.OK,
      exception.getErrorMessage(),
      exception.getErrorCode(),
    );
  }

  private handleHttpException(exception: HttpException, response: any): void {
    const errorResponse = exception.getResponse();
    const status = exception.getStatus();

    if (isValidatorErrorResponse(errorResponse)) {
      this.handleResponse(
        response,
        HttpStatus.BAD_REQUEST,
        errorResponse.message.join('. '),
      );
    } else {
      this.handleResponse(response, status, exception.message);
    }
  }

  private handlePrismaKnownError(
    exception: Prisma.PrismaClientKnownRequestError,
    response: any,
  ): void {
    switch (exception.code) {
      case 'P2025':
        this.handleResponse(
          response,
          HttpStatus.NOT_FOUND,
          'The result does not exist or there is no permission',
        );
        break;
      default:
        console.error(
          `Prisma error ${exception.code}: ${JSON.stringify(exception?.meta)}${exception.message}`,
        );
        this.handleResponse(
          response,
          HttpStatus.OK,
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  private handleResponse(
    response: any,
    status: HttpStatus,
    message: string,
    code?: number,
  ): void {
    /* eslint-disable */
    response.status(status).json({
      code: code || status,
      message,
    });
    /* eslint-enable */
  }
}
