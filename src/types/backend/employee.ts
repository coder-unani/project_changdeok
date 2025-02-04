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
  // createdAt: string;
  // updatedAt: string;
}

export interface IEmployeeUpdate {
  name?: string;
  position?: string;
  description?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  hireDate?: Date;
  birthDate?: Date;
  fireDate?: Date;
  isActivated?: boolean;
  isDeleted?: boolean;
}

export interface IEmployeeService {
  create(req: any, res: any): void;
  read(req: any, res: any): void;
  update(req: any, res: any): void;
  delete(req: any, res: any): void;
  login(req: any, res: any): Promise<IServiceResponse<IEmployee>>;
  search(req: any, res: any): Promise<IServiceResponse<IEmployee[]>>;
}