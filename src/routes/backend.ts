import { Router } from 'express';

import { Config } from '../config/config';
import { apiRoutes, backendRoutes } from '../config/routes';
import { BackendController } from '../controllers';
import { AuthMiddleware } from '../middlewares/backend/auth';
import { PermissionMiddleware } from '../middlewares/backend/permission';
import { IMiddleware } from '../types/middleware';

class BackendRouter {
  private config: Config;
  private router: Router;
  private backendController: BackendController;
  private authMiddleware: IMiddleware;
  private permissionMiddleware: IMiddleware;

  constructor(config: Config) {
    this.config = config;

    this.router = Router();
    this.backendController = new BackendController(config);
    this.authMiddleware = new AuthMiddleware();
    this.permissionMiddleware = new PermissionMiddleware();

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.router.use((req, res, next) => this.authMiddleware.handle(req, res, next));
    this.router.use((req, res, next) => this.permissionMiddleware.handle(req, res, next));
  }

  private initializeRoutes(): void {
    // 관리자 홈
    this.router.get(backendRoutes.index.url, (req, res) => {
      this.backendController.index(backendRoutes.index, req, res);
    });

    // 대시보드
    this.router.get(backendRoutes.dashboard.url, (req, res) => {
      this.backendController.dashboard(backendRoutes.dashboard, req, res);
    });

    // 화면 관리: 배너 관리
    this.router.get(backendRoutes.banners.screens.url, (req, res) => {
      this.backendController.screenBanners(backendRoutes.banners.screens, req, res);
    });

    // 화면관리: 배너 등록
    this.router.get(backendRoutes.banners.write.url, (req, res) => {
      this.backendController.bannerWrite(backendRoutes.banners.write, req, res);
    });

    // 화면관리: 배너 상세
    this.router.get(backendRoutes.banners.detail.url, (req, res) => {
      console.log(backendRoutes.banners.detail);
      this.backendController.bannerDetail(backendRoutes.banners.detail, req, res);
    });

    // 화면관리: 배너 수정
    this.router.get(backendRoutes.banners.update.url, (req, res) => {
      this.backendController.bannerUpdate(backendRoutes.banners.update, req, res);
    });

    // 화면관리: 배너 목록
    this.router.get(backendRoutes.banners.list.url, (req, res) => {
      this.backendController.banners(backendRoutes.banners.list, req, res);
    });

    // 컨텐츠 등록
    this.router.get(backendRoutes.contents.write.url, (req, res) => {
      this.backendController.contentWrite(backendRoutes.contents.write, req, res);
    });

    // 컨텐츠 상세
    this.router.get(backendRoutes.contents.detail.url, (req, res) => {
      this.backendController.contentDetail(backendRoutes.contents.detail, req, res);
    });

    // 컨텐츠 수정
    this.router.get(backendRoutes.contents.update.url, (req, res) => {
      this.backendController.contentUpdate(backendRoutes.contents.update, req, res);
    });

    // 컨텐츠 목록
    this.router.get(backendRoutes.contents.list.url, (req, res) => {
      this.backendController.contents(backendRoutes.contents.list, req, res);
    });

    // 직원 등록
    this.router.get(backendRoutes.employees.regist.url, (req, res) => {
      this.backendController.employeeRegist(backendRoutes.employees.regist, req, res);
    });

    // 직원 상세 정보
    this.router.get(backendRoutes.employees.detail.url, (req, res) => {
      this.backendController.employeeDetail(backendRoutes.employees.detail, req, res);
    });

    // 직원 수정
    this.router.get(backendRoutes.employees.update.url, (req, res) => {
      this.backendController.employeeUpdate(backendRoutes.employees.update, req, res);
    });

    // 직원 목록
    this.router.get(backendRoutes.employees.list.url, (req, res) => {
      this.backendController.employees(backendRoutes.employees.list, req, res);
    });

    // 직원 비밀번호 변경
    this.router.get(backendRoutes.employees.updatePassword.url, (req, res) => {
      this.backendController.employeeUpdatePassword(backendRoutes.employees.updatePassword, req, res);
    });

    // 직원 권한 변경
    this.router.get(backendRoutes.employees.permissions.url, (req, res) => {
      this.backendController.employeePermissions(backendRoutes.employees.permissions, req, res);
    });

    // 직원: 로그인
    this.router.get(backendRoutes.employees.login.url, (req, res) => {
      this.backendController.employeeLogin(backendRoutes.employees.login, req, res);
    });

    // 통계 관리
    this.router.get(backendRoutes.stats.url, (req, res) => {
      this.backendController.stats(backendRoutes.stats, req, res);
    });

    // 설정
    this.router.get(backendRoutes.settings.url, (req, res) => {
      this.backendController.settings(backendRoutes.settings, req, res);
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

export const backendRouter = (config: Config) => new BackendRouter(config).getRouter();
