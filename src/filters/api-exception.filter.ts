import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiException } from 'src/exceptions/api.exception';

@Catch(Error)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof ApiException) {
      // eslint-disable-next-line
			response.status(HttpStatus.OK).json({ code: exception.getErrorCode(), message: exception.getErrorMessage() });
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      // eslint-disable-next-line
			response.status(status).json({
        code: status,
        message: exception.message,
      });
    } else {
      // eslint-disable-next-line
			response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' })
    }
  }
}
