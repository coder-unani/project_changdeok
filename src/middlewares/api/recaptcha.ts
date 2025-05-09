import { NextFunction, Request, Response } from 'express';

import { AppError } from '../../common/error';
import { httpStatus } from '../../common/variables';
import { CONFIG } from '../../config/config';
import { apiRoutes } from '../../config/routes';
import { IMiddleware } from '../../types/middleware';

export class RecaptchaMiddleware implements IMiddleware {
  private loginPath: string;
  private includeRecaptcha: string[];

  constructor(includePath: string[] = []) {
    this.loginPath = apiRoutes.employees.login.url;
    this.includeRecaptcha = includePath;
    this.includeRecaptcha.push(this.loginPath);
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    // reCAPTCHA 검증이 필요한 경로인 경우에만 검증 수행
    if (this.includeRecaptcha.includes(req.path)) {
      try {
        const recaptchaToken = req.body.recaptchaToken;

        if (!recaptchaToken) {
          throw new AppError(httpStatus.BAD_REQUEST, 'reCAPTCHA 토큰이 필요합니다.');
        }

        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${CONFIG.RECAPTCHA.SECRET_KEY}&response=${recaptchaToken}`,
        });

        const data = await response.json();

        if (!data.success) {
          throw new AppError(httpStatus.BAD_REQUEST, 'reCAPTCHA 검증에 실패했습니다.');
        }
      } catch (error) {
        next(error);
        return;
      }
    }

    next();
  }
}
