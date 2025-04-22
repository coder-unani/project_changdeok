import jwt from 'jsonwebtoken';

import { CONFIG } from '../../config/config';

// JWT 토큰 생성
export const createJWT = (data: any): string => {
  return jwt.sign(data, CONFIG.JWT_SECRET_KEY, { expiresIn: CONFIG.JWT_EXPIRE_SECOND });
};

// JWT 토큰 검증
export const verifyJWT = (token: string): any => {
  try {
    return jwt.verify(token, CONFIG.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return null;
      }

      return decoded;
    });
  } catch (e) {
    return null;
  }
};
