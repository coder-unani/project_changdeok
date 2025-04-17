import { NextFunction, Request, Response, Router } from 'express';

import { CORS_BACKEND_OPTIONS } from '../config/config';
import { IMiddleware } from '../types/middleware';
import { CorsMiddleware } from '../middlewares/api/cors';
import { AuthMiddleware } from '../middlewares/api/auth';
import { MediaUploadMiddleware } from '../middlewares/api/file';
import { ApiController } from '../controllers';
import { apiRoutes } from '../config/routes';

const router: Router = Router();

// CORS 설정
const corsMiddleware: IMiddleware = new CorsMiddleware(CORS_BACKEND_OPTIONS);
router.use((req, res, next) => corsMiddleware.handle(req, res, next));

// AUTH 미들웨어
const authMiddleware: IMiddleware = new AuthMiddleware();
router.use((req, res, next) => authMiddleware.handle(req, res, next));

// 이미지 업로드 미들웨어
const bannerUploadMiddleware = new MediaUploadMiddleware({
  uploadPath: 'uploads/banners/',
  filter: 'image',
  fieldName: 'image',
  useDateFolder: true,
  convertToWebP: true,
  webpQuality: 80,
});

// 컨텐츠 이미지 업로드 미들웨어
const contentImageUploadMiddleware = new MediaUploadMiddleware({
  uploadPath: 'uploads/contents/',
  filter: 'image',
  fieldName: 'image',
  useDateFolder: true,
  convertToWebP: true,
  webpQuality: 80,
});

// 컨트롤러
const apiController = new ApiController();

// 배너 등록
router.post(
  apiRoutes.banners.write.url,
  (req: Request, res: Response, next: NextFunction) => bannerUploadMiddleware.handle(req, res, next),
  (req: Request, res: Response) => {
    apiController.bannerWrite(req, res);
  }
);

// 배너 상세 정보
router.get(apiRoutes.banners.detail.url, (req: Request, res: Response) => {
  apiController.bannerDetail(req, res);
});

// 배너 수정
router.put(
  apiRoutes.banners.update.url,
  (req: Request, res: Response, next: NextFunction) => bannerUploadMiddleware.handle(req, res, next),
  (req: Request, res: Response) => {
    apiController.bannerUpdate(req, res);
  }
);

// 배너 삭제
router.delete(apiRoutes.banners.delete.url, (req: Request, res: Response) => {
  apiController.bannerDelete(req, res);
});

// 배너 목록
router.get(apiRoutes.banners.list.url, (req: Request, res: Response) => {
  apiController.banners(req, res);
});

// 배너 그룹 정보
router.get(apiRoutes.banners.group.url, (req: Request, res: Response) => {
  apiController.bannerGroup(req, res);
});

// 컨텐츠 목록
router.get(apiRoutes.contents.list.url, (req: Request, res: Response) => {
  apiController.contents(req, res);
});

// 컨텐츠 그룹 정보
router.get(apiRoutes.contents.group.url, (req: Request, res: Response) => {
  apiController.contentGroupInfo(req, res);
});

// 컨텐츠 등록
router.post(apiRoutes.contents.write.url, (req: Request, res: Response) => {
  apiController.contentWrite(req, res);
});

// 컨텐츠 상세 정보
router.get(apiRoutes.contents.detail.url, (req: Request, res: Response) => {
  apiController.contentDetail(req, res);
});

// 컨텐츠 수정
router.put(apiRoutes.contents.update.url, (req: Request, res: Response) => {
  apiController.contentUpdate(req, res);
});

// 컨텐츠 삭제
router.delete(apiRoutes.contents.delete.url, (req: Request, res: Response) => {
  apiController.contentDelete(req, res);
});

// 컨텐츠 이미지 업로드
router.post(
  '/api/contents/:groupId/upload-image',
  (req: Request, res: Response, next: NextFunction) => contentImageUploadMiddleware.handle(req, res, next),
  (req: Request, res: Response) => {
    apiController.contentImageUpload(req, res);
  }
);

// 직원 등록
router.post(apiRoutes.employees.regist.url, (req: Request, res: Response) => {
  apiController.employeeRegist(req, res);
});

// 직원 정보 수정
router.put(apiRoutes.employees.update.url, (req: Request, res: Response) => {
  apiController.employeeUpdate(req, res);
});

// 직원 비밀번호 수정
router.patch(apiRoutes.employees.updatePassword.url, (req: Request, res: Response) => {
  apiController.employeeUpdatePassword(req, res);
});

// 직원 탈퇴
router.delete(apiRoutes.employees.delete.url, (req: Request, res: Response) => {
  apiController.employeeDelete(req, res);
});

router.patch(apiRoutes.employees.permissions.url, (req: Request, res: Response) => {
  apiController.employeePermissions(req, res);
});

// 직원 목록
router.get(apiRoutes.employees.list.url, (req: Request, res: Response) => {
  apiController.employees(req, res);
});

// 직원 로그인
router.post(apiRoutes.employees.login.url, (req: Request, res: Response) => {
  apiController.employeeLogin(req, res);
});

// 직원 로그아웃
router.post(apiRoutes.employees.logout.url, (req: Request, res: Response) => {
  apiController.employeeLogout(req, res);
});

// 직원 상세 정보
router.get(apiRoutes.employees.detail.url, (req: Request, res: Response) => {
  apiController.employeeDetail(req, res);
});

// 권한 목록
router.get(apiRoutes.permissions.url, (req: Request, res: Response) => {
  apiController.permissions(req, res);
});

export default router;
