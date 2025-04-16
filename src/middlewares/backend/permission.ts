import { Request, Response, NextFunction } from 'express';

import { backendRoutes } from '../../config/routes';
import { IMiddleware } from '../../types/middleware';

export class PermissionMiddleware implements IMiddleware {
  constructor() {}

  public handle(req: Request, res: Response, next: NextFunction): void {
    // 권한 확인
    // console.log('path = ', req.path);

    // 다음 미들웨어로 이동
    next();
  }
}
