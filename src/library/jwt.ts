import jwt from 'jsonwebtoken';

// JWT 토큰 생성
export const createJWT = (data: any, jwtSecretKey: string, jwtExpireSecond: number): string => {
  return jwt.sign(data, jwtSecretKey, { expiresIn: jwtExpireSecond });
};

// JWT 토큰 검증
export const verifyJWT = (token: string, jwtSecretKey: string): any => {
  try {
    return jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        return null;
      }

      return decoded;
    });
  } catch (e) {
    return null;
  }
};
