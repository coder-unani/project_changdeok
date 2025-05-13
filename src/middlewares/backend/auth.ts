import { NextFunction, Request, Response } from 'express';

import { removeCookie } from '../../common/utils/cookie';
import { ExpressLogger } from '../../common/utils/log';
import { backendRoutes } from '../../config/routes';
import { verifyJWT } from '../../library/jwt';
import { IMiddleware } from '../../types/middleware';
import { IEmployeeToken } from '../../types/object';

// Constants
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  EMPLOYEE: 'employee',
} as const;

export class AuthMiddleware implements IMiddleware {
  private loginPath: string;
  private exceptAuth: string[];

  constructor(exceptPath: string[] = []) {
    this.loginPath = backendRoutes.employees.login.url;
    this.exceptAuth = exceptPath;
    this.exceptAuth.push(this.loginPath);
  }

  // 인증 쿠키 삭제
  private clearAuthCookies(res: Response): void {
    removeCookie(res, COOKIE_NAMES.ACCESS_TOKEN);
    removeCookie(res, COOKIE_NAMES.EMPLOYEE);
  }

  // 인증 실패 처리
  private handleAuthFailure(res: Response, error?: Error): void {
    this.clearAuthCookies(res);
    if (error) {
      new ExpressLogger().error(`인증 실패: ${error.message}`);
    }
    res.redirect(this.loginPath);
  }

  // 토큰 검증
  private async validateToken(token: string): Promise<IEmployeeToken | null> {
    try {
      return await verifyJWT(token);
    } catch (error) {
      new ExpressLogger().error(`토큰 검증 실패: ${error}`);
      return null;
    }
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    // 인증 제외된 경로는 미들웨어 실행하지 않음
    if (this.exceptAuth.includes(req.path)) {
      next();
      return;
    }

    // 인증 토큰 조회
    const token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];

    // 인증 토큰이 없으면 인증 실패 처리
    if (!token) {
      this.handleAuthFailure(res, new Error('인증 토큰이 없습니다.'));
      return;
    }

    // 인증 토큰 검증
    const decodedToken = this.validateToken(token);

    // 인증 토큰이 유효하지 않으면 인증 실패 처리
    if (!decodedToken) {
      this.handleAuthFailure(res, new Error('유효하지 않은 인증 토큰입니다.'));
      return;
    }

    // 응답 로컬 변수에 인증 토큰 저장
    if (!res.locals.employee || res.locals.employee !== decodedToken) {
      res.locals.employee = decodedToken;
    }

    // 다음 미들웨어 실행
    next();
  }
}
