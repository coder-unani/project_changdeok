import { NextFunction, Request, Response } from 'express';

import { removeCookie } from '../../common/utils/cookie';
import { backendRoutes } from '../../config/routes';
import { verifyJWT } from '../../library/jwt';
import { IMiddleware } from '../../types/middleware';
import { IEmployeeToken } from '../../types/object';

export class AuthMiddleware implements IMiddleware {
  private loginPath: string;
  private forgotPasswordPath: string;
  private exceptAuth: string[];

  // 생성자
  constructor(exceptPath: string[] = []) {
    this.loginPath = backendRoutes.employees.login.url;
    this.forgotPasswordPath = backendRoutes.employees.forgotPassword.url;
    this.exceptAuth = [...exceptPath, this.loginPath, this.forgotPasswordPath];
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    // API 경로가 아닌 경우 미들웨어 실행하지 않음
    if (!req.path.startsWith('/api')) {
      next();
      return;
    }

    // 인증 제외된 경로는 미들웨어 실행하지 않음
    if (this.exceptAuth.includes(req.path)) {
      next();
      return;
    }

    // 인증헤더 확인
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
      // 인증키 없음. 로그인 페이지로 이동
      // res.status(401).json({ message: '로그인이 필요합니다.' });
      // return;
    }

    // Bearer <token> 형식에서 토큰만 추출
    const token = authHeader.split(' ')[1];

    // 토큰 없음. 로그인 페이지로 이동
    if (!token) {
      // res.status(401).json({ message: '로그인이 필요합니다.' });
      next();
      return;
    }

    req.body.accessToken = token;

    // JWT 검증
    // const decodedToken: IEmployeeToken = verifyJWT(token);

    // 유효하지 않은 토큰. 로그인 페이지로 이동
    // if (!decodedToken) {
    // res.status(401).json({ message: '토큰 정보가 만료되었습니다.' });
    // return;
    // }

    // 다음 미들웨어로 이동
    next();
  }
}
