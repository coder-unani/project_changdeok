import { Request, Response } from 'express';

import { RequestEmployeeRegister, RequestEmployeeLogin } from '../../types/backend/request';
import { EmployeeService } from '../../services/employeeService';
import { formatApiResponse } from '../../utils/formattor';
import { CODE_FAIL_SERVER, CODE_FAIL_VALIDATION, MESSAGE_FAIL_SERVER } from '../../config/constants';

export class ApiBackendController {
  // 직원 등록
  public async employeeRegist(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: RequestEmployeeRegister = req.body;
      
      // 직원 등록 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.create(requestData);

      // 등록 실패 처리
      const response = formatApiResponse(false, result.code, result.message, null);
      if (!result.result && result.code === CODE_FAIL_VALIDATION) {
        res.status(400).json(response);
        return;
      } else if (!result.result) {
        res.status(500).json(response);
        return;
      }
      
      // 등록 성공시 201 응답
      res.status(201).send(null);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER, null);
      res.status(500).json(response);

    }
  };

  // 직원 로그인
  public async employeeLogin(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: RequestEmployeeLogin = req.body;

      // 직원 로그인 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.login(requestData);

      // 로그인 실패 처리
      if (!result.result) {
        const response = formatApiResponse(false, result.code, result.message, null);
        if (result.code === CODE_FAIL_VALIDATION) {
          res.status(400).json(response);
          return;

        } else {
          res.status(500).json(response);
          return;

        }
      }
      
      // 응답 데이터 생성
      const response = formatApiResponse(true, null, null, result.data);
      console.log(response);

      // 로그인 성공시 200 응답
      res.status(200).json(response);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER, null);
      res.status(500).json(response);

    }
  };

  // 직원 정보 수정
  public async employeeUpdate(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        const response = formatApiResponse(false, CODE_FAIL_VALIDATION, 'Bad Request', null);
        res.status(400).json(response);
        return;
      }

      // 요청 데이터
      const requestData = req.body;

      // 직원 정보 수정 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.update(employeeId, requestData);

      // 수정 실패 처리
      if (!result.result) {
        const response = formatApiResponse(false, result.code, result.message, null);
        if (result.code === CODE_FAIL_VALIDATION) {
          res.status(400).json(response);
          return;

        } else {
          res.status(500).send(response);
          return;
        }
      }
      
      // 수정 성공시 200 응답
      res.status(201).send(null);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER, null);
      res.status(500).json(response);
      
    }
  }

  // 직원 탈퇴
  public async employeeDelete(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        res.status(400).send('Bad Request');
        return;
      }

      const requestData = req.body;

      // 직원 탈퇴 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.delete(employeeId, requestData);

      // 탈퇴 실패 처리
      if (!result.result && result.code === CODE_FAIL_VALIDATION) {
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
      res.status(500).send(MESSAGE_FAIL_SERVER);
    }
  }
}