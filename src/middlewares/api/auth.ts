import { NextFunction, Request, Response } from 'express';

import { httpStatus } from '../../common/constants';
import { removeCookie } from '../../common/utils/cookie';
import { apiRoutes } from '../../config/routes';
import { verifyJWT } from '../../library/jwt';
import { IMiddleware } from '../../types/middleware';

export class AuthMiddleware implements IMiddleware {
  private jwtSecretKey: string;
  private loginPath: string;
  private exceptAuth: string[];

  // 생성자
  constructor(jwtSecretKey: string, exceptPath: string[] = []) {
    this.jwtSecretKey = jwtSecretKey;
    this.loginPath = apiRoutes.employees.login.url;
    this.exceptAuth = [...exceptPath, this.loginPath, apiRoutes.health.url];
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      // 인증키 없음. 로그인 페이지로 이동
      res.status(httpStatus.UNAUTHORIZED).json({ message: '인증키가 없습니다.' });
      return;
    }

    // Bearer <token> 형식에서 토큰만 추출
    const token = authHeader.split(' ')[1];

    // 토큰 없음. 로그인 페이지로 이동
    if (!token) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: '인증키가 없습니다.' });
      return;
    }

    req.body.accessToken = token;

    // JWT 검증
    const decodedToken: any = verifyJWT(token, this.jwtSecretKey);

    // 유효하지 않은 토큰. 로그인 페이지로 이동
    if (!decodedToken) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: '인증키 정보가 만료되었습니다.' });
      return;
    }

    // 다음 미들웨어로 이동
    next();
  }
}
