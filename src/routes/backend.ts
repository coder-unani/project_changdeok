import { Router, Request, Response, NextFunction } from 'express';

import { CONFIG } from '../config/config';
import { IMiddleware, IErrorMiddleware } from '../types/middleware';
import { backendRoutes, apiBackendRoutes } from './routes';
import { AuthMiddleware } from '../middlewares/backend/auth';
import { PermissionMiddleware } from '../middlewares/backend/permission';
import { ErrorMiddleware } from '../middlewares/backend/error';
import { BackendController } from '../controllers/backendController';
import { ExpressLogger } from '../common/log';

const router: Router = Router();

router.use((req, res, next) => {
  res.locals.serviceUrl = CONFIG.SERVICE_URL;
  res.locals.routes = backendRoutes;
  res.locals.apiBackendRoutes = apiBackendRoutes;
  next();
});

/**
 * 미들웨어 설정
 */
const exceptPath: string[] = [backendRoutes.employeeLogin.url, backendRoutes.employeeForgotPassword.url];
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
router.get(backendRoutes.screenBanners.url, function (req, res) {
  backendController.screenBanners(backendRoutes.screenBanners, req, res);
});

// 화면관리: 팝업 관리
router.get(backendRoutes.popupBanners.url, function (req, res) {
  backendController.popupBanners(backendRoutes.popupBanners, req, res);
});

// 화면관리: 배너 등록
router.get(backendRoutes.bannerWrite.url, function (req, res) {
  backendController.bannerWrite(backendRoutes.bannerWrite, req, res);
});

// 화면관리: 배너 상세
router.get(backendRoutes.bannerDetail.url, function (req, res) {
  backendController.bannerDetail(backendRoutes.bannerDetail, req, res);
});

// 화면관리: 배너 수정
router.get(backendRoutes.bannerUpdate.url, function (req, res) {
  backendController.bannerUpdate(backendRoutes.bannerUpdate, req, res);
});

// 화면관리: 배너 목록
router.get(backendRoutes.banners.url, function (req, res) {
  backendController.banners(backendRoutes.banners, req, res);
});

/**
 * 게시판 관리
 */

// 게시판: 게시물 목록
router.get(backendRoutes.contents.url, function (req, res) {
  backendController.contents(backendRoutes.contents, req, res);
});

// 게시판: 게시물 작성
router.get(backendRoutes.contentWrite.url, function (req, res) {
  backendController.contentWrite(backendRoutes.contentWrite, req, res);
});

// 게시판: 게시물 상세
router.get(backendRoutes.contentDetail.url, function (req, res) {
  backendController.contentDetail(backendRoutes.contentDetail, req, res);
});

// 게시판: 게시물 수정
router.get(backendRoutes.contentUpdate.url, function (req, res) {
  backendController.contentUpdate(backendRoutes.contentUpdate, req, res);
});

/**
 * 직원 관리
 */

// 직원: 로그인
router.get(backendRoutes.employeeLogin.url, function (req, res) {
  backendController.employeeLogin(backendRoutes.employeeLogin, req, res);
});

// 직원: 등록
router.get(backendRoutes.employeeRegist.url, function (req, res) {
  backendController.employeeRegist(backendRoutes.employeeRegist, req, res);
});

// 직원: 정보수정
router.get(backendRoutes.employeeUpdate.url, function (req, res) {
  backendController.employeeUpdate(backendRoutes.employeeUpdate, req, res);
});

// 직원: 비밀번호 수정
router.get(backendRoutes.employeeUpdatePassword.url, function (req, res) {
  backendController.employeeUpdatePassword(backendRoutes.employeeUpdatePassword, req, res);
});

// 직원: 탈퇴
router.get(backendRoutes.employeeDelete.url, function (req, res) {
  backendController.employeeDelete(backendRoutes.employeeDelete, req, res);
});

// 직원: 권한변경
router.get(backendRoutes.employeePermissions.url, function (req, res) {
  backendController.employeePermissions(backendRoutes.employeePermissions, req, res);
});

// 직원: 목록
router.get(backendRoutes.employees.url, function (req, res) {
  backendController.employees(backendRoutes.employees, req, res);
});

// 직원: 비밀번호 찾기
router.get(backendRoutes.employeeForgotPassword.url, function (req, res) {
  backendController.employeeForgotPassword(backendRoutes.employeeForgotPassword, req, res);
});

// 직원: 상세정보
router.get(backendRoutes.employeeDetail.url, function (req, res) {
  backendController.employeeDetail(backendRoutes.employeeDetail, req, res);
});

/**
 * 에러 핸들러 설정
 */
// const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
// const errorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger);
// router.use((err: any, req: Request, res: Response, next: NextFunction) => errorMiddleware.handleError(err, req, res, next));

export default router;
