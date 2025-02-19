import { IContentGroup, IContent, IContentUpdate, IEmployee, IPermission } from './object';
import { 
  IRequestDefaultList,
  IRequestContentWrite,
  IRequestContents,
  IRequestEmployeeRegister, 
  IRequestEmployeeUpdate, 
  IRequestEmployeeUpdatePassword, 
  IRequestEmployeeForceUpdatePassword, 
  IRequestEmployeeDelete, 
  IRequestEmployees, 
  IRequestEmployeeLogin 
} from './request';
import { IServiceResponse } from './response';

export interface IContentService {
  create(groupId: number, data: IRequestContentWrite): Promise<IServiceResponse>
  read(contentId: number): Promise<IServiceResponse<IContent>>;
  update(data: IContentUpdate): void;
  delete(contentId: number): void;
  list(groupId: number, data: IRequestContents): Promise<IServiceResponse<IContent[] | []>>
  groupInfo(groupId: number): Promise<IServiceResponse<IContentGroup>>;
}

export interface IEmployeeService {
  create(data: IRequestEmployeeRegister): Promise<IServiceResponse>
  read(id: number): Promise<IServiceResponse<IEmployee>>;
  update(id: number, data: IRequestEmployeeUpdate): Promise<IServiceResponse<IEmployee>>
  updatePassword(id: number, data: IRequestEmployeeUpdatePassword): Promise<IServiceResponse>;
  updatePasswordForce(id: number, data: IRequestEmployeeForceUpdatePassword): Promise<IServiceResponse>;
  delete(id: number, data: IRequestEmployeeDelete): Promise<IServiceResponse>;
  list(data: IRequestEmployees): Promise<IServiceResponse<IEmployee[] | []>>
  login(data: IRequestEmployeeLogin): Promise<IServiceResponse<IEmployee>>;
}

export interface IPermissionService {
  list(data: IRequestDefaultList): Promise<IServiceResponse<IPermission[]>>;
  updateEmployeesPermissions(employeeId: number, permissionIds: number[], grantedById: number): Promise<IServiceResponse<IEmployee>>
}