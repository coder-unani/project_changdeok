import { IBanner, IBannerGroup, IContent, IContentGroup, IEmployee, IPermission } from './object';
import {
  IRequestBannerUpdate,
  IRequestBannerWrite,
  IRequestBanners,
  IRequestContentUpdate,
  IRequestContentWrite,
  IRequestContents,
  IRequestDefaultList,
  IRequestEmployeeDelete,
  IRequestEmployeeForceUpdatePassword,
  IRequestEmployeeLogin,
  IRequestEmployeeRegister,
  IRequestEmployeeUpdate,
  IRequestEmployeeUpdatePassword,
  IRequestEmployees,
} from './request';
import { IServiceResponse } from './response';

export interface IBannerService {
  create(data: IRequestBannerWrite): Promise<IServiceResponse>;
  read(id: number): Promise<IServiceResponse<IBanner>>;
  update(id: number, data: IRequestBannerUpdate): Promise<IServiceResponse>;
  delete(id: number): Promise<IServiceResponse>;
  list(data: IRequestBanners): Promise<IServiceResponse<IBanner[] | []>>;
  groupInfo(groupId: number): Promise<IServiceResponse<IBannerGroup>>;
}

export interface IContentService {
  create(groupId: number, data: IRequestContentWrite): Promise<IServiceResponse>;
  read(contentId: number): Promise<IServiceResponse<IContent>>;
  update(contentId: number, data: IRequestContentUpdate): Promise<IServiceResponse>;
  delete(contentId: number): Promise<IServiceResponse>;
  list(groupId: number, data: IRequestContents): Promise<IServiceResponse<IContent[] | []>>;
  groupInfo(groupId: number): Promise<IServiceResponse<IContentGroup>>;
}

export interface IEmployeeService {
  create(data: IRequestEmployeeRegister): Promise<IServiceResponse>;
  read(id: number): Promise<IServiceResponse<IEmployee>>;
  update(id: number, data: IRequestEmployeeUpdate): Promise<IServiceResponse<IEmployee>>;
  updatePassword(id: number, data: IRequestEmployeeUpdatePassword): Promise<IServiceResponse>;
  updatePasswordForce(id: number, data: IRequestEmployeeForceUpdatePassword): Promise<IServiceResponse>;
  delete(id: number, data: IRequestEmployeeDelete): Promise<IServiceResponse>;
  list(data: IRequestEmployees): Promise<IServiceResponse<IEmployee[] | []>>;
  login(data: IRequestEmployeeLogin): Promise<IServiceResponse<IEmployee>>;
}

export interface IPermissionService {
  list(data: IRequestDefaultList): Promise<IServiceResponse<IPermission[]>>;
  updateEmployeesPermissions(
    employeeId: number,
    permissionIds: number[],
    grantedById: number
  ): Promise<IServiceResponse<IEmployee>>;
}
