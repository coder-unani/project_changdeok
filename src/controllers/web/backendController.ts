import { Request, Response } from 'express';
import { EmployeeService } from '../../services/employeeService';
import { IRequestEmployeeList } from 'types/backend/request';

const employeeService = new EmployeeService();

export class BackendController {
  private layout: string;

  constructor() {
    this.layout = 'layouts/backend/layout';
  }

  // 관리자 홈
  public index(req: Request, res: Response): void {
    // 2. 로그인 확인되면 권한이 있는지 확인 후 권한이 없으면 권한이 없다는 페이지로 이동
    res.render('backend/index', { layout: this.layout, title: 'Admin Page' });
  };

  // 직원 등록
  public employeeRegist(req: Request, res: Response): void {
    res.render('backend/employee/regist', { layout: this.layout, title: 'Register Page' });
  };

  // 직원 로그인
  public employeeLogin(req: Request, res: Response): void {
    res.render('backend/employee/login', { layout: this.layout, title: 'Login Page' });
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

      const apiResponse = await fetch(`http://localhost:3000/api/backend/employee/${employeeId}`, {
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
        'backend/employee/update', 
        { 
          layout: this.layout, 
          title: '관리자 업데이트',
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

    res.render('backend/employee/delete', { layout: this.layout, title: 'Delete Page', data: employee.data });
  };

  // 직원 목록
  public async employeeList(req: Request, res: Response): Promise<void> {
    try {
      // 쿼리 파라미터 생성
      const queryParams = new URLSearchParams(req.body).toString();

      // 직원 목록 조회
      const apiResponse = await fetch(`http://localhost:3000/api/backend/employee?${queryParams}`, {
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
        'backend/employee/list', 
        { 
          layout: this.layout, 
          title: 'List Page', 
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

      const apiResponse = await fetch(`http://localhost:3000/api/backend/employee/${employeeId}`, {
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
        'backend/employee/detail', 
        { 
          layout: this.layout, 
          title: 'Detail Page',
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
      res.render('backend/permission', { layout: this.layout, title: 'Permission Page' });
    } catch (error) {
      res.render('backend/error', { layout: this.layout, title: 'Error Page' });
    }
  };
}