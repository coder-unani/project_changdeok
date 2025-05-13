import { Router } from "express";

import { apiRoutes, frontendRoutes } from "../config/routes";
import { FrontendController } from "../controllers";
import { Config } from "../config/config";

class FrontendRouter {
  private config: Config;
  private router: Router;
  private frontendController: FrontendController;

  constructor(config: Config) {
    this.config = config;

    this.router = Router();
    this.frontendController = new FrontendController();

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {}

  private initializeRoutes(): void {
    // 홈
    this.router.get("/", (req, res) => {
      this.frontendController.index(frontendRoutes.index, req, res);
    });

    // 소개
    this.router.get("/about", (req, res) => {
      this.frontendController.about(frontendRoutes.about, req, res);
    });

    // 업무분야
    this.router.get("/services", (req, res) => {
      this.frontendController.services(frontendRoutes.services, req, res);
    });

    // 성공사례
    this.router.get("/results", (req, res) => {
      this.frontendController.results(frontendRoutes.results, req, res);
    });

    // Q&A
    this.router.get("/qna", (req, res) => {
      this.frontendController.qna(frontendRoutes.qna, req, res);
    });

    // 상담 및 의뢰
    this.router.get("/contact", (req, res) => {
      this.frontendController.contact(frontendRoutes.contact, req, res);
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

export const frontendRouter = (config: Config) =>
  new FrontendRouter(config).getRouter();
