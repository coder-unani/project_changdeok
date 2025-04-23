type typeOptionalNumber = number | null | undefined;
type typeOptionalString = string | null | undefined;

export interface IBannerGroup {
  id: number;
  kind: string;
  title: string;
  description?: typeOptionalString;
  imageWidth?: number | null;
  imageHeight?: number | null;
  banners?: IBanner[];
  createdAt: string;
  updatedAt?: typeOptionalString;
}

export interface IBannerDisp {
  title: string;
  description?: typeOptionalString;
  imagePath: typeOptionalString;
  linkType?: typeOptionalString;
  linkUrl?: typeOptionalString;
}

export interface IBanner extends IBannerDisp {
  id: number;
  groupId: number;
  seq: number;
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
  isFileUpload: boolean;
  isEncrypt: boolean;
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
