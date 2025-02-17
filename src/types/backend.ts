import { 
  IRequestDefaultList,
  IRequestEmployeeRegister, 
  IRequestEmployeeUpdate, 
  IRequestEmployeeUpdatePassword, 
  IRequestEmployeeDelete, 
  IRequestEmployeeList, 
  IRequestEmployeeLogin 
} from './request';
import { IServiceResponse } from './response';

type typeOptionalString = string | null | undefined;

export interface IEmployee {
  id: number;
  email: string;
  name: string;
  position?: typeOptionalString;
  description?: typeOptionalString;
  phone?: typeOptionalString;
  mobile?: typeOptionalString;
  address?: typeOptionalString;
  hireDate?: typeOptionalString;
  birthDate?: typeOptionalString;
  fireDate?: typeOptionalString;
  isActivated?: boolean;
  permissions?: number[];
  // createdAt: string;
  // updatedAt: string;
}

export interface IEmployeeToken {
  id: number;
  email: string;
  name: string;
  permissions: number[] | undefined | null;
}

export interface IEmployeeUpdate {
  name?: string;
  position?: string;
  description?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  hireDate?: Date;
  fireDate?: Date;
  birthDate?: Date;
  isActivated?: boolean;
  isDeleted?: boolean;
}

export interface IEmployeeService {
  create(data: IRequestEmployeeRegister): Promise<IServiceResponse>
  read(id: number): Promise<IServiceResponse<IEmployee>>;
  update(id: number, data: IRequestEmployeeUpdate): Promise<IServiceResponse<IEmployee>>
  updatePassword(id: number, data: IRequestEmployeeUpdatePassword): Promise<IServiceResponse>;
  delete(id: number, data: IRequestEmployeeDelete): Promise<IServiceResponse>;
  list(data: IRequestEmployeeList): Promise<IServiceResponse<IEmployee[]>>;
  login(data: IRequestEmployeeLogin): Promise<IServiceResponse<IEmployee>>;
}

export interface IPermissionService {
  list(data: IRequestDefaultList): Promise<IServiceResponse<IPermission[]>>;
  updateEmployeesPermissions(employeeId: number, permissionIds: number[], grantedById: number): Promise<IServiceResponse<IEmployee>>
}

export interface IPermission {
  id: number;
  title: string;
  description: string | null;
}
