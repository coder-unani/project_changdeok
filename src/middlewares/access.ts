import { NextFunction, Request, Response } from 'express';

import { Config } from '../config/config';
import { IMiddleware } from '../types/middleware';

export class AccessMiddleware implements IMiddleware {
  private blockedIps: string[];
  private allowedBots: RegExp[];
  private allowedBrowsers: RegExp[];
  private blockedBots: RegExp[];

  constructor(config: Config) {
    console.log('config.getSettings().blockedIpJson => ', config.getSettings().blockedIpJson);
    this.blockedIps = JSON.parse(config.getSettings().blockedIpJson || '[]');
    this.allowedBots = [].map((pattern) => new RegExp(pattern, 'i'));
    this.allowedBrowsers = ['chrome', 'firefox', 'safari', 'edge', 'opera', 'msie', 'trident'].map(
      (pattern) => new RegExp(pattern, 'i')
    );
    this.blockedBots = (JSON.parse(config.getSettings().blockedBotJson || '[]') as string[]).map(
      (pattern) => new RegExp(pattern, 'i')
    );
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.headers['user-agent'] as string;

    if (this.isBlockedIp(ip as string) || this.isBot(userAgent)) {
      res.status(403).json({
        error: 'Bot traffic detected',
        message: 'Access denied for bot traffic',
      });
      return;
    }

    next();
  }

  private isBlockedIp(ip: string): boolean {
    return this.blockedIps.includes(ip);
  }

  private isBot(userAgent: string): boolean {
    if (!userAgent) return true;

    if (this.allowedBrowsers.some((pattern) => pattern.test(userAgent))) {
      return false;
    }

    if (this.allowedBots.some((pattern) => pattern.test(userAgent))) {
      return false;
    }

    return this.blockedBots.some((pattern) => pattern.test(userAgent));
  }
}
