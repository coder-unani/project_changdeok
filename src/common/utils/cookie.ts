import { Request, Response } from 'express';

import { CONFIG } from '../../config/config';

/**
 *
 * @param req Request 객체
 * @param name 쿠키 이름
 * @returns string 쿠키 값
 */
export const getCookie = (req: Request, name: string): string | null => {
  try {
    const cookies = req.cookies;
    return cookies[name] || null;
  } catch (error) {
    return null;
  }
};

/**
 * 쿠키 설정
 * @param res Response 객체
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param options 추가 옵션
 */
export const setCookie = (res: Response, name: string, value: string, options: any = {}): void => {
  try {
    let cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: CONFIG.JWT_EXPIRE_SECOND * 1000,
      ...options,
    };
    res.cookie(name, value, cookieOptions);
  } catch (error) {
    throw error;
  }
};

/**
 * 쿠키 삭제
 * @param res Response 객체
 * @param name 쿠키 이름
 */
export const removeCookie = (res: Response, name: string): void => {
  try {
    res.clearCookie(name);
  } catch (error) {
    return;
  }
};
