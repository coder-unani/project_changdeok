type typeErrorCode = 'ERR' | 'FAIL_SERVER' | 'FAIL_VALIDATION';
type typeMessage = string | undefined;

export interface IServiceResponse<T = undefined> {
  result: boolean;
  code?: typeErrorCode;
  message?: typeMessage;
  data?: T;
}