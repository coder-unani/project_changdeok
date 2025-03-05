import { API_BASE_URL } from '../config/config';
import { IApiResponse } from '../types/response';
import { IBannerGroup, IBanner, IContent, IEmployee, IPermission } from '../types/object';
import { apiBackendRoutes } from '../routes/routes';
import { IRequestBanners, IRequestContents } from '../types/request';

export const getApiBannerGroup = async (accessToken: string, groupId: number): Promise<IApiResponse<IBannerGroup>> => {
  try {
    // API 호출
    const apiResponse = await fetch(
      `${API_BASE_URL}${apiBackendRoutes.bannersGroup.url}`.replace(':groupId', groupId.toString()), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
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
      message: responseToJson.message,
      metadata: responseToJson.metadata, 
      data: responseToJson.data 
    };

  } catch (error) {
    return { result: false, metadata: null, message: (error instanceof Error) ? error.message : 'API 호출 실패' };

  }
};

export const getApiBanners = async (accessToken: string, data: IRequestBanners): Promise<IApiResponse<IBanner[] | []>> => {
  try {
    // Params 생성
    const params = new URLSearchParams(data as any);

    // API URL
    const apiUrl = `${API_BASE_URL}${apiBackendRoutes.banners.url}`;

    // API 호출
    const apiResponse = await fetch(`${apiUrl}?${params.toString()}`, {
      method: `${apiBackendRoutes.banners.method}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
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
    return { result: false, metadata: null, data: [], message: (error instanceof Error) ? error.message : 'API 호출 실패' };

  }
}

export const getApiBannerDetail = async (accessToken: string, bannerId: number): Promise<IApiResponse<IContent>> => {
  try {
    // API 호출
    const apiResponse = await fetch(`${API_BASE_URL}${apiBackendRoutes.bannersDetail.url}`.replace(':bannerId', bannerId.toString()), {
      method: `${apiBackendRoutes.bannersDetail.method}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
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
}

export const getApiContents = async (accessToken: string, groupId: number, data: IRequestContents): Promise<IApiResponse<IContent[]>> => {
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
        'Authorization': `Bearer ${accessToken}`,
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
    return { result: false, metadata: null, data: [], message: (error instanceof Error) ? error.message : 'API 호출 실패' };

  }
};

export const getApiContentDetail = async (groupId: number, contentId: number): Promise<IApiResponse<IContent>> => {
  try {
    // API 호출
    const apiResponse = await fetch(
      `${API_BASE_URL}${apiBackendRoutes.contentsDetail.url}`.replace(':groupId', groupId.toString()).replace(':contentId', contentId.toString()
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

    // 응답 성공
    return {
      result: responseToJson.result,
      metadata: responseToJson.metadata,
      data: responseToJson.data
    };
    
  } catch (error) {
    throw error;

  }
}

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