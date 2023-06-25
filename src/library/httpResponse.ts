import { HttpException, HttpStatus } from '@nestjs/common';

import { AppError } from './appError';

export class HttpResponse {
  // wrapper to map error to http status error, returns 'internal server error' if no mapping is configured
  public static writeErrorResponse(error: Error) {
    // map http status code
    const httpStatus =
      AppError.mapHttpErrorStatus.get(error) ||
      HttpStatus.INTERNAL_SERVER_ERROR;

    // map error msg
    const errMsg =
      httpStatus === HttpStatus.INTERNAL_SERVER_ERROR
        ? AppError.internalServerErr.message
        : error.message;

    throw new HttpException(errMsg, httpStatus);
  }
}
