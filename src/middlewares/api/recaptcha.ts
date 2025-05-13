import { NextFunction, Request, Response } from 'express';

import { httpStatus } from '../../common/constants';
import { AppError } from '../../common/error';
import { IMiddleware } from '../../types/middleware';

export class RecaptchaMiddleware implements IMiddleware {
  private readonly recaptchaSecretKey: string;

  constructor(recaptchaSecretKey: string) {
    this.recaptchaSecretKey = recaptchaSecretKey;
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        body: `secret=${this.recaptchaSecretKey}&response=${recaptchaToken}`,
      });

      if (!response.ok) {
        throw new AppError(httpStatus.BAD_REQUEST, 'reCAPTCHA 검증에 실패했습니다.');
      }

      const data = await response.json();

      if (!data.success) {
        throw new AppError(httpStatus.BAD_REQUEST, 'reCAPTCHA 검증에 실패했습니다.');
      }
    } catch (error) {
      next(error);
      return;
    }

    next();
  }
}
