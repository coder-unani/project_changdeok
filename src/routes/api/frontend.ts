import { Request, Response, Router } from 'express';

import { CORS_OPTIONS } from '../../config/config';
import { IMiddleware } from '../../types/middleware';
import { CorsMiddleware } from '../../middlewares/api/cors';

const router: Router = Router();

// API CORS 설정
const corsMiddleware: IMiddleware = new CorsMiddleware(CORS_OPTIONS);
router.use((req, res, next) => corsMiddleware.handle(req, res, next));

export default router;