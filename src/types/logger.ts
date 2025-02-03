export interface IHttpLogger {
  info(message: string): void;
  error(message: string): void;
  logRequest(req: any): void;
  logResponse(req: any, res: any): void;
  logException(req: any, err: Error): void;
}