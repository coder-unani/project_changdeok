import { PrismaClient } from '@prisma/client';

import { CODE_BAD_REQUEST, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER } from "../config/constants";
import { IContentGroup, IContent } from "../types/object";
import { IContentService } from '../types/service';
import { IRequestContents, IRequestContentWrite, IRequestContentUpdate } from "../types/request";
import { IServiceResponse } from "../types/response";
import { validateStringLength } from "../utils/validator";

export class ContentService implements IContentService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(groupId: number, data: IRequestContentWrite): Promise<IServiceResponse> {

    try {
      // 제목 길이 검증
      const validateTitle = validateStringLength(data.title, 1, 50);
      if (!validateTitle.result) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: validateTitle.message
        }
      }

      // 내용 길이 검증
      const validateContent = validateStringLength(data.content, 1, 1000);
      if (!validateContent.result) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: validateContent.message
        }
      }

      const content = await this.prisma.content.create({
        data: {
          groupId: groupId,
          title: data.title,
          content: data.content,
          ip: data.ip || '',
          userAgent: data.userAgent || '',
        }
      });

      return { result: true };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: MESSAGE_FAIL_SERVER
      }
    }
  }

  async read(contentId: number): Promise<IServiceResponse<IContent>> {
    try {
      const prismaContent = await this.prisma.content.findUnique({
        where: {
          id: contentId,
          isDeleted: false
        }
      });

      if (!prismaContent) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '컨텐츠가 존재하지 않습니다.'
        }
      }

      if (!prismaContent.isActivated) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '비활성화된 컨텐츠입니다.'
        }
      }

      const groupInfo = await this.prisma.contentGroup.findUnique({
        where: {
          id: prismaContent.groupId,
          isDeleted: false,
          isActivated: true,
        }
      });

      if (!groupInfo) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '컨텐츠 그룹이 존재하지 않습니다.'
        }
      }

      const content: IContent = {
        id: prismaContent.id,
        groupId: prismaContent.groupId,
        title: prismaContent.title,
        content: prismaContent.content ?? null,
        writerId: prismaContent.writerId ?? null,
        writerName: prismaContent.writerName ?? null,
        writerEmail: prismaContent.writerEmail ?? null,
        writerPhone: prismaContent.writerPhone ?? null,
        isActivated: prismaContent.isActivated,
        isAnonymous: prismaContent.isAnonymous,
        ip: prismaContent.ip ?? null,
        userAgent: prismaContent.userAgent ?? null,
      }

      return {
        result: true,
        metadata: {
          groupId: groupInfo.id,
          kind: groupInfo.kind,
          title: groupInfo.title,
          description: groupInfo.description ?? null,
          bannerTopUrl: groupInfo.bannerTopUrl ?? null,
        },
        data: content
      }

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: (error instanceof Error) ? error.message : MESSAGE_FAIL_SERVER
      }

    }
  }

  async update(contentId: number, data: IRequestContentUpdate): Promise<IServiceResponse> {
    try {
      const updateData: Partial<IRequestContentUpdate> = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.isAnonymous !== undefined) updateData.isAnonymous = data.isAnonymous;
      if (data.isActivated !== undefined) updateData.isActivated = data.isActivated;

      // 제목 길이 검증
      if (updateData.title) {
        const validateTitle = validateStringLength(updateData.title, 1, 50);
        if (!validateTitle.result) {
          return {
            result: false,
            code: CODE_BAD_REQUEST,
            message: validateTitle.message
          }
        }
      }

      // 내용 길이 검증
      if (updateData.content) {
        const validateContent = validateStringLength(updateData.content, 1, 1000);
        if (!validateContent.result) {
          return {
            result: false,
            code: CODE_BAD_REQUEST,
            message: validateContent.message
          }
        }
      }

      // 컨텐츠 업데이트
      await this.prisma.content.update({
        where: {
          id: contentId
        },
        data: updateData
      });

      // 성공
      return { result: true };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: (error instanceof Error) ? error.message : MESSAGE_FAIL_SERVER
      }

    }
  }

  async delete(contentId: number): Promise<void> {
    console.log('delete content');
  }

  async list(groupId: number, data: IRequestContents): Promise<IServiceResponse<IContent[] | []>> {
    
    try {
      // 페이지 번호가 없거나 1보다 작은 경우 1로 설정
      if (!data.page || data.page < 1) {
        data.page = 1;
      }

      // 페이지 크기가 작거나 너무 크면 10으로 설정
      if (!data.pageSize || data.pageSize < 1 || data.pageSize > 100) {
        data.pageSize = 10;
      }

      // 정렬이 없는 경우 id로 설정
      if (!data.sort) {
        data.sort = 'ID_ASC';
      }

      let orderBy = {};
      if (data.sort === 'ID_DESC') {
        orderBy = {
          id: 'desc'
        }
      } else if (data.sort === 'ID_ASC') {
        orderBy = {
          id: 'asc'
        }
      } else if (data.sort === 'TITLE_DESC') {
        orderBy = {
          title: 'desc'
        }
      } else if (data.sort === 'TITLE_ASC') {
        orderBy = {
          title: 'asc'
        }
      }

      // 컨텐츠 그룹 정보 조회
      const groupInfo = await this.prisma.contentGroup.findUnique({
        where: {
          id: groupId,
          isDeleted: false,
          isActivated: true,
        }
      });

      // 컨텐츠 그룹이 없는 경우
      if (!groupInfo) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '컨텐츠 그룹이 존재하지 않습니다.'
        }
      }

      // 전체 컨텐츠 수 조회
      const totalContents = await this.prisma.content.count({
        where: {
          groupId,
          title: data.query ? { contains: data.query } : {},
          isDeleted: false,
          isActivated: true,
        }
      });

      // 컨텐츠 목록 조회
      const contentInquery = await this.prisma.content.findMany({
        where: {
          groupId,
          title: data.query ? { contains: data.query } : {},
          isDeleted: false,
          isActivated: true,
        },
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
        orderBy: orderBy
      });

      const contents: IContent[] = contentInquery.map((content) => {
        return {
          id: content.id,
          groupId: content.groupId,
          title: content.title,
          content: content.content ?? null,
          writerId: content.writerId ?? null,
          writerName: content.writerName ?? null,
          writerEmail: content.writerEmail ?? null,
          writerPhone: content.writerPhone ?? null,
          isActivated: content.isActivated,
          isAnonymous: content.isAnonymous,
          ip: content.ip ?? null,
          userAgent: content.userAgent ?? null,
        }
      });

      // 메타데이터 생성
      const metadata = {
        groupId: groupInfo.id,
        kind: groupInfo.kind,
        title: groupInfo.title,
        description: groupInfo.description ?? null,
        bannerTopUrl: groupInfo.bannerTopUrl ?? null,
        total: totalContents,
        page: data.page,
        pageSize: data.pageSize,
        start: (data.page - 1) * data.pageSize + 1,
        end: (data.page - 1) * data.pageSize + contents.length,
        count: contents.length,
        totalPage: Math.ceil(totalContents / data.pageSize)
      };

      return { result: true, metadata, data: contents };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: MESSAGE_FAIL_SERVER
      }

    }

    return {
      result: true,
      data: []
    }
  }

  async groupInfo(groupId: number): Promise<IServiceResponse<IContentGroup>> {
    console.log('groupInfo content');

    return {
      result: true,
    }
  }
}