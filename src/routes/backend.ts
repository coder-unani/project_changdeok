import { Router, Request, Response, NextFunction } from 'express';

import { LOG_PATH, LOG_LEVEL, API_BASE_URL } from '../config/config';
import { backendRoutes, apiBackendRoutes } from './routes';
import { IMiddleware, IErrorMiddleware } from '../types/middleware';
import { AuthMiddleware } from '../middlewares/backend/auth';
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
const authMiddleware: IMiddleware = new AuthMiddleware();
router.use((req, res, next) => authMiddleware.handle(req, res, next));

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

// 직원 로그인
router.get(backendRoutes.employeesLogin.url, function (req, res) {
  backendController.employeesLogin(req, res);
});

// 직원 등록
router.get(backendRoutes.employeesRegist.url, function (req, res) {
  backendController.employeesRegist(req, res);
});

// 직원 상세 정보
router.get(backendRoutes.employeesDetail.url, function (req, res) {
  backendController.employeesDetail(req, res);
});

// 직원 정보 수정
router.get(backendRoutes.employeesModify.url, function (req, res) {
  backendController.employeesModify(req, res);
});

// 직원 비밀번호 수정
router.get(backendRoutes.employeesModifyPassword.url, function (req, res) {
  backendController.employeesModifyPassword(req, res);
});

// 직원 탈퇴
router.post(backendRoutes.employeesDelete.url, function (req, res) {
  backendController.employeesDelete(req, res);
});

// 직원 권한 변경
router.get(backendRoutes.employeesPermissions.url, function (req, res) {
  backendController.employeesPermissions(req, res);
});

// 직원 목록
router.get(backendRoutes.employees.url, function (req, res) {
  backendController.employees(req, res);
});

// 직원 로그아웃
router.get(backendRoutes.employeesLogout.url, function (req, res) {
  backendController.employeesLogout(req, res);
});

/**
 * 에러 핸들러 설정
 */
// const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
// const errorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger);
// router.use((err: any, req: Request, res: Response, next: NextFunction) => errorMiddleware.handleError(err, req, res, next));

export default router;