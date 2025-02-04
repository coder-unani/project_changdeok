export interface IApiResponse<T = undefined> {
  result: boolean;
  code?: string | null;
  message?: string | null
  data?: T;
}