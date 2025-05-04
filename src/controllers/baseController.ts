import { IRoute, IPageData } from '../types/config';
import { AppError, ValidationError } from '../common/utils/error';
import { httpStatus } from '../common/variables';

export class BaseWebController {
  constructor() {}

  protected validateInteger(_value: any | number, _fieldName: string): number {
    const parsedValue = Number(_value);
    if (isNaN(parsedValue)) {
      throw new ValidationError(`${_fieldName}가 올바르지 않습니다.`);
    }
    return parsedValue;
  }

  protected validateString(_value: any | number, _fieldName: string): string {
    const parsedValue = String(_value);
    if (_value === null || _value === undefined || typeof parsedValue !== 'string') {
      throw new ValidationError(`${_fieldName}가 올바르지 않습니다.`);
    }
    return parsedValue;
  }

  protected validateBoolean(_value: any | boolean, _fieldName: string): boolean {
    const parsedValue =
      typeof _value === 'string'
        ? ['Y', 'y', 'TRUE', 'true', '1'].includes(_value)
          ? true
          : ['N', 'n', 'FALSE', 'false', '0'].includes(_value)
            ? false
            : null
        : _value;
    if (typeof parsedValue !== 'boolean') {
      throw new ValidationError(`${_fieldName}가 올바르지 않습니다.`);
    }
    return parsedValue;
  }

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

  protected async handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'API 호출 중 오류가 발생했습니다.');
    }
  }
}

export class BaseApiController {}
