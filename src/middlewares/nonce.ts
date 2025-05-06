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
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://tagassistant.google.com https://www.google-analytics.com`,
      `style-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://fonts.googleapis.com`,
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' https://www.googletagmanager.com https://fonts.gstatic.com data:",
      "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
      "frame-src 'self' https://www.googletagmanager.com",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
    ].join('; ');

    res.setHeader('Content-Security-Policy', cspDirectives);

    next();
  }
}
