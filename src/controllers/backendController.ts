import { Request, Response } from 'express';

import {
  getApiBannerDetail,
  getApiBannerGroup,
  getApiBanners,
  getApiContentDetail,
  getApiContentGroup,
  getApiContents,
  getApiEmployeeDetail,
  getApiPermissionList,
} from '../common/api';
import { getCookie } from '../common/utils/cookie';
import { AppError, AuthError, ValidationError } from '../common/utils/error';
import { verifyJWT } from '../library/jwt';
import { getAccessToken } from '../common/utils/verify';
import { CONFIG } from '../config/config';
import { prisma } from '../library/database';
import { apiRoutes, backendRoutes } from '../config/routes';
import { EmployeeService } from '../services/employeeService';
import { IEmployeeToken } from '../types/object';
import { IRoute } from '../types/config';
import { IRequestBanners, IRequestContents, typeListSort } from '../types/request';
import { decryptDataAES } from '../library/encrypt';

// TODO: 권한을 체크해서 다른 계정도 수정하게 할 것인지 확인 필요
export class BackendController {
  constructor() {}

  // 관리자 홈
  public index = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      // 관리자 홈 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 대시보드
  public dashboard = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 배너 정보
      const banners = [
        { title: '메인화면', published: 3, reserved: 1, expired: 2 },
        { title: '팝업', published: 5, reserved: 3, expired: 3 },
      ];

      // 게시물 정보
      const contents = [
        { title: '공지사항', count: 2 },
        { title: '문의', count: 1 },
      ];

      // 관리자 정보
      const employees = { count: 2 };

      // 제목 정보
      const metadata = {
        banners: { title: '화면' },
        contents: { title: '게시판' },
        employees: { title: '관리자' },
      };

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata,
        data: {
          banners,
          contents,
          employees,
        },
      };

      // 대시보드 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 화면 관리: 배너 등록
  public bannerWrite = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 접속 토큰
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new AuthError('로그인이 필요합니다.');
      }

      // 배너 그룹 ID
      const groupId = Number(req.query.gp);
      if (!groupId || isNaN(groupId)) {
        throw new ValidationError('배너 그룹 ID가 올바르지 않습니다.');
      }

      // 배너 시퀀스
      const seq = Number(req.query.sq);
      if (seq <= 0) {
        throw new ValidationError('배너 시퀀스가 올바르지 않습니다.');
      }

      // 배너 그룹 정보 조회
      const apiGroupInfo = await getApiBannerGroup([groupId]);
      const bannerGroupInfo = apiGroupInfo.data?.[0] || null;

      // 배너 그룹 정보 조회 실패
      if (!apiGroupInfo.result || !bannerGroupInfo) {
        throw new AppError(apiGroupInfo.code as number, apiGroupInfo.message as string);
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: `${bannerGroupInfo.title} ${route.title}`,
        metadata: {
          groupInfo: {
            id: apiGroupInfo.metadata.group.ids?.[0],
            title: bannerGroupInfo.title,
            imageWidth: bannerGroupInfo.imageWidth,
            imageHeight: bannerGroupInfo.imageHeight,
          },
          seq,
        },
        data: {},
      };

      // 배너 등록 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 화면 관리: 배너 상세
  public bannerDetail = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 접속 토큰
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      // 배너 ID
      const bannerId = Number(req.params.bannerId);
      if (!bannerId || isNaN(bannerId)) {
        throw new Error('배너 ID가 올바르지 않습니다.');
      }

      const { result, message, metadata, data: banner } = await getApiBannerDetail(bannerId);

      // 배너 상세 정보 조회 실패
      if (!result) {
        throw new Error(message as string);
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: `${metadata.groupInfo.title} ${route.title}`,
        metadata,
        data: banner,
      };

      // 배너 상세 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 화면 관리: 배너 수정
  public bannerUpdate = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 접속 토큰
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      // 배너 ID
      const bannerId = Number(req.params.bannerId);
      if (!bannerId || isNaN(bannerId)) {
        throw new Error('배너 ID가 올바르지 않습니다.');
      }

      const { result, message, metadata, data: banner } = await getApiBannerDetail(bannerId);

      // 배너 상세 정보 조회 실패
      if (!result) {
        throw new Error(message as string);
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: `${metadata.groupInfo.title} ${route.title}`,
        metadata,
        data: banner,
      };

      // 배너 상세 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 화면 관리: 배너 목록
  public banners = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 접속 토큰
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      // 배너 그룹 ID
      const groupId = Number(req.query.gp);
      if (!groupId || isNaN(groupId)) {
        throw new Error('배너 그룹 ID가 올바르지 않습니다.');
      }

      // 배너 시퀀스
      const seq = Number(req.query.sq);
      if (seq <= 0) {
        throw new Error('배너 시퀀스 조건이 올바르지 않습니다.');
      }

      // API Params
      const params: IRequestBanners = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
        query: req.query.query ? (req.query.query as string) : '',
        groupId,
        seq,
      };

      // API 호출
      const { result, message, metadata, data: banners } = await getApiBanners(params);

      // 호출 실패
      if (!result) {
        throw new Error(message as string);
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: `${metadata.groupInfo.title} ${route.title}`,
        metadata,
        data: banners,
      };

      // 배너 목록 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 화면 관리: 배너
  public screenBanners = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      // 배너 관리 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 화면 관리: 팝업
  public popupBanners = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      // 팝업 관리 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 게시판 관리
  public contents = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 게시판 ID 추출
      const groupId = Number(req.params.groupId);

      // 게시판 ID가 없는 경우
      if (!groupId || isNaN(groupId)) {
        throw new ValidationError('게시판 아이디가 형식에 맞지 않습니다.');
      }

      // params 생성
      const params: IRequestContents = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
        query: req.query.query ? (req.query.query as string) : '',
        sort: req.query.sort ? (req.query.sort as typeListSort) : 'ID_DESC',
      };

      // API 호출
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new AuthError('로그인이 필요합니다.');
      }

      const { result, code, message, metadata, data: contents } = await getApiContents(groupId, params);

      if (!result) {
        throw new AppError(code || 500, message || '');
      }

      // 게시판 그룹 정보
      const { data: group } = await getApiContentGroup(groupId);

      const groupTitle = group?.title ?? '게시판';

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: `${groupTitle} 목록`,
        metadata,
        data: contents,
      };

      // 게시판 관리 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 게시글 작성
  public contentWrite = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 게시판 ID 추출
      const groupId = Number(req.params.groupId);

      // 게시판 ID가 없는 경우
      if (!groupId || isNaN(groupId)) {
        throw new Error('게시판 아이디가 형식에 맞지 않습니다.');
      }

      // 게시판 그룹 정보
      const { data: group } = await getApiContentGroup(groupId);

      const groupTitle = group?.title ?? '게시판';

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: `${groupTitle} 작성`,
        metadata: {
          group: {
            id: groupId,
          },
        },
        data: {},
      };

      // 게시글 작성 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 게시글 상세 정보
  public contentDetail = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 게시판 ID와 게시글 ID 추출
      const groupId = Number(req.params.groupId);
      const contentId = Number(req.params.contentId);

      // 컨텐츠 그룹 ID가 없는 경우
      if (!groupId || isNaN(groupId)) {
        throw new ValidationError('잘못된 게시판 그룹 입니다.');
      }

      // 컨텐츠 ID가 없는 경우
      if (!contentId || isNaN(contentId)) {
        throw new ValidationError('잘못된 게시글 번호 입니다.');
      }

      // 게시판 그룹 정보 API 호출
      const getContentGroup = await getApiContentGroup(groupId);

      if (!getContentGroup.result) {
        throw new AppError(getContentGroup.code || 500, getContentGroup.message || '');
      }

      const groupTitle = getContentGroup.data?.title ?? '게시판';

      // 컨텐츠 상세 API 호출
      const getContentDetail = await getApiContentDetail(groupId, contentId);

      if (!getContentDetail.result) {
        throw new AppError(getContentDetail.code || 500, getContentDetail.message || '');
      }

      // 게시글 상세 content가 있을 경우
      if (getContentGroup.data?.isEncrypt && getContentDetail.data?.content) {
        // AES 복호화
        getContentDetail.data.content = decryptDataAES(getContentDetail.data?.content);
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: `${groupTitle} 상세`,
        metadata: {
          group: getContentGroup.metadata,
          content: getContentDetail.metadata,
        },
        data: getContentDetail.data,
      };

      // 게시글 상세 정보 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 게시글 업데이트
  public contentUpdate = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 게시판 ID와 게시글 ID 추출
      const groupId = Number(req.params.groupId);
      const contentId = Number(req.params.contentId);

      // 컨텐츠 그룹 ID가 없는 경우
      if (!groupId || isNaN(groupId)) {
        throw new Error('존재하지 않는 게시판입니다.');
      }

      // 컨텐츠 ID가 없는 경우
      if (!contentId) {
        throw new Error('존재하지 않는 게시글입니다.');
      }

      // API 호출
      const { metadata, data: content } = await getApiContentDetail(groupId, contentId);

      // 게시판 그룹 정보
      const { data: group } = await getApiContentGroup(groupId);

      const groupTitle = group?.title ?? '게시판';

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: `${groupTitle} 수정`,
        metadata,
        data: content,
      };

      // 게시글 상세 정보 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 등록
  public employeeRegist = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      this.verifyPermission(req, route.permissions);

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      // 직원 등록 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 상세 정보
  public employeeDetail = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 접근 권한 체크
      this.verifyPermission(req, route.permissions, employeeId);

      // 관리자 상세 정보 조회
      const { metadata, data: employee } = await getApiEmployeeDetail(employeeId);

      // 결과가 없는 경우 에러 페이지 이동
      if (!employee) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata,
        data: employee,
      };

      // 상세 정보 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 정보 수정
  public employeeUpdate = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 접근 권한 체크
      this.verifyPermission(req, route.permissions, employeeId);

      // 관리자 정보 조회
      const { data: employee } = await getApiEmployeeDetail(employeeId);

      // 결과가 없는 경우 에러 페이지 이동
      if (!employee) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: employee,
      };

      // 직원 정보 수정 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 비밀번호 수정
  public employeeUpdatePassword = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // 직원 ID가 없는 경우 에러 페이지로 이동
      if (!employeeId) {
        throw new Error('직원 아이디가 필요합니다.');
      }

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 접근 권한 체크
      this.verifyPermission(req, route.permissions, employeeId);

      // 로그인한 직원과 수정하려는 직원이 다른 경우
      let isForceUpdatePassword = false;
      const cookieEmployee = getCookie(req, 'employee');
      if (cookieEmployee) {
        const loggedInEmployee: IEmployeeToken = JSON.parse(cookieEmployee);
        if (loggedInEmployee.id !== employeeId) {
          isForceUpdatePassword = true;
        }
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: { employeeId, isForceUpdatePassword },
      };

      // 직원 비밀번호 수정 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 삭제
  public employeeDelete = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // 직원 ID가 없는 경우 에러 페이지로 이동
      if (!employeeId) {
        throw new Error('직원 아이디가 필요합니다.');
      }

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 접근 권한 체크
      this.verifyPermission(req, route.permissions, employeeId);

      // 직원 정보 조회
      const employeeService = new EmployeeService(prisma);
      const employee = await employeeService.read(employeeId);

      // 직원 정보가 없는 경우 에러 페이지로 이동
      if (!employee.result) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: employee.data,
      };

      // 직원 삭제 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 권한 변경
  public employeePermissions = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      // this.verifyPermission(req, route.permissions);

      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // 직원 ID가 없는 경우 에러 페이지로 이동
      if (!employeeId) {
        throw new Error('직원 아이디가 필요합니다.');
      }

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 직원 정보 조회
      const accessToken = req.cookies.accessToken;
      const decodedToken = accessToken ? verifyJWT(accessToken) : null;

      // Access Token이 없는 경우 에러 페이지로 이동
      if (!decodedToken) {
        throw new Error('로그인이 필요합니다.');
      }

      // 현재 로그인한 직원 정보 조회
      const { data: grantedByEmployee } = await getApiEmployeeDetail(decodedToken.id);

      // 현재 로그인한 직원 정보가 없는 경우 에러 페이지로 이동
      if (!grantedByEmployee) {
        throw new Error('사용자의 정보 조회에 실패했습니다.');
      }

      // 권한을 수정하려는 직원 정보 조회
      const { data: employee } = await getApiEmployeeDetail(employeeId);

      // 직원 정보가 없는 경우 에러 페이지로 이동
      if (!employee) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }

      // 전체 권한 목록
      const { data: permissionsAll } = await getApiPermissionList(1, 10);

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {
          employeeId,
          employee,
          grantedByEmployee,
          permissions: permissionsAll,
        },
      };

      // 직원 권한 수정 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 목록
  public employees = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 접근 권한 체크
      // this.verifyPermission(req, route.permissions);

      // 쿼리 파라미터 생성
      const queryParams = new URLSearchParams(req.body).toString();

      // 관리자 목록 조회
      let apiUrl = CONFIG.SERVICE_URL;
      apiUrl = CONFIG.SERVICE_PORT ? `${apiUrl}:${CONFIG.SERVICE_PORT}` : apiUrl;
      apiUrl = `${apiUrl}${apiRoutes.employees.list.url}?${queryParams}`;
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 응답 오류
      if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
      }

      // JSON 파싱
      const result = await apiResponse.json();

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {
          result: result.result,
          code: result.code,
          message: result.message,
          ...result.metadata,
        },
        data: result.data,
      };

      // 직원 목록 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 로그인
  public employeeLogin = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      // 로그인 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 비밀번호 찾기
  public employeeForgotPassword = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      // 비밀번호 찾기 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  public verifyPermission = (
    req: Request,
    accessPermissions: number[] = [],
    accessEmployeeId: number | undefined | null = null
  ): void => {
    try {
      // Cookie에서 직원 정보 추출
      const cookieEmployee = getCookie(req, 'employee');
      if (!cookieEmployee) {
        throw new Error('로그인이 필요합니다.');
      }

      console.log('cookieEmployee = ', cookieEmployee);

      // Cookie 직원 정보 파싱
      const loggedInEmployee: IEmployeeToken = JSON.parse(cookieEmployee);

      // 권한 확인용 변수
      let hasPermission = false;

      // 권한이 필요없는 페이지이면 접근 가능
      if (accessPermissions.length === 0 && !accessEmployeeId) {
        hasPermission = true;
      }

      // 특정 직원 ID가 허용되어 있으면 해당 직원은 접근 가능
      if (accessEmployeeId && loggedInEmployee.id === accessEmployeeId) {
        hasPermission = true;
      }

      // 특정 권한이 허용되어 있으면 해당 직원은 접근 가능
      if (
        accessPermissions &&
        loggedInEmployee.permissions &&
        loggedInEmployee.permissions.some((permission) => accessPermissions.includes(permission))
      ) {
        hasPermission = true;
      }

      // 권한이 없으면 에러 페이지로 이동
      if (!hasPermission) {
        throw new AuthError('권한이 없습니다.');
      }
    } catch (error) {
      throw error;
    }
  };

  // 에러 페이지
  public renderError = (res: Response, error: unknown): void => {
    const { title, view, layout } = backendRoutes.error;

    if (error instanceof AppError) {
      res.status(error.statusCode).render(view, {
        layout,
        title: `${title} ${error.statusCode}`,
        message: error.message,
      });
    } else {
      res.status(500).render(view, {
        layout,
        title,
        message: '알 수 없는 오류가 발생했습니다.',
      });
    }
  };
}
