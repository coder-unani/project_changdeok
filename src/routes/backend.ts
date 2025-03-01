import { Router, Request, Response, NextFunction } from 'express';

import { LOG_PATH, LOG_LEVEL, API_BASE_URL } from '../config/config';
import { IMiddleware, IErrorMiddleware } from '../types/middleware';
import { backendRoutes, apiBackendRoutes } from './routes';
import { AuthMiddleware } from '../middlewares/backend/auth';
import { PermissionMiddleware } from '../middlewares/backend/permission';
import { ErrorMiddleware } from '../middlewares/backend/error';
import { BackendController } from '../controllers/backendController';
import { ExpressLogger } from '../common/logger';

const router: Router = Router();

router.use((req, res, next) => {
  res.locals.baseUrl = API_BASE_URL;
  res.locals.routes = backendRoutes;
  res.locals.apiBackendRoutes = apiBackendRoutes;
  next();
});

/**
 * 미들웨어 설정
 */
const exceptPath: string[] = [
  backendRoutes.employeesLogin.url,
  backendRoutes.employeesForgotPassword.url,
];
const authMiddleware: IMiddleware = new AuthMiddleware(exceptPath);
router.use((req, res, next) => authMiddleware.handle(req, res, next));

const permissionMiddleware: IMiddleware = new PermissionMiddleware();
router.use((req, res, next) => permissionMiddleware.handle(req, res, next));

// 컨트롤러
const backendController = new BackendController();

// 관리자 홈
router.get(backendRoutes.index.url, function (req, res) {
  backendController.index(req, res);
});

// 대시보드
router.get(backendRoutes.dashboard.url, function (req, res) {
  backendController.dashboard(req, res);
});


/**
 * 화면 관리
 */

// 화면관리: 배너 등록
router.get(backendRoutes.bannersWrite.url, function (req, res) {
  backendController.bannersWrite(req, res);
});

// 화면관리: 배너 상세
router.get(backendRoutes.bannersDetail.url, function (req, res) {
  backendController.bannersDetail(req, res);
});

// 화면관리: 배너 수정
router.get(backendRoutes.bannersUpdate.url, function (req, res) {
  backendController.bannersUpdate(req, res);
});

// 화면관리: 배너 목록
router.get(backendRoutes.banners.url, function (req, res) {
  backendController.banners(req, res);
});


// 화면관리: 배너 관리
router.get(backendRoutes.bannersScreen.url, function (req, res) {
  backendController.bannersScreen(req, res);
});

// 화면관리: 팝업 관리
router.get(backendRoutes.bannersPopup.url, function (req, res) {
  backendController.bannersPopup(req, res);
});


/**
 * 게시판 관리
 */

// 게시판: 게시물 목록
router.get(backendRoutes.contents.url, function (req, res) {
  backendController.contents(req, res);
});

// 게시판: 게시물 작성
router.get(backendRoutes.contentsWrite.url, function (req, res) {
  backendController.contentsWrite(req, res);
});

// 게시판: 게시물 상세
router.get(backendRoutes.contentsDetail.url, function (req, res) {
  backendController.contentsDetail(req, res);
});

// 게시판: 게시물 수정
router.get(backendRoutes.contentsUpdate.url, function (req, res) {
  backendController.contentsUpdate(req, res);
});

/**
 * 직원 관리
 */

// 직원: 로그인
router.get(backendRoutes.employeesLogin.url, function (req, res) {
  backendController.employeesLogin(req, res);
});

// 직원: 등록
router.get(backendRoutes.employeesRegist.url, function (req, res) {
  backendController.employeesRegist(req, res);
});

// 직원: 정보수정
router.get(backendRoutes.employeesUpdate.url, function (req, res) {
  backendController.employeesUpdate(req, res);
});

// 직원: 비밀번호 수정
router.get(backendRoutes.employeesUpdatePassword.url, function (req, res) {
  backendController.employeesUpdatePassword(req, res);
});

// 직원: 탈퇴
router.get(backendRoutes.employeesDelete.url, function (req, res) {
  backendController.employeesDelete(req, res);
});

// 직원: 권한변경
router.get(backendRoutes.employeesPermissions.url, function (req, res) {
  backendController.employeesPermissions(req, res);
});

// 직원: 목록
router.get(backendRoutes.employees.url, function (req, res) {
  backendController.employees(req, res);
});

// 직원: 비밀번호 찾기
router.get(backendRoutes.employeesForgotPassword.url, function (req, res) {
  backendController.employeesForgotPassword(req, res);
});

// 직원: 상세정보
router.get(backendRoutes.employeesDetail.url, function (req, res) {
  backendController.employeesDetail(req, res);
});

/**
 * 에러 핸들러 설정
 */
// const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
// const errorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger);
// router.use((err: any, req: Request, res: Response, next: NextFunction) => errorMiddleware.handleError(err, req, res, next));

export default router;