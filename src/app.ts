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
import { NonceMiddleware } from './middlewares/nonce';

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
if (CONFIG.ENV === 'production') {
  app.set('trust proxy', true);
}

// 보안 설정
app.use(
  helmet({
    // Content Security Policy: 웹사이트에서 로드할 수 있는 리소스(스크립트, 스타일, 이미지 등)를 제한
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // 기본적으로 같은 출처의 리소스만 허용
        scriptSrc: ["'self'"], // 스크립트는 같은 출처에서만 로드 가능
        styleSrc: ["'self'"], // 스타일시트는 같은 출처에서만 로드 가능
        // 필요시 추가
      },
    },
    // Cross-Origin Embedder Policy: 외부 리소스 임베딩 정책 설정
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    // Cross-Origin Opener Policy: 팝업 창과의 상호작용 정책 설정
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    // Cross-Origin Resource Policy: 리소스 접근 정책 설정
    crossOriginResourcePolicy: { policy: 'same-origin' },
    // Referrer Policy: 리퍼러(referrer) 정보 전송 정책 설정
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // HTTP Strict Transport Security: HTTPS 사용 강제
    hsts: {
      maxAge: 63072000, // 2년 동안 HTTPS 사용 강제
      includeSubDomains: true, // 서브도메인에도 적용
      preload: true, // HSTS 프리로드 목록에 포함
    },
    // X-Content-Type-Options: MIME 타입 스니핑 방지
    xContentTypeOptions: true,
    // DNS Prefetch Control: DNS 프리페치 기능 제어
    dnsPrefetchControl: { allow: false },
    // X-Download-Options: IE에서 다운로드한 파일의 실행 방지
    xDownloadOptions: true,
    // Frame Guard: 클릭재킹 공격 방지
    frameguard: { action: 'deny' },
    // Cross-Domain Policy: Adobe Flash/PDF 관련 보안 설정
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    // X-XSS-Protection: XSS 공격 방지를 위한 브라우저 내장 기능 (현대에는 비활성화 권장)
    xXssProtection: false,
    // X-Powered-By: 서버 기술 정보 숨김
    xPoweredBy: false,
  })
);

// Nonce 미들웨어 적용 (helmet 설정 이후에 추가)
const nonceMiddleware = new NonceMiddleware();
app.use((req, res, next) => nonceMiddleware.handle(req, res, next));

// 요청 제한 설정 (15분에 1000개의 요청)
// 참고) https://www.npmjs.com/package/express-rate-limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    limit: 1000, // 15분에 1000개의 요청
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
