import { Router } from 'express';

import { WEB_BACKEND_ROUTE } from '../routes';
import { IMiddleware } from '../../types/middleware';
import { AuthMiddleware } from '../../middlewares/backend/auth';
import { BackendController } from '../../controllers/web/backendController';


const router: Router = Router();

// Auth 설정
const authMiddleware: IMiddleware = new AuthMiddleware();
router.use((req, res, next) => authMiddleware.handle(req, res, next));

// 컨트롤러
const backendController = new BackendController();

// 관리자 홈
router.get(WEB_BACKEND_ROUTE.INDEX, function (req, res) {
  backendController.index(req, res);
});

// 직원 목록
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_LIST, function (req, res) {
  backendController.list(req, res);
});

// 직원 등록
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_REGIST, function (req, res) {
  backendController.regist(req, res);
});

// 직원 로그인
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_LOGIN, function (req, res) {
  backendController.login(req, res);
});

// 직원 정보 수정
router.get(WEB_BACKEND_ROUTE.EMPLOYEE_UPDATE, function (req, res) {
  backendController.update(req, res);
});

// 직원 탈퇴
router.post(WEB_BACKEND_ROUTE.EMPLOYEE_DELETE, function (req, res) {
  backendController.delete(req, res);
});

export default router;