import { Request, Response } from 'express';
import { EmployeeService } from '../../services/employeeService';
import { IRequestEmployeeList } from 'types/backend/request';

const employeeService = new EmployeeService();

export class BackendController {

  // 관리자 홈
  public index(req: Request, res: Response): void {
    // 1. 관리자 로그인 확인 및 비로그인시 로그인 페이지로 이동
    // 2. 로그인 확인되면 권한이 있는지 확인 후 권한이 없으면 권한이 없다는 페이지로 이동
    res.render('backend/index', { title: 'Admin Page' });
  };

  // 직원 등록
  public regist(req: Request, res: Response): void {
    res.render('backend/employee/regist', { layout: 'layouts/backend/layout', title: 'Register Page' });
  };

  // 직원 로그인
  public login(req: Request, res: Response): void {
    res.render('backend/employee/login', { layout: 'layouts/backend/layout', title: 'Login Page' });
  };

  // 직원 정보 수정
  public async update(req: Request, res: Response): Promise<void> {
    // 직원 ID 추출
    const employeeId = parseInt(req.params.employeeId);

    // ID가 숫자가 아닌 경우 에러 페이지로 이동
    if (isNaN(employeeId)) {
      res.render('backend/error', { layout: 'layouts/backend/layout', title: 'Error Page' });
      return;
    }
    
    // 직원 정보 조회
    const employee = await employeeService.read(employeeId);

    // 직원 정보가 없는 경우 에러 페이지로 이동
    if (!employee.result) {
      res.render('admin/error', { layout: 'layouts/backend/layout', title: 'Error Page' });
      return;
    }

    res.render('backend/employee/modify', { title: 'Modify Page', data: employee.data });
  };

  // 직원 탈퇴
  public async delete(req: Request, res: Response): Promise<void> {
    // 직원 ID 추출
    const employeeId = parseInt(req.params.employeeId);

    // ID가 숫자가 아닌 경우 에러 페이지로 이동
    if (isNaN(employeeId)) {
      res.render('backend/error', { layout: 'layouts/backend/layout', title: 'Error Page' });
      return;
    }

    // 직원 정보 조회
    const employee = await employeeService.read(employeeId);

    // 직원 정보가 없는 경우 에러 페이지로 이동
    if (!employee.result) {
      res.render('backend/error', { layout: 'layouts/backend/layout', title: 'Error Page' });
      return;
    }

    res.render('backend/employee/delete', { layout: 'layouts/backend/layout', title: 'Delete Page', data: employee.data });
  };

  // 직원 목록
  public async list(req: Request, res: Response): Promise<void> {
    try {
      const requestData = req.body;

      // 직원 목록 조회
      const employeeService = new EmployeeService();
      const result = await employeeService.list(requestData);

      // 조회 실패 처리 
      // TODO: 에러 처리가 필요함
      if (!result.result) {
        throw new Error('Error');
        
      }

      res.render(
        'backend/employee/list', 
        { 
          layout: 'layouts/backend/layout', 
          title: 'List Page', 
          data: result.data,
          metadata: result.metadata
        }
      );

    } catch (error) {
      res.render('backend/error', { layout: 'layouts/backend/layout', title: 'Error Page' });

    }
  };
}