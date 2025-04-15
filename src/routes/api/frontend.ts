import { Request, Response, Router } from 'express';

import { CORS_OPTIONS } from '../../config/config';
import { IMiddleware } from '../../types/middleware';
import { CorsMiddleware } from '../../middlewares/api/cors';
import { apiRoutes } from '../routes';

const router: Router = Router();

// API CORS 설정
const corsMiddleware: IMiddleware = new CorsMiddleware(CORS_OPTIONS);
router.use((req, res, next) => corsMiddleware.handle(req, res, next));

router.get(apiRoutes.info.url, (req: Request, res: Response) => {
});

router.get(apiRoutes.banners.url, (req: Request, res: Response) => {
});

router.get(apiRoutes.contents.url, (req: Request, res: Response) => {
});

router.get(apiRoutes.contentDetail.url, (req: Request, res: Response) => {
});

export default router;