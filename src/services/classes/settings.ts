import { NotFoundError } from '../../common/error';
import { ExtendedPrismaClient } from '../../library/database';
import { IServiceResponse } from '../../types/config';
import { ISettings, ISiteSettings } from '../../types/config';
import { IRequestAccessSettings, IRequestSiteSettings, IRequestSystemSettings } from '../../types/request';
import { ISettingsService } from '../../types/service';
import { BaseService } from './service';

export class SettingsService extends BaseService implements ISettingsService {
  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
  }

  public async getSettings(): Promise<IServiceResponse<ISettings>> {
    try {
      // 사이트 셋팅 조회
      const prismaData = await this.prisma.settings.findUnique({
        where: {
          id: 1,
        },
      });

      // 사이트 셋팅이 존재하지 않으면 예외 발생
      if (!prismaData) {
        throw new NotFoundError('사이트 셋팅이 존재하지 않습니다.');
      }

      // 사이트 셋팅 데이터 반환
      const settings: ISettings = {
        title: prismaData?.title || '',
        introduction: prismaData?.introduction || '',
        description: prismaData?.description || '',
        keywords: prismaData?.keywords || '',
        favicon: prismaData?.favicon || '',
        logo: prismaData?.logo || '',
        ogTagJson: prismaData?.ogTagJson || '',
        companyJson: prismaData?.companyJson || '',
      };

      // 응답 성공
      return { result: true, data: settings };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateSiteSettings(data: IRequestSiteSettings): Promise<IServiceResponse<void>> {
    try {
      // 사이트 셋팅 업데이트 데이터
      const updateData: Partial<ISiteSettings> = {};

      // 사이트 셋팅 업데이트 데이터 설정
      if (data.title) updateData.title = data.title;
      if (data.introduction) updateData.introduction = data.introduction;
      if (data.description) updateData.description = data.description;
      if (data.keywords) updateData.keywords = data.keywords;
      if (data.ogTagJson) updateData.ogTagJson = data.ogTagJson;
      updateData.favicon = data.favicon;
      updateData.logo = data.logo;

      // 사이트 셋팅 업데이트
      await this.prisma.settings.update({
        where: {
          id: 1,
        },
        data: updateData,
      });

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateCompanySettings(data: string): Promise<IServiceResponse<void>> {
    try {
      // 회사 셋팅 업데이트
      await this.prisma.settings.update({
        where: {
          id: 1,
        },
        data: {
          companyJson: data,
        },
      });

      // 응답 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateAccessSettings(data: IRequestAccessSettings): Promise<IServiceResponse<void>> {
    return { result: true };
  }

  public async updateSystemSettings(data: IRequestSystemSettings): Promise<IServiceResponse<void>> {
    return { result: true };
  }
}
