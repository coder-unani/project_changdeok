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
  getApiSiteSettings,
} from '../../common/api';
import { AppError, AuthError, NotFoundError, ValidationError } from '../../common/error';
import { getCookie } from '../../common/utils/cookie';
import { getAccessToken } from '../../common/utils/verify';
import { httpStatus } from '../../common/variables';
import { CONFIG } from '../../config/config';
import { apiRoutes, backendRoutes } from '../../config/routes';
import { prisma } from '../../library/database';
import { decryptDataAES } from '../../library/encrypt';
import { verifyJWT } from '../../library/jwt';
import { EmployeeService, StatsService } from '../../services';
import { IPageData, IRoute } from '../../types/config';
import { IEmployeeToken } from '../../types/object';
import { IPermission } from '../../types/object';
import { IRequestBanners, IRequestContents, typeListSort } from '../../types/request';
import { BaseWebController } from './controller';

// TODO: 권한을 체크해서 다른 계정도 수정하게 할 것인지 확인 필요
export class BackendController extends BaseWebController {
  // 직원 인증 및 정보 조회 메서드
  private async getLoggedInEmployee(req: Request, employeeId?: number): Promise<IEmployeeToken> {
    // Cookie에서 직원 정보 추출
    const cookieEmployee = getCookie(req, 'employee');
    if (!cookieEmployee) {
      throw new AuthError('로그인이 필요합니다.');
    }

    // Cookie 직원 정보 파싱
    const loggedInEmployee: IEmployeeToken = JSON.parse(cookieEmployee);

    return loggedInEmployee;
  }

  // 권한 검증 메서드
  public verifyPermission = async (
    req: Request,
    accessPermissions: number[] = [],
    accessEmployeeId?: number
  ): Promise<void> => {
    const loggedInEmployee = await this.getLoggedInEmployee(req, accessEmployeeId);

    // 권한이 필요없는 페이지이면 접근 가능
    if (accessPermissions.length === 0 && !accessEmployeeId) {
      return;
    }

    // 특정 직원 ID가 허용되어 있으면 해당 직원은 접근 가능
    if (accessEmployeeId && loggedInEmployee.id === accessEmployeeId) {
      return;
    }

    // 특정 권한이 허용되어 있으면 해당 직원은 접근 가능
    if (
      accessPermissions.length > 0 &&
      loggedInEmployee.permissions?.some((permission) => accessPermissions.includes(permission))
    ) {
      return;
    }

    throw new AuthError('권한이 없습니다.');
  };

  // 관리자 홈
  public index = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const data = this.createPageData(route);

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
      await this.verifyPermission(req, route.permissions);

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
      const data = this.createPageData(route, route.title, metadata, {
        banners,
        contents,
        employees,
      });

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
      await this.verifyPermission(req, route.permissions);

      // 접속 토큰
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new AuthError('로그인이 필요합니다.');
      }

      // 배너 그룹 ID
      const groupId = this.validateInteger(req.query.gp, '배너 그룹 ID');

      // 배너 시퀀스
      const seq = this.validateInteger(req.query.sq, '배너 시퀀스');

      // 배너 그룹 정보 조회
      const apiGroupInfo = await getApiBannerGroup([groupId]);
      const bannerGroupInfo = apiGroupInfo.data?.[0] || null;

      // 배너 그룹 정보 조회 실패
      if (!apiGroupInfo.result || !bannerGroupInfo) {
        throw new AppError(apiGroupInfo.code as number, apiGroupInfo.message as string);
      }

      // 페이지 데이터 생성
      const data = this.createPageData(route, `${bannerGroupInfo.title} ${route.title}`, {
        groupInfo: {
          id: apiGroupInfo.metadata.group.ids?.[0],
          title: bannerGroupInfo.title,
          imageWidth: bannerGroupInfo.imageWidth,
          imageHeight: bannerGroupInfo.imageHeight,
        },
        seq,
      });

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
      await this.verifyPermission(req, route.permissions);

      // 접속 토큰
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new AuthError('로그인이 필요합니다.');
      }

      // 배너 ID
      const bannerId = this.validateInteger(req.params.bannerId, '배너 ID');

      const { result, message, metadata, data: banner } = await getApiBannerDetail(bannerId);

      // 배너 상세 정보 조회 실패
      if (!result) {
        throw new NotFoundError((message as string) || '배너 상세 정보를 조회할 수 없습니다.');
      }

      // 페이지 데이터 생성
      const data = this.createPageData(route, `${metadata.groupInfo.title} ${route.title}`, metadata, banner);

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
      await this.verifyPermission(req, route.permissions);

      // 접속 토큰
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new AuthError('로그인이 필요합니다.');
      }

      // 배너 ID
      const bannerId = this.validateInteger(req.params.bannerId, '배너 ID');

      const { result, message, metadata, data: banner } = await getApiBannerDetail(bannerId);

      // 배너 상세 정보 조회 실패
      if (!result) {
        throw new NotFoundError((message as string) || '배너 상세 정보를 조회할 수 없습니다.');
      }

      // 페이지 데이터 생성
      const data = this.createPageData(route, `${metadata.groupInfo.title} ${route.title}`, metadata, banner);

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
      await this.verifyPermission(req, route.permissions);

      // 접속 토큰
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        throw new AuthError('로그인이 필요합니다.');
      }

      // 배너 그룹 ID
      const groupId = this.validateInteger(req.query.gp, '배너 그룹 ID');

      // 배너 시퀀스
      const seq = this.validateInteger(req.query.sq, '배너 시퀀스');

      const getBannerGroup = await getApiBannerGroup([groupId]);
      const bannerGroupInfo = getBannerGroup.data?.[0] || null;

      if (!getBannerGroup.result || !bannerGroupInfo) {
        throw new ValidationError((getBannerGroup.message as string) || '배너 그룹 정보를 조회할 수 없습니다.');
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
        throw new NotFoundError((message as string) || '배너 목록을 조회할 수 없습니다.');
      }

      // 페이지 데이터 생성
      const data = this.createPageData(route, `${metadata.groupInfo.title} ${route.title}`, metadata, banners);

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
      await this.verifyPermission(req, route.permissions);

      // 페이지 데이터 생성
      const data = this.createPageData(route);

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
      await this.verifyPermission(req, route.permissions);

      // 페이지 데이터 생성
      const data = this.createPageData(route);

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
      await this.verifyPermission(req, route.permissions);

      // 게시판 ID 추출
      const groupId = this.validateInteger(req.params.groupId, '게시판 ID');

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
        throw new NotFoundError((message as string) || '게시판 목록을 조회할 수 없습니다.');
      }

      // 게시판 그룹 정보
      const { data: group } = await getApiContentGroup(groupId);

      const groupTitle = group?.title ?? '게시판';

      // 페이지 데이터 생성
      const data = this.createPageData(route, `${groupTitle} 목록`, metadata, contents);

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
      await this.verifyPermission(req, route.permissions);

      // 게시판 ID 추출
      const groupId = this.validateInteger(req.params.groupId, '게시판 ID');

      // 게시판 그룹 정보
      const { data: group } = await getApiContentGroup(groupId);

      const groupTitle = group?.title ?? '게시판';

      // 페이지 데이터 생성
      const data = this.createPageData(route, `${groupTitle} 작성`, {
        group: {
          id: groupId,
        },
      });

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
      await this.verifyPermission(req, route.permissions);

      // 게시판 ID와 게시글 ID 추출
      const groupId = this.validateInteger(req.params.groupId, '게시판 ID');
      const contentId = this.validateInteger(req.params.contentId, '게시글 ID');

      // 게시판 그룹 정보 API 호출
      const getContentGroup = await getApiContentGroup(groupId);

      if (!getContentGroup.result) {
        throw new AppError(getContentGroup.code || 500, getContentGroup.message || '');
      }

      const groupTitle = getContentGroup.data?.title ?? '게시판';

      // 컨텐츠 상세 API 호출
      const getContentDetail = await getApiContentDetail(groupId, contentId);

      if (!getContentDetail.result) {
        throw new NotFoundError((getContentDetail.message as string) || '게시글 상세 정보를 조회할 수 없습니다.');
      }

      // 게시글 상세 content가 있을 경우
      if (getContentGroup.data?.isEncrypt && getContentDetail.data?.content) {
        // AES 복호화
        getContentDetail.data.content = decryptDataAES(getContentDetail.data?.content);
      }

      // 페이지 데이터 생성
      const data = this.createPageData(
        route,
        `${groupTitle} 상세`,
        {
          group: getContentGroup.metadata,
          content: getContentDetail.metadata,
        },
        getContentDetail.data
      );

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
      await this.verifyPermission(req, route.permissions);

      // 게시판 ID와 게시글 ID 추출
      const groupId = this.validateInteger(req.params.groupId, '게시판 ID');
      const contentId = this.validateInteger(req.params.contentId, '게시글 ID');

      // API 호출
      const { metadata, data: content } = await getApiContentDetail(groupId, contentId);

      // 게시판 그룹 정보
      const { data: group } = await getApiContentGroup(groupId);

      const groupTitle = group?.title ?? '게시판';

      // 페이지 데이터 생성
      const data = this.createPageData(route, `${groupTitle} 수정`, metadata, content);

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
      await this.verifyPermission(req, route.permissions);

      // 직원 정보 조회
      const accessToken = req.cookies.accessToken;
      const decodedToken = accessToken ? verifyJWT(accessToken) : null;

      // 현재 로그인한 직원 정보 조회
      const { data: grantedByEmployee } = await getApiEmployeeDetail(decodedToken.id);

      // 현재 로그인한 직원이 권한 관리자 또는 최고 관리자인 경우
      let permissions: IPermission[] = [];
      if (
        grantedByEmployee &&
        (grantedByEmployee.permissions?.includes(1) || grantedByEmployee.permissions?.includes(2))
      ) {
        const getPermissions = await getApiPermissionList(1, 10);
        if (getPermissions.result && getPermissions.data) {
          permissions = getPermissions.data;
        }
      }

      // 페이지 데이터 생성
      const data = this.createPageData(route, '', {
        permissions,
      });

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
      const employeeId = this.validateInteger(req.params.employeeId, '직원 ID');

      // 접근 권한 체크
      await this.verifyPermission(req, route.permissions, employeeId);

      // 관리자 상세 정보 조회
      const { metadata, data: employee } = await getApiEmployeeDetail(employeeId);

      // 결과가 없는 경우 에러 페이지 이동
      if (!employee) {
        throw new NotFoundError('존재하지 않는 직원 ID입니다.');
      }

      // 전체 권한 목록
      const { data: permissions } = await getApiPermissionList(1, 10);

      // 페이지 데이터 생성
      const data = this.createPageData(
        route,
        route.title,
        {
          ...metadata,
          permissions,
        },
        employee
      );

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
      const employeeId = this.validateInteger(req.params.employeeId, '직원 ID');

      // 접근 권한 체크
      await this.verifyPermission(req, route.permissions, employeeId);

      // 관리자 정보 조회
      const { data: employee } = await getApiEmployeeDetail(employeeId);

      // 결과가 없는 경우 에러 페이지 이동
      if (!employee) {
        throw new NotFoundError('존재하지 않는 직원 ID입니다.');
      }

      // 페이지 데이터 생성
      const data = this.createPageData(route, route.title, {}, employee);

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
      const employeeId = this.validateInteger(req.params.employeeId, '직원 ID');

      // 접근 권한 체크
      await this.verifyPermission(req, route.permissions, employeeId);

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
      const data = this.createPageData(route, route.title, {}, { employeeId, isForceUpdatePassword });

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
      const employeeId = this.validateInteger(req.params.employeeId, '직원 ID');

      // 접근 권한 체크
      await this.verifyPermission(req, route.permissions, employeeId);

      // 직원 정보 조회
      const employeeService = new EmployeeService(prisma);
      const employee = await employeeService.read(employeeId);

      // 직원 정보가 없는 경우 에러 페이지로 이동
      if (!employee.result) {
        throw new NotFoundError('존재하지 않는 직원 ID입니다.');
      }

      // 페이지 데이터 생성
      const data = this.createPageData(route, route.title, {}, employee.data);

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
      await this.verifyPermission(req, route.permissions);

      // 직원 ID 추출
      const employeeId = this.validateInteger(req.params.employeeId, '직원 ID');

      // 직원 정보 조회
      const accessToken = req.cookies.accessToken;
      const decodedToken = accessToken ? verifyJWT(accessToken) : null;

      // Access Token이 없는 경우 에러 페이지로 이동
      if (!decodedToken) {
        throw new AuthError('로그인이 필요합니다.');
      }

      // 현재 로그인한 직원 정보 조회
      const { data: grantedByEmployee } = await getApiEmployeeDetail(decodedToken.id);

      // 현재 로그인한 직원 정보가 없는 경우 에러 페이지로 이동
      if (!grantedByEmployee) {
        throw new NotFoundError('권한 부여자의 정보가 확인되지 않았습니다.');
      }

      // 권한을 수정하려는 직원 정보 조회
      const { data: employee } = await getApiEmployeeDetail(employeeId);

      // 직원 정보가 없는 경우 에러 페이지로 이동
      if (!employee) {
        throw new NotFoundError('존재하지 않는 직원 ID입니다.');
      }

      // 전체 권한 목록
      const { data: permissions } = await getApiPermissionList(1, 10);

      // 페이지 데이터 생성
      const data = this.createPageData(
        route,
        route.title,
        {
          permissions,
          grantedByEmployee,
        },
        {
          ...employee,
        }
      );

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
      await this.verifyPermission(req, route.permissions);

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
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, apiResponse.statusText);
      }

      // JSON 파싱
      const result = await apiResponse.json();

      // 페이지 데이터 생성
      const data = this.createPageData(
        route,
        route.title,
        {
          result: result.result,
          code: result.code,
          message: result.message,
          ...result.metadata,
        },
        result.data
      );

      // 직원 목록 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 직원 로그인
  public employeeLogin = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      const metadata = {
        recaptchaSiteKey: CONFIG.RECAPTCHA_SITE_KEY,
      };

      // 페이지 데이터 생성
      const data = this.createPageData(route, '', metadata);

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
      const data = this.createPageData(route);

      // 비밀번호 찾기 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 통계 관리
  public stats = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const data = this.createPageData(route);

      // 통계 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 설정
  public settings = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 사이트 설정 조회
      const { result, data: siteSettings } = await getApiSiteSettings();

      // 결과가 없는 경우 에러 페이지로 이동
      if (!result || !siteSettings) {
        throw new NotFoundError('사이트 설정 정보가 존재하지 않습니다.');
      }

      // 페이지 데이터 생성
      const data = this.createPageData(route, route.title, {}, siteSettings);

      // 설정 페이지 렌더링
      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 에러 페이지
  public renderError = (res: Response, error: unknown): void => {
    const { title, view, layout } = backendRoutes.error;
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : '알 수 없는 오류가 발생했습니다.';

    res.status(statusCode).render(view, {
      layout,
      title: `${title} ${statusCode}`,
      message,
    });
  };
}
