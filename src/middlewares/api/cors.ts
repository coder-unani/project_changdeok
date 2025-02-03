import { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import { IMiddleware } from '../../types/middleware';

export class CorsMiddleware implements IMiddleware {
  private corsMiddleware: ReturnType<typeof cors>;

  constructor(options: CorsOptions) {
    this.corsMiddleware = cors(options);
  }

  public handle(req: Request, res: Response, next: NextFunction): void {
    this.corsMiddleware(req, res, next); 
  }
}
