import { httpStatus } from '../../common/constants';
import { AppError } from '../../common/error';
import { ExtendedPrismaClient } from '../../library/database';
import { IServiceResponse } from '../../types/config';

export class BaseService {
  protected prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    this.prisma = prisma;
  }

  // 공통 에러 처리 메서드
  protected handleError<T>(error: unknown): IServiceResponse<T> {
    if (error instanceof AppError) {
      return { result: false, code: error.statusCode, message: error.message } as IServiceResponse<T>;
    }
    return {
      result: false,
      code: httpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 오류가 발생했습니다.',
    } as IServiceResponse<T>;
  }
}
