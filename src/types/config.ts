export interface IApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  title: string;
  url: string;
  permissions: number[];
}

export interface IRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  title: string;
  url: string;
  view: string;
  layout: string;
  permissions: number[];
}

export interface INestedRoutes<T> {
  [key: string]: T | INestedRoutes<T>;
}

export type IApiRoutes = INestedRoutes<IApiRoute>;
export type IRoutes = INestedRoutes<IRoute>;

export interface IError {
  statusCode: number;
  message: string;
}

export interface ICompanyInfo {
  name: string; // 회사명
  nameEn: string; // 회사명(영문)
  businessNumber: string; // 사업자 번호
  ceo: string; // 대표자
  address: string; // 주소
  tel: string; // 전화번호
  fax: string; // 팩스
  email: string; // 이메일
  logo: string; // 로고
}
