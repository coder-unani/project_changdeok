import { Request, Response } from 'express';

import { JWT_EXPIRE_SECOND } from '../../config/config';
import { CODE_FAIL_SERVER, CODE_FAIL_VALIDATION, MESSAGE_FAIL_SERVER } from '../../config/constants';
import { IEmployeeService, IEmployeeToken, IPermissionService } from '../../types/backend';
import { 
  typeListSort, 
  IRequestEmployeeRegister, 
  IRequestEmployeeUpdate,
  IRequestEmployeeUpdatePassword,
  IRequestEmployeeDelete,
  IRequestEmployeeLogin, 
  IRequestEmployeeList, 
  IRequestDefaultList
} from '../../types/request';
import { EmployeeService } from '../../services/employeeService';
import { PermissionService } from '../../services/permissionService';
import { formatApiResponse } from '../../utils/formattor';
import { createJWT, verifyJWT } from '../../utils/jwt';
import { setCookie, removeCookie } from '../../utils/cookies';
import { remove } from 'winston';

export class ApiBackendController {
  // 직원 등록
  public async employeesRegist(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestEmployeeRegister = req.body;
      
      // 직원 등록 처리
      const employeeService: IEmployeeService = new EmployeeService();
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
      const employeeService: IEmployeeService = new EmployeeService();
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
  public async employeesUpdate(req: Request, res: Response): Promise<void> {
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
      const requestData: IRequestEmployeeUpdate = req.body;

      // 직원 정보 수정 처리
      const employeeService: IEmployeeService = new EmployeeService();
      const updatedEmployee = await employeeService.update(employeeId, requestData);

      // 수정 실패 처리
      if (!updatedEmployee.result) {
        const response = formatApiResponse(false, updatedEmployee.code, updatedEmployee.message);
        if (updatedEmployee.code === CODE_FAIL_VALIDATION) {
          res.status(400).json(response);
          return;

        } else {
          res.status(500).json(response);
          return;

        }
      }

      // 쿠키 업데이트
      if (updatedEmployee.data) {
        setCookie(
          res, 
          'employee', 
          JSON.stringify({
            id: updatedEmployee.data.id,
            name: updatedEmployee.data.name,
            permissions: updatedEmployee.data.permissions,
          })
        );
      }
      
      // 수정 성공시 200 응답
      res.status(201).send(null);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);
      
    }
  }

  // 직원 비밀번호 변경
  public async employeesUpdatePassword(req: Request, res: Response): Promise<void> {
    try {
      // 직원 ID 추출
      const employeeId = parseInt(req.params.employeeId);

      // ID가 숫자가 아닌 경우 에러 처리
      if (isNaN(employeeId)) {
        res.status(400).send('Bad Request');
        return;
      }

      // 요청 데이터
      const requestData: IRequestEmployeeUpdatePassword = req.body;

      // 직원 비밀번호 변경 처리
      const employeeService: IEmployeeService = new EmployeeService();
      const result = await employeeService.updatePassword(employeeId, requestData);

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
      const requestData: IRequestEmployeeDelete = req.body;

      // 직원 탈퇴 처리
      const employeeService: IEmployeeService = new EmployeeService();
      const result = await employeeService.delete(employeeId, requestData);

      // 탈퇴 실패 처리
      if (!result.result && result.code === CODE_FAIL_VALIDATION) {
        res.status(400).send(result);
        return;

      } else if (!result.result) {
        throw new Error('탈퇴 처리에 실패했습니다.');
      }

      // 쿠키 삭제
      removeCookie(res, 'accessToken');
      removeCookie(res, 'employee');

      // 탈퇴 성공시 200 응답
      res.status(200).send(result);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  }

  // 직원 권한 수정/변경
  public async employeesPermissions(req: Request, res: Response): Promise<void> {
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
      const permissions = requestData.permissions.map((permission: any) => parseInt(permission));

      // 로그인 유저 정보
      const decodedToken = verifyJWT(req.cookies.accessToken);
      const grantedById = decodedToken ? parseInt(decodedToken.id) : null;

      // 로그인 확인
      if (!grantedById) {
        const response = formatApiResponse(false, CODE_FAIL_VALIDATION, '로그인이 필요합니다.');
        res.status(400).json(response);
        return;
      }

      // 직원 권한 수정 처리
      const permissionService: IPermissionService = new PermissionService();
      const updatedEmployee = await permissionService.updateEmployeesPermissions(employeeId, permissions, grantedById);

      // 쿠키 업데이트
      if (updatedEmployee.data) {
        setCookie(
          res,
          'employee',
          JSON.stringify({
            id: updatedEmployee.data.id,
            name: updatedEmployee.data.name,
            permissions: updatedEmployee.data.permissions,
          })
        );
      }
      
      // 수정 실패 처리
      if (!updatedEmployee.result) {
        const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
        res.status(500).send(response);
        return;
      }

      // 수정 성공시 201 응답
      res.status(201).send(null);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  }

  // 직원 목록
  public async employees(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestEmployeeList = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sort: req.params.sort as typeListSort,
        query: req.query.query as string || '',
      }

      // 직원 목록 조회
      const employeeService: IEmployeeService = new EmployeeService();
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

  // 직원 로그인
  public async employeesLogin(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestEmployeeLogin = req.body;

      // 직원 로그인 처리
      const employeeService: IEmployeeService = new EmployeeService();
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
        const tokenData: IEmployeeToken = {
          id: result.data.id,
          name: result.data.name,
          permissions: result.data.permissions,
        }
        const token = createJWT(tokenData);
        if (token) {
          setCookie(res, 'accessToken', token);
          setCookie(res, 'employee', JSON.stringify(tokenData));
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
      removeCookie(res, 'employee');
      removeCookie(res, 'accessToken');

      // 로그아웃 성공시 200 응답
      res.status(201).send(null);

    } catch (error) {
      const response = formatApiResponse(false, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER);
      res.status(500).json(response);

    }
  }

  // 권한 목록
  public async permissions(req: Request, res: Response): Promise<void> {
    try {
      // 요청 데이터
      const requestData: IRequestDefaultList = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        query: req.query.query as string || '',
      }

      // 권한 목록 조회
      const permissionService: IPermissionService = new PermissionService();
      const result = await permissionService.list(requestData);

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
}