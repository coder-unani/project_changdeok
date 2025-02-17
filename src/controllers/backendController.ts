import { Request, Response } from 'express';

import { API_BASE_URL } from '../config/config';
import { IEmployeeToken } from '../types/backend';
import { backendRoutes, apiBackendRoutes } from '../routes/routes';
import { EmployeeService } from '../services/employeeService';
import { getApiEmployeeDetail, getApiPermissionList } from '../utils/api';
import { verifyJWT } from '../utils/jwt';
import { getCookie } from '../utils/cookies';


const employeeService = new EmployeeService();

// TODO: 권한을 체크해서 다른 계정도 수정하게 할 것인지 확인 필요
export class BackendController {
  constructor() { }

  // 관리자 홈
  public index(req: Request, res: Response): void {
    // TODO: 로그인 확인되면 권한이 있는지 확인 후 권한이 없으면 권한이 없다는 페이지로 이동
    const { title, view, layout } = backendRoutes.index;
    res.render(view, { layout, title });
  };

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
  };

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
  };

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
  };

  // 게시판 관리
  public contents(req: Request, res: Response): void {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.contents;

    try {
      // 게시판 ID 추출
      const contentId = req.params.contentId;

      // 게시판 ID가 없는 경우
      if (!contentId) {
        throw new Error('존재하지 않는 게시판입니다.');
      }

      // ID가 숫자가 아닌 경우
      if (isNaN(parseInt(contentId))) {
        throw new Error('게시판 아이디가 형식에 맞지 않습니다.');
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions);

      // 게시판 관리 페이지 렌더링
      res.render(view, { layout, title });

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
  };

  // 직원 상세 정보
  public async employeesDetail(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesDetail;

    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions, employeeId);

      // 관리자 상세 정보 조회
      const { metadata, data: employee } = await getApiEmployeeDetail(employeeId);

      // 결과가 없는 경우 에러 페이지 이동
      if (!employee) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }
      
      // 상세 정보 페이지 렌더링
      res.render(view, { 
        layout, 
        title,
        metadata,
        data: employee,
      });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 정보 수정
  public async employeesUpdate(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesUpdate;

    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 접근 권한 체크
      this.verifyPermission(req, permissions, employeeId);
      
      // 관리자 정보 조회
      const { data: employee } = await getApiEmployeeDetail(employeeId);
      
      // 직원 정보 수정 페이지 렌더링
      res.render(view, { layout, title, data: employee });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 비밀번호 수정
  public async employeesUpdatePassword(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesUpdatePassword;

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
      this.verifyPermission(req, permissions, employeeId);
      
      // 직원 비밀번호 수정 페이지 렌더링
      res.render(view, { layout, title });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 삭제
  public async employeesDelete(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesDelete;

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
      this.verifyPermission(req, permissions, employeeId);

      // 직원 정보 조회
      const employee = await employeeService.read(employeeId);

      // 직원 정보가 없는 경우 에러 페이지로 이동
      if (!employee.result) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }

      // 직원 삭제 페이지 렌더링
      res.render(view, { layout, title, data: employee.data });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 권한 변경
  public async employeesPermissions(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesPermissions;
    
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
      this.verifyPermission(req, permissions);

      // 직원 정보 조회
      const accessToken = req.cookies.accessToken;
      const decodedToken = (accessToken) ? verifyJWT(accessToken) : null;

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

      // 직원 권한 수정 페이지 렌더링
      res.render(view, { 
        layout, 
        title, 
        data: { 
          employeeId,
          employee,
          grantedByEmployee,
          permissions: permissionsAll,
        }
      });

    } catch (error) {
      this.renderError(res, error);

    }
  };

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
      
      // 직원 목록 페이지 렌더링
      res.render(view, { 
        layout, 
        title,
        data: result.data,
        metadata: {
          result: result.result,
          code: result.code,
          message: result.message,
          ...result.metadata
        }
      });
      
    } catch (error) {
      this.renderError(res, error);
      
    }
  };

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
  };

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
  };

  // 접근 권한 확인
  public verifyPermission(req: Request, allowedPermissions: number[] = [], allowedEmployeeId: number | undefined | null = null): void {
    try {
      // Cookie에서 직원 정보 추출
      const cookieEmployee = getCookie(req, 'employee');
      if (!cookieEmployee) {
        throw new Error('로그인이 필요합니다.');
      }

      // Cookie 직원 정보 파싱
      const employee: IEmployeeToken = JSON.parse(cookieEmployee);

      // 권한 확인용 변수
      let hasPermission = false;

      // 권한이 필요없는 페이지이면 접근 가능
      console.log("권한이 필요한지 체크합니다.");
      if (allowedPermissions.length === 0 && !allowedEmployeeId) {
        hasPermission = true;
      }
      console.log("hasPermission = ", hasPermission);

      // 특정 직원 ID가 허용되어 있으면 해당 직원은 접근 가능
      console.log("특정 아이디만 접근이 가능한지 체크합니다.");
      if (allowedEmployeeId && employee.id === allowedEmployeeId) {
        hasPermission = true;
      }
      console.log("hasPermission = ", hasPermission, "employee.id = ", employee.id, "allowedEmployeeId = ", allowedEmployeeId);
      
      // 특정 권한이 허용되어 있으면 해당 직원은 접근 가능
      console.log("특정 권한만 접근이 가능한지 체크합니다.");
      if (
        allowedPermissions 
        && (
          employee.permissions
          && employee.permissions.some(permission => allowedPermissions.includes(permission))
        )
      ) {
        hasPermission = true;
      }
      console.log("hasPermission = ", hasPermission, "employee.permissions = ", employee.permissions, "allowedPermissions = ", allowedPermissions);

      // 권한이 없으면 에러 페이지로 이동
      if (!hasPermission) {
        throw new Error('권한이 없습니다.');
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
        message: error.message || '일시적인 오류가 발생했습니다.' 
      });

    } else {
      res.status(500).render(view, { 
        layout, 
        title,
        message: '알 수 없는 오류가 발생했습니다.' 
      });

    }
  }
}