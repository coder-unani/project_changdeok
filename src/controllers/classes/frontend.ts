import { Request, Response } from 'express';

import { getApiBannerGroup, getApiContentGroup } from '../../common/api';
import { AppError } from '../../common/error';
import { frontendRoutes } from '../../config/routes';
import { IRoute } from '../../types/config';
import { IBanner, IBannerDisp } from '../../types/object';
import { BaseWebController } from './controller';

export class FrontendController extends BaseWebController {
  // 홈
  public index = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // API 인증정보
      const apiOptions = {
        token: req.cookies.access_token,
      };

      // 배너 및 콘텐츠 그룹 정보 동시 호출
      const [getBannerGroup, getContentGroup] = await Promise.all([
        getApiBannerGroup([1, 2, 3, 4, 5], apiOptions),
        getApiContentGroup(3, apiOptions),
      ]);

      // 배너 기본 정보 설정
      const banners = {
        popupBanner: [] as IBannerDisp[],
        topBanner: {
          title: 'Trusted Expertise, Proven Results.',
          description:
            '<span>사고와 상해로 인해 피해를 입은 분들을 위해</span><br /><span>마땅히 보호받아야 할 권리를 찾도록 최선을 다하겠습니다.</span>',
          imagePath: '/uploads/images/1742233951314-698618677.jpg',
        } as IBannerDisp,
        midBanner1: {
          title: '오르빗코드 법률 사무소에서는',
          description: '',
          imagePath: '/uploads/banners/1744909064625-782173125.png',
        } as IBannerDisp,
        midBanner2: [] as IBannerDisp[],
        midBanner3: [] as IBannerDisp[],
      };

      // 배너 정보 조회 성공시 데이터 매핑
      if (getBannerGroup.result && getBannerGroup.data) {
        const mapBanner = (banner: IBanner): IBannerDisp => ({
          id: banner.id,
          title: banner.title,
          description: banner.description,
          imagePath: banner.imagePath,
        });

        // 팝업 배너
        if (getBannerGroup.data[0]?.banners) {
          banners.popupBanner = getBannerGroup.data[0].banners.map(mapBanner);
        }

        // 상단 배너
        const topBanner = getBannerGroup.data[1]?.banners?.find((b) => b.seq === 1);
        if (topBanner) {
          banners.topBanner = mapBanner(topBanner);
        }

        // 중간 배너1
        const midBanner1 = getBannerGroup.data[2]?.banners?.find((b) => b.seq === 1);
        if (midBanner1) {
          banners.midBanner1 = mapBanner(midBanner1);
        }

        // 중간 배너2
        if (getBannerGroup.data[3]?.banners) {
          banners.midBanner2 = getBannerGroup.data[3].banners.map(mapBanner);
        }

        // 중간 배너3
        if (getBannerGroup.data[4]?.banners) {
          banners.midBanner3 = getBannerGroup.data[4].banners.map(mapBanner);
        }
      }

      // 페이지 데이터 생성
      const pageData = this.createPageData(
        route,
        route.title,
        {
          banner: getBannerGroup.metadata,
          content: getContentGroup.metadata,
        },
        banners
      );

      // 홈 페이지 렌더링
      res.render(route.view, pageData);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 소개
  public about = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 배너 정보 가져오기
      const groupIds: number[] = [4];

      // API 인증정보
      const apiOptions = {
        token: req.cookies.access_token,
      };

      // 배너 그룹 정보 API 호출
      const { result, data: bannerGroups } = await getApiBannerGroup(groupIds, apiOptions);
      const midBanner: IBannerDisp[] = [];

      if (result) {
        if (bannerGroups?.[0]) {
          bannerGroups[0].banners?.forEach((banner: IBanner) => {
            midBanner.push({
              title: banner.title,
              description: banner.description,
              imagePath: banner.imagePath,
            });
          });
        }
      }

      // 페이지 데이터 생성
      const pageData = this.createPageData(route, route.title, {}, { midBanner });

      // 소개 페이지 렌더링
      res.render(route.view, pageData);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 업무분야
  public services = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 배너 정보 가져오기
      const groupIds: number[] = [4];

      // API 인증정보
      const apiOptions = {
        token: req.cookies.access_token,
      };

      // API 호출
      const { result, data: bannerGroups } = await getApiBannerGroup(groupIds, apiOptions);
      const midBanner: IBannerDisp[] = [];

      if (result) {
        if (bannerGroups?.[0]) {
          bannerGroups[0].banners?.forEach((banner: IBanner) => {
            midBanner.push({
              title: banner.title,
              description: banner.description,
              imagePath: banner.imagePath,
            });
          });
        }
      }

      // 페이지 데이터 생성
      const pageData = this.createPageData(route, route.title, {}, { midBanner });

      // 업무분야 페이지 렌더링
      res.render(route.view, pageData);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 성공사례
  public results = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const pageData = {
        layout: route.layout,
        title: route.title,
        metadata: {},
        data: {},
      };

      // 성공사례 페이지 렌더링
      res.render(route.view, pageData);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // Q&A
  public qna = async (route: IRoute, req: Request, res: Response): Promise<void> => {
    try {
      // 페이지 데이터 생성
      const pageData = this.createPageData(route, route.title, {}, {});

      // Q&A 페이지 렌더링
      res.render(route.view, pageData);
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
      const options = {
        token: req.cookies.access_token,
      };
      const getContentGroup = await getApiContentGroup(contentGroupId, options);

      // 페이지 데이터 생성
      const pageData = this.createPageData(
        route,
        route.title,
        {
          content: getContentGroup.metadata,
        },
        {}
      );

      // 상담 및 의뢰 페이지 렌더링
      res.render(route.view, pageData);
    } catch (error) {
      this.renderError(res, error);
    }
  };

  // 에러 페이지
  public renderError = (res: Response, error: unknown): void => {
    const { title, view, layout } = frontendRoutes.error;
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : '알 수 없는 오류가 발생했습니다.';

    res.status(statusCode).render(view, {
      layout,
      title: `${title} ${statusCode}`,
      message,
    });
  };
}
