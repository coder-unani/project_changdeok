import { HTTP_STATUS } from "../config/constants";
import { IError } from "../types/object";

export class AppError extends Error implements IError {
  public statusCode: number;
  
  constructor(code: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, message: string = 'Internal Server Error') {
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
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}

export class PermissionError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}

export class ServerError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}

