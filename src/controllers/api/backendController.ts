import { Request, Response } from 'express';

import { HTTP_STATUS } from '../../config/constants';
import { prisma } from '../../config/database';
import { 
  typeListSort,
  IRequestBannerWrite,
  IRequestBannerUpdate,
  IRequestBanners,
  IRequestContentWrite,
  IRequestContentUpdate,
  IRequestEmployeeRegister, 
  IRequestEmployeeUpdate,
  IRequestEmployeeUpdatePassword,
  IRequestEmployeeForceUpdatePassword,
  IRequestEmployeeDelete,
  IRequestEmployeeLogin, 
  IRequestEmployees, 
  IRequestDefaultList,
  IRequestContents,
} from '../../types/request';
import { IEmployeeToken } from '../../types/object';
import { IBannerService, IContentService, IEmployeeService, IPermissionService } from '../../types/service';
import { apiBackendRoutes } from '../../routes/routes';
import { EmployeeService } from '../../services/employeeService';
import { PermissionService } from '../../services/permissionService';
import { BannerService } from '../../services/bannerService';
import { ContentService } from '../../services/contentService';
import { formatApiResponse } from '../../common/formattor';
import { createJWT, verifyJWT } from '../../common/jwt';
import { getCookie, setCookie, removeCookie } from '../../common/cookies';
import { getAccessedEmployee } from '../../common/verifier';
import { AppError, ValidationError, AuthError, PermissionError, NotFoundError, ServerError } from '../../common/error';


export class ApiBackendController {
  // 배너 등록
  public async bannerWrite(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.bannerWrite;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
      if (req.files && req.files instanceof Array && req.files.length > 0) {
        imagePath = req.files[0].path;
        // public 경로 제거
        if (imagePath.startsWith('public')) {
          imagePath = imagePath.replace('public', '');
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
        isPublished: (req.body.isPublished && req.body.isPublished === 'Y') ? true : false,
        publishedAt: req.body.publishedAt ? req.body.publishedAt : new Date().toISOString(),
        unpublishedAt: req.body.unpublishedAt ? req.body.unpublishedAt : null,
        createdBy: accessedEmployee.id
      }

      // 배너 등록
      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.create(requestData);

      // 등록 실패
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }
      
      // 등록 성공
      res.status(HTTP_STATUS.CREATED).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 배너 상세 정보
  public async bannerDetail(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.bannerDetail;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);
      
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
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 배너 수정
  public async bannerUpdate(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.bannerUpdate;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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

      // 이미지 경로
      let imagePath = null;
      if (req.files && req.files instanceof Array && req.files.length > 0) {
        imagePath = req.files[0].path;
        // public 경로 제거
        if (imagePath.startsWith('public')) {
          imagePath = imagePath.replace('public', '');
        }
      }

      // 요청 데이터
      const requestData: IRequestBannerUpdate = {
        title: req.body.title,
        description: req.body.description || null,
        imagePath: imagePath,
        linkType: req.body.linkType || null,
        linkUrl: req.body.linkUrl || null,
        isPublished: (req.body.isPublished && req.body.isPublished === 'Y') ? true : false,
        publishedAt: req.body.publishedAt ? req.body.publishedAt : new Date().toISOString(),
        unpublishedAt: req.body.unpublishedAt ? req.body.unpublishedAt : null,
        updatedBy: accessedEmployee.id
      };

      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.update(bannerId, requestData);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 수정 성공
      res.status(HTTP_STATUS.NO_CONTENT).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 배너 삭제
  public async bannerDelete(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.bannerDelete;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
      res.status(HTTP_STATUS.NO_CONTENT).send(null);
    
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 배너 목록
  public async banners(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.banners;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
        query: req.query.query as string || '',
        groupId,
        seq,
      }

      // 배너 목록 조회
      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.list(params);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 배너 그룹
  public async bannerGroup(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.bannerGroup;
    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 배너 그룹 ID
      const groupId = parseInt(req.params.groupId);
      if (isNaN(groupId)) {
        throw new ValidationError('배너 그룹 ID가 잘못되었습니다.');
      }

      // 배너 그룹 정보 조회
      const bannerService: IBannerService = new BannerService(prisma);
      const result = await bannerService.groupInfo(groupId);

      // 조회 실패
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 응답 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 컨텐츠 목록
  public async contents(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.contents;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 컨텐츠 그룹 ID 추출
      const groupId = parseInt(req.params.groupId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(groupId)) {
        throw new ValidationError('컨텐츠 그룹 ID가 잘못되었습니다.');
      }

      // 요청 데이터
      const requestData: IRequestContents = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        query: req.query.query as string || '',
        sort: req.query.sort as typeListSort || 'ID_DESC',
      }

      // 컨텐츠 목록 조회
      const contentService: IContentService = new ContentService(prisma);
      const result = await contentService.list(groupId, requestData);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 컨텐츠 등록
  public async contentWrite(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.contentWrite;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
      res.status(HTTP_STATUS.CREATED).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 컨텐츠 상세 정보
  public async contentDetail(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.contentDetail;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 컨텐츠 수정
  public async contentUpdate(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.contentUpdate;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
      res.status(HTTP_STATUS.NO_CONTENT).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 컨텐츠 삭제
  public async contentDelete(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.contentDelete;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
      res.status(HTTP_STATUS.NO_CONTENT).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 직원 등록
  public async employeeRegist(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.employeeRegist;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);
  
      // 요청 데이터
      const requestData: IRequestEmployeeRegister = req.body;
      
      // 직원 등록 처리
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.create(requestData);

      // 등록 실패
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }
      
      // 등록 성공
      res.status(HTTP_STATUS.CREATED).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  };

  // 직원 상세
  public async employeeDetail(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.employeeDetail;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 직원 정보 수정
  public async employeeUpdate(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.employeeUpdate;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        throw new ValidationError('직원 ID가 잘못되었습니다.');
      }

      // 요청 데이터
      const requestData: IRequestEmployeeUpdate = req.body;

      // 직원 정보 수정 처리
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.update(employeeId, requestData);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 쿠키 업데이트
      if (result.data) {
        setCookie(
          res, 
          'employee', 
          JSON.stringify({
            id: result.data.id,
            name: result.data.name,
            permissions: result.data.permissions,
          })
        );
      }
      
      // 수정 성공
      res.status(HTTP_STATUS.NO_CONTENT).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 직원 비밀번호 변경
  public async employeeUpdatePassword(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.employeeUpdatePassword;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        throw new ValidationError('직원 ID가 잘못되었습니다.');
      }

      // 로그인 확인
      const accessToken = getCookie(req, 'accessToken');
      const tokenEmployee = (accessToken) ? verifyJWT(accessToken) : null;
      if (!tokenEmployee) {
        throw new AuthError('로그인 정보가 없습니다.');
      }
      
      const loggedInEmployee: IEmployeeToken = tokenEmployee;

      // 접근 권한 확인
      let hasPermission = false;
      // 강제 비밀번호 변경 여부
      let isForceUpdatePassword = false;

      // 접근 가능 권한
      const accessPermissions = apiBackendRoutes.employeeUpdatePassword.permissions;

      // 접근 권한 확인
      if (accessPermissions && (
          loggedInEmployee.permissions
          && loggedInEmployee.permissions.some(permission => accessPermissions.includes(permission))
        )
      ) {
        hasPermission = true;
      }
      
      // 접근 권한이 있고 본인인 경우
      if (tokenEmployee.id === employeeId) {
        hasPermission = true;

      // 접근 권한이 있고 다른 계정인 경우
      } else {
        isForceUpdatePassword = true;
      }

      // 권한 없음 처리
      if (!hasPermission) {
        throw new PermissionError('권한이 없습니다.');
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
      res.status(HTTP_STATUS.NO_CONTENT).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 직원 삭제
  public async employeeDelete(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.employeeDelete;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

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
      // removeCookie(res, 'accessToken');
      // removeCookie(res, 'employee');

      // 탈퇴 성공
      res.status(HTTP_STATUS.NO_CONTENT).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 직원 권한 수정/변경
  public async employeePermissions(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.employeePermissions;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        throw new ValidationError('직원 ID가 잘못되었습니다.');
      }

      // 요청 데이터
      const requestData = req.body;
      const requestPermissions = requestData.permissions.map((permission: any) => parseInt(permission));

      // 로그인 유저 정보
      const decodedToken = verifyJWT(req.cookies.accessToken);
      const grantedById = decodedToken ? parseInt(decodedToken.id) : null;

      // 로그인 확인
      if (!grantedById) {
        throw new AuthError('로그인 정보가 없습니다.');
      }

      // 직원 권한 수정 처리
      const permissionService: IPermissionService = new PermissionService();
      const result = await permissionService.updateEmployeesPermissions(employeeId, requestPermissions, grantedById);

      // 수정 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 쿠키 업데이트
      if (result.data) {
        setCookie(
          res,
          'employee',
          JSON.stringify({
            id: result.data.id,
            name: result.data.name,
            permissions: result.data.permissions,
          })
        );
      }
      
      // 수정 성공
      res.status(HTTP_STATUS.NO_CONTENT).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 직원 목록
  public async employees(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.employees;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 요청 데이터
      const requestData: IRequestEmployees = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sort: req.params.sort as typeListSort,
        query: req.query.query as string || '',
      }

      // 직원 목록 조회
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.list(requestData);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }
      
      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 직원 로그인
  public async employeeLogin(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestEmployeeLogin = req.body;

      // 직원 로그인 처리
      const employeeService: IEmployeeService = new EmployeeService(prisma);
      const result = await employeeService.login(requestData);

      // 로그인 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }
      
      // 로그인 성공시 쿠키에 토큰 저장
      if (result.data) {
        const tokenData: IEmployeeToken = {
          id: result.data.id,
          email: result.data.email,
          name: result.data.name,
          permissions: result.data.permissions,
        }
        const token = createJWT(tokenData);

        if (token) {
          setCookie(res, 'accessToken', token);
          setCookie(res, 'employee', JSON.stringify(tokenData));
        }
      }
      
      // 응답 데이터 생성
      const response = formatApiResponse(true, null, null, result.metadata, result.data);

      // 로그인 성공
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  };

  // 직원 로그아웃
  public async employeeLogout(req: Request, res: Response): Promise<void> {
    try {
      // 쿠키 삭제
      removeCookie(res, 'employee');
      removeCookie(res, 'accessToken');

      // 로그아웃 성공
      res.status(HTTP_STATUS.NO_CONTENT).send(null);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  // 권한 목록
  public async permissions(req: Request, res: Response): Promise<void> {
    const { permissions } = apiBackendRoutes.permissions;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);
    
      // 요청 데이터
      const requestData: IRequestDefaultList = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        query: req.query.query as string || '',
      }

      // 권한 목록 조회
      const permissionService: IPermissionService = new PermissionService();
      const result = await permissionService.list(requestData);

      // 조회 실패 처리
      if (!result.result) {
        throw new AppError(result.code, result.message);
      }

      // 조회 성공
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: '알 수 없는 오류가 발생하였습니다.' });
      }
    }
  }

  public verifyPermission(req: Request, permissions: number[] = []): void {

  }
}