import { Request, Response, Router } from 'express';

import { ApiBackendController } from '../../controllers/api/backendController';
import { API_BACKEND_ROUTE } from '../routes';

const router: Router = Router();

// 컨트롤러
const apiBackendController = new ApiBackendController();

// 직원 목록
router.get(API_BACKEND_ROUTE.EMPLOYEE_LIST, (req: Request, res: Response) => {
  apiBackendController.employeeList(req, res);
});

// 직원 상세 정보
router.get(API_BACKEND_ROUTE.EMPLOYEE_READ, (req: Request, res: Response) => {
  apiBackendController.employeeDetail(req, res);
});

// 직원 등록
router.post(API_BACKEND_ROUTE.EMPLOYEE_REGIST, (req: Request, res: Response) => {
  apiBackendController.employeeRegist(req, res);
});

// 직원 로그인
router.post(API_BACKEND_ROUTE.EMPLOYEE_LOGIN, (req: Request, res: Response) => {
  apiBackendController.employeeLogin(req, res);
});

// 직원 정보 수정
router.patch(API_BACKEND_ROUTE.EMPLOYEE_UPDATE, (req: Request, res: Response) => {
  apiBackendController.employeeUpdate(req, res);
});

// 직원 탈퇴
router.delete(API_BACKEND_ROUTE.EMPLOYEE_DELETE, (req: Request, res: Response) => {
  apiBackendController.employeeDelete(req, res);
});

export default router;