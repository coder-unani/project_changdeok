import cors, { CorsOptions } from 'cors';
import { NextFunction, Request, Response } from 'express';

import { httpStatus } from '../../common/constants';
import { IMiddleware } from '../../types/middleware';

export class CorsMiddleware implements IMiddleware {
  private corsMiddleware: ReturnType<typeof cors>;

  constructor(options: CorsOptions) {
    this.corsMiddleware = cors(options);
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    // API 경로가 아닌 경우 미들웨어 실행하지 않음
    if (!req.path.startsWith('/api')) {
      next();
      return;
    }

    this.corsMiddleware(req, res, next);
  }
}
