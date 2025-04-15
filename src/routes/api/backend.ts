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
const bannerUploadMiddleware = new MediaUploadMiddleware({
  uploadPath: 'public/uploads/images/',
  filter: 'image',
  fieldName: 'image',
});

// 컨트롤러
const apiBackendController = new ApiBackendController();

// 배너 등록
router.post(
  apiBackendRoutes.bannerWrite.url,
  (req: Request, res: Response, next: NextFunction) => bannerUploadMiddleware.handle(req, res, next),
  (req: Request, res: Response) => {
    apiBackendController.bannerWrite(req, res);
  }
);

// 배너 상세 정보
router.get(apiBackendRoutes.bannerDetail.url, (req: Request, res: Response) => {
  apiBackendController.bannerDetail(req, res);
});

// 배너 수정
router.put(
  apiBackendRoutes.bannerUpdate.url,
  (req: Request, res: Response, next: NextFunction) => bannerUploadMiddleware.handle(req, res, next),
  (req: Request, res: Response) => {
    apiBackendController.bannerUpdate(req, res);
  }
);

// 배너 삭제
router.delete(apiBackendRoutes.bannerDelete.url, (req: Request, res: Response) => {
  apiBackendController.bannerDelete(req, res);
});

// 배너 목록
router.get(apiBackendRoutes.banners.url, (req: Request, res: Response) => {
  apiBackendController.banners(req, res);
});

// 배너 그룹 정보
router.get(apiBackendRoutes.bannerGroup.url, (req: Request, res: Response) => {
  apiBackendController.bannerGroup(req, res);
});

// 컨텐츠 목록
router.get(apiBackendRoutes.contents.url, (req: Request, res: Response) => {
  apiBackendController.contents(req, res);
});

// 컨텐츠 등록
router.post(apiBackendRoutes.contentWrite.url, (req: Request, res: Response) => {
  apiBackendController.contentWrite(req, res);
});

// 컨텐츠 상세 정보
router.get(apiBackendRoutes.contentDetail.url, (req: Request, res: Response) => {
  apiBackendController.contentDetail(req, res);
});

// 컨텐츠 수정
router.put(apiBackendRoutes.contentUpdate.url, (req: Request, res: Response) => {
  apiBackendController.contentUpdate(req, res);
});

// 컨텐츠 삭제
router.delete(apiBackendRoutes.contentDelete.url, (req: Request, res: Response) => {
  apiBackendController.contentDelete(req, res);
});

// 직원 등록
router.post(apiBackendRoutes.employeeRegist.url, (req: Request, res: Response) => {
  apiBackendController.employeeRegist(req, res);
});

// 직원 정보 수정
router.put(apiBackendRoutes.employeeUpdate.url, (req: Request, res: Response) => {
  apiBackendController.employeeUpdate(req, res);
});

// 직원 비밀번호 수정
router.patch(apiBackendRoutes.employeeUpdatePassword.url, (req: Request, res: Response) => {
  apiBackendController.employeeUpdatePassword(req, res);
});

// 직원 탈퇴
router.delete(apiBackendRoutes.employeeDelete.url, (req: Request, res: Response) => {
  apiBackendController.employeeDelete(req, res);
});

router.patch(apiBackendRoutes.employeePermissions.url, (req: Request, res: Response) => {
  apiBackendController.employeePermissions(req, res);
});

// 직원 목록
router.get(apiBackendRoutes.employees.url, (req: Request, res: Response) => {
  apiBackendController.employees(req, res);
});

// 직원 로그인
router.post(apiBackendRoutes.employeeLogin.url, (req: Request, res: Response) => {
  apiBackendController.employeeLogin(req, res);
});

// 직원 로그아웃
router.post(apiBackendRoutes.employeeLogout.url, (req: Request, res: Response) => {
  apiBackendController.employeeLogout(req, res);
});

// 직원 상세 정보
router.get(apiBackendRoutes.employeeDetail.url, (req: Request, res: Response) => {
  apiBackendController.employeeDetail(req, res);
});

// 권한 목록
router.get(apiBackendRoutes.permissions.url, (req: Request, res: Response) => {
  apiBackendController.permissions(req, res);
});

export default router;
