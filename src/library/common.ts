export class Common {
  /**
   *
   * @param promise
   * @returns object with {data: T; error: any}
   */
  public static pWrap<T>(
    promise: Promise<T>,
  ): Promise<{ data: T; error: Error }> {
    return promise
      .then((pData) => ({ data: pData, error: null }))
      .catch((pError) => ({ data: null, error: pError }));
  }
}
