import { AppError, NotFoundError, ValidationError } from '../../common/error';
import { convertDateToKST, convertDateToString } from '../../common/utils/format';
import { validateStringLength } from '../../common/utils/validate';
import { ExtendedPrismaClient } from '../../library/database';
import { encryptDataAES } from '../../library/encrypt';
import { IServiceResponse } from '../../types/config';
import { IContent, IContentGroup } from '../../types/object';
import {
  IRequestContentGroupUpdate,
  IRequestContentUpdate,
  IRequestContentWrite,
  IRequestSearchList,
} from '../../types/request';
import { IContentService } from '../../types/service';
import { BaseService } from './service';

export class ContentService extends BaseService implements IContentService {
  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
  }

  public async create(groupId: number, data: IRequestContentWrite): Promise<IServiceResponse> {
    try {
      // 제목 길이 검증
      const validateTitle = validateStringLength(data.title, 1, 50);
      if (!validateTitle.result) {
        throw new ValidationError(validateTitle.message);
      }

      // 내용 길이 검증
      const validateContent = validateStringLength(data.content, 1, 1000);
      if (!validateContent.result) {
        throw new ValidationError(validateContent.message);
      }

      // 컨텐츠 그룹 정보 조회
      const groupInfo = await this.groupInfo(groupId);
      if (!groupInfo.result) {
        throw new AppError(groupInfo.code, groupInfo.message);
      }

      // 컨텐츠 생성
      await this.prisma.content.create({
        data: {
          groupId,
          title: data.title.trim(),
          content: groupInfo.data?.isEncrypt ? await encryptDataAES(data.content) : data.content?.trim(),
          ip: data.ip || '',
          userAgent: data.userAgent || '',
        },
      });

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async read(contentId: number): Promise<IServiceResponse<IContent>> {
    try {
      // 컨텐츠 정보 조회
      const prismaContent = await this.prisma.content.findUnique({
        where: {
          id: contentId,
          isDeleted: false,
          isActivated: true,
        },
      });

      // 컨텐츠가 없는 경우
      if (!prismaContent) {
        throw new NotFoundError('컨텐츠가 존재하지 않습니다.');
      }

      // 컨텐츠 그룹 정보 조회
      const groupInfo = await this.prisma.contentGroup.findUnique({
        where: {
          id: prismaContent.groupId,
          isDeleted: false,
          isActivated: true,
        },
      });

      // 컨텐츠 그룹이 없는 경우
      if (!groupInfo) {
        throw new NotFoundError('컨텐츠 그룹이 존재하지 않습니다.');
      }

      // 컨텐츠 생성
      const createdAt = convertDateToString(convertDateToKST(prismaContent.createdAt));
      const updatedAt = prismaContent.updatedAt ? convertDateToString(convertDateToKST(prismaContent.updatedAt)) : null;
      const content: IContent = {
        id: prismaContent.id,
        groupId: prismaContent.groupId,
        title: prismaContent.title.trim(),
        content: prismaContent.content?.trim() || null,
        writerId: prismaContent.writerId || null,
        writerName: prismaContent.writerName || null,
        writerEmail: prismaContent.writerEmail || null,
        writerPhone: prismaContent.writerPhone || null,
        viewCount: prismaContent.viewCount || 0,
        likeCount: prismaContent.likeCount || 0,
        commentCount: prismaContent.commentCount || 0,
        isAnonymous: prismaContent.isAnonymous,
        isNotice: prismaContent.isNotice || false,
        isActivated: prismaContent.isActivated,
        ip: prismaContent.ip || null,
        userAgent: prismaContent.userAgent || null,
        createdAt,
        updatedAt,
      };

      // 응답 성공
      return {
        result: true,
        metadata: {
          group: {
            id: groupInfo.id,
            kind: groupInfo.kind,
            title: groupInfo.title,
            description: groupInfo.description ?? null,
            banners: {
              top: groupInfo.bannerTopUrl ?? null,
            },
          },
        },
        data: content,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async update(contentId: number, data: IRequestContentUpdate): Promise<IServiceResponse> {
    try {
      // 업데이트 데이터 생성
      const updateData: Partial<IRequestContentUpdate> = {};

      // 업데이트할 필드만 추가
      if (data.title !== undefined) {
        const validateTitle = validateStringLength(data.title, 1, 50);
        if (!validateTitle.result) {
          throw new ValidationError(validateTitle.message);
        }
        updateData.title = data.title;
      }

      // 내용 길이 검증
      if (data.content !== undefined) {
        const validateContent = validateStringLength(data.content, 1, 1000);
        if (!validateContent.result) {
          throw new ValidationError(validateContent.message);
        }
        updateData.content = data.content;
      }

      // 익명 여부 검증
      if (data.isAnonymous !== undefined) updateData.isAnonymous = data.isAnonymous;

      // 활성화 여부 검증
      if (data.isActivated !== undefined) updateData.isActivated = data.isActivated;

      // 컨텐츠 업데이트
      await this.prisma.content.update({
        where: { id: contentId },
        data: { ...updateData, updatedAt: new Date() },
      });

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 컨텐츠 삭제
  public async delete(contentId: number): Promise<IServiceResponse> {
    try {
      // 컨텐츠 조회
      const prismaContent = await this.prisma.content.findUnique({
        where: {
          id: contentId,
          isDeleted: false,
        },
      });

      // 컨텐츠가 없는 경우
      if (!prismaContent) {
        throw new NotFoundError('컨텐츠가 존재하지 않습니다.');
      }

      // 컨텐츠 삭제
      await this.prisma.content.update({
        where: { id: contentId },
        data: { isDeleted: true, updatedAt: new Date() },
      });

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 컨텐츠 목록 조회
  public async list(groupId: number, data: IRequestSearchList): Promise<IServiceResponse<IContent[] | []>> {
    try {
      // 기본값 설정
      const page = Math.max(1, data.page || 1);
      const pageSize = Math.min(100, Math.max(1, data.pageSize || 10));
      const sort = data.sort || 'ID_ASC';

      // 정렬 조건 설정
      const orderBy = {
        ID_DESC: { id: 'desc' as const },
        ID_ASC: { id: 'asc' as const },
        TITLE_DESC: { title: 'desc' as const },
        TITLE_ASC: { title: 'asc' as const },
      }[sort] || { id: 'asc' as const };

      // 컨텐츠 그룹 정보 조회
      const groupInfo = await this.prisma.contentGroup.findUnique({
        where: {
          id: groupId,
          isDeleted: false,
          isActivated: true,
        },
      });

      // 컨텐츠 그룹이 없는 경우
      if (!groupInfo) {
        throw new NotFoundError('컨텐츠 그룹이 존재하지 않습니다.');
      }

      // 검색 조건 설정
      const where = {
        groupId,
        isDeleted: false,
        isActivated: true,
        ...(data.query ? { title: { contains: data.query } } : {}),
      };

      // 전체 컨텐츠 수 조회
      const [totalContents, prismaContents] = await Promise.all([
        this.prisma.content.count({ where }),
        this.prisma.content.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
      ]);

      // 컨텐츠 목록 생성
      const contents: IContent[] = prismaContents.map((content) => {
        const createdAt = convertDateToString(convertDateToKST(content.createdAt));
        const updatedAt = content.updatedAt ? convertDateToString(convertDateToKST(content.updatedAt)) : null;
        return {
          id: content.id,
          groupId: content.groupId,
          title: content.title,
          content: content.content ?? null,
          writerId: content.writerId ?? null,
          writerName: content.writerName ?? null,
          writerEmail: content.writerEmail ?? null,
          writerPhone: content.writerPhone ?? null,
          viewCount: content.viewCount ?? 0,
          likeCount: content.likeCount ?? 0,
          commentCount: content.commentCount ?? 0,
          isAnonymous: content.isAnonymous,
          isNotice: content.isNotice ?? false,
          isActivated: content.isActivated,
          ip: content.ip ?? null,
          userAgent: content.userAgent ?? null,
          createdAt,
          updatedAt,
        };
      });

      // 응답 성공
      return {
        result: true,
        metadata: {
          group: {
            id: groupInfo.id,
            kind: groupInfo.kind,
            title: groupInfo.title,
            description: groupInfo.description ?? null,
            banners: {
              top: groupInfo.bannerTopUrl ?? null,
            },
          },
          total: totalContents,
          page,
          pageSize,
          start: (page - 1) * pageSize + 1,
          end: (page - 1) * pageSize + contents.length,
          count: contents.length,
          totalPage: Math.ceil(totalContents / pageSize),
        },
        data: contents,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async groupInfo(groupId: number): Promise<IServiceResponse<IContentGroup>> {
    try {
      // 컨텐츠 그룹 조회
      const prismaResult = await this.prisma.contentGroup.findUnique({
        where: {
          id: groupId,
          isDeleted: false,
          isActivated: true,
        },
      });

      // 컨텐츠 그룹이 없는 경우
      if (!prismaResult) {
        throw new NotFoundError('컨텐츠 그룹이 존재하지 않습니다.');
      }

      // 컨텐츠 그룹 정보 생성
      const groupInfo: IContentGroup = {
        id: prismaResult.id,
        kind: prismaResult.kind,
        title: prismaResult.title,
        description: prismaResult.description ?? null,
        sizePerPage: prismaResult.sizePerPage,
        isUserWrite: prismaResult.isUserWrite,
        isUserRead: prismaResult.isUserRead,
        isUserDisplay: prismaResult.isUserDisplay,
        isNonUserWrite: prismaResult.isNonUserWrite,
        isNonUserRead: prismaResult.isNonUserRead,
        isNonUserDisplay: prismaResult.isNonUserDisplay,
        isAnonymous: prismaResult.isAnonymous,
        isLike: prismaResult.isLike,
        isShare: prismaResult.isShare,
        isComment: prismaResult.isComment,
        isFileUpload: prismaResult.isFileUpload,
        isEncrypt: prismaResult.isEncrypt,
        isActivated: prismaResult.isActivated,
      };

      // 응답 성공
      return { result: true, metadata: { group: { id: groupId } }, data: groupInfo };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 컨텐츠 그룹 수정
  public async updateGroup(groupId: number, data: IRequestContentGroupUpdate): Promise<IServiceResponse> {
    try {
      // 컨텐츠 그룹 조회
      const prismaResult = await this.prisma.contentGroup.findUnique({
        where: {
          id: groupId,
          isDeleted: false,
          isActivated: true,
        },
      });

      // 컨텐츠 그룹이 없는 경우
      if (!prismaResult) {
        throw new NotFoundError('컨텐츠 그룹이 존재하지 않습니다.');
      }

      // 컨텐츠 그룹 수정
      await this.prisma.contentGroup.update({
        where: { id: groupId },
        data: { ...data, updatedAt: new Date() },
      });

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
