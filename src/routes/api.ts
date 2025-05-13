import { NextFunction, Request, Response, Router } from 'express';

import { Config } from '../config/config';
import { apiRoutes } from '../config/routes';
import { ApiController } from '../controllers';
import { CorsMiddleware } from '../middlewares/api/cors';
import { FileUploadMiddleware } from '../middlewares/api/file';
import { RecaptchaMiddleware } from '../middlewares/api/recaptcha';
import { IMiddleware } from '../types/middleware';

class ApiRouter {
  private config: Config;
  private router: Router;
  private apiController: ApiController;
  private corsMiddleware: IMiddleware;
  private recaptchaMiddleware: IMiddleware;
  private bannerUploadMiddleware: FileUploadMiddleware;
  private contentImageUploadMiddleware: FileUploadMiddleware;
  private siteSettingsUploadMiddleware: FileUploadMiddleware;

  constructor(config: Config) {
    this.config = config;

    this.router = Router();
    this.apiController = new ApiController();
    this.corsMiddleware = new CorsMiddleware(config.getCORSApiOptions());
    this.recaptchaMiddleware = new RecaptchaMiddleware(config.getRecaptchaSecretKey());
    this.bannerUploadMiddleware = new FileUploadMiddleware({
      fields: [
        {
          filter: 'image',
          name: 'image',
          maxCount: 1,
          uploadPath: 'public/uploads/banners/',
          useDateFolder: true,
          convertToWebP: true,
          webpQuality: 90,
        },
      ],
    });
    this.contentImageUploadMiddleware = new FileUploadMiddleware({
      fields: [
        {
          filter: 'image',
          name: 'image',
          maxCount: 1,
          uploadPath: 'public/uploads/contents/',
          useDateFolder: true,
          convertToWebP: true,
          webpQuality: 90,
        },
      ],
    });
    this.siteSettingsUploadMiddleware = new FileUploadMiddleware({
      fields: [
        {
          filter: 'image',
          name: 'favicon',
          maxCount: 1,
          filename: 'favicon',
          uploadPath: 'public/',
          useDateFolder: false,
        },
        {
          filter: 'image',
          name: 'logo',
          maxCount: 1,
          uploadPath: 'public/uploads/logos/',
          useDateFolder: false,
          convertToWebP: true,
          webpQuality: 90,
        },
        {
          filter: 'image',
          name: 'ogImage',
          maxCount: 1,
          uploadPath: 'public/uploads/og-images/',
          useDateFolder: false,
          convertToWebP: true,
          webpQuality: 90,
        },
      ],
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.router.use((req, res, next) => this.corsMiddleware.handle(req, res, next));
  }

  private initializeRoutes(): void {
    // 배너 관련 라우트
    this.router.post(
      apiRoutes.banners.write.url,
      (req: Request, res: Response, next: NextFunction) => this.bannerUploadMiddleware.handle(req, res, next),
      (req: Request, res: Response) => {
        this.apiController.bannerWrite(req, res);
      }
    );

    this.router.get(apiRoutes.banners.detail.url, (req: Request, res: Response) => {
      this.apiController.bannerDetail(req, res);
    });

    this.router.put(
      apiRoutes.banners.update.url,
      (req: Request, res: Response, next: NextFunction) => this.bannerUploadMiddleware.handle(req, res, next),
      (req: Request, res: Response) => {
        this.apiController.bannerUpdate(req, res);
      }
    );

    this.router.delete(apiRoutes.banners.delete.url, (req: Request, res: Response) => {
      this.apiController.bannerDelete(req, res);
    });

    this.router.get(apiRoutes.banners.list.url, (req: Request, res: Response) => {
      this.apiController.banners(req, res);
    });

    this.router.get(apiRoutes.banners.group.url, (req: Request, res: Response) => {
      this.apiController.bannerGroup(req, res);
    });

    // 컨텐츠 관련 라우트
    this.router.get(apiRoutes.contents.list.url, (req: Request, res: Response) => {
      this.apiController.contents(req, res);
    });

    this.router.get(apiRoutes.contents.group.url, (req: Request, res: Response) => {
      this.apiController.contentGroupInfo(req, res);
    });

    this.router.post(apiRoutes.contents.write.url, (req: Request, res: Response) => {
      this.apiController.contentWrite(req, res);
    });

    this.router.get(apiRoutes.contents.detail.url, (req: Request, res: Response) => {
      this.apiController.contentDetail(req, res);
    });

    this.router.put(apiRoutes.contents.update.url, (req: Request, res: Response) => {
      this.apiController.contentUpdate(req, res);
    });

    this.router.delete(apiRoutes.contents.delete.url, (req: Request, res: Response) => {
      this.apiController.contentDelete(req, res);
    });

    this.router.post(
      apiRoutes.contents.uploadImage.url,
      (req: Request, res: Response, next: NextFunction) => this.contentImageUploadMiddleware.handle(req, res, next),
      (req: Request, res: Response) => {
        this.apiController.uploadContentImage(req, res);
      }
    );

    // 직원 관련 라우트
    this.router.post(apiRoutes.employees.regist.url, (req: Request, res: Response) => {
      this.apiController.employeeRegist(req, res);
    });

    this.router.put(apiRoutes.employees.update.url, (req: Request, res: Response) => {
      this.apiController.employeeUpdate(req, res);
    });

    this.router.patch(apiRoutes.employees.updatePassword.url, (req: Request, res: Response) => {
      this.apiController.employeeUpdatePassword(req, res);
    });

    this.router.delete(apiRoutes.employees.delete.url, (req: Request, res: Response) => {
      this.apiController.employeeDelete(req, res);
    });

    this.router.patch(apiRoutes.employees.permissions.url, (req: Request, res: Response) => {
      this.apiController.employeePermissions(req, res);
    });

    this.router.get(apiRoutes.employees.list.url, (req: Request, res: Response) => {
      this.apiController.employees(req, res);
    });

    this.router.post(
      apiRoutes.employees.login.url,
      (req, res, next) => this.recaptchaMiddleware.handle(req, res, next),
      (req: Request, res: Response) => {
        this.apiController.employeeLogin(req, res);
      }
    );

    this.router.post(apiRoutes.employees.logout.url, (req: Request, res: Response) => {
      this.apiController.employeeLogout(req, res);
    });

    this.router.get(apiRoutes.employees.detail.url, (req: Request, res: Response) => {
      this.apiController.employeeDetail(req, res);
    });

    // 권한 관련 라우트
    this.router.get(apiRoutes.permissions.url, (req: Request, res: Response) => {
      this.apiController.permissions(req, res);
    });

    // 통계 관련 라우트
    this.router.get(apiRoutes.stats.visitor.url, (req: Request, res: Response) => {
      this.apiController.statsVisitor(req, res);
    });

    this.router.get(apiRoutes.stats.dailyVisitor.url, (req: Request, res: Response) => {
      this.apiController.statsDailyVisitor(req, res);
    });

    this.router.get(apiRoutes.stats.pageView.url, (req: Request, res: Response) => {
      this.apiController.statsPageView(req, res);
    });

    this.router.get(apiRoutes.stats.country.url, (req: Request, res: Response) => {
      this.apiController.statsCountry(req, res);
    });

    this.router.get(apiRoutes.stats.referrer.url, (req: Request, res: Response) => {
      this.apiController.statsReferrer(req, res);
    });

    this.router.get(apiRoutes.stats.hourly.url, (req: Request, res: Response) => {
      this.apiController.statsHourly(req, res);
    });

    this.router.get(apiRoutes.stats.browser.url, (req: Request, res: Response) => {
      this.apiController.statsBrowser(req, res);
    });

    this.router.get(apiRoutes.stats.accessLogs.url, (req: Request, res: Response) => {
      this.apiController.statsAccessLogs(req, res);
    });

    // 설정 관련 라우트
    this.router.get(apiRoutes.settings.read.url, (req: Request, res: Response) => {
      this.apiController.getSettings(req, res);
    });

    // 사이트 설정 수정
    this.router.patch(
      apiRoutes.settings.updateSite.url,
      (req: Request, res: Response, next: NextFunction) => this.siteSettingsUploadMiddleware.handle(req, res, next),
      (req: Request, res: Response) => {
        this.apiController.setSiteSettings(req, res);
      }
    );

    // 회사 설정 수정
    this.router.patch(apiRoutes.settings.updateCompany.url, (req: Request, res: Response) => {
      this.apiController.setCompanySettings(req, res);
    });

    // 시스템 설정 수정
    this.router.patch(apiRoutes.settings.updateSystem.url, (req: Request, res: Response) => {
      this.apiController.setSystemSettings(req, res);
    });

    // 시스템 재시작
    this.router.post(apiRoutes.systems.restart.url, (req: Request, res: Response) => {
      this.apiController.systemRestart(req, res);
    });

    // 시스템 상태 확인
    this.router.get(apiRoutes.systems.status.url, (req: Request, res: Response) => {
      this.apiController.systemStatus(req, res);
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

export const apiRouter = (config: Config) => new ApiRouter(config).getRouter();
