import jwt from 'jsonwebtoken';

import { Config, asyncConfig } from '../config/config';

// JWT 토큰 생성
export const createJWT = async (data: any): Promise<string> => {
  const config = await asyncConfig();
  return jwt.sign(data, config.getJwtSecretKey(), { expiresIn: config.getSettings().jwtExpireSecond });
};

// JWT 토큰 검증
export const verifyJWT = async (token: string): Promise<any> => {
  try {
    const config = await asyncConfig();
    return jwt.verify(token, config.getJwtSecretKey(), (err, decoded) => {
      if (err) {
        return null;
      }

      return decoded;
    });
  } catch (e) {
    return null;
  }
};
