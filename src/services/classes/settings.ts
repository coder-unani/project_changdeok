import { NotFoundError } from '../../common/error';
import { ExtendedPrismaClient } from '../../library/database';
import { IServiceResponse } from '../../types/config';
import { ISiteSettings } from '../../types/object';
import {
  IRequestAccessSettings,
  IRequestCompanySettings,
  IRequestSiteSettings,
  IRequestSystemSettings,
} from '../../types/request';
import { ISettingsService } from '../../types/service';
import { BaseService } from './service';

export class SettingsService extends BaseService implements ISettingsService {
  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
  }

  public async getSiteSettings(): Promise<IServiceResponse<ISiteSettings>> {
    try {
      const prismaData = await this.prisma.settings.findUnique({
        where: {
          id: 1,
        },
      });

      console.log('????');
      console.log('prismaData = ', prismaData);

      if (!prismaData) {
        throw new NotFoundError('사이트 셋팅이 존재하지 않습니다.');
      }

      const siteSettings: ISiteSettings = {
        siteTitle: prismaData?.siteTitle || '',
        siteTitleEn: prismaData?.siteTitleEn || '',
        siteFavicon: prismaData?.siteFavicon || '',
        siteLogo: prismaData?.siteLogo || '',
        siteDescription: prismaData?.siteDescription || '',
        siteKeywords: prismaData?.siteKeywords || '',
      };

      return { result: true, data: siteSettings };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateSiteSettings(data: IRequestSiteSettings): Promise<IServiceResponse<void>> {
    try {
      const updateData: Partial<ISiteSettings> = {};

      if (data.title) updateData.siteTitle = data.title;
      if (data.titleEn) updateData.siteTitleEn = data.titleEn;
      if (data.description) updateData.siteDescription = data.description;
      if (data.keywords) updateData.siteKeywords = data.keywords;
      if (data.favicon) updateData.siteFavicon = data.favicon;
      if (data.logo) updateData.siteLogo = data.logo;

      await this.prisma.settings.update({
        where: {
          id: 1,
        },
        data: updateData,
      });

      return { result: true };
    } catch (error) {
      return { result: false };
    }
  }
  public async getCompanySettings(): Promise<IServiceResponse<any>> {
    return { result: true, data: {} };
  }
  public async updateCompanySettings(data: IRequestCompanySettings): Promise<IServiceResponse<any>> {
    return { result: true, data: {} };
  }
  public async getAccessSettings(): Promise<IServiceResponse<any>> {
    return { result: true, data: {} };
  }
  public async updateAccessSettings(data: IRequestAccessSettings): Promise<IServiceResponse<any>> {
    return { result: true, data: {} };
  }
  public async getSystemSettings(): Promise<IServiceResponse<any>> {
    return { result: true, data: {} };
  }
  public async updateSystemSettings(data: IRequestSystemSettings): Promise<IServiceResponse<any>> {
    return { result: true, data: {} };
  }
}
