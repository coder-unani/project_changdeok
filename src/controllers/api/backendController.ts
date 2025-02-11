import { Request, Response } from 'express';

import { IRequestEmployeeRegister, IRequestEmployeeLogin } from '../../types/backend/request';
import { EmployeeService } from '../../services/employeeService';
import { formatApiResponse } from '../../utils/formattor';
import { CODE_FAIL_SERVER, CODE_FAIL_VALIDATION, MESSAGE_FAIL_SERVER } from '../../config/constants';
import { createJWT } from '../../utils/jwt';

export class ApiBackendController {
  // 직원 등록
  public async employeesRegist(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestEmployeeRegister = req.body;
      
      // 직원 등록 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.create(requestData);

      // 등록 실패 처리
      const response = formatApiResponse(false, result.code, result.message);
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
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  };

  // 직원 상세
  public async employeesDetail(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        res.status(400).send('Bad Request');
        return;
      }

      // 직원 상세 조회
      const employeeService = new EmployeeService();
      const result = await employeeService.read(employeeId);

      // 조회 실패 처리
      if (!result.result) {
        res.status(500).send(result);
        return;
      }

      // 조회 성공시 200 응답
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(200).json(response);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  }

  // 직원 정보 수정
  public async employeesModify(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        const response = formatApiResponse(false, CODE_FAIL_VALIDATION, 'Bad Request');
        res.status(400).json(response);
        return;
      }

      // 요청 데이터
      const requestData = req.body;

      // 직원 정보 수정 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.modify(employeeId, requestData);

      // 수정 실패 처리
      if (!result.result) {
        const response = formatApiResponse(false, result.code, result.message);
        if (result.code === CODE_FAIL_VALIDATION) {
          res.status(400).json(response);
          return;

        } else {
          res.status(500).json(response);
          return;
        }
      }
      
      // 수정 성공시 200 응답
      res.status(201).send(null);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);
      
    }
  }

  // 직원 탈퇴
  public async employeesDelete(req: Request, res: Response): Promise<void> {
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
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  }

  // 직원 목록
  public async employees(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData = req.body;

      // 직원 목록 조회
      const employeeService = new EmployeeService();
      const result = await employeeService.list(requestData);

      // 조회 실패 처리
      if (!result.result) {
        res.status(500).send(result);
        return;
      }
      
      // 조회 성공시 200 응답
      const response = formatApiResponse(true, null, null, result.metadata, result.data);
      res.status(200).json(response);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  }

  // 직원 비밀번호 변경
  public async employeesModifyPassword(req: Request, res: Response): Promise<void> {
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

      // 직원 비밀번호 변경 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.modifyPassword(employeeId, requestData);

      // 변경 실패 처리
      if (!result.result) {
        res.status(500).send(result);
        return;
      }

      // 변경 성공시 201 응답
      res.status(201).send(null);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  }

  // 직원 로그인
  public async employeesLogin(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestEmployeeLogin = req.body;

      // 직원 로그인 처리
      const employeeService = new EmployeeService();
      const result = await employeeService.login(requestData);

      // 로그인 실패 처리
      if (!result.result) {
        const response = formatApiResponse(false, result.code, result.message);
        if (result.code === CODE_FAIL_VALIDATION) {
          res.status(400).json(response);
          return;

        } else {
          res.status(500).json(response);
          return;

        }
      }
      
      // 로그인 성공시 쿠키에 토큰 저장
      if (result.data) {
        const tokenData = {
          id: result.data.id,
          name: result.data.name
        }
        const token = createJWT(tokenData);
        if (token) {
          res.cookie('accessToken', token, {
            httpOnly: true,
            secure: true, // HTTPS에서만 전송
            maxAge: 3600 * 1000, // 1시간
          });
        }
      }
      
      // 응답 데이터 생성
      const response = formatApiResponse(true, null, null, result.metadata, result.data);

      // 로그인 성공시 200 응답
      res.status(200).json(response);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  };

  // 직원 로그아웃
  public async employeesLogout(req: Request, res: Response): Promise<void> {
    try {
      // 쿠키 삭제
      res.clearCookie('accessToken');

      // 로그아웃 성공시 200 응답
      res.status(200).send(null);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  }
}