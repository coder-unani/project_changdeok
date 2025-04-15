type typeOptionalNumber = number | null | undefined;
type typeOptionalString = string | null | undefined;

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

export interface IBannerGroup {
  id: number;
  kind: string;
  title: string;
  description?: typeOptionalString;
  imageWidth?: number;
  imageHeight?: number;
  createdAt: string;
  updatedAt?: typeOptionalString;
}

export interface IBanner {
  id: number;
  seq: number;
  title: string;
  description?: typeOptionalString;
  imagePath: typeOptionalString;
  linkType: typeOptionalString;
  linkUrl: typeOptionalString;
  isPublished: boolean;
  publishedAt?: typeOptionalString;
  unpublishedAt?: typeOptionalString;
  createdBy: number;
  createdAt: string;
  updatedBy?: typeOptionalNumber;
  updatedAt?: typeOptionalString;
}

export interface IContentGroup {
  id: number;
  kind: string;
  title: string;
  description?: typeOptionalString;
  bannerTopUrl?: typeOptionalString;
  sizePerPage: number;
  isUserWrite: boolean;
  isUserRead: boolean;
  isUserDisplay: boolean;
  isNonUserWrite: boolean;
  isNonUserRead: boolean;
  isNonUserDisplay: boolean;
  isAnonymous: boolean;
  isLike: boolean;
  isShare: boolean;
  isComment: boolean;
  isActivated: boolean;
}

export interface IContent {
  id: number;
  groupId: number;
  title: string;
  content?: typeOptionalString;
  writerId?: number | null;
  writerName?: typeOptionalString;
  writerEmail?: typeOptionalString;
  writerPhone?: typeOptionalString;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isAnonymous?: boolean;
  isNotice?: boolean;
  isActivated?: boolean;
  ip?: typeOptionalString;
  userAgent?: typeOptionalString;
  createdAt: string;
  updatedAt?: typeOptionalString;
}

export interface IContentUpdate {
  groupId: number;
  title: string;
  content?: typeOptionalString;
  writerId?: typeOptionalNumber;
  writerName?: typeOptionalString;
  writerEmail?: typeOptionalString;
  writerPhone?: typeOptionalString;
  isActivated?: boolean;
  isAnonymous?: boolean;
}

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

export interface IPermission {
  id: number;
  title: string;
  description: string | null;
}
