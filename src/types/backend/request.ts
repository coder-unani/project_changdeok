export interface IRequestEmployeeRegister {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
  position?: string;
  description?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  hireDate?: string; // 선택적 필드 (ISO 날짜 문자열)
  birthDate?: string; // 선택적 필드 (ISO 날짜 문자열)
}

export interface IRequestEmployeeModify {
  name?: string;
  position?: string;
  description?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  hireDate?: string;
  birthDate?: string;
  fireDate?: string;
  isActivated?: boolean;
  isDeleted?: boolean;
}

export interface IRequestEmployeeDelete {
  fireDate?: string;
}

export interface IRequestEmployeeLogin {
  email: string;
  password: string;
}

export interface IRequestEmployeeList {
  page: number;
  pageSize: number;
  sort?: 'ID_DESC' | 'ID_ASC' | 'NAME_DESC' | 'NAME_ASC';
  query?: string | undefined;
}

export interface IRequestEmployeePasswordModify {
  password: string;
  passwordNew: string;
  passwordNewConfirm: string;
}