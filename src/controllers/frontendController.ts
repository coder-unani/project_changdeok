import { Request, Response } from 'express';

import { AppError } from '../common/utils/error';
import { frontendRoutes } from '../config/routes';
import { IRoute } from '../types/config';
import { getApiBannerGroup, getApiContentGroup } from '../common/api';
import { IBannerDisp, IBannerGroup } from '../types/object';
import { IApiResponse } from '../types/response';

export class FrontendController {
  constructor() {}

  // 홈
  public index = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 배너 정보 가져오기
      const bannerGroupIds: number[] = [1, 2, 3, 4, 5];

      // API 호출
      const getBannerGroup = await getApiBannerGroup(bannerGroupIds);
      let popupBanner: IBannerDisp[] = [];
      let topBanner: IBannerDisp = {
        title: 'Trusted Expertise, Proven Results.',
        description:
          '<span>사고와 상해로 인해 피해를 입은 분들을 위해</span><br /><span>마땅히 보호받아야 할 권리를 찾도록 최선을 다하겠습니다.</span>',
        imagePath: '/uploads/images/1742233951314-698618677.jpg',
      };
      let midBanner1: IBannerDisp = {
        title: '오르빗코드 법률 사무소에서는',
        description: '',
        imagePath: '/uploads/banners/1744909064625-782173125.png',
      };
      let midBanner2: IBannerDisp[] = [];
      let midBanner3: IBannerDisp[] = [];

      // 배너 정보 조회 성공
      if (getBannerGroup.result) {
        if (getBannerGroup.data?.[0]) {
          getBannerGroup.data[0].banners?.forEach((banner) => {
            popupBanner.push({
              id: banner.id,
              title: banner.title,
              description: banner.description,
              imagePath: banner.imagePath,
            });
          });
        }

        if (getBannerGroup.data?.[1]) {
          getBannerGroup.data[1].banners?.forEach((banner) => {
            if (banner.seq === 1) {
              topBanner = {
                title: banner.title,
                description: banner.description,
                imagePath: banner.imagePath,
              };
            }
          });
        }

        if (getBannerGroup.data?.[2]) {
          getBannerGroup.data[2].banners?.forEach((banner) => {
            if (banner.seq === 1) {
              midBanner1 = {
                title: banner.title,
                description: banner.description,
                imagePath: banner.imagePath,
              };
            }
          });
        }

        if (getBannerGroup.data?.[3]) {
          getBannerGroup.data[3].banners?.forEach((banner) => {
            midBanner2.push({
              title: banner.title,
              description: banner.description,
              imagePath: banner.imagePath,
            });
          });
        }

        if (getBannerGroup.data?.[4]) {
          getBannerGroup.data[4].banners?.forEach((banner) => {
            midBanner3.push({
              title: banner.title,
              description: banner.description,
              imagePath: banner.imagePath,
            });
          });
        }
      }

      // 콘텐츠 그룹 정보 가져오기
      const contentGroupId: number = 3;

      // API 호출
      const getContentGroup = await getApiContentGroup(contentGroupId);

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {
          banner: getBannerGroup.metadata,
          content: getContentGroup.metadata,
        },
        data: {
          popupBanner,
          topBanner,
          midBanner1,
          midBanner2,
          midBanner3,
        },
      };

      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 소개
  public about = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 배너 정보 가져오기
      const groupIds: number[] = [4];

      // API 호출
      const { result, message, metadata, data: bannerGroups } = await getApiBannerGroup(groupIds);
      const midBanner: IBannerDisp[] = [];

      if (result) {
        if (bannerGroups?.[0]) {
          bannerGroups[0].banners?.forEach((banner) => {
            midBanner.push({
              title: banner.title,
              description: banner.description,
              imagePath: banner.imagePath,
            });
          });
        }
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {
          midBanner,
        },
      };

      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 업무분야
  public services = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 배너 정보 가져오기
      const groupIds: number[] = [4];

      // API 호출
      const { result, message, metadata, data: bannerGroups } = await getApiBannerGroup(groupIds);
      const midBanner: IBannerDisp[] = [];

      if (result) {
        if (bannerGroups?.[0]) {
          bannerGroups[0].banners?.forEach((banner) => {
            midBanner.push({
              title: banner.title,
              description: banner.description,
              imagePath: banner.imagePath,
            });
          });
        }
      }

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {
          midBanner,
        },
      };

      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 성공사례
  public results = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // Q&A
  public qna = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 상담 및 의뢰
  public contact = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 콘텐츠 그룹 정보 가져오기
      const contentGroupId: number = 3;

      // API 호출
      const getContentGroup = await getApiContentGroup(contentGroupId);

      // 페이지 데이터 생성
      const data = {
        layout: route.layout,
        title: route.title,
        metadata: {
          content: getContentGroup.metadata,
        },
        data: {},
      };

      res.render(route.view, data);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 에러 페이지
  public renderError = (res: Response, error: unknown): void => {
    const { title, view, layout } = frontendRoutes.error;

    if (error instanceof AppError) {
      res.status(error.statusCode).render(view, {
        layout,
        title: `${title} ${error.statusCode}`,
        message: error.message,
      });
    } else {
      res.status(500).render(view, {
        layout,
        title,
        message: '알 수 없는 오류가 발생했습니다.',
      });
    }
  };
}
