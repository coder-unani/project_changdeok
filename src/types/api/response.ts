export interface IApiResponse<T = undefined | null> {
  result: boolean;
  code?: string | null;
  message?: string | null
  metadata?: any | null;
  data?: T;
}