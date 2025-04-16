import { CONFIG } from '../config/config';
import { IApiResponse } from '../types/response';
import { IBannerGroup, IBanner, IContent, IContentGroup, IEmployee, IPermission } from '../types/object';
import { apiRoutes } from '../config/routes';
import { IRequestBanners, IRequestContents } from '../types/request';

let API_BASE_URL = CONFIG.SERVICE_URL;
API_BASE_URL = CONFIG.SERVICE_PORT ? `${API_BASE_URL}:${CONFIG.SERVICE_PORT}` : API_BASE_URL;

export const getApiBannerGroup = async (accessToken: string, groupId: number): Promise<IApiResponse<IBannerGroup>> => {
  try {
    // API 호출
    const apiResponse = await fetch(
      `${API_BASE_URL}${apiRoutes.banners.group.url}`.replace(':groupId', groupId.toString()),
      {
        method: `${apiRoutes.banners.group.method}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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
      data: responseToJson.data,
    };
  } catch (error) {
    return { result: false, metadata: null, message: error instanceof Error ? error.message : 'API 호출 실패' };
  }
};

export const getApiBanners = async (
  accessToken: string,
  data: IRequestBanners
): Promise<IApiResponse<IBanner[] | []>> => {
  try {
    // Params 생성
    const params = new URLSearchParams(data as any);

    // API URL
    const apiUrl = `${API_BASE_URL}${apiRoutes.banners.list.url}`;

    // API 호출
    const apiResponse = await fetch(`${apiUrl}?${params.toString()}`, {
      method: `${apiRoutes.banners.list.method}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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
      data: responseToJson.data,
    };
  } catch (error) {
    return {
      result: false,
      metadata: null,
      data: [],
      message: error instanceof Error ? error.message : 'API 호출 실패',
    };
  }
};

export const getApiBannerDetail = async (accessToken: string, bannerId: number): Promise<IApiResponse<IContent>> => {
  try {
    // API 호출
    const apiResponse = await fetch(
      `${API_BASE_URL}${apiRoutes.banners.detail.url}`.replace(':bannerId', bannerId.toString()),
      {
        method: `${apiRoutes.banners.detail.method}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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
      data: responseToJson.data,
    };
  } catch (error) {
    throw error;
  }
};

export const getApiContents = async (
  accessToken: string,
  groupId: number,
  data: IRequestContents
): Promise<IApiResponse<IContent[]>> => {
  try {
    // Params 생성
    const params = new URLSearchParams(data as any);

    // Url 생성
    let apiUrl = `${API_BASE_URL}${apiRoutes.contents.list.url}`.replace(':groupId', groupId.toString());
    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    // API 호출
    const apiResponse = await fetch(apiUrl, {
      method: `${apiRoutes.contents.list.method}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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
      data: responseToJson.data,
    };
  } catch (error) {
    return {
      result: false,
      metadata: null,
      data: [],
      message: error instanceof Error ? error.message : 'API 호출 실패',
    };
  }
};

export const getApiContentDetail = async (groupId: number, contentId: number): Promise<IApiResponse<IContent>> => {
  try {
    // API 호출
    const apiResponse = await fetch(
      `${API_BASE_URL}${apiRoutes.contents.detail.url}`
        .replace(':groupId', groupId.toString())
        .replace(':contentId', contentId.toString()),
      {
        method: `${apiRoutes.contents.detail.method}`,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

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
      data: responseToJson.data,
    };
  } catch (error) {
    throw error;
  }
};

export const getApiContentGroup = async (groupId: number): Promise<IApiResponse<IContentGroup>> => {
  try {
    // API 호출
    const apiResponse = await fetch(
      `${API_BASE_URL}${apiRoutes.contents.group.url}`.replace(':groupId', groupId.toString()),
      {
        method: `${apiRoutes.contents.group.method}`,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

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
      data: responseToJson.data,
    };
  } catch (error) {
    throw error;
  }
};

export const getApiEmployeeDetail = async (employeeId: number): Promise<IApiResponse<IEmployee>> => {
  try {
    // API 호출
    const apiResponse = await fetch(
      `${API_BASE_URL}${apiRoutes.employees.detail.url}`.replace(':employeeId', employeeId.toString()),
      {
        method: `${apiRoutes.employees.detail.method}`,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

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
    };

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
    const apiResponse = await fetch(`${API_BASE_URL}${apiRoutes.permissions.url}`, {
      method: `${apiRoutes.permissions.method}`,
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
      data: responseToJson.data,
    };
  } catch (error) {
    throw error;
  }
};
