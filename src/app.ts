import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import expressLayouts from 'express-ejs-layouts';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';

import { ExpressLogger } from './common/utils/log';
import { Config, asyncConfig } from './config/config';
import { AccessMiddleware } from './middlewares/access';
import { GlobalMiddleware } from './middlewares/global';
import { LoggerMiddleware } from './middlewares/logger';
import { NonceMiddleware } from './middlewares/nonce';
import { SanitizeMiddleware } from './middlewares/sanitizer';
import { apiRouter, backendRouter, frontendRouter } from './routes';
import { IMiddleware } from './types/middleware';

export class App {
  private app: Application;
  private logger: ExpressLogger;
  private loggerMiddleware: IMiddleware;
  private sanitizeMiddleware: IMiddleware;
  private nonceMiddleware: IMiddleware;
  private accessMiddleware: IMiddleware;
  private globalMiddleware: IMiddleware;

  private config: Config;

  constructor(config: Config) {
    this.app = express();

    // 프로젝트 설정 가져오기
    this.config = config;

    // Logger 초기화
    this.logger = new ExpressLogger(config.getLogPath(), config.getLogLevel());

    // 미들웨어 초기화
    this.loggerMiddleware = new LoggerMiddleware(this.logger);
    this.accessMiddleware = new AccessMiddleware(config);
    this.sanitizeMiddleware = new SanitizeMiddleware(JSON.parse(config.getSettings().enabledTagsJson || '[]'));
    this.nonceMiddleware = new NonceMiddleware();
    this.globalMiddleware = new GlobalMiddleware(config);

    // 스태틱 파일 경로 설정
    this.app.use(express.static(path.resolve(__dirname, '../public')));

    // 템플릿 엔진 설정
    this.app.set('views', path.resolve(__dirname, 'views'));
    this.app.set('view engine', 'ejs');
    this.app.use(expressLayouts);

    // 앱 초기화
    this.initializeSecurity();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  public start(): void {
    this.app.listen(this.config.getExpressPort(), () => {
      console.log(`Server is running at http://localhost:${this.config.getExpressPort()}\n`);
    });
  }

  private initializeSecurity(): void {
    if (this.config.getEnv() === 'production') {
      this.app.set('trust proxy', true);
    }

    // helmet 설정
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
          },
        },
        crossOriginEmbedderPolicy: { policy: 'require-corp' },
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-origin' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        hsts: {
          maxAge: 63072000,
          includeSubDomains: true,
          preload: true,
        },
        xContentTypeOptions: true,
        dnsPrefetchControl: { allow: false },
        xDownloadOptions: true,
        frameguard: { action: 'deny' },
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
        xXssProtection: false,
        xPoweredBy: false,
      })
    );
  }

  private initializeMiddlewares(): void {
    // Access
    this.app.use((req, res, next) => this.accessMiddleware.handle(req, res, next));

    // Nonce 미들웨어
    this.app.use((req, res, next) => this.nonceMiddleware.handle(req, res, next));

    // Rate Limiter
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 1000,
        standardHeaders: true,
        legacyHeaders: false,
        skipFailedRequests: false,
        message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      })
    );

    // Cookie Parser
    this.app.use(cookieParser());

    // Body Parser
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());

    // Logger
    this.app.use((req, res, next) => this.loggerMiddleware.handle(req, res, next));

    // Sanitizer
    this.app.use((req, res, next) => this.sanitizeMiddleware.handle(req, res, next));

    // Global
    this.app.use((req, res, next) => this.globalMiddleware.handle(req, res, next));
  }

  private initializeRoutes(): void {
    this.app.use(apiRouter(this.config));
    this.app.use(frontendRouter(this.config));
    this.app.use(backendRouter(this.config));
  }
}

// 애플리케이션 실행
(async () => {
  const app = new App(await asyncConfig());
  app.start();
})();
