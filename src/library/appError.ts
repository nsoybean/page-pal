import { HttpStatus } from '@nestjs/common';

export class AppError {
  // Add more error constants as needed
  public static objectNotFoundErr: Error = new Error('Object not found');
  public static invalidLinkErr: Error = new Error('Invalid Link');
  public static internalServerErr: Error = new Error('Internal Server Error');
  public static unauthorizedErr: Error = new Error('Unauthorized');
  public static validationErr: Error = new Error('Validation error');

  // map app errors to http error status
  public static mapHttpErrorStatus: Map<Error, HttpStatus> = new Map<
    Error,
    HttpStatus
  >([
    [AppError.invalidLinkErr, HttpStatus.BAD_REQUEST],
    [AppError.objectNotFoundErr, HttpStatus.NOT_FOUND],
  ]);
}
