import { NextFunction, Request, Response, Router } from 'express';

import { CORS_BACKEND_OPTIONS } from '../../config/config';
import { IMiddleware } from '../../types/middleware';
import { CorsMiddleware } from '../../middlewares/api/cors';
import { AuthMiddleware } from '../../middlewares/api/backend/auth';
import { MediaUploadMiddleware } from '../../middlewares/api/file';
import { ApiBackendController } from '../../controllers/api/backendController';
import { apiBackendRoutes } from '../routes';

const router: Router = Router();

// CORS 설정
const corsMiddleware: IMiddleware = new CorsMiddleware(CORS_BACKEND_OPTIONS);
router.use((req, res, next) => corsMiddleware.handle(req, res, next));

// AUTH 미들웨어
const authMiddleware: IMiddleware = new AuthMiddleware();
router.use((req, res, next) => authMiddleware.handle(req, res, next));

// 이미지 업로드 미들웨어
const imageUploadMiddleware = new MediaUploadMiddleware({
  uploadPath: 'public/uploads/images/',
  filter: 'image',
  fieldName: 'image',
});

// 컨트롤러
const apiBackendController = new ApiBackendController();

// 배너 등록
router.post(
  apiBackendRoutes.bannersWrite.url, 
  (req: Request, res: Response, next: NextFunction) => imageUploadMiddleware.handle(req, res, next), 
  (req: Request, res: Response) => {
    apiBackendController.bannersWrite(req, res);
  }
);

// 배너 상세 정보
router.get(apiBackendRoutes.bannersDetail.url, (req: Request, res: Response) => {
  apiBackendController.bannersDetail(req, res);
});

// 배너 수정
router.put(apiBackendRoutes.bannerUpdate.url, (req: Request, res: Response) => {
  apiBackendController.bannersUpdate(req, res);
});

// 배너 삭제
router.delete(apiBackendRoutes.bannerDelete.url, (req: Request, res: Response) => {
  apiBackendController.bannersDelete(req, res);
});

// 배너 목록
router.get(apiBackendRoutes.banners.url, (req: Request, res: Response) => {
  apiBackendController.banners(req, res);
});

// 배너 그룹 정보
router.get(apiBackendRoutes.bannerGroup.url, (req: Request, res: Response) => {
  apiBackendController.bannersGroup(req, res);
});

// 컨텐츠 목록
router.get(apiBackendRoutes.contents.url,
  (req: Request, res: Response) => {
    apiBackendController.contents(req, res);
  }
);

// 컨텐츠 등록
router.post(apiBackendRoutes.contentsWrite.url, (req: Request, res: Response) => {
  apiBackendController.contentsWrite(req, res);
});

// 컨텐츠 상세 정보
router.get(apiBackendRoutes.contentsDetail.url, (req: Request, res: Response) => {
  apiBackendController.contentsDetail(req, res);
});

// 컨텐츠 수정
router.put(apiBackendRoutes.contentsUpdate.url, (req: Request, res: Response) => {
  apiBackendController.contentsUpdate(req, res);
});

// 컨텐츠 삭제
router.delete(apiBackendRoutes.contentsDelete.url, (req: Request, res: Response) => {
  apiBackendController.contentsDelete(req, res);
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