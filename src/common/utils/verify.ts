import { Request } from 'express';

import { IEmployeeToken } from '../types/object';
import { getCookie } from './cookie';

/**
 * 접속한 직원 정보 추출
 * @param req Request 객체
 * @returns IEmployeeToken | null 직원 정보
 */
export const getAccessedEmployee = (req: Request): IEmployeeToken | null => {
  try {
    const cookieEmployee = getCookie(req, 'employee');
    if (!cookieEmployee) {
      return null;
    }

    return JSON.parse(cookieEmployee);
  } catch (error) {
    return null;
  }
};

/**
 * Access Token 추출
 * @param req Request 객체
 * @returns
 */
export const getAccessToken = (req: Request): string | null => {
  try {
    const accessToken = getCookie(req, 'accessToken');
    if (!accessToken) {
      return null;
    }

    return accessToken;
  } catch (error) {
    return null;
  }
};
