import { Request, Response, NextFunction } from 'express';
import { IMiddleware } from '../types/middleware';
import { IHttpLogger } from '../types/logger';

export class LoggerMiddleware implements IMiddleware {
  private logger: IHttpLogger;

  constructor(logger: IHttpLogger) {
    this.logger = logger;
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    // Request 로그 기록
    this.logger.logRequest(req);

    // 로거 참조
    const logger = this.logger;

    // finish 이벤트에 로그 기록
    res.on('finish', () => {
      // Response 로그 기록
      logger.logResponse(req, res);
    });

    // 다음 미들웨어로 이동
    next();
  }
}
