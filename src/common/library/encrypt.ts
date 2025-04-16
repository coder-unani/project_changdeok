import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

import { CONFIG } from '../../config/config';

/**
 * 비밀번호를 해싱하는 함수
 * @param password - 평문 비밀번호
 * @returns Promise<string> - 해싱된 비밀번호
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

/**
 * 비밀번호를 검증하는 함수
 * @param plainPassword - 사용자가 입력한 평문 비밀번호
 * @param hashedPassword - 데이터베이스에 저장된 해싱된 비밀번호
 * @returns Promise<boolean> - 비밀번호가 일치하면 true, 그렇지 않으면 false
 */
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
};

/**
 * 평문 데이터 암호화 함수
 * @param plainData - 평문 데이터
 * @returns string - 암호화된 데이터
 */
export const encryptDataAES = (plainData: string): string => {
  return CryptoJS.AES.encrypt(plainData, CONFIG.CRYPTO_SECRET_KEY).toString();
};

/**
 * 평문 데이터 복호화 함수
 * @param encryptedData - 암호화된 데이터
 * @returns string - 복호화된 데이터
 */
export const decryptDataAES = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, CONFIG.CRYPTO_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// 테스트 코드
// const phoneNumber = '010-1234-5678';
// const encryptedPhoneNumber = encryptDataAES(phoneNumber);
// console.log('Encrypted:', encryptedPhoneNumber);

// const decryptedPhoneNumber = decryptDataAES(encryptedPhoneNumber);
// console.log('Decrypted:', decryptedPhoneNumber);
