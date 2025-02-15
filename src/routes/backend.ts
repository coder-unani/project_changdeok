import { Router, Request, Response, NextFunction } from 'express';

import { LOG_PATH, LOG_LEVEL, API_BASE_URL } from '../config/config';
import { IMiddleware, IErrorMiddleware } from '../types/middleware';
import { backendRoutes, apiBackendRoutes } from './routes';
import { AuthMiddleware } from '../middlewares/backend/auth';
import { PermissionMiddleware } from '../middlewares/backend/permission';
import { ErrorMiddleware } from '../middlewares/backend/error';
import { BackendController } from '../controllers/backendController';
import { ExpressLogger } from '../utils/logger';




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

// 화면관리: 배너 관리
router.get(backendRoutes.screensBanner.url, function (req, res) {
  backendController.screensBanner(req, res);
});

// 화면관리: 팝업 관리
router.get(backendRoutes.screensPopup.url, function (req, res) {
  backendController.screensPopup(req, res);
});

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
router.post(backendRoutes.employeesDelete.url, function (req, res) {
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

// 직원: 로그아웃
router.get(backendRoutes.employeesLogout.url, function (req, res) {
  backendController.employeesLogout(req, res);
});

// 직원: 비밀번호 찾기
router.get(backendRoutes.employeesForgotPassword.url, function (req, res) {
  console.log('employeesForgotPassword');
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