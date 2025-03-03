import { CODE_BAD_REQUEST, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER } from "../config/constants";
import { ExtendedPrismaClient } from '../config/database';
import { IRequestBanners, IRequestBannerWrite, IRequestBannerUpdate } from "../types/request";
import { IServiceResponse } from "../types/response";
import { IBannerGroup, IBanner } from "../types/object";
import { validateStringLength } from "../common/validator";

export class BannerService {
  private prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    this.prisma = prisma;
  }

  public async create(data: IRequestBannerWrite): Promise<IServiceResponse> {
    try {
      // code가 없으면 등록 불가
      if (!data.groupId || isNaN(parseInt(data.groupId))) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 그룹이 필요합니다.'
        }
      }

      // linkType이 있으면 link가 필수
      if (data.linkType && !data.linkUrl) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '링크 주소를 입력해주세요.'
        }
      }
      
      // link가 있으면 linkType이 필수
      if (data.linkUrl && !data.linkType) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '링크 타입을 선택해주세요.'
        }
      }

      // linkType이 outer이면 link는 반드시 http:// 또는 https://로 시작
      if (data.linkType === 'outer' && data.linkUrl && !data.linkUrl.match(/^https?:\/\//)) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '외부 링크는 http:// 또는 https://로 시작해야 합니다.'
        }
      }

      // 발행 마감일이 발행일보다 빠르면 등록 불가
      const publishedAt = (data.publishedAt) ? new Date(data.publishedAt) : new Date();
      const unpublishedAt = (data.unpublishedAt) ? new Date(data.unpublishedAt) : null;

      if (unpublishedAt && publishedAt > unpublishedAt) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '발행 마감일은 발행일보다 빠를 수 없습니다.'
        }
      }

      // 발행 마감일이 현재 시간보다 이전이면 등록 불가
      if (unpublishedAt && unpublishedAt < new Date()) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '발행 마감일은 현재 시간보다 이전일 수 없습니다.'
        }
      }

      // title 길이 체크
      const validateTitle = validateStringLength(data.title, 1, 50);
      if (!validateTitle.result) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: validateTitle.message
        }
      }

      // description 길이 체크
      if (data.description) {
        const validateDescription = validateStringLength(data.description, 0, 1000);
        if (!validateDescription.result) {
          return {
            result: false,
            code: CODE_BAD_REQUEST,
            message: validateDescription.message
          }
        }
      }

      // 발행일과 겹치는 배너가 있는지 확인
      const checkPublished = await this.prisma.banner.findMany({
        where: {
          groupId: parseInt(data.groupId),
          isPublished: true,
          // publishedAt이 unpublishedAt보다 작거나 같고 unpublishedAt이 없거나 현재 시간보다 작은 경우
          AND: [
            { publishedAt: { lte: publishedAt } },
            { unpublishedAt: { gte: publishedAt } }
          ]
        }
      });

      // 배너 생성
      await this.prisma.banner.create({
        data: {
          groupId: parseInt(data.groupId),
          title: data.title,
          description: data.description || null,
          imagePath: data.imagePath || null,
          linkType: data.linkType || null,
          linkUrl: data.linkUrl || null,
          sort: data.sort || 0,
          isPublished: data.isPublished || false,
          publishedAt: publishedAt,
          unpublishedAt: unpublishedAt,
          createdBy: data.createdBy
        }
      });

      return { result: true };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: (error instanceof Error) ? error.message : MESSAGE_FAIL_SERVER
      }

    }
  }

  public async read(id: number): Promise<IServiceResponse<IBanner>> {
    try {
      // ID가 없거나 숫자가 아니면 에러 반환
      if (!id && isNaN(id)) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 ID가 필요합니다.'
        }
      }

      // 배너 조회
      const prismaBanner = await this.prisma.banner.findUnique({
        where: { 
          id,
          isDeleted: false
        }
      });

      // 조회 결과가 없으면 에러 반환
      if (!prismaBanner) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 정보를 찾을 수 없습니다.'
        }
      }

      // 조회 결과를 IBanner 타입으로 변환
      const banner: IBanner = {
        id: prismaBanner.id,
        title: prismaBanner.title,
        description: prismaBanner.description || null,
        imagePath: prismaBanner.imagePath || null,
        linkType: prismaBanner.linkType || null,
        linkUrl: prismaBanner.linkUrl || null,
        sort: prismaBanner.sort || 0,
        isPublished: prismaBanner.isPublished,
        publishedAt: prismaBanner.publishedAt?.toISOString() || null,
        unpublishedAt: prismaBanner.unpublishedAt?.toISOString() || null,
        createdBy: prismaBanner.createdBy,
        createdAt: prismaBanner.createdAt.toISOString(),
        updatedBy: prismaBanner.updatedBy || null,
        updatedAt: prismaBanner.updatedAt?.toISOString() || null
      }

      // 메타데이터 생성
      const metadata = {
        id: banner.id
      }

      // 응답 성공
      return { 
        result: true, 
        metadata, 
        data: banner 
      };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: (error instanceof Error) ? error.message : MESSAGE_FAIL_SERVER
      }

    }
  }

  public async update(id: number, data: IRequestBannerUpdate): Promise<IServiceResponse> {
    try {

      return { result: true };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: (error instanceof Error) ? error.message : MESSAGE_FAIL_SERVER
      }

    }
  }

  public async delete(id: number): Promise<IServiceResponse> {
    try {
      // ID가 없거나 숫자가 아니면 에러 반환
      if (!id && isNaN(id)) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 ID가 필요합니다.'
        }
      }

      // 배너 삭제
      await this.prisma.banner.update({
        where: { id },
        data: {
          isDeleted: true
        }
      });

      return { result: true };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: (error instanceof Error) ? error.message : MESSAGE_FAIL_SERVER
      }

    }
  } 

  // 배너 목록 조회
  
  public async list(data: IRequestBanners): Promise<IServiceResponse<IBanner[] | []>> {
    try {
      // 페이지 번호가 없거나 1보다 작은 경우 1로 설정
      if (!data.page || data.page < 1) {
        data.page = 1;
      }

      // 페이지 크기가 작거나 너무 크면 10으로 설정
      if (!data.pageSize || data.pageSize < 1 || data.pageSize > 100) {
        data.pageSize = 10;
      }

      // 배너 코드가 없으면 에러 반환
      if (!data.groupId) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 코드가 필요합니다.'
        }
      }

      // 배너 그룹 정보 조회
      const groupInfo = await this.groupInfo(data.groupId);
      if (!groupInfo.result || !groupInfo.data) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 그룹 정보를 찾을 수 없습니다.'
        }
      }

      // 전체 배너 수 조회
      const totalBanners = await this.prisma.banner.count({
        where: {
          groupId: data.groupId,
          isDeleted: false
        }
      });

      // 배너 목록 조회
      const prismaBanners = await this.prisma.banner.findMany({
        where: {
          groupId: data.groupId, 
          isDeleted: false
        },
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
        orderBy: {
          id: 'desc'
        }
      });

      // 조회 결과를 IBanner 타입으로 변환
      const banners: IBanner[] = prismaBanners.map((banner) => {
        return {
          id: banner.id,
          title: banner.title,
          description: banner.description || null,
          imagePath: banner.imagePath || null,
          linkType: banner.linkType || null,
          linkUrl: banner.linkUrl || null,
          sort: banner.sort || 0,
          isPublished: banner.isPublished,
          publishedAt: banner.publishedAt?.toISOString() || null,
          unpublishedAt: banner.unpublishedAt?.toISOString() || null,
          createdBy: banner.createdBy,
          createdAt: banner.createdAt.toISOString(),
          updatedBy: banner.updatedBy || null,
          updatedAt: banner.updatedAt?.toISOString() || null
        }
      });
      
      // 메타데이터 생성
      const metadata = {
        groupInfo: groupInfo.data,
        total: banners.length,
        page: data.page,
        pageSize: data.pageSize,
        start: (data.page - 1) * data.pageSize + 1,
        end: (data.page - 1) * data.pageSize + banners.length,
        count: banners.length,
        totalPage: Math.ceil(totalBanners / data.pageSize)
      }

      // 응답 성공
      return {
        result: true,
        metadata,
        data: banners
      };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: (error instanceof Error) ? error.message : MESSAGE_FAIL_SERVER
      }

    }
  }

  public async groupInfo(groupId: number): Promise<IServiceResponse<IBannerGroup>> {
    try {
      // ID가 없거나 숫자가 아니면 에러 반환
      if (!groupId && isNaN(groupId)) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 그룹 ID가 필요합니다.'
        }
      }

      // 배너 그룹 조회
      const prismaGroup = await this.prisma.bannerGroup.findUnique({
        where: { 
          id: groupId,
          isDeleted: false
        }
      });

      // 조회 결과가 없으면 에러 반환
      if (!prismaGroup) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 그룹 정보를 찾을 수 없습니다.'
        }
      }

      // 조회 결과를 IBannerGroup 타입으로 변환
      const group: IBannerGroup = {
        id: prismaGroup.id,
        kind: prismaGroup.kind,
        title: prismaGroup.title,
        description: prismaGroup.description || null,
        imageWidth: prismaGroup.imageWidth || 0,
        imageHeight: prismaGroup.imageHeight || 0,
        createdAt: prismaGroup.createdAt.toISOString(),
        updatedAt: prismaGroup.updatedAt?.toISOString() || null
      }

      // 메타데이터 생성
      const metadata = {
        id: group.id
      }

      // 응답 성공
      return { 
        result: true, 
        metadata, 
        data: group 
      };

    } catch (error) {
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: (error instanceof Error) ? error.message : MESSAGE_FAIL_SERVER
      }

    }
  }
}