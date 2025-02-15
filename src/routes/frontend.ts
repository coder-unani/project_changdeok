import { Router, Request, Response, NextFunction } from 'express';

import { LOG_PATH, LOG_LEVEL } from '../config/config';
import { IMiddleware, IErrorMiddleware } from '../types/middleware';
import { ErrorMiddleware } from '../middlewares/backend/error';
import { ExpressLogger } from '../utils/logger';

const router: Router = Router();


router.get('/', (req: Request, res: Response) => {
  res.render('frontend/index', { title: 'Frontend Page' });
});

router.get('/error', (req: Request, res: Response) => {
  throw new Error('Test Error');
});


/**
 * 에러 핸들러 설정
 */
// const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
// const errorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger, 'frontend/error');
// router.use((err: any, req: Request, res: Response, next: NextFunction) => errorMiddleware.handleError(err, req, res, next));

export default router;