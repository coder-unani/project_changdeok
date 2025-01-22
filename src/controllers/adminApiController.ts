import { Request, Response } from 'express';
import { RequestEmployeeRegister, RequestEmployeeLogin } from '../types/admin/request';
import { EmployeeService } from '../services/employeeService';

export class AdminApiController {
  public async regist(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: RequestEmployeeRegister = req.body;
      
      // 직원 등록 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.reqister(requestData);

      // 등록 실패 처리
      if (!result.result && result.code === 'FAIL_VALIDATION') {
        res.status(400).send(result);
        return;
      } else if (!result.result) {
        res.status(500).send(result);
        return;
      }
      
      // 등록 성공시 201 응답
      res.status(201).send(result);

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');

    }
  };

  public async login(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: RequestEmployeeLogin = req.body;

      // 직원 로그인 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.login(requestData);

      // 로그인 실패 처리
      if (!result.result && result.code === 'FAIL_VALIDATION') {
        res.status(400).send(result);
        return;

      } else if (!result.result) {
        res.status(500).send(result);
        return;
      }

      // 로그인 성공시 200 응답
      res.status(200).send(result);

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
}