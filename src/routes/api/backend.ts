import { Request, Response, Router } from 'express';

import { CORS_BACKEND_OPTIONS } from '../../config/config';
import { IMiddleware } from '../../types/middleware';
import { CorsMiddleware } from '../../middlewares/api/cors';
import { ApiBackendController } from '../../controllers/api/backendController';
import { apiBackendRoutes } from '../routes';

const router: Router = Router();

// CORS 설정
const corsMiddleware: IMiddleware = new CorsMiddleware(CORS_BACKEND_OPTIONS);
router.use((req, res, next) => corsMiddleware.handle(req, res, next));

// 컨트롤러
const apiBackendController = new ApiBackendController();

// 컨텐츠 목록
router.get(apiBackendRoutes.contents.url, (req: Request, res: Response) => {
  apiBackendController.contents(req, res);
});

// 컨텐츠 등록
router.post(apiBackendRoutes.contentsWrite.url, (req: Request, res: Response) => {
  apiBackendController.contentsWrite(req, res);
});

// 직원 등록
router.post(apiBackendRoutes.employeesRegist.url, (req: Request, res: Response) => {
  apiBackendController.employeesRegist(req, res);
});

// 직원 정보 수정
router.put(apiBackendRoutes.employeesUpdate.url, (req: Request, res: Response) => {
  apiBackendController.employeesUpdate(req, res);
});

// 직원 비밀번호 수정
router.patch(apiBackendRoutes.employeesUpdatePassword.url, (req: Request, res: Response) => {
  apiBackendController.employeesUpdatePassword(req, res);
});

// 직원 탈퇴
router.delete(apiBackendRoutes.employeesDelete.url, (req: Request, res: Response) => {
  apiBackendController.employeesDelete(req, res);
});

router.patch(apiBackendRoutes.employeesPermissions.url, (req: Request, res: Response) => {
  apiBackendController.employeesPermissions(req, res);
});

// 직원 목록
router.get(apiBackendRoutes.employees.url, (req: Request, res: Response) => {
  apiBackendController.employees(req, res);
});

// 직원 로그인
router.post(apiBackendRoutes.employeesLogin.url, (req: Request, res: Response) => {
  apiBackendController.employeesLogin(req, res);
});

// 직원 로그아웃
router.post(apiBackendRoutes.employeesLogout.url, (req: Request, res: Response) => {
  apiBackendController.employeesLogout(req, res);
});

// 직원 상세 정보
router.get(apiBackendRoutes.employeesDetail.url, (req: Request, res: Response) => {
  apiBackendController.employeesDetail(req, res);
});

// 권한 목록
router.get(apiBackendRoutes.permissions.url, (req: Request, res: Response) => {
  apiBackendController.permissions(req, res);
});

export default router;