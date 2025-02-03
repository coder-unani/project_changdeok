import { Request, Response } from 'express';
import { RequestEmployeeRegister, RequestEmployeeLogin } from '../../types/backend/request';
import { EmployeeService } from '../../services/employeeService';

export class ApiAdminController {
  public async regist(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: RequestEmployeeRegister = req.body;
      
      // 직원 등록 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.create(requestData);

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

  public async modify(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        res.status(400).send('Bad Request');
        return;
      }

      // 요청 데이터
      const requestData = req.body;

      // 직원 정보 수정 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.update(employeeId, requestData);

      // 수정 실패 처리
      if (!result.result && result.code === 'FAIL_VALIDATION') {
        res.status(400).send(result);
        return;

      } else if (!result.result) {
        res.status(500).send(result);
        return;
      }

      // 수정 성공시 200 응답
      res.status(200).send(result);

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        res.status(400).send('Bad Request');
        return;
      }

      // 직원 탈퇴 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.delete(employeeId);

      // 탈퇴 실패 처리
      if (!result.result && result.code === 'FAIL_VALIDATION') {
        res.status(400).send(result);
        return;

      } else if (!result.result) {
        res.status(500).send(result);
        return;
      }

      // 탈퇴 성공시 200 응답
      res.status(200).send(result);

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
}