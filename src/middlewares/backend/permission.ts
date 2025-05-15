import { NextFunction, Request, Response } from 'express';

import { backendRoutes } from '../../config/routes';
import { IMiddleware } from '../../types/middleware';

export class PermissionMiddleware implements IMiddleware {
  constructor() {}

  public handle(req: Request, res: Response, next: NextFunction): void {
    // 백엔드가 아닌 경로는 미들웨어 실행하지 않음
    if (!req.path.startsWith('/admin')) {
      next();
      return;
    }
    // 권한 확인
    // console.log('path = ', req.path);

    // 다음 미들웨어로 이동
    next();
  }
}
