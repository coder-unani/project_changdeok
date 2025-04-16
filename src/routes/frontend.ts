import { NextFunction, Request, Response, Router } from 'express';

import { ExpressLogger } from '../common/utils/log';
import { CONFIG } from '../config/config';
import { FrontendController } from '../controllers/frontendController';
import { IErrorMiddleware, IMiddleware } from '../types/middleware';
import { apiRoutes, frontendRoutes } from '../config/routes';

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

// 소개
router.get('/about', function (req: Request, res: Response) {
  frontendController.about(frontendRoutes.about, req, res);
});

// 업무분야
router.get('/services', function (req: Request, res: Response) {
  frontendController.services(frontendRoutes.services, req, res);
});

// 성공사례
router.get('/results', function (req: Request, res: Response) {
  frontendController.results(frontendRoutes.results, req, res);
});

// Q&A
router.get('/qna', function (req: Request, res: Response) {
  frontendController.qna(frontendRoutes.qna, req, res);
});

// 상담 및 의뢰
router.get('/contact', function (req: Request, res: Response) {
  frontendController.contact(frontendRoutes.contact, req, res);
});

/**
 * 에러 핸들러 설정
 */
// const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
// const errorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger, 'frontend/error');
// router.use((err: any, req: Request, res: Response, next: NextFunction) => errorMiddleware.handleError(err, req, res, next));

export default router;
