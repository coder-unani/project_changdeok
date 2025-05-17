import { NextFunction, Request, Response } from 'express';

import { setCookie } from '../common/utils/cookie';
import { Config } from '../config/config';
import { createJWT } from '../library/jwt';
import { IMiddleware } from '../types/middleware';

/**
 * 접근 제한 미들웨어
 *
 * 차단된 IP와 봇 패턴을 확인하여 접근을 제한합니다.
 *
 * @param {Config} config - 설정 객체
 * @param {Request} req - 요청 객체
 * @param {Response} res - 응답 객체
 * @param {NextFunction} next - 다음 미들웨어 함수
 * 참고)
 * - 차단되는 봇 패턴 기본 설정 항목
 * 'curl', 'wget', 'python', 'java', 'perl', 'ruby', 'php', 'go-http', 'headless', 'phantom', 'selenium', 'puppeteer', 'playwright', 'cypress', 'nagios'
 * - 허용되는 봇 패턴 추천 설정 항목
 * 'googlebot', 'naverbot', 'bingbot', 'slurp', 'daumoa', 'baiduspider', 'yandexbot'
 * - 허용되는 브라우저 패턴 기본 설정 항목
 * 'chrome', 'firefox', 'safari', 'edge', 'opera', 'msie', 'trident'
 */
export class AccessMiddleware implements IMiddleware {
  private config: Config;
  private blockedIps: string[];
  private allowedBots: RegExp[];
  private allowedBrowsers: RegExp[];
  private blockedBots: RegExp[];

  constructor(config: Config) {
    this.config = config;
    this.blockedIps = JSON.parse(config.getSettings().blockedIpJson || '[]');
    this.allowedBots = [].map((pattern) => new RegExp(pattern, 'i'));
    this.allowedBrowsers = ['chrome', 'firefox', 'safari', 'edge', 'opera', 'msie', 'trident'].map(
      (pattern) => new RegExp(pattern, 'i')
    );
    this.blockedBots = (JSON.parse(config.getSettings().blockedBotJson || '[]') as string[]).map(
      (pattern) => new RegExp(pattern, 'i')
    );
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    const clientIp = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.headers['user-agent'] as string;

    // 차단된 IP
    if (this.isBlockedIp(clientIp as string)) {
      res.status(403).json({
        message: 'Access denied for blocked IP',
      });
      return;
    }

    // 차단된 봇
    if (this.isBot(userAgent)) {
      res.status(403).json({
        message: 'Access denied for blocked bot',
      });
      return;
    }

    // access token 생성
    const accessToken = createJWT(
      {
        ip: clientIp,
      },
      this.config.getJwtSecretKey(),
      this.config.getSettings().jwtExpireSecond
    );

    // access token 저장
    setCookie(res, 'access_token', accessToken, {
      maxAge: this.config.getSettings().jwtExpireSecond,
    });

    next();
  }

  private isBlockedIp(ip: string): boolean {
    return this.blockedIps.includes(ip);
  }

  private isBot(userAgent: string): boolean {
    if (!userAgent) return true;

    if (this.allowedBrowsers.some((pattern) => pattern.test(userAgent))) {
      return false;
    }

    if (this.allowedBots.some((pattern) => pattern.test(userAgent))) {
      return false;
    }

    return this.blockedBots.some((pattern) => pattern.test(userAgent));
  }
}
