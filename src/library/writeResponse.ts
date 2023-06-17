export class WriteResponse {
  public static Success(data: any) {
    const successResponse = {
      success: true,
      result: data,
    };
    return successResponse;
  }

  public static Error(errorId: string, errorCode: string, errorMsg: string) {
    const errorResponse = {
      success: true,
      failure: {
        errorId: errorId,
        errorCode: errorCode,
        message: errorMsg,
      },
    };

    return errorResponse;
  }
}
