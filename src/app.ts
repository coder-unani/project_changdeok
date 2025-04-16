//prettier-ignore
import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ExpressLogger } from './common/utils/log';
import { ALLOWED_TAGS, CONFIG } from './config/config';
import { companyInfo } from './config/info';
import { LoggerMiddleware } from './middlewares/logger';
import { SanitizeMiddleware } from './middlewares/sanitizer';
import { apiRouter, frontendRouter, backendRouter } from './routes';
import { IMiddleware } from './types/middleware';

/**
 * 필요한 환경 변수 설정
 */
if (!CONFIG.SERVICE_PORT || !CONFIG.STATIC_PATH || !CONFIG.LOG_PATH || !CONFIG.LOG_LEVEL) {
  throw new Error('필수 환경변수가 설정되지 않았습니다.');
}

/**
 * Express 앱 설정
 */
const app: Application = express();

/**
 * 공통 미들웨어 설정
 */

// 프록시 설정 (Nginx 등에서 Reverse Proxy를 사용하는 경우)
app.set('trust proxy', true);

// 보안 설정
app.use(helmet());

// 요청 제한 설정 (15분에 100개의 요청)
// 참고) https://www.npmjs.com/package/express-rate-limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    limit: 100, // 15분에 100개의 요청
  })
);

// 쿠키 파서 설정
app.use(cookieParser());

// Body-parser 설정
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use(express.json()); // JSON 데이터 파싱

// Http Logger 설정
const logger = new ExpressLogger(CONFIG.LOG_PATH, CONFIG.LOG_LEVEL);
const loggerMiddleware: IMiddleware = new LoggerMiddleware(logger);
app.use((req, res, next) => loggerMiddleware.handle(req, res, next));

// Sanitize 설정
const sanitizeMiddleware: IMiddleware = new SanitizeMiddleware(ALLOWED_TAGS);
app.use((req, res, next) => sanitizeMiddleware.handle(req, res, next));

/**
 * WEB 설정
 */

// 정적 파일 설정
app.use(express.static(path.resolve(__dirname, CONFIG.STATIC_PATH)));

// 템플릿 엔진 (WEB 서비스가 없을 경우 삭제)
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

/**
 * 전역 데이터 설정
 */
app.use((req, res, next) => {
  res.locals.company = companyInfo;
  next();
});

/**
 * 라우터 설정
 */
app.use(apiRouter); // API Backend 라우터
app.use(frontendRouter); // Frontend 라우터
app.use(backendRouter); // Backend 라우터

/**
 * 서버 실행
 */
app.listen(CONFIG.SERVICE_PORT, () => {
  console.log(`Server is running at http://localhost:${CONFIG.SERVICE_PORT}`);
});
