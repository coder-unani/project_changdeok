import { httpStatus } from '../../common/constants';
import { AppError } from '../../common/error';
import { validateBoolean, validateInteger, validateString } from '../../common/utils/validate';
import { Config } from '../../config/config';
import { IPageData, IRoute } from '../../types/config';

export class BaseController {
  protected config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  protected validateInteger(_value: any | number, _fieldName: string): number {
    return validateInteger(_value, _fieldName);
  }

  protected validateString(_value: any | number, _fieldName: string): string {
    return validateString(_value, _fieldName);
  }

  protected validateBoolean(_value: any | boolean, _fieldName: string): boolean {
    return validateBoolean(_value, _fieldName);
  }
}

export class BaseWebController extends BaseController {
  // 페이지 데이터 생성 메서드
  protected createPageData(
    route: IRoute,
    title: string = '',
    metadata: Record<string, any> = {},
    data: Record<string, any> = {}
  ): IPageData {
    return {
      layout: route.layout,
      title: title || route.title,
      metadata,
      data,
    };
  }

  // API 호출 처리 메서드
  protected async handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'API 호출 중 오류가 발생했습니다.');
    }
  }
}

export class BaseApiController {}
