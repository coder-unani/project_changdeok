import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';

import { IMiddleware, IErrorMiddleware } from './types/middleware';
import { CorsMiddleware } from './middlewares/api/cors';
import { LoggerMiddleware } from './middlewares/logger';
import { ErrorMiddleware } from './middlewares/web/error';
import { ExpressLogger } from './utils/logger';
import apiFrontendRouter from './routes/api/frontend';
import apiBackendRouter from './routes/api/backend';
import frontendRouter from './routes/web/frontend';
import backendRouter from './routes/web/backend';

/**
 * 필요한 환경 변수 설정
 */
const EXPRESS_PORT: number = process.env.EXPRESS_PORT ? parseInt(process.env.EXPRESS_PORT) : 3000;

/**
 * Express 앱 설정
 */
const app: Application = express();

/**
 * 공통 미들웨어 설정
 */
// Http Logger 설정
const logger = new ExpressLogger();
const loggerMiddleware: IMiddleware = new LoggerMiddleware(logger);
app.use((req, res, next) => loggerMiddleware.handle(req, res, next));
// Body-parser 설정
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use(express.json()); // JSON 데이터 파싱

/**
 * API 설정
 */
// API CORS 설정
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
}
const corsMiddleware: IMiddleware = new CorsMiddleware(corsOptions);
apiFrontendRouter.use((req, res, next) => corsMiddleware.handle(req, res, next));
apiBackendRouter.use((req, res, next) => corsMiddleware.handle(req, res, next));

/**
 * WEB 설정
 */
// 정적 파일 설정
app.use(express.static(path.join(__dirname, 'public'))); 
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
app.listen(EXPRESS_PORT, () => {
  console.log(`Server is running at http://localhost:${EXPRESS_PORT}`);
});