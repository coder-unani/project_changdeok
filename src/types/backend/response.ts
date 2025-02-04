import { CODE_ERROR, CODE_FAIL_SERVER, CODE_FAIL_VALIDATION } from '../../config/constants';

// CODE_ERROR, CODE_FAIL_SERVER, CODE_FAIL_VALIDATION 상수를 사용하여 typeCode를 정의
export type typeCode = typeof CODE_ERROR | typeof CODE_FAIL_SERVER | typeof CODE_FAIL_VALIDATION;
export type typeMessage = string | undefined;

export interface IServiceResponse<T = undefined> {
  result: boolean;
  code?: typeCode;
  message?: typeMessage;
  data?: T;
}