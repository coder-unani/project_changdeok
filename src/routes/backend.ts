import { NextFunction, Request, Response, Router } from 'express';

import { CONFIG } from '../config/config';
import { apiRoutes, backendRoutes } from '../config/routes';
import { BackendController } from '../controllers';
import { AuthMiddleware } from '../middlewares/backend/auth';
import { PermissionMiddleware } from '../middlewares/backend/permission';
import { IMiddleware } from '../types/middleware';

const router: Router = Router();

router.use((req, res, next) => {
  res.locals.serviceUrl = CONFIG.SERVICE_URL;
  res.locals.routes = backendRoutes;
  res.locals.apiRoutes = apiRoutes;
  next();
});

/**
 * 미들웨어 설정
 */
const exceptPath: string[] = [backendRoutes.employees.login.url, backendRoutes.employees.forgotPassword.url];
const authMiddleware: IMiddleware = new AuthMiddleware(exceptPath);
router.use((req, res, next) => authMiddleware.handle(req, res, next));

const permissionMiddleware: IMiddleware = new PermissionMiddleware();
router.use((req, res, next) => permissionMiddleware.handle(req, res, next));

// 컨트롤러
const backendController = new BackendController();

// 관리자 홈
router.get(backendRoutes.index.url, function (req, res) {
  backendController.index(backendRoutes.index, req, res);
});

// 대시보드
router.get(backendRoutes.dashboard.url, function (req, res) {
  backendController.dashboard(backendRoutes.dashboard, req, res);
});

/**
 * 화면 관리
 */

// 화면관리: 배너 관리
router.get(backendRoutes.banners.screens.url, function (req, res) {
  backendController.screenBanners(backendRoutes.banners.screens, req, res);
});

// 화면관리: 팝업 관리
router.get(backendRoutes.banners.popups.url, function (req, res) {
  backendController.popupBanners(backendRoutes.banners.popups, req, res);
});

// 화면관리: 배너 등록
router.get(backendRoutes.banners.write.url, function (req, res) {
  backendController.bannerWrite(backendRoutes.banners.write, req, res);
});

// 화면관리: 배너 상세
router.get(backendRoutes.banners.detail.url, function (req, res) {
  backendController.bannerDetail(backendRoutes.banners.detail, req, res);
});

// 화면관리: 배너 수정
router.get(backendRoutes.banners.update.url, function (req, res) {
  backendController.bannerUpdate(backendRoutes.banners.update, req, res);
});

// 화면관리: 배너 목록
router.get(backendRoutes.banners.list.url, function (req, res) {
  backendController.banners(backendRoutes.banners.list, req, res);
});

/**
 * 게시판 관리
 */

// 게시판: 게시물 목록
router.get(backendRoutes.contents.list.url, function (req, res) {
  backendController.contents(backendRoutes.contents.list, req, res);
});

// 게시판: 게시물 작성
router.get(backendRoutes.contents.write.url, function (req, res) {
  backendController.contentWrite(backendRoutes.contents.write, req, res);
});

// 게시판: 게시물 상세
router.get(backendRoutes.contents.detail.url, function (req, res) {
  backendController.contentDetail(backendRoutes.contents.detail, req, res);
});

// 게시판: 게시물 수정
router.get(backendRoutes.contents.update.url, function (req, res) {
  backendController.contentUpdate(backendRoutes.contents.update, req, res);
});

/**
 * 직원 관리
 */

// 직원: 로그인
router.get(backendRoutes.employees.login.url, function (req, res) {
  backendController.employeeLogin(backendRoutes.employees.login, req, res);
});

// 직원: 등록
router.get(backendRoutes.employees.regist.url, function (req, res) {
  backendController.employeeRegist(backendRoutes.employees.regist, req, res);
});

// 직원: 정보수정
router.get(backendRoutes.employees.update.url, function (req, res) {
  backendController.employeeUpdate(backendRoutes.employees.update, req, res);
});

// 직원: 비밀번호 수정
router.get(backendRoutes.employees.updatePassword.url, function (req, res) {
  backendController.employeeUpdatePassword(backendRoutes.employees.updatePassword, req, res);
});

// 직원: 탈퇴
router.get(backendRoutes.employees.delete.url, function (req, res) {
  backendController.employeeDelete(backendRoutes.employees.delete, req, res);
});

// 직원: 권한변경
router.get(backendRoutes.employees.permissions.url, function (req, res) {
  backendController.employeePermissions(backendRoutes.employees.permissions, req, res);
});

// 직원: 목록
router.get(backendRoutes.employees.list.url, function (req, res) {
  backendController.employees(backendRoutes.employees.list, req, res);
});

// 직원: 비밀번호 찾기
router.get(backendRoutes.employees.forgotPassword.url, function (req, res) {
  backendController.employeeForgotPassword(backendRoutes.employees.forgotPassword, req, res);
});

// 직원: 상세정보
router.get(backendRoutes.employees.detail.url, function (req, res) {
  backendController.employeeDetail(backendRoutes.employees.detail, req, res);
});

/**
 * 통계 관리
 */
router.get(backendRoutes.stats.url, function (req, res) {
  backendController.stats(backendRoutes.stats, req, res);
});

/**
 * 설정
 */
router.get(backendRoutes.settings.url, function (req, res) {
  backendController.settings(backendRoutes.settings, req, res);
});

/**
 * 에러 핸들러 설정
 */
// const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
// const errorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger);
// router.use((err: any, req: Request, res: Response, next: NextFunction) => errorMiddleware.handleError(err, req, res, next));

export default router;
