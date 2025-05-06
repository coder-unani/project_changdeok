import { Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';
import { IMiddleware } from '../types/middleware';

export class NonceMiddleware implements IMiddleware {
  public handle(req: Request, res: Response, next: NextFunction): void {
    // Generate a random nonce using crypto-js
    const nonce = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64);

    // Add nonce to response locals so it's available in templates
    res.locals.nonce = nonce;

    // Add nonce to response headers for CSP
    res.setHeader(
      'Content-Security-Policy',
      `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://www.googletagmanager.com;`
    );

    next();
  }
}
