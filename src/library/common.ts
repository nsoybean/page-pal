export class Common {
  /**
   *
   * @param promise
   * @returns object with {data: any; error: any}
   */
  public static pWrap(
    promise: Promise<any>,
  ): Promise<{ data: any; error: any }> {
    return promise
      .then((pData) => ({ data: pData, error: null }))
      .catch((pError) => ({ data: null, error: pError }));
  }
}
