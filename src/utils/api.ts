import { API_BASE_URL } from '../config/config';
import { IApiResponse } from '../types/response';
import { IEmployee, IPermission } from '../types/backend';
import { apiBackendRoutes } from '../routes/routes';

export const getApiEmployeeDetail = async (employeeId: number): Promise<IApiResponse<IEmployee>> => {
  try {
    // API 호출
    const response = await fetch(
      `${API_BASE_URL}${apiBackendRoutes.employeesDetail.url}`.replace(':employeeId', employeeId.toString()
      ), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // 응답 오류
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    
    // JSON 파싱
    const responseToJson = await response.json();
    
    // 결과가 실패인 경우
    if (!responseToJson.result) {
      throw new Error(responseToJson.message);
    }
    
    // metadata 생성
    const metadata = {
      code: responseToJson.code,
      message: responseToJson.message,
    }

    // data 생성
    const data: IEmployee = responseToJson.data;

    // metadata, data 반환
    return { result: responseToJson.result, metadata, data };

  } catch (error) {
    throw error;

  }
};

export const getApiPermissionList = async (page: number, pageSize: number): Promise<IApiResponse<IPermission[]>> => {
  try {
    const apiResponse = await fetch(`${API_BASE_URL}${apiBackendRoutes.permissions.url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      throw new Error(apiResponse.statusText);
    }

    const responseToJson = await apiResponse.json();

    return { 
      result: responseToJson.result, 
      metadata: responseToJson.metadata, 
      data: responseToJson.data 
    };

  } catch (error) {
    throw error;

  }
};