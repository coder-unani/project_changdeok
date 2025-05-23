import { IBannerService } from 'types/service';

import { NotFoundError, ValidationError } from '../../common/error';
import { deleteFile } from '../../common/utils/file';
import {
  convertDateToKST,
  convertDateToString,
  convertDateToUTC,
  convertStringToDate,
} from '../../common/utils/format';
import { validateStringLength } from '../../common/utils/validate';
import { ExtendedPrismaClient } from '../../library/database';
import { IServiceResponse } from '../../types/config';
import { IBanner, IBannerGroup } from '../../types/object';
import { IRequestBannerUpdate, IRequestBannerWrite, IRequestBanners } from '../../types/request';
import { BaseService } from './service';

export class BannerService extends BaseService implements IBannerService {
  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
  }

  public async create(data: IRequestBannerWrite): Promise<IServiceResponse> {
    try {
      // 배너 그룹 ID
      if (!data.groupId) {
        throw new ValidationError('배너 그룹 ID가 필요합니다.');
      }

      // 배너 스퀀스
      if (!data.seq) {
        throw new ValidationError('배너 시퀀스가 필요합니다.');
      }

      // linkType이 있으면 link가 필수
      if (data.linkType && !data.linkUrl) {
        throw new ValidationError('링크 주소를 입력해주세요.');
      }

      // link가 있으면 linkType이 필수
      if (data.linkUrl && !data.linkType) {
        throw new ValidationError('링크 타입을 선택해주세요.');
      }

      // linkType이 outer이면 link는 반드시 http:// 또는 https://로 시작
      if (data.linkType === 'outer' && data.linkUrl && !data.linkUrl.match(/^https?:\/\//)) {
        throw new ValidationError('외부 링크는 http:// 또는 https://로 시작해야 합니다.');
      }

      // 발행 마감일이 발행일보다 빠르면 등록 불가
      const publishedAt = convertStringToDate(data.publishedAt);
      const unpublishedAt = convertStringToDate(data.unpublishedAt);

      if (unpublishedAt && publishedAt > unpublishedAt) {
        throw new ValidationError('발행 마감일은 발행일보다 빠를 수 없습니다.');
      }

      // 발행 마감일이 현재 시간보다 이전이면 등록 불가
      const currentDate = convertDateToKST(new Date());
      if (unpublishedAt && unpublishedAt < currentDate) {
        throw new ValidationError('발행 마감일은 현재 시간보다 이전일 수 없습니다.');
      }

      // title 길이 체크
      const validateTitle = validateStringLength(data.title, 1, 50);
      if (!validateTitle.result) {
        throw new ValidationError(validateTitle.message);
      }

      // description 길이 체크
      if (data.description) {
        const validateDescription = validateStringLength(data.description, 0, 1000);
        if (!validateDescription.result) {
          throw new ValidationError(validateDescription.message);
        }
      }

      // 발행 기간이 중복되는 배너가 있을 시 배너 등록 불가
      const prismaPeriodCheck = await this.prisma.banner.findFirst({
        where: {
          groupId: data.groupId,
          seq: data.seq,
          isDeleted: false,
          OR: [
            // 기존 발행일이 새로운 발행일보다 적고, 마감일이 없거나 새로운 발행일보다 큰 경우
            {
              AND: [{ publishedAt: { lt: publishedAt } }, { unpublishedAt: { gte: publishedAt } }],
            },
            // 기존 발행일이 새로운 발행일보다 크고, 새로운 마감일보다 작고, 기존 마감일이 새로운 마감일보다 큰 경우
            {
              AND: [
                { publishedAt: { gte: publishedAt } },
                { publishedAt: { lte: unpublishedAt } },
                { unpublishedAt: { gt: unpublishedAt } },
              ],
            },
            // 기존 발행일이 새로운 발행일보다 크고, 새로운 마감일보다 작고, 기존 마감일이 새로운 마감일보다 작은 경우
            {
              AND: [
                { publishedAt: { gte: publishedAt } },
                { publishedAt: { lte: unpublishedAt } },
                { unpublishedAt: { lte: unpublishedAt } },
              ],
            },
          ],
        },
      });

      if (prismaPeriodCheck) {
        throw new ValidationError('발행 기간이 중복되는 배너가 있습니다.');
      }

      // 배너 생성
      await this.prisma.banner.create({
        data: {
          groupId: data.groupId,
          seq: data.seq,
          title: data.title,
          description: data.description || null,
          imagePath: data.imagePath || null,
          linkType: data.linkType || null,
          linkUrl: data.linkUrl || null,
          isPublished: data.isPublished || false,
          createdBy: data.createdBy,
          publishedAt: publishedAt,
          unpublishedAt: unpublishedAt,
        },
      });

      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async read(id: number): Promise<IServiceResponse<IBanner>> {
    try {
      // ID가 없거나 숫자가 아니면 에러 반환
      if (!id && isNaN(id)) {
        throw new ValidationError('배너 ID가 필요합니다.');
      }

      // 배너 조회
      const prismaBanner = await this.prisma.banner.findUnique({
        where: {
          id,
          isDeleted: false,
        },
      });

      // 조회 결과가 없으면 에러 반환
      if (!prismaBanner) {
        throw new NotFoundError('배너 정보를 찾을 수 없습니다.');
      }

      // 조회 결과를 IBanner 타입으로 변환
      const banner = this.convertToBanner(prismaBanner);

      // 배너 그룹정보 조회
      const groupInfo = await this.groupInfo([prismaBanner.groupId], false);
      if (!groupInfo.result || !groupInfo.data) {
        throw new NotFoundError('배너 그룹 정보를 찾을 수 없습니다.');
      }

      // 메타데이터 생성
      const metadata = {
        groupInfo: groupInfo.data?.[0],
        id: banner.id,
      };

      // 응답 성공
      return {
        result: true,
        metadata,
        data: banner,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async update(id: number, data: IRequestBannerUpdate): Promise<IServiceResponse> {
    try {
      // 배너 ID
      const bannerId = id;

      // ID가 없거나 숫자가 아니면 에러 반환
      if (!bannerId && isNaN(bannerId)) {
        throw new ValidationError('배너 ID가 필요합니다.');
      }

      // 배너 조회
      const bannerInfo = await this.read(bannerId);

      // 배너 조회 실패
      if (!bannerInfo.result || !bannerInfo.data) {
        throw new NotFoundError('배너 정보를 찾을 수 없습니다.');
      }

      // 업데이트 데이터 생성
      const updateData: Partial<IRequestBannerUpdate> = {};

      if (data.title) updateData.title = data.title;
      if (data.description) updateData.description = data.description;
      if (data.imagePath) updateData.imagePath = data.imagePath;
      if (data.linkType) updateData.linkType = data.linkType;
      if (data.linkUrl) updateData.linkUrl = data.linkUrl;
      if (data.updatedBy) updateData.updatedBy = data.updatedBy;
      updateData.isPublished = data.isPublished;

      const currentDate = new Date();
      const publishedAt = data.publishedAt ? convertStringToDate(data.publishedAt) : null;
      const unpublishedAt = data.unpublishedAt ? convertStringToDate(data.unpublishedAt) : null;

      // imagePath가 있으면 기존 이미지 삭제
      if (updateData.imagePath) {
        let originImagePath = bannerInfo.data.imagePath;
        if (originImagePath) {
          originImagePath = originImagePath.startsWith('public') ? originImagePath : `public${originImagePath}`;
          // 이미지 삭제
          deleteFile(originImagePath);
        }
      }

      // 제목 길이 검증
      if (updateData.title) {
        const validateTitle = validateStringLength(updateData.title, 1, 50);
        if (!validateTitle.result) {
          throw new ValidationError(validateTitle.message);
        }
      }

      // 설명 길이 검증
      if (updateData.description) {
        const validateDescription = validateStringLength(updateData.description, 0, 1000);
        if (!validateDescription.result) {
          throw new ValidationError(validateDescription.message);
        }
      }

      // 발행 기간 검증
      if (!publishedAt || !unpublishedAt) {
        throw new ValidationError('발행 기간을 입력해주세요.');
      }

      if (unpublishedAt && publishedAt > unpublishedAt) {
        throw new ValidationError('발행 마감일은 발행일보다 빠를 수 없습니다.');
      }

      // 발행 마감일이 현재 시간보다 이전이면 등록 불가
      if (unpublishedAt && unpublishedAt < currentDate) {
        throw new ValidationError('발행 마감일은 현재 시간보다 이전일 수 없습니다.');
      }

      // 발행 기간이 중복되는 배너가 있을 시 배너 등록 불가
      const prismaPeriodCheck = await this.prisma.banner.findFirst({
        where: {
          groupId: bannerInfo.data.groupId,
          seq: bannerInfo.data.seq,
          isDeleted: false,
          isPublished: true,
          NOT: { id: bannerId },
          OR: [
            // 기존 발행일이 새로운 발행일보다 적고, 마감일이 없거나 새로운 발행일보다 큰 경우
            {
              AND: [{ publishedAt: { lt: publishedAt } }, { unpublishedAt: { gte: publishedAt } }],
            },
            // 기존 발행일이 새로운 발행일보다 크고, 새로운 마감일보다 작고, 기존 마감일이 새로운 마감일보다 큰 경우
            {
              AND: [
                { publishedAt: { gte: publishedAt } },
                { publishedAt: { lte: unpublishedAt } },
                { unpublishedAt: { gt: unpublishedAt } },
              ],
            },
            // 기존 발행일이 새로운 발행일보다 크고, 새로운 마감일보다 작고, 기존 마감일이 새로운 마감일보다 작은 경우
            {
              AND: [
                { publishedAt: { gte: publishedAt } },
                { publishedAt: { lte: unpublishedAt } },
                { unpublishedAt: { lte: unpublishedAt } },
              ],
            },
          ],
        },
      });

      if (prismaPeriodCheck) {
        throw new ValidationError('발행 기간이 중복되는 배너가 있습니다.');
      }

      // 배너 업데이트
      await this.prisma.banner.update({
        where: { id: bannerId },
        data: {
          ...updateData,
          publishedAt,
          unpublishedAt,
          updatedAt: currentDate,
        },
      });

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async delete(id: number): Promise<IServiceResponse> {
    try {
      // ID가 없거나 숫자가 아니면 에러 반환
      if (!id && isNaN(id)) {
        throw new ValidationError('배너 ID가 필요합니다.');
      }

      const bannerInfo = await this.read(id);
      if (!bannerInfo.result || !bannerInfo.data) {
        throw new NotFoundError('배너 정보를 찾을 수 없습니다.');
      }

      /*
      imagePath가 있으면 기존 이미지 삭제
      하지만 완전 삭제가 아닌 isDeleted를 true로 변경이기 때문에 복구 가능성을 생각해서
      이미지 삭제는 하지 않음
      if (bannerInfo.data.imagePath) {
        let originImagePath = bannerInfo.data.imagePath;
        if (originImagePath) {
          originImagePath = (originImagePath.startsWith('public')) ? originImagePath : `public${originImagePath}`;
          // 이미지 삭제
          deleteFile(originImagePath);
        }
      }
      */

      // 배너 삭제
      await this.prisma.banner.update({
        where: { id },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
        },
      });

      return { result: true };
    } catch (error) {
      return this.handleError(error);
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

      // 배너 그룹 ID가 없으면 에러 반환
      if (!data.groupId) {
        throw new ValidationError('배너 그룹 ID가 필요합니다.');
      }

      // 배너 시퀀스가 없으면 에러 반환
      if (!data.seq) {
        throw new ValidationError('배너 시퀀스가 필요합니다.');
      }

      // 배너 그룹 정보 조회
      const groupInfo = await this.groupInfo([data.groupId], false);
      if (!groupInfo.result || !groupInfo.data) {
        throw new NotFoundError('배너 그룹 정보를 찾을 수 없습니다.');
      }

      // 전체 배너 수 조회
      const totalBanners = await this.prisma.banner.count({
        where: {
          groupId: data.groupId,
          seq: data.seq,
          isDeleted: false,
        },
      });

      // 배너 목록 조회
      const prismaBanners = await this.prisma.banner.findMany({
        where: {
          groupId: data.groupId,
          seq: data.seq,
          isDeleted: false,
        },
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
        orderBy: {
          id: 'desc',
        },
      });

      // 조회 결과를 IBanner 타입으로 변환
      const banners: IBanner[] = prismaBanners.map((banner) => this.convertToBanner(banner));

      // 메타데이터 생성
      const metadata = {
        groupInfo: groupInfo.data?.[0],
        seq: data.seq,
        total: banners.length,
        page: data.page,
        pageSize: data.pageSize,
        start: (data.page - 1) * data.pageSize + 1,
        end: (data.page - 1) * data.pageSize + banners.length,
        count: banners.length,
        totalPage: Math.ceil(totalBanners / data.pageSize),
      };

      // 응답 성공
      return {
        result: true,
        metadata,
        data: banners,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async groupInfo(
    groupIds: number[],
    includeBanners: boolean = false
  ): Promise<IServiceResponse<IBannerGroup[]>> {
    try {
      // 배너 그룹 조회 쿼리 조건
      const groupWhere = {
        isDeleted: false,
        ...(groupIds?.length > 0 && { id: { in: groupIds } }),
      };

      // 배너 그룹 조회
      const prismaBannerGroups = await this.prisma.bannerGroup.findMany({
        where: groupWhere,
        orderBy: { id: 'asc' },
        include: includeBanners
          ? {
              banners: {
                where: {
                  isDeleted: false,
                  isPublished: true,
                  publishedAt: { lte: new Date() },
                  unpublishedAt: { gte: new Date() },
                },
                orderBy: { seq: 'asc' },
              },
            }
          : undefined,
      });

      // 배너 그룹 정보 변환
      const bannerGroups: IBannerGroup[] = prismaBannerGroups.map((prismaGroup) => {
        const createdAt = convertDateToString(convertDateToKST(prismaGroup.createdAt));
        const updatedAt = prismaGroup.updatedAt ? convertDateToString(convertDateToKST(prismaGroup.updatedAt)) : null;

        const group: IBannerGroup = {
          id: prismaGroup.id,
          kind: prismaGroup.kind,
          title: prismaGroup.title,
          description: prismaGroup.description || null,
          imageWidth: prismaGroup.imageWidth || 0,
          imageHeight: prismaGroup.imageHeight || 0,
          createdAt,
          updatedAt,
        };

        if (includeBanners && 'banners' in prismaGroup) {
          const banners = (prismaGroup as any).banners;
          group.banners = banners.map((banner: any) => this.convertToBanner(banner));
        }

        return group;
      });

      // 메타데이터 생성
      const metadata = {
        group: {
          ids: bannerGroups.map((group) => group.id),
          total: bannerGroups.length,
          totalBanners: bannerGroups.reduce((acc, group) => acc + (group.banners?.length || 0), 0),
        },
      };

      return {
        result: true,
        metadata,
        data: bannerGroups,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Prisma 배너 객체를 IBanner 타입으로 변환하는 private 메서드
   * @param banner Prisma에서 조회한 배너 객체
   * @returns IBanner 타입으로 변환된 배너 객체
   */
  private convertToBanner(banner: any): IBanner {
    // 발행일, 마감일, 생성일, 수정일을 KST로 변환
    const createdAt = convertDateToString(convertDateToKST(banner.createdAt));
    const updatedAt = banner.updatedAt ? convertDateToString(convertDateToKST(banner.updatedAt)) : null;
    const publishedAt = banner.publishedAt ? convertDateToString(convertDateToKST(banner.publishedAt)) : null;
    const unpublishedAt = banner.unpublishedAt ? convertDateToString(convertDateToKST(banner.unpublishedAt)) : null;

    return {
      id: banner.id,
      groupId: banner.groupId,
      seq: banner.seq,
      title: banner.title,
      description: banner.description || null,
      imagePath: banner.imagePath || null,
      linkType: banner.linkType || null,
      linkUrl: banner.linkUrl || null,
      isPublished: banner.isPublished,
      createdBy: banner.createdBy,
      updatedBy: banner.updatedBy || null,
      publishedAt,
      unpublishedAt,
      createdAt,
      updatedAt,
    };
  }
}
