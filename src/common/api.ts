import { apiRoutes } from '../config/routes';
import { IApiResponse } from '../types/config';
import { IPermission, ISettings, ISystemStatus } from '../types/config';
import { IBanner, IBannerGroup, IContent, IContentGroup, IEmployee } from '../types/object';
import { IRequestBanners, IRequestSearchList } from '../types/request';

const API_BASE_URL = 'http://localhost:3000';

interface FetchOptions {
  accessToken?: string;
  params?: URLSearchParams;
}

const fetchApi = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options: FetchOptions = {}
): Promise<IApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.accessToken) {
      headers['Authorization'] = `Bearer ${options.accessToken}`;
    }

    const finalUrl = options.params ? `${API_BASE_URL}${url}?${options.params.toString()}` : `${API_BASE_URL}${url}`;

    const apiResponse = await fetch(finalUrl, {
      method,
      headers,
    });

    const responseToJson = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(responseToJson.message || apiResponse.statusText);
    }

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
    return {
      result: false,
      metadata: null,
      data: null as T,
      message: error instanceof Error ? error.message : 'API 호출 실패',
    };
  }
};

export const getApiBannerGroup = async (
  groupIds: number[] = [],
  options: FetchOptions = {}
): Promise<IApiResponse<IBannerGroup[]>> => {
  const groupIdsString = groupIds.length > 0 ? groupIds.join(',') : 'all';
  const apiUrl = `${apiRoutes.banners.group.url}`.replace(':groupIds', groupIdsString);

  console.log(apiUrl);
  console.log(options);

  return fetchApi<IBannerGroup[]>(apiRoutes.banners.group.method, apiUrl, {
    ...options,
  });
};

export const getApiBanners = async (
  data: IRequestBanners,
  options: FetchOptions = {}
): Promise<IApiResponse<IBanner[] | []>> => {
  const params = new URLSearchParams(data as any);
  const apiUrl = `${apiRoutes.banners.list.url}`;

  console.log(apiUrl);
  console.log(options);

  return fetchApi<IBanner[]>(apiRoutes.banners.list.method, apiUrl, {
    ...options,
    params,
  });
};

export const getApiBannerDetail = async (
  bannerId: number,
  options: FetchOptions = {}
): Promise<IApiResponse<IContent>> => {
  const apiUrl = `${apiRoutes.banners.detail.url}`.replace(':bannerId', bannerId.toString());

  return fetchApi<IContent>(apiRoutes.banners.detail.method, apiUrl, {
    ...options,
  });
};

export const getApiContents = async (
  groupId: number,
  data: IRequestSearchList,
  options: FetchOptions = {}
): Promise<IApiResponse<IContent[]>> => {
  const params = new URLSearchParams(data as any);
  let apiUrl = `${apiRoutes.contents.list.url}`.replace(':groupId', groupId.toString());

  return fetchApi<IContent[]>(apiRoutes.contents.list.method, apiUrl, {
    ...options,
    params,
  });
};

export const getApiContentDetail = async (
  groupId: number,
  contentId: number,
  options: FetchOptions = {}
): Promise<IApiResponse<IContent>> => {
  const apiUrl = `${apiRoutes.contents.detail.url}`
    .replace(':groupId', groupId.toString())
    .replace(':contentId', contentId.toString());

  return fetchApi<IContent>(apiRoutes.contents.detail.method, apiUrl, {
    ...options,
  });
};

export const getApiContentGroup = async (
  groupId: number,
  options: FetchOptions = {}
): Promise<IApiResponse<IContentGroup>> => {
  const apiUrl = `${apiRoutes.contents.group.url}`.replace(':groupId', groupId.toString());

  return fetchApi<IContentGroup>(apiRoutes.contents.group.method, apiUrl, {
    ...options,
  });
};

export const getApiEmployeeDetail = async (
  employeeId: number,
  options: FetchOptions = {}
): Promise<IApiResponse<IEmployee>> => {
  const apiUrl = `${apiRoutes.employees.detail.url}`.replace(':employeeId', employeeId.toString());

  return fetchApi<IEmployee>(apiRoutes.employees.detail.method, apiUrl, {
    ...options,
  });
};

export const getApiPermissionList = async (options: FetchOptions = {}): Promise<IApiResponse<IPermission[]>> => {
  const apiUrl = `${apiRoutes.permissions.url}`;

  return fetchApi<IPermission[]>(apiRoutes.permissions.method, apiUrl, {
    ...options,
  });
};

export const getApiSettings = async (options: FetchOptions = {}): Promise<IApiResponse<ISettings>> => {
  const apiUrl = `${apiRoutes.settings.read.url}`;

  return fetchApi<ISettings>(apiRoutes.settings.read.method, apiUrl, {
    ...options,
  });
};

export const getApiSystemStatus = async (options: FetchOptions = {}): Promise<IApiResponse<ISystemStatus>> => {
  const apiUrl = `${apiRoutes.systems.status.url}`;

  return fetchApi<ISystemStatus>(apiRoutes.systems.status.method, apiUrl, {
    ...options,
  });
};
