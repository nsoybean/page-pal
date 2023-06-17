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
      .then((data) => ({ data, error: null }))
      .catch((error) => ({ data: null, error }));
  }
}
