import { IServiceResponse } from './config';
import { IPermission, ISettings, ISystemStatus } from './config';
import { IBanner, IBannerGroup, IContent, IContentGroup, IEmployee, IEmployeeLoginHistory } from './object';
import {
  IRequestAccessSettings,
  IRequestBannerUpdate,
  IRequestBannerWrite,
  IRequestBanners,
  IRequestCompanySettings,
  IRequestContentGroupUpdate,
  IRequestContentUpdate,
  IRequestContentWrite,
  IRequestEmployeeDelete,
  IRequestEmployeeForceUpdatePassword,
  IRequestEmployeeLogin,
  IRequestEmployeeRegister,
  IRequestEmployeeUpdate,
  IRequestEmployeeUpdatePassword,
  IRequestSearchList,
  IRequestSiteSettings,
  IRequestSystemSettings,
} from './request';

export interface IBannerService {
  create(data: IRequestBannerWrite): Promise<IServiceResponse>;
  read(id: number): Promise<IServiceResponse<IBanner>>;
  update(id: number, data: IRequestBannerUpdate): Promise<IServiceResponse>;
  delete(id: number): Promise<IServiceResponse>;
  list(data: IRequestBanners): Promise<IServiceResponse<IBanner[] | []>>;
  groupInfo(groupIds: number[], includeBanners: boolean): Promise<IServiceResponse<IBannerGroup[]>>;
}

export interface IContentService {
  create(groupId: number, data: IRequestContentWrite): Promise<IServiceResponse>;
  read(contentId: number): Promise<IServiceResponse<IContent>>;
  update(contentId: number, data: IRequestContentUpdate): Promise<IServiceResponse>;
  delete(contentId: number): Promise<IServiceResponse>;
  list(groupId: number, data: IRequestSearchList): Promise<IServiceResponse<IContent[] | []>>;
  groupInfo(groupId: number): Promise<IServiceResponse<IContentGroup>>;
  updateGroup(groupId: number, data: IRequestContentGroupUpdate): Promise<IServiceResponse>;
}

export interface IEmployeeService {
  create(data: IRequestEmployeeRegister): Promise<IServiceResponse>;
  read(id: number): Promise<IServiceResponse<IEmployee>>;
  update(id: number, data: IRequestEmployeeUpdate): Promise<IServiceResponse<IEmployee>>;
  updatePassword(id: number, data: IRequestEmployeeUpdatePassword): Promise<IServiceResponse>;
  updatePasswordForce(id: number, data: IRequestEmployeeForceUpdatePassword): Promise<IServiceResponse>;
  delete(id: number, data: IRequestEmployeeDelete): Promise<IServiceResponse>;
  list(data: IRequestSearchList): Promise<IServiceResponse<IEmployee[] | []>>;
  login(data: IRequestEmployeeLogin): Promise<IServiceResponse<IEmployee>>;
  loginHistory(params: IRequestSearchList): Promise<IServiceResponse<IEmployeeLoginHistory[]>>;
}

export interface IPermissionService {
  list(data: IRequestSearchList): Promise<IServiceResponse<IPermission[]>>;
  updateEmployeesPermissions(
    employeeId: number,
    permissionIds: number[],
    grantedById: number
  ): Promise<IServiceResponse<IEmployee>>;
}

export interface IStatsService {
  getVisitorStats(startDate: string, endDate: string): Promise<IServiceResponse<any>>;
  getDailyVisitorStats(startDate: string, endDate: string): Promise<IServiceResponse<any>>;
  getPageViews(startDate: string, endDate: string): Promise<IServiceResponse<any>>;
  getCountryStats(startDate: string, endDate: string): Promise<IServiceResponse<any>>;
  getReferrerStats(startDate: string, endDate: string): Promise<IServiceResponse<any>>;
  getHourlyStats(startDate: string, endDate: string): Promise<IServiceResponse<any>>;
  getBrowserStats(startDate: string, endDate: string): Promise<IServiceResponse<any>>;
  getAccessLogs(date: string): Promise<IServiceResponse<any>>;
}

export interface ISettingsService {
  getSettings(): Promise<IServiceResponse<ISettings>>;
  updateSiteSettings(data: IRequestSiteSettings): Promise<IServiceResponse<void>>;
  updateCompanySettings(data: string): Promise<IServiceResponse<void>>;
  updateAccessSettings(data: IRequestAccessSettings): Promise<IServiceResponse<void>>;
  updateSystemSettings(data: IRequestSystemSettings): Promise<IServiceResponse<void>>;
}

export interface ISystemService {
  restart(): Promise<IServiceResponse<void>>;
  getStatus(): Promise<IServiceResponse<ISystemStatus>>;
}
