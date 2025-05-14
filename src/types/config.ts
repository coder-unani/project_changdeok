import { httpStatus } from '../common/constants';

// CODE_ERROR, CODE_FAIL_SERVER, CODE_FAIL_VALIDATION 상수를 사용하여 typeCode를 정의
export type typeCode = (typeof httpStatus)[keyof typeof httpStatus];
export type typeMessage = string | undefined;

export interface ICORSOptions {
  origin: string;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  optionsSuccessStatus?: number;
}

export interface IApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  title: string;
  url: string;
  permissions: number[];
}

// 페이지 데이터 인터페이스
export interface IPageData {
  layout: string;
  title: string;
  metadata: Record<string, any>;
  data: Record<string, any>;
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

export interface IServiceResponse<T = undefined> {
  result: boolean;
  code?: typeCode;
  message?: typeMessage;
  metadata?: any;
  data?: T;
}

export interface IApiResponse<T = undefined | null> {
  result: boolean;
  code?: number | null;
  message?: string | null;
  metadata?: any | null;
  data?: T;
}

export interface IPermission {
  id: number;
  title: string;
  description: string | null;
}

export interface ISiteSettings {
  title: string;
  introduction?: string;
  description?: string;
  keywords?: string;
  favicon?: string;
  logo?: string;
  ogTagJson?: string;
  serviceDomain?: string;
  servicePort?: number;
}

export interface ICompanySettings {
  companyJson?: string;
}

export interface IAccessSettings {
  blockedIpJson?: string;
  enabledBotJson?: string;
}

export interface ISystemSettings {
  expressDomain: string;
  expressPort: number;
  maxUploadSize: number;
  jwtExpireSecond: number;
  enabledTagsJson?: string;
  enabledCorsJson?: string;
}

export interface ISettings extends ISiteSettings, ICompanySettings, IAccessSettings, ISystemSettings {
  createdAt: Date;
  updatedAt: Date | null;
}

export interface IProcessInfo {
  isRunning: boolean;
  pid: number;
}

export interface IMemoryInfo {
  free: string;
  total: string;
}

export interface ICpuInfo {
  used: string;
  idle: string;
}

export interface ISystemStatus {
  processInfo: IProcessInfo;
  memoryInfo: IMemoryInfo;
  cpuInfo: ICpuInfo;
  uptime: string;
}
