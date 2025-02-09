import { Request, Response } from 'express';

import { WEB_BACKEND_ROUTE } from '../routes/routes';
import { EmployeeService } from '../services/employeeService';
import { IRequestEmployeeList } from 'types/backend/request';

const employeeService = new EmployeeService();

export class BackendController {
  private layout: string;
  private layoutNonHeader: string;

  constructor() {
    this.layout = 'layouts/backend/layout';
    this.layoutNonHeader = 'layouts/backend/layoutNonHeader';
  }

  // 관리자 홈
  public index(req: Request, res: Response): void {
    // 2. 로그인 확인되면 권한이 있는지 확인 후 권한이 없으면 권한이 없다는 페이지로 이동
    res.render(
      WEB_BACKEND_ROUTE.INDEX.VIEW, { 
        layout: this.layout, 
        title: WEB_BACKEND_ROUTE.INDEX.TITLE
      }
    );
  };

  // 직원 등록
  public employeeRegist(req: Request, res: Response): void {
    res.render(
      WEB_BACKEND_ROUTE.EMPLOYEE_REGIST.VIEW, { 
        layout: this.layout, 
        title: WEB_BACKEND_ROUTE.EMPLOYEE_REGIST.TITLE
      }
    );
  };

  // 직원 로그인
  public employeeLogin(req: Request, res: Response): void {
    res.render(
      WEB_BACKEND_ROUTE.EMPLOYEE_LOGIN.VIEW, { 
        layout: this.layoutNonHeader, 
        title: WEB_BACKEND_ROUTE.EMPLOYEE_LOGIN.TITLE
      }
    );
  };

  // 직원 정보 수정
  public async employeeUpdate(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        res.render('backend/error', { layout: this.layout, title: 'Error Page' });
        return;
      }

      const apiResponse = await fetch(`http://localhost:3000/api/backend/employees/${employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!apiResponse.ok) {
        throw new Error('Error');
      }

      const result = await apiResponse.json();

      res.render(
        WEB_BACKEND_ROUTE.EMPLOYEE_UPDATE.VIEW, { 
          layout: this.layout, 
          title: WEB_BACKEND_ROUTE.EMPLOYEE_UPDATE.TITLE,
          data: result.data,
          metadata: {
            result: result.result,
            code: result.code,
            message: result.message,
          }
        }
      );

    } catch (error) {
      res.render('backend/error', { layout: this.layout, title: 'Error Page' });

    }
  };

  // 직원 탈퇴
  public async employeeDelete(req: Request, res: Response): Promise<void> {
    // 직원 ID 추출
    const employeeId = parseInt(req.params.employeeId);

    // ID가 숫자가 아닌 경우 에러 페이지로 이동
    if (isNaN(employeeId)) {
      res.render('backend/error', { layout: this.layout, title: 'Error Page' });
      return;
    }

    // 직원 정보 조회
    const employee = await employeeService.read(employeeId);

    // 직원 정보가 없는 경우 에러 페이지로 이동
    if (!employee.result) {
      res.render('backend/error', { layout: this.layout, title: 'Error Page' });
      return;
    }

    res.render(
      WEB_BACKEND_ROUTE.EMPLOYEE_DELETE.VIEW, { 
        layout: this.layout, 
        title: WEB_BACKEND_ROUTE.EMPLOYEE_DELETE.TITLE, 
        data: employee.data 
      }
    );
  };

  // 직원 목록
  public async employeeList(req: Request, res: Response): Promise<void> {
    try {
      // 쿼리 파라미터 생성
      const queryParams = new URLSearchParams(req.body).toString();

      // 직원 목록 조회
      const apiResponse = await fetch(`http://localhost:3000/api/backend/employees?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
      }

      const result = await apiResponse.json();
      
      res.render(
        WEB_BACKEND_ROUTE.EMPLOYEE_LIST.VIEW, { 
          layout: this.layout, 
          title: WEB_BACKEND_ROUTE.EMPLOYEE_LIST.TITLE, 
          data: result.data,
          metadata: {
            result: result.result,
            code: result.code,
            message: result.message,
            ...result.metadata
          }
        }
      );

    } catch (error) {
      res.render('backend/error', { layout: this.layout, title: 'Error Page' });

    }
  };

  // 직원 상세 정보
  public async employeeDetail(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 페이지로 이동
      if (isNaN(employeeId)) {
        res.render('backend/error', { layout: this.layout, title: 'Error Page' });
        return;
      }

      const apiResponse = await fetch(`http://localhost:3000/api/backend/employees/${employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!apiResponse.ok) {
        throw new Error('Error');
      }

      const result = await apiResponse.json();

      res.render(
        WEB_BACKEND_ROUTE.EMPLOYEE_READ.VIEW, 
        { 
          layout: this.layout, 
          title: WEB_BACKEND_ROUTE.EMPLOYEE_READ.TITLE,
          data: result.data,
          metadata: {
            result: result.result,
            code: result.code,
            message: result.message,
          }
        }
      );

    } catch (error) {
      res.render('backend/error', { layout: this.layout, title: 'Error Page' });

    }
  };

  // 권한 관리
  public async permission(req: Request, res: Response): Promise<void> {
    try {
      res.render(
        WEB_BACKEND_ROUTE.PERMISSION.VIEW, { 
          layout: this.layout, 
          title: WEB_BACKEND_ROUTE.PERMISSION.TITLE
        }
      );

    } catch (error) {
      res.render('backend/error', { layout: this.layout, title: 'Error Page' });
    }
  };
}