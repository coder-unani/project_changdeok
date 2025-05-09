import { CONFIG } from '../config/config';
import { apiRoutes } from '../config/routes';
import { IApiResponse } from '../types/config';
import { IPermission, ISiteSettings, ISystemStatus } from '../types/config';
import { IBanner, IBannerGroup, IContent, IContentGroup, IEmployee } from '../types/object';
import { IRequestBanners, IRequestContents } from '../types/request';

let API_BASE_URL = CONFIG.SERVICE_URL;
API_BASE_URL = CONFIG.SERVICE_PORT ? `${API_BASE_URL}:${CONFIG.SERVICE_PORT}` : API_BASE_URL;

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

    const finalUrl = options.params ? `${url}?${options.params.toString()}` : url;

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
  const apiUrl = `${API_BASE_URL}${apiRoutes.banners.group.url}`.replace(':groupIds', groupIdsString);

  return fetchApi<IBannerGroup[]>(apiUrl, {
    method: apiRoutes.banners.group.method,
  });
};

export const getApiBanners = async (data: IRequestBanners): Promise<IApiResponse<IBanner[] | []>> => {
  const params = new URLSearchParams(data as any);
  const apiUrl = `${API_BASE_URL}${apiRoutes.banners.list.url}`;

  return fetchApi<IBanner[]>(apiUrl, {
    method: apiRoutes.banners.list.method,
    params,
  });
};

export const getApiBannerDetail = async (bannerId: number): Promise<IApiResponse<IContent>> => {
  const apiUrl = `${API_BASE_URL}${apiRoutes.banners.detail.url}`.replace(':bannerId', bannerId.toString());

  return fetchApi<IContent>(apiUrl, {
    method: apiRoutes.banners.detail.method,
  });
};

export const getApiContents = async (groupId: number, data: IRequestContents): Promise<IApiResponse<IContent[]>> => {
  const params = new URLSearchParams(data as any);
  let apiUrl = `${API_BASE_URL}${apiRoutes.contents.list.url}`.replace(':groupId', groupId.toString());

  return fetchApi<IContent[]>(apiUrl, {
    method: apiRoutes.contents.list.method,
    params,
  });
};

export const getApiContentDetail = async (groupId: number, contentId: number): Promise<IApiResponse<IContent>> => {
  const apiUrl = `${API_BASE_URL}${apiRoutes.contents.detail.url}`
    .replace(':groupId', groupId.toString())
    .replace(':contentId', contentId.toString());

  return fetchApi<IContent>(apiUrl, {
    method: apiRoutes.contents.detail.method,
  });
};

export const getApiContentGroup = async (groupId: number): Promise<IApiResponse<IContentGroup>> => {
  const apiUrl = `${API_BASE_URL}${apiRoutes.contents.group.url}`.replace(':groupId', groupId.toString());

  return fetchApi<IContentGroup>(apiUrl, {
    method: apiRoutes.contents.group.method,
  });
};

export const getApiEmployeeDetail = async (employeeId: number): Promise<IApiResponse<IEmployee>> => {
  const apiUrl = `${API_BASE_URL}${apiRoutes.employees.detail.url}`.replace(':employeeId', employeeId.toString());

  return fetchApi<IEmployee>(apiUrl, {
    method: apiRoutes.employees.detail.method,
  });
};

export const getApiPermissionList = async (page: number, pageSize: number): Promise<IApiResponse<IPermission[]>> => {
  const apiUrl = `${API_BASE_URL}${apiRoutes.permissions.url}`;

  return fetchApi<IPermission[]>(apiUrl, {
    method: apiRoutes.permissions.method,
  });
};

export const getApiSiteSettings = async (): Promise<IApiResponse<ISiteSettings>> => {
  const apiUrl = `${API_BASE_URL}${apiRoutes.settings.read.url}`;

  return fetchApi<ISiteSettings>(apiUrl, {
    method: apiRoutes.settings.read.method,
  });
};

export const getApiSystemStatus = async (): Promise<IApiResponse<ISystemStatus>> => {
  const apiUrl = `${API_BASE_URL}${apiRoutes.systems.status.url}`;

  return fetchApi<ISystemStatus>(apiUrl, {
    method: apiRoutes.systems.status.method,
  });
};
