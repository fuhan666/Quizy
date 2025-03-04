import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  private readonly errorCode: number;
  private readonly errorMessage: string;

  constructor(msg: string, errorCode: number) {
    super(msg, HttpStatus.OK);
    this.errorMessage = msg;
    this.errorCode = errorCode;
  }

  getErrorCode() {
    return this.errorCode;
  }
  getErrorMessage() {
    return this.errorMessage;
  }
}
