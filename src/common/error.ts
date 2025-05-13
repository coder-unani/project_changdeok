import { IError } from '../types/config';
import { httpStatus } from './constants';

export class AppError extends Error implements IError {
  public statusCode: number;

  constructor(code: number = httpStatus.INTERNAL_SERVER_ERROR, message: string = 'Internal Server Error') {
    super(message);

    this.statusCode = code;
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(httpStatus.BAD_REQUEST, message);
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(httpStatus.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(httpStatus.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(httpStatus.NOT_FOUND, message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(httpStatus.TOO_MANY_REQUESTS, message);
  }
}

export class ServerError extends AppError {
  constructor(message: string) {
    super(httpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
