import { httpStatus } from '../../common/constants';
import { AppError, NotFoundError, ValidationError } from '../../common/error';
import { convertDateToKST, convertDateToString } from '../../common/utils/format';
import { validateStringLength } from '../../common/utils/validate';
import { asyncConfig } from '../../config/config';
import { backendRoutes } from '../../config/routes';
import { ExtendedPrismaClient } from '../../library/database';
import { encryptDataAES } from '../../library/encrypt';
import { MailService } from '../../services';
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

// 캐시 TTL (5분)
const CACHE_TTL = 5 * 60 * 1000;

export class ContentService extends BaseService implements IContentService {
  private contentCache: Map<string, { data: any; timestamp: number }> = new Map();
  private groupCache: Map<number, { data: IContentGroup; timestamp: number }> = new Map();

  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
  }

  // 컨텐츠 데이터 검증
  private validateContentData(title: string, content: string): void {
    const validateTitle = validateStringLength(title, 1, 50);
    if (!validateTitle.result) {
      throw new ValidationError(validateTitle.message);
    }

    const validateContent = validateStringLength(content, 1, 1000);
    if (!validateContent.result) {
      throw new ValidationError(validateContent.message);
    }
  }

  // 캐시에서 데이터 가져오기
  private getCachedData<T>(key: string, cache: Map<string, { data: T; timestamp: number }>): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  // 캐시에 데이터 설정
  private setCachedData<T>(key: string, data: T, cache: Map<string, { data: T; timestamp: number }>): void {
    cache.set(key, { data, timestamp: Date.now() });
  }

  // Prisma 컨텐츠를 IContent로 변환
  private convertToContent(prismaContent: any, groupInfo?: any): IContent {
    const createdAt = convertDateToString(convertDateToKST(prismaContent.createdAt));
    const updatedAt = prismaContent.updatedAt ? convertDateToString(convertDateToKST(prismaContent.updatedAt)) : null;

    return {
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
  }

  // 컨텐츠 생성
  public async create(groupId: number, data: IRequestContentWrite): Promise<IServiceResponse> {
    try {
      // 컨텐츠 데이터 검증
      this.validateContentData(data.title, data.content);

      // 컨텐츠 그룹 정보 조회
      const { result, message, data: contentGroup } = await this.groupInfo(groupId);
      if (!result || !contentGroup) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, message);
      }

      // 컨텐츠 생성
      const content = await this.prisma.content.create({
        data: {
          groupId,
          title: data.title.trim(),
          content: contentGroup.isEncrypt ? await encryptDataAES(data.content) : data.content?.trim(),
          ip: data.ip || '',
          userAgent: data.userAgent || '',
        },
      });

      // 등록 알림 이메일 전송
      if (contentGroup.registNotice === 'EMAIL') {
        await this.sendRegistrationEmail(content, contentGroup);
      }

      // 캐시 삭제
      this.contentCache.clear();
      this.groupCache.delete(groupId);

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 등록 알림 이메일 전송
  private async sendRegistrationEmail(content: any, contentGroup: IContentGroup): Promise<void> {
    // 설정 조회
    const config = await asyncConfig();

    // 이메일 서비스 생성
    const mailService = new MailService(config);

    // 회사 정보 조회
    const companyInfo = JSON.parse(config.getSettings().companyJson || '{}');

    // 이메일 제목 생성
    const subject = `${contentGroup.title} 게시글 등록 알림`;

    // 컨텐츠 상세 주소 생성
    const contentUrl = `https://${config.getSettings().serviceDomain}${backendRoutes.contents.detail.url
      .replace(':groupId', content.groupId.toString())
      .replace(':contentId', content.id.toString())}`;

    // 등록 일시 생성
    const registAt = convertDateToString(convertDateToKST(content.createdAt));

    // 이메일 템플릿 생성
    const { text, html } = mailService.templateContentRegist(
      subject,
      contentGroup.title,
      content.title,
      registAt,
      contentUrl,
      companyInfo?.name || '',
      companyInfo?.address || ''
    );

    // 이메일 전송
    try {
      // 이메일 전송
      await mailService.send({ subject, text, html, to: 'orbitcode.dev@gmail.com' });

      // 이메일 전송 이력 생성
      await this.prisma.mailHistory.create({
        data: {
          subject,
          text,
          html,
          to: 'orbitcode.dev@gmail.com',
          from: 'dev@orbitcode.kr',
          contentId: content.id,
          isSent: true,
          sendAt: new Date(),
          message: '성공',
        },
      });
    } catch (error) {
      // 이메일 전송 이력 생성
      const message = error instanceof Error ? error.message : '에러 발생';

      // 이메일 전송 이력 생성
      await this.prisma.mailHistory.create({
        data: {
          subject,
          text,
          html,
          to: 'orbitcode.dev@gmail.com',
          from: 'dev@orbitcode.kr',
          contentId: content.id,
          isSent: false,
          sendAt: new Date(),
          message,
        },
      });
    }
  }

  // 컨텐츠 조회
  public async read(contentId: number): Promise<IServiceResponse<IContent>> {
    try {
      // 캐시 키 생성
      const cacheKey = `content_${contentId}`;

      // 캐시에서 데이터 가져오기
      const cachedContent = this.getCachedData(cacheKey, this.contentCache);

      // 캐시에 데이터가 있으면 캐시에서 데이터 반환
      if (cachedContent) {
        return { result: true, data: cachedContent };
      }

      // 컨텐츠 조회
      const prismaContent = await this.prisma.content.findUnique({
        where: {
          id: contentId,
          isDeleted: false,
          isActivated: true,
        },
      });

      // 컨텐츠가 존재하지 않으면 오류 발생
      if (!prismaContent) {
        throw new NotFoundError('컨텐츠가 존재하지 않습니다.');
      }

      // 컨텐츠 그룹 조회
      const prismaContentGroup = await this.prisma.contentGroup.findUnique({
        where: {
          id: prismaContent.groupId,
          isDeleted: false,
          isActivated: true,
        },
      });

      // 컨텐츠 그룹이 존재하지 않으면 오류 발생
      if (!prismaContentGroup) {
        throw new NotFoundError('컨텐츠 그룹이 존재하지 않습니다.');
      }

      // 컨텐츠 데이터 변환
      const content = this.convertToContent(prismaContent);

      // 캐시 설정
      this.setCachedData(cacheKey, content, this.contentCache);

      // 응답 성공
      return {
        result: true,
        metadata: {
          group: {
            id: prismaContentGroup.id,
            kind: prismaContentGroup.kind,
            title: prismaContentGroup.title,
            description: prismaContentGroup.description ?? null,
            banners: {
              top: prismaContentGroup.bannerTopUrl ?? null,
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
      // 컨텐츠 데이터 업데이트
      const updateData: Partial<IRequestContentUpdate> = {};

      // 제목 검증
      if (data.title !== undefined) {
        const validateTitle = validateStringLength(data.title, 1, 50);
        if (!validateTitle.result) {
          throw new ValidationError(validateTitle.message);
        }
        updateData.title = data.title;
      }

      // 내용 검증
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

      // 캐시 삭제
      this.contentCache.delete(`content_${contentId}`);

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

      // 컨텐츠가 존재하지 않으면 오류 발생
      if (!prismaContent) {
        throw new NotFoundError('컨텐츠가 존재하지 않습니다.');
      }

      // 컨텐츠 삭제
      await this.prisma.content.update({
        where: { id: contentId },
        data: { isDeleted: true, updatedAt: new Date() },
      });

      // 캐시 삭제
      this.contentCache.delete(`content_${contentId}`);

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 컨텐츠 목록 조회
  public async list(groupId: number, data: IRequestSearchList): Promise<IServiceResponse<IContent[] | []>> {
    try {
      // 페이지 번호 검증
      const page = Math.max(1, data.page || 1);

      // 페이지 크기 검증
      const pageSize = Math.min(100, Math.max(1, data.pageSize || 10));

      // 정렬 검증
      const sort = data.sort || 'ID_ASC';

      // 정렬 조건 설정
      const orderBy = {
        ID_DESC: { id: 'desc' as const },
        ID_ASC: { id: 'asc' as const },
        TITLE_DESC: { title: 'desc' as const },
        TITLE_ASC: { title: 'asc' as const },
      }[sort] || { id: 'asc' as const };

      // 조회 조건 설정
      const where = {
        groupId,
        isDeleted: false,
        isActivated: true,
        ...(data.query ? { title: { contains: data.query } } : {}),
      };

      // 컨텐츠 조회
      const [totalContents, prismaContents, groupInfo] = await Promise.all([
        this.prisma.content.count({ where }),
        this.prisma.content.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
        this.prisma.contentGroup.findUnique({
          where: {
            id: groupId,
            isDeleted: false,
            isActivated: true,
          },
        }),
      ]);

      // 컨텐츠 그룹이 존재하지 않으면 오류 발생
      if (!groupInfo) {
        throw new NotFoundError('컨텐츠 그룹이 존재하지 않습니다.');
      }

      // 컨텐츠 데이터 변환
      const contents = prismaContents.map((content) => this.convertToContent(content));

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

  // 컨텐츠 그룹 정보 조회
  public async groupInfo(groupId: number): Promise<IServiceResponse<IContentGroup>> {
    try {
      // 캐시에서 데이터 가져오기
      const cachedGroup = this.groupCache.get(groupId);

      // 캐시에 데이터가 있으면 캐시에서 데이터 반환
      if (cachedGroup && Date.now() - cachedGroup.timestamp < CACHE_TTL) {
        return { result: true, metadata: { group: { id: groupId } }, data: cachedGroup.data };
      }

      // 컨텐츠 그룹 조회
      const prismaResult = await this.prisma.contentGroup.findUnique({
        where: {
          id: groupId,
          isDeleted: false,
          isActivated: true,
        },
      });

      // 컨텐츠 그룹이 존재하지 않으면 오류 발생
      if (!prismaResult) {
        throw new NotFoundError('컨텐츠 그룹이 존재하지 않습니다.');
      }

      // 컨텐츠 그룹 데이터 변환
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
        registNotice: prismaResult.registNotice,
        isActivated: prismaResult.isActivated,
      };

      // 캐시 설정
      this.groupCache.set(groupId, { data: groupInfo, timestamp: Date.now() });

      // 응답 성공
      return { result: true, metadata: { group: { id: groupId } }, data: groupInfo };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 컨텐츠 그룹 정보 업데이트
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

      // 컨텐츠 그룹이 존재하지 않으면 오류 발생
      if (!prismaResult) {
        throw new NotFoundError('컨텐츠 그룹이 존재하지 않습니다.');
      }

      // 컨텐츠 그룹 업데이트 데이터 설정
      const updateData: Partial<IRequestContentGroupUpdate> = {};
      if (data.description !== undefined) updateData.description = data.description;
      if (data.sizePerPage !== undefined) updateData.sizePerPage = data.sizePerPage;
      if (data.registNotice !== undefined) updateData.registNotice = data.registNotice;

      // 컨텐츠 그룹 업데이트
      await this.prisma.contentGroup.update({
        where: { id: groupId },
        data: { ...updateData, updatedAt: new Date() },
      });

      // 캐시 삭제
      this.groupCache.delete(groupId);

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
