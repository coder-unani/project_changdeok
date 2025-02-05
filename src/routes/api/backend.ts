import { Request, Response, Router } from 'express';
import { ApiBackendController } from '../../controllers/api/backendController';

const router: Router = Router();

// 라우트 경로
const ROUTE = {
  EMPLOYEE_REGIST: '/employee/regist',
  EMPLOYEE_LOGIN: '/employee/login',
  EMPLOYEE_UPDATE: '/employee/:employeeId/update',
  EMPLOYEE_DELETE: '/employee/:employeeId/delete',
}

// 컨트롤러
const apiBackendController = new ApiBackendController();

// 직원 등록
router.post(ROUTE.EMPLOYEE_REGIST, (req: Request, res: Response) => {
  apiBackendController.employeeRegist(req, res);
});

// 직원 로그인
router.post(ROUTE.EMPLOYEE_LOGIN, (req: Request, res: Response) => {
  apiBackendController.employeeLogin(req, res);
});

// 직원 정보 수정
router.patch(ROUTE.EMPLOYEE_UPDATE, (req: Request, res: Response) => {
  apiBackendController.employeeUpdate(req, res);
});

// 직원 탈퇴
router.delete(ROUTE.EMPLOYEE_DELETE, (req: Request, res: Response) => {
  apiBackendController.employeeDelete(req, res);
});

export default router;