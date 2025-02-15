import { Request, Response } from 'express';

import { API_BASE_URL } from '../config/config';
import { IEmployeeToken } from '../types/backend';
import { backendRoutes, apiBackendRoutes } from '../routes/routes';
import { EmployeeService } from '../services/employeeService';
import { getApiEmployeeDetail, getApiPermissionList } from '../utils/api';
import { verifyJWT } from '../utils/jwt';
import { ALL } from 'dns';


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
    const { title, view, layout } = backendRoutes.dashboard;
    res.render(view, { layout, title });
  };

  // 화면 관리: 배너
  public screensBanner(req: Request, res: Response): void {
    const { title, view, layout } = backendRoutes.screensBanner;
    res.render(view, { layout, title });
  };

  // 화면 관리: 팝업
  public screensPopup(req: Request, res: Response): void {
    const { title, view, layout } = backendRoutes.screensPopup;
    res.render(view, { layout, title });
  };

  // 게시판 관리
  public contents(req: Request, res: Response): void {
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

    } catch (error) {
      this.renderError(res, error);

    }

    const { title, view, layout } = backendRoutes.contents;
    res.render(view, { layout, title });
  }

  // 직원 등록
  public employeesRegist(req: Request, res: Response): void {
    const { title, view, layout } = backendRoutes.employeesRegist;
    res.render(view, { layout, title });
  };

  // 직원 상세 정보
  public async employeesDetail(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 관리자 상세 정보 조회
      const { metadata, data: employee } = await getApiEmployeeDetail(employeeId);

      // 결과가 없는 경우 에러 페이지로 이동
      if (!employee) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }
      
      // 상세 정보 페이지로 이동
      const { title, view, layout } = backendRoutes.employeesDetail;
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
    const ALLOWED_PERMISSIONS = [1, 2];
    const ALLOWED_MYSELF = true;
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        throw new Error('직원 아이디가 형식에 맞지 않습니다.');
      }

      // 로그인 확인
      if (!res.locals.employee) {
        throw new Error('로그인이 필요합니다.');
      }

      // 직원 ID와 로그인 ID가 다른 경우 에러 페이지로 이동
      if (res.locals.employee.id !== employeeId) {
        throw new Error('다른 계정의 정보는 수정 할 수 없습니다.');
      }

      // 관리자 정보 조회
      const { data: employee } = await getApiEmployeeDetail(employeeId);
      
      
      // 결과가 있는 경우 수정 페이지로 이동
      const { title, view, layout } = backendRoutes.employeesUpdate;
      res.render(view, { layout, title, data: employee });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 비밀번호 수정
  public async employeesUpdatePassword(req: Request, res: Response): Promise<void> {
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

      // 로그인 확인
      if (!res.locals.employee) {
        throw new Error('로그인이 필요합니다.');
      }

      // 직원 ID와 로그인 ID가 다른 경우 에러 페이지로 이동
      if (res.locals.employee.id !== employeeId) {
        throw new Error('다른 계정의 비밀번호는 수정 할 수 없습니다.');
      }

      // 직원 비밀번호 수정 페이지로 이동
      const { title, view, layout } = backendRoutes.employeesUpdatePassword;
      res.render(view, { layout, title });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 탈퇴
  public async employeesDelete(req: Request, res: Response): Promise<void> {
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

      // 직원 정보 조회
      const employee = await employeeService.read(employeeId);

      // 직원 정보가 없는 경우 에러 페이지로 이동
      if (!employee.result) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }

      const { title, view, layout } = backendRoutes.employeesDelete;
      res.render(view, { layout, title });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 권한 변경
  public async employeesPermissions(req: Request, res: Response): Promise<void> {
    // 라우팅 정보
    const { title, view, layout, permissions } = backendRoutes.employeesPermissions;
    
    try {

      console.log(res.locals.employee);

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
      const decodedToken = (accessToken) ? verifyJWT(accessToken) : null;

      // Access Token이 없는 경우 에러 페이지로 이동
      if (!decodedToken) {
        throw new Error('로그인이 필요합니다.');
      }

      // 현재 로그인한 직원 정보 조회
      const { data: grantedByEmployee } = await getApiEmployeeDetail(decodedToken.id);
      
      if (!grantedByEmployee) {
        throw new Error('직원 정보 조회에 실패했습니다.');
      }

      // 권한이 있는지 확인  
      // const hasPermission = 
      //   (grantedByEmployee.permissions) 
      //   ? grantedByEmployee.permissions.some(permission => ALLOWED_PERMISSIONS.includes(permission)) 
      //   : false;

      // 현재 로그인한 직원과 권한을 부여할 직원이 같은지 확인
      // const isSameEmployee = (ALLOWED_MYSELF && employeeId === grantedByEmployee.id);

      // 권한이 없는 경우 에러 페이지로 이동
      // if (!hasPermission && !isSameEmployee) {
      //   throw new Error('권한이 없습니다.');
      // }
       
      // 전체 권한 목록
      const { data: permissions } = await getApiPermissionList(1, 10);

      
      res.render(view, { layout, title, data: { employeeId, grantedByEmployee, permissions } });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 목록
  public async employees(req: Request, res: Response): Promise<void> {
    try {
      // 쿼리 파라미터 생성
      const queryParams = new URLSearchParams(req.body).toString();

      // 관리자 목록 조회
      const apiResponse = await fetch(`${API_BASE_URL}${apiBackendRoutes.employees.url}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
      }

      const result = await apiResponse.json();
      
      const { title, view, layout } = backendRoutes.employees;
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
    try {
      const { title, view, layout } = backendRoutes.employeesLogin;
      res.render(view, { layout, title });

    } catch (error) {
      this.renderError(res, error);

    }
  };

  // 직원 로그아웃
  public employeesLogout(req: Request, res: Response): void {
    const { title, view, layout } = backendRoutes.employeesLogout;
    res.render(view, { layout, title });
  };

  // 직원 비밀번호 찾기
  public employeesForgotPassword(req: Request, res: Response): void {
    // 관리자 시스템이므로 직원 비밀번호 찾기는 없음
    // 담당자에게 문의하기로 대체
    try {
      const { title, view, layout } = backendRoutes.employeesForgotPassword;
      res.render(view, { layout, title });

    } catch (error) {
      this.renderError(res, error);
      
    }
  };

  // 접근 권한 확인
  public verifyPermission(allowedPermissions: number[]): void {
    
  }

  public verifySameEmployee(employeeId: number, targetEmployeeId: number): void {

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