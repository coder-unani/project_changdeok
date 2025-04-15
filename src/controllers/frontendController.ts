import { Request, Response } from 'express';

import { AppError } from '../common/error';
import { frontendRoutes } from '../config/routes';
import { IRoute } from '../types/object';

export class FrontendController {
  constructor() {}

  // 홈
  public index = async (route: IRoute, req: Request, res: Response): Promise<void> => {
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

  // 소개
  public about = async (route: IRoute, req: Request, res: Response): Promise<void> => {
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

  // 업무분야
  public services = async (route: IRoute, req: Request, res: Response): Promise<void> => {
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
