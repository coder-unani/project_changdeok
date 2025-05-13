import { apiRoutes } from '../config/routes';
import { IApiResponse } from '../types/config';
import { IPermission, ISettings, ISystemStatus } from '../types/config';
import { IBanner, IBannerGroup, IContent, IContentGroup, IEmployee } from '../types/object';
import { IRequestBanners, IRequestContents } from '../types/request';

const API_BASE_URL = 'http://localhost:3000';

interface FetchOptions {
  method: string;
  accessToken?: string;
  params?: URLSearchParams;
}

const fetchApi = async <T>(url: string, options: FetchOptions): Promise<IApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.accessToken) {
      headers['Authorization'] = `Bearer ${options.accessToken}`;
    }

    const finalUrl = options.params ? `${API_BASE_URL}${url}?${options.params.toString()}` : `${API_BASE_URL}${url}`;

    const apiResponse = await fetch(finalUrl, {
      method: options.method,
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

export const getApiBannerGroup = async (groupIds: number[] = []): Promise<IApiResponse<IBannerGroup[]>> => {
  const groupIdsString = groupIds.length > 0 ? groupIds.join(',') : 'all';
  const apiUrl = `${apiRoutes.banners.group.url}`.replace(':groupIds', groupIdsString);

  return fetchApi<IBannerGroup[]>(apiUrl, {
    method: apiRoutes.banners.group.method,
  });
};

export const getApiBanners = async (data: IRequestBanners): Promise<IApiResponse<IBanner[] | []>> => {
  const params = new URLSearchParams(data as any);
  const apiUrl = `${apiRoutes.banners.list.url}`;

  return fetchApi<IBanner[]>(apiUrl, {
    method: apiRoutes.banners.list.method,
    params,
  });
};

export const getApiBannerDetail = async (bannerId: number): Promise<IApiResponse<IContent>> => {
  const apiUrl = `${apiRoutes.banners.detail.url}`.replace(':bannerId', bannerId.toString());

  return fetchApi<IContent>(apiUrl, {
    method: apiRoutes.banners.detail.method,
  });
};

export const getApiContents = async (groupId: number, data: IRequestContents): Promise<IApiResponse<IContent[]>> => {
  const params = new URLSearchParams(data as any);
  let apiUrl = `${apiRoutes.contents.list.url}`.replace(':groupId', groupId.toString());

  return fetchApi<IContent[]>(apiUrl, {
    method: apiRoutes.contents.list.method,
    params,
  });
};

export const getApiContentDetail = async (groupId: number, contentId: number): Promise<IApiResponse<IContent>> => {
  const apiUrl = `${apiRoutes.contents.detail.url}`
    .replace(':groupId', groupId.toString())
    .replace(':contentId', contentId.toString());

  return fetchApi<IContent>(apiUrl, {
    method: apiRoutes.contents.detail.method,
  });
};

export const getApiContentGroup = async (groupId: number): Promise<IApiResponse<IContentGroup>> => {
  const apiUrl = `${apiRoutes.contents.group.url}`.replace(':groupId', groupId.toString());

  return fetchApi<IContentGroup>(apiUrl, {
    method: apiRoutes.contents.group.method,
  });
};

export const getApiEmployees = async (page: number, pageSize: number): Promise<IApiResponse<IEmployee[]>> => {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  const apiUrl = `${apiRoutes.employees.list.url}`;

  return fetchApi<IEmployee[]>(apiUrl, {
    method: apiRoutes.employees.list.method,
    params,
  });
};

export const getApiEmployeeDetail = async (employeeId: number): Promise<IApiResponse<IEmployee>> => {
  const apiUrl = `${apiRoutes.employees.detail.url}`.replace(':employeeId', employeeId.toString());

  return fetchApi<IEmployee>(apiUrl, {
    method: apiRoutes.employees.detail.method,
  });
};

export const getApiPermissionList = async (page: number, pageSize: number): Promise<IApiResponse<IPermission[]>> => {
  const apiUrl = `${apiRoutes.permissions.url}`;

  return fetchApi<IPermission[]>(apiUrl, {
    method: apiRoutes.permissions.method,
  });
};

export const getApiSettings = async (): Promise<IApiResponse<ISettings>> => {
  const apiUrl = `${apiRoutes.settings.read.url}`;

  return fetchApi<ISettings>(apiUrl, {
    method: apiRoutes.settings.read.method,
  });
};

export const getApiSystemStatus = async (): Promise<IApiResponse<ISystemStatus>> => {
  const apiUrl = `${apiRoutes.systems.status.url}`;

  return fetchApi<ISystemStatus>(apiUrl, {
    method: apiRoutes.systems.status.method,
  });
};
