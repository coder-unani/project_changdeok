import { Request, Response, NextFunction } from 'express';

import { backendRoutes } from '../../routes/routes';
import { IMiddleware } from '../../types/middleware';
import { verifyJWT } from '../../utils/jwt';

export class AuthMiddleware implements IMiddleware {
  private loginPath: string;
  private exceptAuth: string[];
  
  // 생성자
  constructor(exceptPath: string[] = []) {
    this.loginPath = backendRoutes.employeesLogin.url;
    this.exceptAuth = exceptPath;
    this.exceptAuth.push(this.loginPath);
  }

  public handle(req: Request, res: Response, next: NextFunction): void {

    // const authHeader = req.headers.authorization;

    // 인증 제외된 경로는 미들웨어 실행하지 않음
    if (this.exceptAuth.includes(req.path)) {
      next();
      return;
    }

    // 인증헤더 확인
    // if (!authHeader) {
    //   // 인증키 없음. 로그인 페이지로 이동
    //   res.redirect(this.loginPath);
    //   return;
    // }

    // Bearer <token> 형식에서 토큰만 추출
    // const token = authHeader.split(' ')[1];

    const token = req.cookies.accessToken;

    // 토큰 유무 확인
    if (!token) {
      // 토큰 없음. 로그인 페이지로 이동
      res.redirect(this.loginPath);
      return;
    }

    // JWT 검증
    const decodedToken = verifyJWT(token);
    
    // 유효하지 않은 토큰. 로그인 페이지로 이동
    if (!decodedToken) {
      res.redirect(this.loginPath);
      return;
    }

    // 토큰 검증 성공. 사용자 정보 저장
    res.locals.employee = decodedToken;

    // 다음 미들웨어로 이동
    next();
    
  }
}