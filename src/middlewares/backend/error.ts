import { Request, Response, NextFunction } from 'express';

import { IErrorMiddleware } from '../../types/middleware';
import { IHttpLogger } from '../../types/logger';
import { backendRoutes } from '../../config/routes';

// TODO: 에러 처리 미들웨어가 동작하지 않는 이유 찾아볼 것
/**
 * 분석 결과. Express에서 에러 처리 미들웨어는 라우터에 등록된 순서대로 동작한다.
 * 따라서 에러 처리 미들웨어는 라우터 등록 후에 등록해야 한다.
 * 이미 그렇게 했지만 동작하지 않는다.
 * Express 에서는 비동기 함수의 에러를 캐치하지 못하는 경우가 있다.
 * 이에 대한 처리 방법 연구가 필요하다.
 * 일단 임시로 각 라우터에 error 함수를 만들어서 try-catch에서 catch 문에서 error 함수를 호출하는 형태로 만든다.
 */
export class ErrorMiddleware implements IErrorMiddleware {
  private logger: IHttpLogger;

  constructor(logger: IHttpLogger) {
    this.logger = logger;
  }

  public handleError(err: any, req: Request, res: Response, next: NextFunction): void {
    // 에러 로그 기록
    this.logger.logException(req, err);

    // 응답
    const { view, layout } = backendRoutes.error;
    res.status(500).render(view, {
      layout,
      status: err.status || 500,
      message: err.message || '일시적인 오류가 발생했습니다.',
    });

    // 다음 미들웨어로 이동하지 않고 종료
  }
}
