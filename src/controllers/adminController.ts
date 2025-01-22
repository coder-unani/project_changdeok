import { Request, Response } from 'express';
import { EmployeeService } from '../services/employeeService';

const employeeService = new EmployeeService();

export class AdminController {
  public index(req: Request, res: Response): void {
    // 1. 관리자 로그인 확인 및 비로그인시 로그인 페이지로 이동
    // 2. 로그인 확인되면 권한이 있는지 확인 후 권한이 없으면 권한이 없다는 페이지로 이동
    res.render('admin/index', { title: 'Admin Page' });
  };

  public regist(req: Request, res: Response): void {
    res.render('admin/employee/regist', { title: 'Register Page' });
  };

  public login(req: Request, res: Response): void {
    res.render('admin/employee/login', { title: 'Login Page' });
  };

  public modify(req: Request, res: Response): void {
    // ID 추출
    const employeeId = parseInt(req.params.employeeId);
    if (isNaN(employeeId)) {
      // 에러 페이지로 이동
      res.render('admin/error', { title: 'Error Page' });
      return;
    }
    console.log(employeeId);
    const employee = employeeService.read(employeeId);
    res.render('admin/employee/modify', { title: 'Modify Page' });
  };
}