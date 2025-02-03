import { Request, Response, NextFunction } from 'express';
import { IErrorMiddleware } from '../../types/middleware';
import { IHttpLogger } from '../../types/logger';

export class ErrorMiddleware implements IErrorMiddleware {
  private logger: IHttpLogger;
  private template: string;

  constructor(logger: IHttpLogger, template: string = 'frontend/error') {
    this.logger = logger;
    this.template = template;

  }

  public handleError(err: any, req: Request, res: Response, next: NextFunction): void {
    // 에러 로그 기록
    this.logger.logException(req, err);

    // 응답
    res.status(500).render(
      this.template, 
      { 
        status: err.status || 500, 
        message: err.message || '일시적인 오류가 발생했습니다.' 
      }
    );

  }
}