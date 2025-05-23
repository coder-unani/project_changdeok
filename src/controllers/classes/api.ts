import { Request, Response } from 'express';

import { httpStatus } from '../../common/constants';
import { AppError, AuthError, ForbiddenError, NotFoundError, ValidationError } from '../../common/error';
import { getCookie, removeCookie, setCookie } from '../../common/utils/cookie';
import { formatApiResponse } from '../../common/utils/format';
import { getAccessedEmployee } from '../../common/utils/verify';
import { Config } from '../../config/config';
import { apiRoutes } from '../../config/routes';
import { prisma } from '../../library/database';
import { createJWT, verifyJWT } from '../../library/jwt';
import {
  BannerService,
  ContentService,
  EmployeeService,
  PermissionService,
  SettingsService,
  StatsService,
  SystemService,
} from '../../services';
import { IEmployeeToken } from '../../types/object';
import {
  IRequestAccessSettings,
  IRequestBannerUpdate,
  IRequestBannerWrite,
  IRequestBanners,
  IRequestContentGroupUpdate,
  IRequestContentUpdate,
  IRequestContentWrite,
  IRequestEmployeeDelete,
  IRequestEmployeeForceUpdatePassword,
  IRequestEmployeeLogin,
  IRequestEmployeeRegister,
  IRequestEmployeeUpdate,
  IRequestEmployeeUpdatePassword,
  IRequestSearchList,
  IRequestSiteSettings,
  IRequestSystemSettings,
  typeListSort,
} from '../../types/request';
import {
  IBannerService,
  IContentService,
  IEmployeeService,
  IPermissionService,
  ISettingsService,
  IStatsService,
  ISystemService,
} from '../../types/service';

export class ApiController {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  // 헬스 체크
  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.status(httpStatus.OK).send('OK');
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 배너 등록
  public async bannerWrite(req: Request, res: Response): Promise<void> {
    try {
      // 로그인 직원 정보
      const accessedEmployee = getAccessedEmployee(req);
      if (!accessedEmployee) {
        throw new AuthError('로그인 정보가 없습니다.');
      }

      // 배너 그룹 ID
      const groupId = parseInt(req.body.groupId);
      if (isNaN(groupId)) {
        throw new ValidationError('배너 그룹 ID가 잘못되었습니다.');
      }

      // 배너 시퀀스
      const seq = parseInt(req.body.seq);
      if (isNaN(seq)) {
        throw new ValidationError('배너 시퀀스 값이 잘못되었습니다.');
      }

      // 이미지 경로
      let imagePath = null;
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // 특정 필드명의 파일을 가져옴
        const fieldFiles = files['image'];
        if (fieldFiles && fieldFiles.length > 0) {
          imagePath = fieldFiles[0].path;
          // public 경로 제거
          if (imagePath.startsWith('public')) {
            imagePath = imagePath.replace('public', '');
          }
        }
      }

      // 요청 데이터
      const requestData: IRequestBannerWrite = {
        groupId: groupId,
        seq: seq,
        title: req.body.title,
        description: req.body.description || null,
        imagePath: imagePath,
        linkType: req.body.linkType || null,
        linkUrl: req.body.linkUrl || null,
        isPublished: req.body.isPublished && req.body.isPublished === 'Y' ? true : false,
        publishedAt: req.body.publishedAt ? req.body.publishedAt : new Date().toISOString(),
        unpublishedAt: req.body.unpublishedAt ? req.body.unpublishedAt : null,
        createdBy: accessedEmployee.id,
      };

      // 배너 등록
      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.create(requestData);

      // 등록 실패
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 등록 성공
      res.status(httpStatus.CREATED).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 배너 상세 정보
  public async bannerDetail(req: Request, res: Response): Promise<void> {
    try {
      // 배너 ID
      const bannerId = parseInt(req.params.bannerId);
      if (isNaN(bannerId)) {
        throw new ValidationError('배너 ID가 잘못되었습니다.');
      }

      // 배너 상세 조회
      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.read(bannerId);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공시 200 응답
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 배너 수정
  public async bannerUpdate(req: Request, res: Response): Promise<void> {
    try {
      // 로그인 직원 정보
      const accessedEmployee = getAccessedEmployee(req);
      if (!accessedEmployee) {
        throw new AuthError('로그인 정보가 없습니다.');
      }

      // 배너 ID
      const bannerId = parseInt(req.params.bannerId);
      if (isNaN(bannerId)) {
        throw new ValidationError('배너 ID가 잘못되었습니다.');
      }

      let imagePath = null;
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // 특정 필드명의 파일을 가져옴
        const fieldFiles = files['image'];
        if (fieldFiles && fieldFiles.length > 0) {
          imagePath = fieldFiles[0].path;
          // public 경로 제거
          if (imagePath.startsWith('public')) {
            imagePath = imagePath.replace('public', '');
          }
        }
      }

      // 요청 데이터
      const requestData: IRequestBannerUpdate = {
        title: req.body.title,
        description: req.body.description || null,
        imagePath: imagePath,
        linkType: req.body.linkType || null,
        linkUrl: req.body.linkUrl || null,
        isPublished: req.body.isPublished && req.body.isPublished === 'Y' ? true : false,
        publishedAt: req.body.publishedAt ? req.body.publishedAt : new Date().toISOString(),
        unpublishedAt: req.body.unpublishedAt ? req.body.unpublishedAt : null,
        updatedBy: accessedEmployee.id,
      };

      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.update(bannerId, requestData);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 수정 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 배너 삭제
  public async bannerDelete(req: Request, res: Response): Promise<void> {
    try {
      // 배너 ID
      const bannerId = parseInt(req.params.bannerId);
      if (isNaN(bannerId)) {
        throw new ValidationError('배너 ID가 잘못되었습니다.');
      }

      // 배너 삭제
      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.delete(bannerId);

      // 삭제 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 삭제 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 배너 목록
  public async banners(req: Request, res: Response): Promise<void> {
    try {
      // 배너 그룹 ID
      const groupId = parseInt(req.query.groupId as string);
      if (!groupId || isNaN(groupId)) {
        throw new ValidationError('배너 그룹 ID가 잘못되었습니다.');
      }

      // 배너 시퀀스
      const seq = parseInt(req.query.seq as string);
      if (!seq || isNaN(seq)) {
        throw new ValidationError('배너 시퀀스 값이 잘못되었습니다.');
      }

      // 요청 데이터
      const params: IRequestBanners = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        query: (req.query.query as string) || '',
        groupId,
        seq,
      };

      // 배너 목록 조회
      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.list(params);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 배너 그룹
  public async bannerGroup(req: Request, res: Response): Promise<void> {
    try {
      // 배너 그룹 ID
      let groupIds: number[] = [];
      if (req.params.groupIds != 'all') {
        groupIds = req.params.groupIds.split(',').map((id) => parseInt(id));
      }

      // 배너 그룹 정보 조회
      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.groupInfo(groupIds, true);

      // 조회 실패
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 배너 그룹 정보 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);

      // 응답 성공
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 컨텐츠 목록
  public async contents(req: Request, res: Response): Promise<void> {
    try {
      // 컨텐츠 그룹 ID 추출
      const groupId = parseInt(req.params.groupId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(groupId)) {
        throw new ValidationError('컨텐츠 그룹 ID가 잘못되었습니다.');
      }

      // 요청 데이터
      const requestData: IRequestSearchList = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        query: (req.query.query as string) || '',
        sort: (req.query.sort as typeListSort) || 'ID_DESC',
      };

      // 컨텐츠 목록 조회
      const contentService: IContentService = new ContentService(prisma);
      const result = await contentService.list(groupId, requestData);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 컨텐츠 등록
  public async contentWrite(req: Request, res: Response): Promise<void> {
    try {
      // 컨텐츠 그룹 ID 추출
      const groupId = parseInt(req.params.groupId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(groupId)) {
        throw new ValidationError('컨텐츠 그룹 ID가 잘못되었습니다.');
      }

      // 요청 데이터
      const requestData: IRequestContentWrite = req.body;

      // IP 주소 얻기
      // requestData.ip = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
      requestData.ip = req.ip || req.socket.remoteAddress;
      // User-Agent 얻기
      requestData.userAgent = req.get('user-agent') || '';

      // User-Agent 얻기
      const userAgent = req.get('user-agent') || '';

      // 컨텐츠 등록 처리
      const contentService: IContentService = new ContentService(prisma);
      const result = await contentService.create(groupId, requestData);

      // 등록 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 등록 성공
      res.status(httpStatus.CREATED).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 컨텐츠 상세 정보
  public async contentDetail(req: Request, res: Response): Promise<void> {
    try {
      // 컨텐츠 그룹 ID 추출
      const groupId = parseInt(req.params.groupId);

      // 컨텐츠 ID 추출
      const contentId = parseInt(req.params.contentId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(groupId) || isNaN(contentId)) {
        throw new ValidationError('컨텐츠 그룹 ID 또는 컨텐츠 ID가 잘못되었습니다.');
      }

      // 컨텐츠 상세 조회
      const contentService: IContentService = new ContentService(prisma);
      const result = await contentService.read(contentId);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 컨텐츠 수정
  public async contentUpdate(req: Request, res: Response): Promise<void> {
    try {
      // 컨텐츠 그룹 ID 추출
      const groupId = parseInt(req.params.groupId);

      // 컨텐츠 ID 추출
      const contentId = parseInt(req.params.contentId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(groupId) || isNaN(contentId)) {
        throw new ValidationError('컨텐츠 그룹 ID 또는 컨텐츠 ID가 잘못되었습니다.');
      }

      // 요청 데이터
      const requestData: IRequestContentUpdate = req.body;

      // 컨텐츠 수정 처리
      const contentService: IContentService = new ContentService(prisma);
      const result = await contentService.update(contentId, requestData);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 수정 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * 컨텐츠 삭제
   * @param req Request
   * @param res Response
   */
  public async contentDelete(req: Request, res: Response): Promise<void> {
    try {
      // 컨텐츠 그룹 ID 추출
      const groupId = parseInt(req.params.groupId);

      // 컨텐츠 ID 추출
      const contentId = parseInt(req.params.contentId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(groupId) || isNaN(contentId)) {
        throw new ValidationError('컨텐츠 그룹 ID 또는 컨텐츠 ID가 잘못되었습니다.');
      }

      // 컨텐츠 삭제 처리
      const contentService: IContentService = new ContentService(prisma);
      const result = await contentService.delete(contentId);

      // 삭제 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 삭제 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * 컨텐츠 이미지 업로드
   * @param req Request
   * @param res Response
   */
  public uploadContentImage(req: Request, res: Response): void {
    try {
      // 파일이 없는 경우
      if (!req.files) {
        throw new ValidationError('업로드할 파일이 없습니다.');
      }

      // req.files는 이제 { [fieldname: string]: Express.Multer.File[] } 형태
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // 첫 번째 필드의 첫 번째 파일을 가져옴
      const firstFieldName = Object.keys(files)[0];
      if (!firstFieldName || !files[firstFieldName] || files[firstFieldName].length === 0) {
        throw new ValidationError('업로드할 파일이 없습니다.');
      }

      // 파일 정보
      const file = files[firstFieldName][0];
      if (!file.path || typeof file.path !== 'string') {
        throw new ValidationError('업로드할 파일이 없습니다.');
      }

      // 파일 경로
      const filePath = file.path.replace('public', '');

      // 응답
      res.status(200).json({
        url: filePath,
        message: '이미지 업로드 성공',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 컨텐츠 그룹 정보
  public async contentGroupInfo(req: Request, res: Response): Promise<void> {
    try {
      // 컨텐츠 그룹 ID 추출
      const groupId = parseInt(req.params.groupId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(groupId)) {
        throw new ValidationError('컨텐츠 그룹 ID가 잘못되었습니다.');
      }

      // 컨텐츠 그룹 정보 조회
      const contentService: IContentService = new ContentService(prisma);
      const result = await contentService.groupInfo(groupId);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 컨텐츠 그룹 수정
  public async contentGroupUpdate(req: Request, res: Response): Promise<void> {
    try {
      // 컨텐츠 그룹 ID 추출
      const groupId = Number(req.params.groupId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (!groupId || isNaN(groupId)) {
        throw new ValidationError('컨텐츠 그룹 ID가 잘못되었습니다.');
      }

      // 요청 데이터
      const requestData: IRequestContentGroupUpdate = {
        description: req.body.description || null,
        sizePerPage: Number(req.body.sizePerPage || null),
        registNotice: ['EMAIL'].includes(req.body.registNotice) ? req.body.registNotice : 'NONE',
      };

      // 컨텐츠 그룹 수정 처리
      const contentService: IContentService = new ContentService(prisma);
      const result = await contentService.updateGroup(groupId, requestData);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 수정 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 등록
  public async employeeRegist(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestEmployeeRegister = req.body;

      // 접속 정보 확인
      const cookieAccessToken = getCookie(req, 'access_token');
      const cookieEmployee = getCookie(req, 'employee');

      // 접속 정보 확인 실패
      if (!cookieAccessToken || !cookieEmployee) {
        throw new AuthError('로그인 정보가 없습니다.');
      }

      // 접속 정보 확인
      const loggedInEmployee: IEmployeeToken = JSON.parse(cookieEmployee);

      // 직원 생성자 ID 설정
      requestData.grantedById = loggedInEmployee.id;

      // 직원 등록 처리
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.create(requestData);

      // 등록 실패
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 등록 성공
      res.status(httpStatus.CREATED).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 상세
  public async employeeDetail(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        throw new ValidationError('직원 ID가 잘못되었습니다.');
      }

      // 직원 상세 조회
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.read(employeeId);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 정보 수정
  public async employeeUpdate(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        throw new ValidationError('직원 ID가 잘못되었습니다.');
      }

      // 접속 정보 확인
      const cookieAccessToken = getCookie(req, 'access_token');
      const cookieEmployee = getCookie(req, 'employee');

      // 접속 정보 확인 실패
      if (!cookieAccessToken || !cookieEmployee) {
        throw new AuthError('로그인 정보가 없습니다.');
      }

      // 현재 로그인된 직원 정보
      const loggedInEmployee: IEmployeeToken = JSON.parse(cookieEmployee);

      // 요청 데이터
      const requestData: IRequestEmployeeUpdate = req.body;

      // 직원 정보 수정 처리
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.update(employeeId, requestData);

      console.log(result);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 로그인 직원이 수정된 직원인 경우 쿠키 업데이트
      if (result.data && loggedInEmployee.id === result.data.id) {
        const updateEmployee = {
          ...loggedInEmployee,
          id: result.data.id,
          name: result.data.name,
        };
        setCookie(res, 'employee', JSON.stringify(updateEmployee), {
          maxAge: this.config.getSettings().jwtExpireSecond,
        });
      }

      // 수정 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 비밀번호 변경
  public async employeeUpdatePassword(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        throw new ValidationError('직원 ID가 잘못되었습니다.');
      }

      // 접속 정보 확인
      const cookieAccessToken = getCookie(req, 'access_token');
      const cookieEmployee = getCookie(req, 'employee');

      // 접속 정보 확인 실패
      if (!cookieAccessToken || !cookieEmployee) {
        throw new AuthError('로그인 정보가 없습니다.');
      }

      // 현재 로그인된 직원 정보
      const loggedInEmployee: IEmployeeToken = JSON.parse(cookieEmployee);

      // 접근 권한 확인
      let hasPermission = false;
      // 강제 비밀번호 변경 여부
      let isForceUpdatePassword = false;

      // 접근 가능 권한
      const accessPermissions = apiRoutes.employees.updatePassword.permissions;

      // 접근 권한 확인
      if (
        accessPermissions &&
        loggedInEmployee.permissions &&
        loggedInEmployee.permissions.some((permission) => accessPermissions.includes(permission))
      ) {
        hasPermission = true;
      }

      // 접근 권한이 있고 본인인 경우
      if (loggedInEmployee.id === employeeId) {
        hasPermission = true;

        // 접근 권한이 있고 다른 계정인 경우
      } else {
        isForceUpdatePassword = true;
      }

      // 권한 없음 처리
      if (!hasPermission) {
        throw new ForbiddenError('권한이 없습니다.');
      }

      // 직원 비밀번호 변경 처리
      const employeeService: IEmployeeService = new EmployeeService(prisma);

      let result = null;

      // 강제 비밀번호 변경
      if (isForceUpdatePassword) {
        const requestForceData: IRequestEmployeeForceUpdatePassword = req.body;
        result = await employeeService.updatePasswordForce(employeeId, requestForceData);

        // 일반 비밀번호 변경
      } else {
        const requestData: IRequestEmployeeUpdatePassword = req.body;
        result = await employeeService.updatePassword(employeeId, requestData);
      }

      // 변경 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 변경 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 삭제
  public async employeeDelete(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        throw new ValidationError('직원 ID가 잘못되었습니다.');
      }

      // 요청 데이터
      const requestData: IRequestEmployeeDelete = req.body;

      // 직원 삭제 처리
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.delete(employeeId, requestData);

      // 삭제 처리 실패
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 쿠키 삭제
      // 다른 계정을 삭제할 수 있으므로 쿠키 삭제하지 않음
      // removeCookie(res, 'access_token');
      // removeCookie(res, 'employee');

      // 탈퇴 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 권한 수정/변경
  public async employeePermissions(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        throw new ValidationError('직원 ID가 잘못되었습니다.');
      }

      // 접속 정보 확인
      const cookieAccessToken = getCookie(req, 'access_token');
      const cookieEmployee = getCookie(req, 'employee');

      // 접속 정보 확인 실패
      if (!cookieAccessToken || !cookieEmployee) {
        throw new AuthError('로그인 정보가 없습니다.');
      }

      // 현재 로그인된 직원 정보
      const loggedInEmployee: IEmployeeToken = JSON.parse(cookieEmployee);

      // 요청 데이터
      const requestData = req.body;
      const requestPermissions = requestData.permissions.map((permission: any) => parseInt(permission));

      // 직원 권한 수정 처리
      const permissionService: IPermissionService = new PermissionService(prisma);
      const result = await permissionService.updateEmployeesPermissions(
        employeeId,
        requestPermissions,
        loggedInEmployee.id
      );

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 로그인 직원이 수정된 직원인 경우 쿠키 업데이트
      if (result.data && loggedInEmployee.id === employeeId) {
        const updatedEmployee = {
          ...loggedInEmployee,
          permissions: result.data.permissions,
        };
        setCookie(res, 'employee', JSON.stringify(updatedEmployee), {
          maxAge: this.config.getSettings().jwtExpireSecond,
        });
      }

      // 수정 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 목록
  public async employees(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestSearchList = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sort: req.params.sort as typeListSort,
        query: (req.query.query as string) || '',
      };

      // 직원 목록 조회
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.list(requestData);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 로그인
  public async employeeLogin(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestEmployeeLogin = {
        email: req.body.email,
        password: req.body.password,
        clientIp: (req.headers['x-forwarded-for'] as string) || (req.ip as string),
        userAgent: req.headers['user-agent'] as string,
        origin: req.headers['origin'] as string,
        referer: req.headers['referer'] as string,
      };

      // 직원 로그인 처리
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const { result, code, message, metadata, data } = await employeeService.login(requestData);

      // 로그인 실패 처리
      if (!result || !data) {
        throw new AppError(code, message);
      }

      const token = createJWT(
        { id: data.id },
        this.config.getJwtSecretKey(),
        this.config.getSettings().jwtExpireSecond
      );

      if (!token) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, '인증 토큰 생성 실패');
      }

      // 로그인 성공시 쿠키에 토큰 저장
      const employee: IEmployeeToken = {
        id: data.id,
        email: data.email,
        name: data.name,
        permissions: data.permissions,
        token,
      };

      const options = {
        // 쿠키 유지 시간
        maxAge: this.config.getSettings().jwtExpireSecond,
      };

      // 쿠키 저장
      setCookie(res, 'employee', JSON.stringify(employee), { ...options, httpOnly: true, secure: true });

      // 응답 데이터 생성
      const response = formatApiResponse(true, null, null, metadata, data);

      // 로그인 성공
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 로그아웃
  public async employeeLogout(req: Request, res: Response): Promise<void> {
    try {
      // 쿠키 삭제
      removeCookie(res, 'employee');
      removeCookie(res, 'access_token');

      // 로그아웃 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 직원 로그인 히스토리
  public async employeeLoginHistory(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestSearchList = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        query: (req.query.query as string) || '',
        startDate: (req.query.startDate as string) || '',
        endDate: (req.query.endDate as string) || '',
        sort: (req.query.sort as typeListSort) || 'CREATED_AT_DESC',
      };

      // 직원 로그인 히스토리 조회
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.loginHistory(requestData);

      // 호출 실패
      if (!result.result || !result.data) {
        throw new NotFoundError((result.message as string) || '직원 로그인 히스토리를 조회할 수 없습니다.');
      }

      // 응답 데이터 생성
      const response = formatApiResponse(true, null, null, result.metadata, result.data);

      // 응답 성공
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 권한 목록
  public async permissions(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestSearchList = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        query: (req.query.query as string) || '',
      };

      // 권한 목록 조회
      const permissionService: IPermissionService = new PermissionService(prisma);
      const result = await permissionService.list(requestData);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 방문자 통계
  public async statsVisitor(req: Request, res: Response): Promise<void> {
    try {
      const statsService: IStatsService = new StatsService(prisma);
      const { result, code, message, metadata, data } = await statsService.getVisitorStats(
        req.query.startDate as string,
        req.query.endDate as string
      );

      if (!result) {
        throw new AppError(code, message);
      }

      const response = formatApiResponse(true, null, null, metadata, data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 일간 방문자 통계
  public async statsDailyVisitor(req: Request, res: Response): Promise<void> {
    try {
      const statsService: IStatsService = new StatsService(prisma);
      const { result, code, message, metadata, data } = await statsService.getDailyVisitorStats(
        req.query.startDate as string,
        req.query.endDate as string
      );

      if (!result) {
        throw new AppError(code, message);
      }

      const response = formatApiResponse(true, null, null, metadata, data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 페이지 뷰 통계
  public async statsPageView(req: Request, res: Response): Promise<void> {
    try {
      const statsService: IStatsService = new StatsService(prisma);
      const { result, code, message, metadata, data } = await statsService.getPageViews(
        req.query.startDate as string,
        req.query.endDate as string
      );

      if (!result) {
        throw new AppError(code, message);
      }

      const response = formatApiResponse(true, null, null, metadata, data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 국가 통계
  public async statsCountry(req: Request, res: Response): Promise<void> {
    try {
      const statsService: IStatsService = new StatsService(prisma);
      const { result, code, message, metadata, data } = await statsService.getCountryStats(
        req.query.startDate as string,
        req.query.endDate as string
      );

      if (!result) {
        throw new AppError(code, message);
      }

      const response = formatApiResponse(true, null, null, metadata, data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 참조 통계
  public async statsReferrer(req: Request, res: Response): Promise<void> {
    try {
      const statsService: IStatsService = new StatsService(prisma);
      const { result, code, message, metadata, data } = await statsService.getReferrerStats(
        req.query.startDate as string,
        req.query.endDate as string
      );

      if (!result) {
        throw new AppError(code, message);
      }

      const response = formatApiResponse(true, null, null, metadata, data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 시간대별 통계
  public async statsHourly(req: Request, res: Response): Promise<void> {
    try {
      const statsService: IStatsService = new StatsService(prisma);
      const { result, code, message, metadata, data } = await statsService.getHourlyStats(
        req.query.startDate as string,
        req.query.endDate as string
      );

      if (!result) {
        throw new AppError(code, message);
      }

      const response = formatApiResponse(true, null, null, metadata, data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 브라우저 통계
  public async statsBrowser(req: Request, res: Response): Promise<void> {
    try {
      const statsService: IStatsService = new StatsService(prisma);
      const { result, code, message, metadata, data } = await statsService.getBrowserStats(
        req.query.startDate as string,
        req.query.endDate as string
      );

      if (!result) {
        throw new AppError(code, message);
      }

      const response = formatApiResponse(true, null, null, metadata, data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 접속 로그 통계
  public async statsAccessLogs(req: Request, res: Response): Promise<void> {
    try {
      const statsService: IStatsService = new StatsService(prisma);
      const { result, code, message, metadata, data } = await statsService.getAccessLogs(req.query.date as string);

      if (!result) {
        throw new AppError(code, message);
      }

      const response = formatApiResponse(true, null, null, metadata, data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 기본 설정 조회
  public async getSettings(req: Request, res: Response): Promise<void> {
    try {
      // 사이트 설정 조회
      const settingsService: ISettingsService = new SettingsService(prisma);
      const result = await settingsService.getSettings();

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);

      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 사이트 설정 수정
  public async setSiteSettings(req: Request, res: Response): Promise<void> {
    try {
      // 로그인 직원 정보
      const accessedEmployee = getAccessedEmployee(req);
      if (!accessedEmployee) {
        throw new AuthError('로그인 정보가 없습니다.');
      }

      // 파일 정보 처리
      let faviconPath = null;
      let logoPath = null;
      let ogImagePath = null;

      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // 파비콘 파일 처리
        const faviconFiles = files['favicon'];
        if (faviconFiles && faviconFiles.length > 0) {
          faviconPath = faviconFiles[0].path;
          if (faviconPath.startsWith('public')) {
            faviconPath = faviconPath.replace('public', '');
          }
        }

        // 로고 파일 처리
        const logoFiles = files['logo'];
        if (logoFiles && logoFiles.length > 0) {
          logoPath = logoFiles[0].path;
          if (logoPath.startsWith('public')) {
            logoPath = logoPath.replace('public', '');
          }
        }

        // OG태그 이미지 파일 처리
        const ogImageFiles = files['ogImage'];
        if (ogImageFiles && ogImageFiles.length > 0) {
          ogImagePath = ogImageFiles[0].path;
          if (ogImagePath.startsWith('public')) {
            ogImagePath = ogImagePath.replace('public', '');
          }
        }
      }

      // favicon 파일 경로 삽입
      const favicon = faviconPath || req.body.faviconOrig || '';

      // 로고 파일 경로 삽입
      const logo = logoPath || req.body.logoOrig || '';

      // OG태그 이미지 파일 경로 삽입
      const ogTag = req.body.ogTagJson ? JSON.parse(req.body.ogTagJson) : {};
      ogTag['og:image'] = ogImagePath || req.body.ogImageOrig || '';

      // 요청 데이터
      const requestData: IRequestSiteSettings = {
        title: req.body.title,
        introduction: req.body.introduction,
        description: req.body.description,
        keywords: req.body.keywords,
        favicon: favicon,
        logo: logo,
        ogTagJson: ogTag ? JSON.stringify(ogTag) : '',
        serviceDomain: req.body.serviceDomain,
        servicePort: Number(req.body.servicePort),
      };

      // 사이트 설정 수정
      const settingsService: ISettingsService = new SettingsService(prisma);
      const result = await settingsService.updateSiteSettings(requestData);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 응답 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 회사 설정 수정
  public async setCompanySettings(req: Request, res: Response): Promise<void> {
    try {
      // 회사 설정 수정
      const settingsService: ISettingsService = new SettingsService(prisma);
      const result = await settingsService.updateCompanySettings(req.body.companyJson);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 응답 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async setAccessSettings(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestAccessSettings = {
        blockedIpJson: req.body.blockedIpJson,
        blockedBotJson: req.body.blockedBotJson,
      };

      // 접근 설정 수정
      const settingsService: ISettingsService = new SettingsService(prisma);
      const result = await settingsService.updateAccessSettings(requestData);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 응답 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 시스템 설정 수정
  public async setSystemSettings(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestSystemSettings = {
        maxUploadSize: Number(req.body.maxUploadSize),
        jwtExpireSecond: Number(req.body.jwtExpireSecond),
        expressDomain: req.body.expressDomain,
        expressPort: Number(req.body.expressPort),
        enabledTagsJson: req.body.enabledTagsJson,
        enabledCorsJson: req.body.enabledCorsJson,
      };

      // 시스템 설정 수정
      const settingsService: ISettingsService = new SettingsService(prisma);
      const result = await settingsService.updateSystemSettings(requestData);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 응답 성공
      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 서버 재시작
  public async systemRestart(req: Request, res: Response): Promise<void> {
    try {
      const systemService: ISystemService = new SystemService(prisma);
      const result = await systemService.restart();

      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      res.status(httpStatus.NO_CONTENT).send(null);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // 서버 상태 확인
  public async systemStatus(req: Request, res: Response): Promise<void> {
    try {
      const systemService: ISystemService = new SystemService(prisma);
      const result = await systemService.getStatus();

      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      const response = formatApiResponse(true, null, null, null, result.data);
      res.status(httpStatus.OK).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError = (error: any, res: Response) => {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
    }
  };
}
