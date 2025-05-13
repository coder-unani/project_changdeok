import type { typeValidatedResult } from '../../types/validate';
import { ValidationError } from '../error';

/**
 * 허용하는 날짜 형식
 * 2023-10-15
 * 2023/10/15
 * 2023-10-15 14:30
 * 2023/10/15 14:30
 * 2023-10-15T14:30
 * 2023-10-15 14:30:00
 * 2023/10/15 14:30:00
 * 2023-10-15T14:30:00
 * 1981-01-12T00:00:00.000Z
 */
export const REG_DATE_PATTERN =
  /^(\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01]))(?:[T\s](?:((?:[01]\d|2[0-3]):[0-5]\d)(?::(?:[0-5]\d)(?:\.\d{3})?)?)(Z)?)?$/;

/**
 * 이메일 형식 체크
 */
export const REG_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * 비밀번호 8자리 이상, 숫자, 문자, 특수문자 포함 체크
 */
export const REG_PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;

/**
 * 전화번호 형식 체크
 */
export const REG_PHONE_PATTERN = /^\d{9,11}$/;

// Integer 형식 체크 함수
export const validateInteger = (_value: any, _fieldName: string = ''): number => {
  const parsedValue = Number(_value);

  if (isNaN(parsedValue)) {
    const message = (_fieldName ? `${_fieldName}가` : '값이') + '올바르지 않습니다.';
    throw new ValidationError(message);
  }

  return parsedValue;
};

// String 형식 체크 함수
export const validateString = (_value: any, _fieldName: string = ''): string => {
  const parsedValue = String(_value);

  if (typeof parsedValue !== 'string') {
    const message = (_fieldName ? `${_fieldName}가` : '값이') + '올바르지 않습니다.';
    throw new ValidationError(message);
  }

  return parsedValue;
};

// Boolean 형식 체크 함수
export const validateBoolean = (_value: any | boolean, _fieldName: string): boolean => {
  let parsedValue = null;

  if (typeof _value === 'string') {
    parsedValue = ['Y', 'y', 'TRUE', 'true', '1'].includes(_value)
      ? true
      : ['N', 'n', 'FALSE', 'false', '0'].includes(_value)
        ? false
        : null;
  } else {
    parsedValue = _value;
  }

  if (typeof parsedValue !== 'boolean') {
    const message = (_fieldName ? `${_fieldName}가` : '값이') + '올바르지 않습니다.';
    throw new ValidationError(message);
  }

  return parsedValue;
};

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
