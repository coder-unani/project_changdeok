export type typeListSort = 'ID_DESC' | 'ID_ASC' | 'TITLE_DESC' | 'TITLE_ASC';

export interface IRequestBannerWrite {
  groupId: number;
  seq: number;
  title: string;
  description?: string;
  imagePath?: string | undefined | null;
  linkType?: string;
  linkUrl?: string;
  isPublished?: boolean;
  publishedAt: string;
  unpublishedAt: string;
  createdBy: number;
}

export interface IRequestBannerUpdate {
  title?: string;
  description?: string;
  imagePath?: string | undefined | null;
  linkType?: string;
  linkUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  unpublishedAt?: string;
  updatedBy: number;
}

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
  permissions?: number[];
  grantedById?: number;
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
  origin?: string;
  referer?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface IRequestDefaultList {
  page: number;
  pageSize: number;
  query?: string | undefined;
}

export interface IRequestBanners extends IRequestDefaultList {
  groupId: number;
  seq: number;
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

export interface IRequestSiteSettings {
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

export interface IRequestCompanySettings {
  name: string;
  ceo: string;
  businessNumber: string;
  phone: string;
  fax: string;
  email: string;
  address: string;
  zipCode: string;
  latitude: string;
  longitude: string;
}

export interface IRequestAccessSettings {
  blockedIpJson?: string;
  enabledBotJson?: string;
}

export interface IRequestSystemSettings {
  maxUploadSize: number;
  jwtExpireSecond: number;
  expressDomain: string;
  expressPort: number;
  enabledTagsJson: string;
  enabledCorsJson: string;
}
