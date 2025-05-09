import { NextFunction, Request, Response, Router } from 'express';

import { CORS_API_OPTIONS } from '../config/config';
import { apiRoutes } from '../config/routes';
import { ApiController } from '../controllers';
import { CorsMiddleware } from '../middlewares/api/cors';
import { FileUploadMiddleware } from '../middlewares/api/file';
import { RecaptchaMiddleware } from '../middlewares/api/recaptcha';
import { IMiddleware } from '../types/middleware';

const router: Router = Router();

// CORS 설정
const corsMiddleware: IMiddleware = new CorsMiddleware(CORS_API_OPTIONS);
router.use((req, res, next) => corsMiddleware.handle(req, res, next));

// reCAPTCHA 미들웨어
const recaptchaMiddleware: IMiddleware = new RecaptchaMiddleware();

// AUTH 미들웨어
// const authMiddleware: IMiddleware = new AuthMiddleware();
// router.use((req, res, next) => authMiddleware.handle(req, res, next));

// 배너 이미지 업로드 미들웨어
const bannerUploadMiddleware = new FileUploadMiddleware({
  fields: [
    {
      filter: 'image',
      name: 'image',
      maxCount: 1,
      uploadPath: 'public/uploads/banners/',
      useDateFolder: true,
      convertToWebP: true,
      webpQuality: 90,
    },
  ],
});

// 컨텐츠 이미지 업로드 미들웨어
const contentImageUploadMiddleware = new FileUploadMiddleware({
  fields: [
    {
      filter: 'image',
      name: 'image',
      maxCount: 1,
      uploadPath: 'public/uploads/contents/',
      useDateFolder: true,
      convertToWebP: true,
      webpQuality: 90,
    },
  ],
});

const siteSettingsUploadMiddleware = new FileUploadMiddleware({
  fields: [
    {
      filter: 'image',
      name: 'favicon',
      maxCount: 1,
      filename: 'favicon',
      uploadPath: 'public/',
      useDateFolder: false,
    },
    {
      filter: 'image',
      name: 'logo',
      maxCount: 1,
      uploadPath: 'public/uploads/logos/',
      useDateFolder: false,
      convertToWebP: true,
      webpQuality: 90,
    },
    {
      filter: 'image',
      name: 'ogImage',
      maxCount: 1,
      uploadPath: 'public/uploads/og-images/',
      useDateFolder: false,
      convertToWebP: true,
      webpQuality: 90,
    },
  ],
});

// 컨트롤러
const apiController = new ApiController();

// 웹사이트 정보
router.get(apiRoutes.info.url, (req: Request, res: Response) => {
  apiController.info(req, res);
});

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
  apiRoutes.contents.uploadImage.url,
  (req: Request, res: Response, next: NextFunction) => contentImageUploadMiddleware.handle(req, res, next),
  (req: Request, res: Response) => {
    apiController.uploadContentImage(req, res);
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
router.post(
  apiRoutes.employees.login.url,
  (req, res, next) => recaptchaMiddleware.handle(req, res, next),
  (req: Request, res: Response) => {
    apiController.employeeLogin(req, res);
  }
);

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

// 방문자 통계
router.get(apiRoutes.stats.visitor.url, (req: Request, res: Response) => {
  apiController.statsVisitor(req, res);
});

// 일간 방문자 통계
router.get(apiRoutes.stats.dailyVisitor.url, (req: Request, res: Response) => {
  apiController.statsDailyVisitor(req, res);
});

// 페이지 뷰 통계
router.get(apiRoutes.stats.pageView.url, (req: Request, res: Response) => {
  apiController.statsPageView(req, res);
});

// 국가 통계
router.get(apiRoutes.stats.country.url, (req: Request, res: Response) => {
  apiController.statsCountry(req, res);
});

// 참조 통계
router.get(apiRoutes.stats.referrer.url, (req: Request, res: Response) => {
  apiController.statsReferrer(req, res);
});

// 시간대별 통계
router.get(apiRoutes.stats.hourly.url, (req: Request, res: Response) => {
  apiController.statsHourly(req, res);
});

// 브라우저 통계
router.get(apiRoutes.stats.browser.url, (req: Request, res: Response) => {
  apiController.statsBrowser(req, res);
});

// 접속 로그 통계
router.get(apiRoutes.stats.accessLogs.url, (req: Request, res: Response) => {
  apiController.statsAccessLogs(req, res);
});

// 기본 설정
router.get(apiRoutes.siteSettings.read.url, (req: Request, res: Response) => {
  apiController.getSiteSettings(req, res);
});

// 기본 설정 수정
router.patch(
  apiRoutes.siteSettings.update.url,
  (req: Request, res: Response, next: NextFunction) => siteSettingsUploadMiddleware.handle(req, res, next),
  (req: Request, res: Response) => {
    apiController.setSiteSettings(req, res);
  }
);

// 회사 설정
router.get(apiRoutes.companySettings.read.url, (req: Request, res: Response) => {
  apiController.getCompanySettings(req, res);
});

router.post(apiRoutes.companySettings.update.url, (req: Request, res: Response) => {
  apiController.setCompanySettings(req, res);
});

// 접속 제한
router.get(apiRoutes.accessSettings.read.url, (req: Request, res: Response) => {
  apiController.getAccessSettings(req, res);
});

router.post(apiRoutes.accessSettings.update.url, (req: Request, res: Response) => {
  apiController.setAccessSettings(req, res);
});

// 시스템 설정
router.get(apiRoutes.systemSettings.read.url, (req: Request, res: Response) => {
  apiController.getSystemSettings(req, res);
});

router.post(apiRoutes.systemSettings.update.url, (req: Request, res: Response) => {
  apiController.setSystemSettings(req, res);
});

export default router;
