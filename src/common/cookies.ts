import { Request, Response } from 'express';

import { JWT_EXPIRE_SECOND } from '../config/config';

export const getCookie = (req: Request, name: string): string | null => {
  try {
    const cookies = req.cookies;
    return cookies[name] || null;

  } catch (error) {
    return null;

  }
}

export const setCookie = (res: Response, name: string, value: string, options: any = {}): void => {
  try {
    let cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: JWT_EXPIRE_SECOND * 1000,
      ...options
    };
    res.cookie(name, value, cookieOptions);

  } catch (error) {
    throw error;

  }
}

export const removeCookie = (res: Response, name: string): void => {
  try {
    res.clearCookie(name);

  } catch (error) {
    return;

  }
}