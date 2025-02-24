import { Request, Response } from 'express';

import { prisma } from '../config/database';
import { API_BASE_URL } from '../config/config';
import { IRequestContents, typeListSort } from '../types/request';
import { IEmployeeToken } from '../types/object';
import { backendRoutes, apiBackendRoutes } from '../routes/routes';
import { EmployeeService } from '../services/employeeService';
import { getApiContents, getApicontentsDetail, getApiEmployeeDetail, getApiPermissionList } from '../utils/api';
import { verifyJWT } from '../utils/jwt';
import { getCookie } from '../utils/cookies';

// TODO: 권한을 체크해서 다른 계정도 수정하게 할 것인지 확인 필요
export class BackendController {
  constructor() {}

  // 관리자 홈
  public index(req: Request, res: Response): void {
    // TODO: 로그인 확인되면 권한이 있는지 확인 후 권한이 없으면 권한이 없다는 페이지로 이동
    const { title, view, layout } = backendRoutes.index;
    res.render(view, { layout, title });
  }

  // 대시보드
  public dashboard(req: Request, res: Response): void {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.dashboard;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 대시보드 페이지 렌더링
      res.render(view, { layout, title });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 화면 관리: 배너
  public screensBanner(req: Request, res: Response): void {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.screensBanner;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 배너 관리 페이지 렌더링
      res.render(view, { layout, title });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 화면 관리: 팝업
  public screensPopup(req: Request, res: Response): void {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.screensPopup;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 팝업 관리 페이지 렌더링
      res.render(view, { layout, title });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 게시판 관리
  public async contents(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.contents;

    try {
      // 게시판 ID 추출
      const groupId = parseInt(req.params.groupId);

      // 게시판 ID가 없는 경우
      if (!groupId) {
        throw new Error("존재하지 않는 게시판입니다.");
      }

      // ID가 숫자가 아닌 경우
      if (isNaN(groupId)) {
        throw new Error("게시판 아이디가 형식에 맞지 않습니다.");
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // params 생성
      const data: IRequestContents = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
        query: req.query.query ? (req.query.query as string) : "",
        sort: req.query.sort ? (req.query.sort as typeListSort) : "ID_DESC",
      };

      // API 호출
      const { metadata, data: contents } = await getApiContents(groupId, data);

      // 게시판 관리 페이지 렌더링
      res.render(view, { layout, title: metadata.title, data: { contents, metadata } });

    } catch (error) {
      this.renderError(res, error);

    }
  }

  // 게시글 작성
  public contentsWrite(req: Request, res: Response): void {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.contentsWrite;

    try {
      // 게시판 ID 추출
      const groupId = parseInt(req.params.groupId);

      // 게시판 ID가 없는 경우
      if (!groupId) {
        throw new Error("존재하지 않는 게시판입니다.");
      }

      // ID가 숫자가 아닌 경우
      if (isNaN(groupId)) {
        throw new Error("게시판 아이디가 형식에 맞지 않습니다.");
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 게시글 작성 페이지 렌더링
      res.render(view, { layout, title, data: { groupId } });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 게시글 상세 정보
  public async contentsDetail(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.contentsDetail;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 게시판 ID와 게시글 ID 추출
      const groupId = parseInt(req.params.groupId);
      const contentId = parseInt(req.params.contentId);

      // 컨텐츠 그룹 ID가 없는 경우
      if (!groupId) {
        throw new Error("존재하지 않는 게시판입니다.");
      }

      // 컨텐츠 ID가 없는 경우
      if (!contentId) {
        throw new Error("존재하지 않는 게시글입니다.");
      }

      // API 호출
      const { metadata, data: content } = await getApicontentsDetail(parseInt(req.params.groupId), parseInt(req.params.contentId));
      console.log(content);

      // 게시글 상세 정보 페이지 렌더링
      res.render(view, { layout, title, data: { content, metadata } });

    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 게시글 업데이트
  public async contentsUpdate(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.contentsUpdate;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 게시판 ID와 게시글 ID 추출
      const groupId = parseInt(req.params.groupId);
      const contentId = parseInt(req.params.contentId);

      // 컨텐츠 그룹 ID가 없는 경우
      if (!groupId) {
        throw new Error("존재하지 않는 게시판입니다.");
      }

      // 컨텐츠 ID가 없는 경우
      if (!contentId) {
        throw new Error("존재하지 않는 게시글입니다.");
      }

      // API 호출
      const { metadata, data: content } = await getApicontentsDetail(parseInt(req.params.groupId), parseInt(req.params.contentId));

      // 게시글 상세 정보 페이지 렌더링
      res.render(view, { layout, title, data: { content, metadata } });

    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 등록
  public employeesRegist(req: Request, res: Response): void {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesRegist;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 직원 등록 페이지 렌더링
      res.render(view, { layout, title });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 상세 정보
  public async employeesDetail(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesDetail;

    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error("직원 아이디가 형식에 맞지 않습니다.");
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions, employeeId);

      // 관리자 상세 정보 조회
      const { metadata, data: employee } = await getApiEmployeeDetail(employeeId);

      // 결과가 없는 경우 에러 페이지 이동
      if (!employee) {
        throw new Error("직원 정보 조회에 실패했습니다.");
      }

      // 상세 정보 페이지 렌더링
      res.render(view, {
        layout,
        title,
        data: {
          employee,
          metadata,
        },
      });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 정보 수정
  public async employeesUpdate(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesUpdate;

    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error("직원 아이디가 형식에 맞지 않습니다.");
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions, employeeId);

      // 관리자 정보 조회
      const { data: employee } = await getApiEmployeeDetail(employeeId);

      // 직원 정보 수정 페이지 렌더링
      res.render(view, { layout, title, data: { employee } });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 비밀번호 수정
  public async employeesUpdatePassword(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesUpdatePassword;

    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // 직원 ID가 없는 경우 에러 페이지로 이동
      if (!employeeId) {
        throw new Error("직원 아이디가 필요합니다.");
      }

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error("직원 아이디가 형식에 맞지 않습니다.");
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions, employeeId);

      // 로그인한 직원과 수정하려는 직원이 다른 경우
      let isForceUpdatePassword = false;
      const cookieEmployee = getCookie(req, "employee");
      if (cookieEmployee) {
        const loggedInEmployee: IEmployeeToken = JSON.parse(cookieEmployee);
        if (loggedInEmployee.id !== employeeId) {
          isForceUpdatePassword = true;
        }
      }

      // 직원 비밀번호 수정 페이지 렌더링
      res.render(view, { layout, title, data: { employeeId, isForceUpdatePassword } });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 삭제
  public async employeesDelete(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesDelete;

    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // 직원 ID가 없는 경우 에러 페이지로 이동
      if (!employeeId) {
        throw new Error("직원 아이디가 필요합니다.");
      }

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error("직원 아이디가 형식에 맞지 않습니다.");
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions, employeeId);

      // 직원 정보 조회
      const employeeService = new EmployeeService(prisma);
      const employee = await employeeService.read(employeeId);

      // 직원 정보가 없는 경우 에러 페이지로 이동
      if (!employee.result) {
        throw new Error("직원 정보 조회에 실패했습니다.");
      }

      // 직원 삭제 페이지 렌더링
      res.render(view, { layout, title, data: employee.data });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 권한 변경
  public async employeesPermissions(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesPermissions;

    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // 직원 ID가 없는 경우 에러 페이지로 이동
      if (!employeeId) {
        throw new Error("직원 아이디가 필요합니다.");
      }

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error("직원 아이디가 형식에 맞지 않습니다.");
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 직원 정보 조회
      const accessToken = req.cookies.accessToken;
      const decodedToken = accessToken ? verifyJWT(accessToken) : null;

      // Access Token이 없는 경우 에러 페이지로 이동
      if (!decodedToken) {
        throw new Error("로그인이 필요합니다.");
      }

      // 현재 로그인한 직원 정보 조회
      const { data: grantedByEmployee } = await getApiEmployeeDetail(decodedToken.id);

      // 현재 로그인한 직원 정보가 없는 경우 에러 페이지로 이동
      if (!grantedByEmployee) {
        throw new Error("사용자의 정보 조회에 실패했습니다.");
      }

      // 권한을 수정하려는 직원 정보 조회
      const { data: employee } = await getApiEmployeeDetail(employeeId);

      // 직원 정보가 없는 경우 에러 페이지로 이동
      if (!employee) {
        throw new Error("직원 정보 조회에 실패했습니다.");
      }

      // 전체 권한 목록
      const { data: permissionsAll } = await getApiPermissionList(1, 10);

      // 직원 권한 수정 페이지 렌더링
      res.render(view, {
        layout,
        title,
        data: {
          employeeId,
          employee,
          grantedByEmployee,
          permissions: permissionsAll,
        },
      });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 목록
  public async employees(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employees;

    try {
      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 쿼리 파라미터 생성
      const queryParams = new URLSearchParams(req.body).toString();

      // 관리자 목록 조회
      const apiResponse = await fetch(`${API_BASE_URL}${apiBackendRoutes.employees.url}?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 응답 오류
      if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
      }

      // JSON 파싱
      const result = await apiResponse.json();

      // 직원 목록 페이지 렌더링
      res.render(view, {
        layout,
        title,
        data: result.data,
        metadata: {
          result: result.result,
          code: result.code,
          message: result.message,
          ...result.metadata,
        },
      });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 로그인
  public employeesLogin(req: Request, res: Response): void {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesLogin;

    try {
      // 로그인 페이지 렌더링
      res.render(view, { layout, title });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 직원 비밀번호 찾기
  public employeesForgotPassword(req: Request, res: Response): void {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesForgotPassword;

    try {
      // 비밀번호 찾기 페이지 렌더링
      res.render(view, { layout, title });
    } catch (error) {
      this.renderError(res, error);
    }
  }

  // 접근 권한 확인
  public verifyPermission(
    req: Request,
    accessPermissions: number[] = [],
    accessEmployeeId: number | undefined | null = null
  ): void {
    try {
      // Cookie에서 직원 정보 추출
      const cookieEmployee = getCookie(req, "employee");
      if (!cookieEmployee) {
        throw new Error("로그인이 필요합니다.");
      }

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
        throw new Error("권한이 없습니다.");
      }
    } catch (error) {
      throw error;
    }
  }

  // 에러 페이지
  public renderError(res: Response, error: unknown): void {
    const { title, view, layout } = backendRoutes.error;
    if (error instanceof Error) {
      res.status(500).render(view, {
        layout,
        title,
        message: error.message || "일시적인 오류가 발생했습니다.",
      });
    } else {
      res.status(500).render(view, {
        layout,
        title,
        message: "알 수 없는 오류가 발생했습니다.",
      });
    }
  }
}
