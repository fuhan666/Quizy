import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  private _errorcCode: number;
  private _errorMessage: string;

  constructor(msg: string, errorCode: number) {
    super(msg, HttpStatus.OK);
    this._errorMessage = msg;
    this._errorcCode = errorCode;
  }

  getErrorCode() {
    return this._errorcCode;
  }
  getErrorMessage() {
    return this._errorMessage;
  }
}
