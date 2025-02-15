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
      // eslint-disable-next-line
      response.status(HttpStatus.OK).json({
        code: exception.getErrorCode(),
        message: exception.getErrorMessage(),
      });
    } else if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      if (isValidatorErrorResponse(errorResponse)) {
        const validatorMessage = errorResponse.message;
        // eslint-disable-next-line
        response.status(HttpStatus.BAD_REQUEST).json({
          code: HttpStatus.BAD_REQUEST,
          message: validatorMessage.join('. '),
        });
      } else {
        const status = exception.getStatus();
        // eslint-disable-next-line
        response.status(status).json({
          code: status,
          message: exception.message,
        });
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2025':
          // eslint-disable-next-line
          response.status(HttpStatus.OK).json({
            code: HttpStatus.BAD_REQUEST,
            message: 'The result does not exist or there is no permission',
          });
          break;
        default:
          console.error(
            `Prisma error ${exception.code}: ${JSON.stringify(exception?.meta)}${exception.message}`,
          );
          // eslint-disable-next-line
          response.status(HttpStatus.OK).json({
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
          });
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // eslint-disable-next-line
      response
        .status(HttpStatus.BAD_REQUEST)
        .json({ code: HttpStatus.BAD_REQUEST, message: 'Bad requests' });
    } else {
      console.error(exception);
      // eslint-disable-next-line
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }
}
