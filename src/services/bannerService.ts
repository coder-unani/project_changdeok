import { CODE_BAD_REQUEST, CODE_FAIL_SERVER, MESSAGE_FAIL_SERVER } from "../config/constants";
import { ExtendedPrismaClient } from '../config/database';
import { IRequestBannerCreate, IRequestBannerUpdate } from "../types/request";
import { IServiceResponse } from "../types/response";
import { IBanner } from "../types/object";
import { validateStringLength } from "../utils/validator";

export class BannerService {
  private prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    this.prisma = prisma;
  }

  public async create(data: IRequestBannerCreate): Promise<IServiceResponse> {
    try {
      // title 길이 체크
      const validateTitle = validateStringLength(data.title, 1, 50);
      if (!validateTitle.result) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: validateTitle.message
        }
      }

      if (data.description) {
        // description 길이 체크
        const validateDescription = validateStringLength(data.description, 0, 1000);
        if (!validateDescription.result) {
          return {
            result: false,
            code: CODE_BAD_REQUEST,
            message: validateDescription.message
          }
        }
      }

      // imagePath가 있으면 이미지 업로드
      if (data.imagePath) {
        // 이미지 업로드
      }

      // 배너 생성


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
  public async list(bannerCode: string): Promise<IServiceResponse<IBanner[] | []>> {
    try {
      // 배너 코드가 없으면 에러 반환
      if (!bannerCode) {
        return {
          result: false,
          code: CODE_BAD_REQUEST,
          message: '배너 코드가 필요합니다.'
        }
      }

      // 배너 목록 조회
      const prismaBanners = await this.prisma.banner.findMany({
        where: {
          code: bannerCode, 
          isDeleted: false
        },
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
        bannerCode: bannerCode,
        total: banners.length
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
}