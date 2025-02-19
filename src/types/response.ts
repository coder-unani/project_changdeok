import { CODE_BAD_REQUEST, CODE_UNAUTHORIZED, CODE_FORBIDDEN, CODE_FAIL_SERVER } from '../config/constants';

// CODE_ERROR, CODE_FAIL_SERVER, CODE_FAIL_VALIDATION 상수를 사용하여 typeCode를 정의
export type typeCode = typeof CODE_FAIL_SERVER | typeof CODE_BAD_REQUEST | typeof CODE_UNAUTHORIZED | typeof CODE_FORBIDDEN;
export type typeMessage = string | undefined;

export interface IServiceResponse<T = undefined> {
  result: boolean;
  code?: typeCode;
  message?: typeMessage;
  metadata?: any;
  data?: T;
}

export interface IApiResponse<T = undefined | null> {
  result: boolean;
  code?: number | null;
  message?: string | null
  metadata?: any | null;
  data?: T;
}