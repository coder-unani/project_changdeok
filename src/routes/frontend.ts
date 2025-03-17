import { NextFunction, Request, Response, Router } from 'express';

import { ExpressLogger } from '../common/logger';
import { CONFIG } from '../config/config';
import { FrontendController } from '../controllers/frontendController';
import { IErrorMiddleware, IMiddleware } from '../types/middleware';
import { apiRoutes, frontendRoutes } from './routes';

const router: Router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.serviceUrl = CONFIG.SERVICE_URL;
  res.locals.routes = frontendRoutes;
  res.locals.apiRoutes = apiRoutes;
  next();
});

/**
 * 미들웨어 설정
 */
// ...

// 컨트롤러
const frontendController = new FrontendController();

// 홈
router.get('/', function (req: Request, res: Response) {
  frontendController.index(frontendRoutes.index, req, res);
});

/**
 * 에러 핸들러 설정
 */
// const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
// const errorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger, 'frontend/error');
// router.use((err: any, req: Request, res: Response, next: NextFunction) => errorMiddleware.handleError(err, req, res, next));

export default router;
