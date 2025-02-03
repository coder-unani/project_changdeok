import { Request, Response, NextFunction } from 'express';

export interface IMiddleware {
  handle(req: Request, res: Response, next: NextFunction): void;
}

export interface IErrorMiddleware {
  handleError(err: Error, req: Request, res: Response, next: NextFunction): void;
}
