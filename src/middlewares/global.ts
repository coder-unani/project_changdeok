import { NextFunction, Request, Response } from 'express';

import { Config } from '../config/config';
import { apiRoutes, backendRoutes, frontendRoutes } from '../config/routes';
import { ISiteSettings } from '../types/config';
import { IMiddleware } from '../types/middleware';

export class GlobalMiddleware implements IMiddleware {
  private config: Config;

  public constructor(config: Config) {
    this.config = config;
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    const settings = this.config.getSettings();

    // 사이트 설정
    const siteSettings: ISiteSettings = {
      title: settings.title,
      introduction: settings.introduction,
      description: settings.description,
      keywords: settings.keywords,
      favicon: settings.favicon,
      logo: settings.logo,
      serviceDomain: settings.serviceDomain,
      servicePort: settings.servicePort,
    };

    // 오픈그래프 태그
    const ogTag = settings.ogTagJson ? JSON.parse(settings.ogTagJson) : null;

    // 회사 정보
    const companyInfo = settings.companyJson ? JSON.parse(settings.companyJson) : null;

    // 응답 데이터
    res.locals.settings = {
      ...siteSettings,
      ogTag,
      companyInfo,
    };
    res.locals.routes = frontendRoutes;
    res.locals.apiRoutes = apiRoutes;
    res.locals.backendRoutes = backendRoutes;

    next();
  }
}
