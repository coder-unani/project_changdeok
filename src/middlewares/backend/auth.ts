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
  private jwtSecretKey: string;
  private loginPath: string;
  private exceptAuth: string[];

  constructor(jwtSecretKey: string, exceptPath: string[] = []) {
    this.jwtSecretKey = jwtSecretKey;
    this.loginPath = backendRoutes.employees.login.url;
    this.exceptAuth = [...exceptPath, this.loginPath, backendRoutes.employees.forgotPassword.url];
  }

  // 인증 미들웨어
  public handle(req: Request, res: Response, next: NextFunction): void {
    // 백엔드가 아닌 경로는 미들웨어 실행하지 않음
    if (!req.path.startsWith('/admin')) {
      next();
      return;
    }

    // 인증 제외된 경로는 미들웨어 실행하지 않음
    if (this.exceptAuth.includes(req.path)) {
      next();
      return;
    }

    // 인증 정보 조회
    const cookieEmployee = req.cookies[COOKIE_NAMES.EMPLOYEE];

    // 인증 정보가 없으면 인증 실패 처리
    if (!cookieEmployee) {
      this.handleAuthFailure(res, new Error('인증 정보가 없습니다.'));
      return;
    }

    // 인증 정보 파싱
    const employee: IEmployeeToken = JSON.parse(cookieEmployee);

    // 인증 토큰 검증
    const decodedToken = this.validateToken(employee.token);

    // 인증 토큰이 유효하지 않으면 인증 실패 처리
    if (!decodedToken) {
      this.handleAuthFailure(res, new Error('유효하지 않은 인증 토큰입니다.'));
      return;
    }

    // 인증 정보 일치 확인
    if (employee.id !== decodedToken.id) {
      this.handleAuthFailure(res, new Error('인증 정보가 일치하지 않습니다.'));
      return;
    }

    // 응답 로컬 변수에 인증 정보 저장
    if (!res.locals.employee || res.locals.employee !== decodedToken) {
      res.locals.employee = decodedToken;
    }

    // 다음 미들웨어 실행
    next();
  }

  // 인증 쿠키 삭제
  private clearAuthCookies(res: Response): void {
    removeCookie(res, COOKIE_NAMES.EMPLOYEE);
  }

  // 인증 실패 처리
  private handleAuthFailure(res: Response, error?: Error): void {
    // 인증 쿠키 삭제
    this.clearAuthCookies(res);

    // 에러 로깅
    if (error) {
      new ExpressLogger().error(error.message);
    }

    // 로그인 페이지로 리다이렉트
    res.redirect(this.loginPath);
  }

  // 토큰 검증
  private validateToken(token: string): IEmployeeToken | null {
    try {
      // 토큰 검증
      return verifyJWT(token, this.jwtSecretKey);
    } catch (error: any) {
      // 토큰 검증 실패
      new ExpressLogger().error(`토큰 검증 실패: ${error}`);
      return null;
    }
  }
}
