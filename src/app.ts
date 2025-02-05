import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';

import { IMiddleware, IErrorMiddleware } from './types/middleware';
import { CorsMiddleware } from './middlewares/api/cors';
import { LoggerMiddleware } from './middlewares/logger';
import { SanitizeMiddleware } from './middlewares/sanitizer';
import { ErrorMiddleware } from './middlewares/web/error';
import { ExpressLogger } from './utils/logger';
import apiFrontendRouter from './routes/api/frontend';
import apiBackendRouter from './routes/api/backend';
import frontendRouter from './routes/web/frontend';
import backendRouter from './routes/web/backend';
import { SERVICE_PORT, STATIC_PATH, LOG_PATH, LOG_LEVEL, CORS_OPTIONS, CORS_BACKEND_OPTIONS, ALLOWED_TAGS } from './config/config';

/**
 * 필요한 환경 변수 설정
 */
if (!SERVICE_PORT || !STATIC_PATH || !LOG_PATH || !LOG_LEVEL) {
  throw new Error('필수 환경변수가 설정되지 않았습니다.');
}

/**
 * Express 앱 설정
 */
const app: Application = express();

/**
 * 공통 미들웨어 설정
 */
// Http Logger 설정
const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
const loggerMiddleware: IMiddleware = new LoggerMiddleware(logger);
app.use((req, res, next) => loggerMiddleware.handle(req, res, next));

// Sanitize 설정
const sanitizeMiddleware: IMiddleware = new SanitizeMiddleware(ALLOWED_TAGS);
app.use((req, res, next) => sanitizeMiddleware.handle(req, res, next));

// Body-parser 설정
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use(express.json()); // JSON 데이터 파싱

/**
 * API 설정
 */
// API CORS 설정
const corsMiddleware: IMiddleware = new CorsMiddleware(CORS_OPTIONS);
const backendCorsMiddleware: IMiddleware = new CorsMiddleware(CORS_BACKEND_OPTIONS);
apiFrontendRouter.use((req, res, next) => corsMiddleware.handle(req, res, next));
apiBackendRouter.use((req, res, next) => backendCorsMiddleware.handle(req, res, next));

/**
 * WEB 설정
 */
// 정적 파일 설정

app.use(express.static(path.resolve(__dirname, STATIC_PATH))); 
// 템플릿 엔진 (WEB 서비스가 없을 경우 삭제)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * 라우터 설정
 */
app.use('/api', apiFrontendRouter); // API Frontend 라우터
app.use('/api/backend', apiBackendRouter); // API Backend 라우터
app.use('/', frontendRouter); // Frontend 라우터
app.use('/admin', backendRouter); // Backend 라우터

/**
 * 에러 핸들러 설정
 */
// Frontend Error Middleware
const frontendErrorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger, 'frontend/error');
frontendRouter.use((err: any, req: Request, res: Response, next: NextFunction) => frontendErrorMiddleware.handleError(err, req, res, next));

// Backend Error Middleware
const backendErrorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger, 'backend/error');
backendRouter.use((err: any, req: Request, res: Response, next: NextFunction) => backendErrorMiddleware.handleError(err, req, res, next));

/**
 * 서버 실행
 */
app.listen(SERVICE_PORT, () => {
  console.log(`Server is running at http://localhost:${SERVICE_PORT}`);
});