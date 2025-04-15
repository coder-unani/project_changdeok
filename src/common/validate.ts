import type { typeValidatedResult } from '../types/validate';
import { REG_DATE_PATTERN, REG_EMAIL_PATTERN, REG_PASSWORD_PATTERN, REG_PHONE_PATTERN } from '../config/config';

// Email 형식 체크 함수
export const validateEmail = (email: string): typeValidatedResult => {
  // Email 필수 체크
  if (!email) {
    return {
      result: false,
      message: '이메일을 입력해주세요.',
    };
  }

  // Email 형식 체크
  if (!REG_EMAIL_PATTERN.test(email)) {
    return {
      result: false,
      message: '이메일 형식이 올바르지 않습니다.',
    };
  }

  // 모든 체크 통과
  return {
    result: true,
    message: '',
  };
};

// 비밀번호 체크 함수 (typeResponse 반환)
export const validatePassword = (
  password: string | null | undefined,
  passwordConfirm: string | null | undefined
): typeValidatedResult => {
  // 비밀번호 필수 체크
  if (!password) {
    return {
      result: false,
      message: '비밀번호를 입력해주세요.',
    };
  }

  // 비밀번호 확인 값이 있으면 비밀번호 확인 필수 체크
  if (passwordConfirm && password !== passwordConfirm) {
    return {
      result: false,
      message: '패스워드가 일치하지 않습니다.',
    };
  }

  // 비밀번호 형식 체크
  if (!REG_PASSWORD_PATTERN.test(password)) {
    return {
      result: false,
      message: '비밀번호는 8자리 이상, 숫자, 문자, 특수문자를 포함해야 합니다.',
    };
  }

  // 모든 체크 통과
  return {
    result: true,
    message: '',
  };
};

// 전화번호 형식 체크 함수
export const validatePhone = (phone: string): typeValidatedResult => {
  // 전화번호 하이픈 제거
  const phoneNum = phone.replace(/-/g, '');

  // 전화번호 형식 체크
  if (!REG_PHONE_PATTERN.test(phoneNum)) {
    return {
      result: false,
      message: '전화번호 형식이 올바르지 않습니다.',
    };
  }

  // 모든 체크 통과
  return {
    result: true,
    message: '',
  };
};

// 날짜 형식 체크 함수
export const validateDate = (date: string): typeValidatedResult => {
  // 날짜 형식 체크
  if (!REG_DATE_PATTERN.test(date)) {
    return {
      result: false,
      message: '날짜 형식이 올바르지 않습니다.',
    };
  }

  // 모든 체크 통과
  return {
    result: true,
    message: '',
  };
};

// 날짜 및 시간 형식 체크 함수
export const validateDateTime = (dateTime: string): typeValidatedResult => {
  // 날짜 및 시간 형식 체크
  if (!REG_DATE_PATTERN.test(dateTime)) {
    return {
      result: false,
      message: '날짜 및 시간 형식이 올바르지 않습니다.',
    };
  }

  // 모든 체크 통과
  return {
    result: true,
    message: '',
  };
};

// 문자열 길이 체크 함수
export const validateStringLength = (value: string, min: number, max: number): typeValidatedResult => {
  // 문자열 길이 체크
  if (value.length < min || value.length > max) {
    return {
      result: false,
      message: `${min}자 이상 ${max}자 이하로 입력해주세요.`,
    };
  }

  // 모든 체크 통과
  return {
    result: true,
    message: '',
  };
};
