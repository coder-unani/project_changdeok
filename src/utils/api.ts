import { API_BASE_URL } from '../config/config';
import { IApiResponse } from '../types/response';
import { IContent, IEmployee, IPermission } from '../types/object';
import { apiBackendRoutes } from '../routes/routes';
import { IRequestContents } from 'types/request';

export const getApiContents = async (groupId: number, data: IRequestContents): Promise<IApiResponse<IContent[]>> => {
  try {
    // Params 생성
    const params = new URLSearchParams(data as any);

    // Url 생성
    let apiUrl = `${API_BASE_URL}${apiBackendRoutes.contents.url}`.replace(':groupId', groupId.toString());
    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    // API 호출
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // JSON 파싱
    const responseToJson = await apiResponse.json();

    // 응답 오류
    if (!apiResponse.ok) {
      throw new Error(responseToJson.message || apiResponse.statusText);
    }

    // API 조회 실패
    if (!responseToJson.result) {
      throw new Error(responseToJson.message);
    }

    // 응답 성공
    return { 
      result: responseToJson.result, 
      metadata: responseToJson.metadata, 
      data: responseToJson.data 
    };

  } catch (error) {
    throw error;

  }
};

export const getApiEmployeeDetail = async (employeeId: number): Promise<IApiResponse<IEmployee>> => {
  try {
    // API 호출
    const apiResponse = await fetch(
      `${API_BASE_URL}${apiBackendRoutes.employeesDetail.url}`.replace(':employeeId', employeeId.toString()
      ), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // JSON 파싱
    const responseToJson = await apiResponse.json();

    // 응답 오류
    if (!apiResponse.ok) {
      throw new Error(responseToJson.message || apiResponse.statusText);
    }
    
    // API 조회 실패
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

    // 응답 성공
    return { result: responseToJson.result, metadata, data };

  } catch (error) {
    throw error;

  }
};

export const getApiPermissionList = async (page: number, pageSize: number): Promise<IApiResponse<IPermission[]>> => {
  try {
    // API 호출
    const apiResponse = await fetch(`${API_BASE_URL}${apiBackendRoutes.permissions.url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // JSON 파싱
    const responseToJson = await apiResponse.json();

    // 응답 오류
    if (!apiResponse.ok) {
      throw new Error(responseToJson.message || apiResponse.statusText);
    }

    // API 조회 실패
    if (!responseToJson.result) {
      throw new Error(responseToJson.message);
    }

    return { 
      result: responseToJson.result, 
      metadata: responseToJson.metadata, 
      data: responseToJson.data 
    };

  } catch (error) {
    throw error;

  }
};