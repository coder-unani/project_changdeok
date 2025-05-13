import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';

import { IMiddleware } from '../types/middleware';

// SanitizeMiddleware 클래스
export class SanitizeMiddleware implements IMiddleware {
  private enabledTags: string[];

  constructor(enabledTags: string[] = []) {
    this.enabledTags = enabledTags;
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeHtml(req.body[key], {
            allowedTags: this.enabledTags, // 허용할 HTML 태그
            allowedAttributes: { a: ['href', 'target'], img: ['src', 'width', 'height'] }, // 속성 허용
            disallowedTagsMode: 'discard', // 허용되지 않은 태그 삭제
          });
        }
      }
    }
    next(); // 다음 미들웨어로 이동
  }
}
