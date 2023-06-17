import { HttpStatus, Res } from '@nestjs/common';

export class AppError {
  public static readonly objectNotFoundErr: Error = new Error(
    'Object not found',
  );
  public static readonly invalidLinkErr: Error = new Error('Invalid Link');
  public static readonly internalServerErr: Error = new Error(
    'Internal Server Error',
  );
  public static readonly unauthorizedErr: Error = new Error('Unauthorized');
  public static readonly validationErr: Error = new Error('Validation error');
  // Add more error constants as needed

  public static mapErrorStatus(error: Error) {
    switch (error) {
      case AppError.invalidLinkErr:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  public static writeErrorResponse(response: any, error: Error) {
    // return default internal server error unless error is accounted for
    return response.status(AppError.mapErrorStatus(error)).json({
      message:
        AppError.mapErrorStatus(error) === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'INTERNAL_SERVER_ERROR'
          : error.message,
    });
  }
}
