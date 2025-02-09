import { Router, Request, Response, NextFunction } from 'express';

import { LOG_PATH, LOG_LEVEL } from '../config/config';
import { WEB_BACKEND_ROUTE } from './routes';
import { IMiddleware, IErrorMiddleware } from '../types/middleware';
import { AuthMiddleware } from '../middlewares/backend/auth';
import { ErrorMiddleware } from '../middlewares/backend/error';
import { BackendController } from '../controllers/backendController';
import { ExpressLogger } from '../utils/logger';


const router: Router = Router();

/**
 * 미들웨어 설정
 */
const authMiddleware: IMiddleware = new AuthMiddleware();
router.use((req, res, next) => authMiddleware.handle(req, res, next));

// 컨트롤러
const backendController = new BackendController();

// 관리자 홈
router.get(WEB_BACKEND_ROUTE.INDEX.URL, function (req, res) {
  backendController.index(req, res);
});

// 직원 목록
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_LIST.URL, function (req, res) {
  backendController.employeeList(req, res);
});

// 직원 등록
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_REGIST.URL, function (req, res) {
  backendController.employeeRegist(req, res);
});

// 직원 로그인
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_LOGIN.URL, function (req, res) {
  backendController.employeeLogin(req, res);
});

// 직원 상세 정보
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_READ.URL, function (req, res) {
  backendController.employeeDetail(req, res);
});

// 직원 정보 수정
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_UPDATE.URL, function (req, res) {
  backendController.employeeUpdate(req, res);
});

// 직원 탈퇴
router.post(WEB_BACKEND_ROUTE.EMPLOYEE_DELETE.URL, function (req, res) {
  backendController.employeeDelete(req, res);
});

// 직원 권한 관리
router.get(WEB_BACKEND_ROUTE.PERMISSION.URL, function (req, res) {
  backendController.permission(req, res);
});


/**
 * 에러 핸들러 설정
 */
const logger = new ExpressLogger(LOG_PATH, LOG_LEVEL);
const errorMiddleware: IErrorMiddleware = new ErrorMiddleware(logger, 'backend/error');
router.use((err: any, req: Request, res: Response, next: NextFunction) => errorMiddleware.handleError(err, req, res, next));

export default router;