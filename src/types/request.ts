export type typeListSort = 'ID_DESC' | 'ID_ASC' | 'TITLE_DESC' | 'TITLE_ASC';

export interface IRequestContentWrite {
  title: string;
  content: string;
  isAnonymous?: boolean;
  isActivated?: boolean;
  ip?: string;
  userAgent?: string;
}

export interface IRequestContentUpdate {
  title?: string;
  content?: string;
  isAnonymous?: boolean;
  isActivated?: boolean;
}

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

export interface IRequestEmployeeUpdate {
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

export interface IRequestDefaultList {
  page: number;
  pageSize: number;
  query?: string | undefined;
}

export interface IRequestContents extends IRequestDefaultList {
  sort?: typeListSort;
}

export interface IRequestEmployees extends IRequestDefaultList {
  sort?: typeListSort;
}


export interface IRequestEmployeeForceUpdatePassword {
  passwordNew: string;
  passwordNewConfirm: string;
}

export interface IRequestEmployeeUpdatePassword extends IRequestEmployeeForceUpdatePassword {
  password: string;
}