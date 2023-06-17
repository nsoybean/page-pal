export class AppError {
  public static readonly objectNotFoundErr: Error = new Error(
    'Object not found',
  );
  public static readonly invalidLinkErr: Error = new Error('Invalid Link');
  public static readonly unauthorizedErr: Error = new Error('Unauthorized');
  public static readonly validationErr: Error = new Error('Validation error');
  // Add more error constants as needed
}
