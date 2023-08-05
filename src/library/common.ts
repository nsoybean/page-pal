import { IOffsetAndLimit } from './interface';
import { BadRequestException } from '@nestjs/common';
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

  public static calculateSkipAndLimit(
    page: string,
    limit: string,
  ): IOffsetAndLimit | null {
    // return default val
    if (!page || !limit) {
      const offsetAndLimit: IOffsetAndLimit = {
        skip: 0,
        limit: 10,
      };
      return offsetAndLimit;
    }

    if (!parseInt(page) || !parseInt(limit)) {
      throw new BadRequestException('invalid query param');
    }

    const calculatedSkip = Math.max(0, Number(page) - 1) * Number(limit);
    const calculatedLimit = Number(limit);
    const offsetAndLimit: IOffsetAndLimit = {
      skip: calculatedSkip,
      limit: calculatedLimit,
    };

    return offsetAndLimit;
  }
}

export enum NodeEnv {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}
