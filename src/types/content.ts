import { create } from "domain"
import { IServiceResponse } from "./response";

type typeOptionalString = string | null | undefined;

export interface IContentGroup {
  id: number,
  kind: string,
  title: string,
  description?: typeOptionalString,
  bannerTopUrl?: typeOptionalString,
  sizePerPage: number,
  isUserWrite: boolean,
  isUserRead: boolean,
  isUserDisplay: boolean,
  isNonUserWrite: boolean,
  isNonUserRead: boolean,
  isNonUserDisplay: boolean,
  isAnonymous: boolean,
  isLike: boolean,
  isShare: boolean,
  isComment: boolean,
  isActivated: boolean,
}

export interface IContent {
  id: number,
  groupId: number,
  title: string,
  content?: typeOptionalString,
  writerId?: typeOptionalString,
  writerName?: typeOptionalString,
  writerEmail?: typeOptionalString,
  writerPhone?: typeOptionalString,
  isActivated?: boolean,
  isAnonymous?: boolean,
  ip?: string,
  userAgent?: typeOptionalString,
}

export interface IContentUpdate {
  groupId: number,
  title: string,
  content?: typeOptionalString,
  writerId?: typeOptionalString,
  writerName?: typeOptionalString,
  writerEmail?: typeOptionalString,
  writerPhone?: typeOptionalString,
  isActivated?: boolean,
  isAnonymous?: boolean,
}

export interface IContentService {
  create(data: IContent): void;
  read(contentId: number): Promise<IServiceResponse<IContent>>;
  modify(data: IContentUpdate): void;
  delete(contentId: number): void;
  list(groupId: number, page: number): Promise<IServiceResponse<IContent[]>>;
  groupInfo(groupId: number): Promise<IServiceResponse<IContentGroup>>;
}