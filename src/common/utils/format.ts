import { ValidationError } from '../../common/error';
import { IApiResponse } from '../../types/config';

export const REG_DATE_PATTERN =
  /^(\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01]))(?:[T\s](?:((?:[01]\d|2[0-3]):[0-5]\d)(?::(?:[0-5]\d)(?:\.\d{3})?)?)(Z)?)?$/;

/**
 * 이메일 형식 체크
 */
export const REG_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * 날짜를 한국 시간대로 변환
 * @param date 날짜
 * @param toString 문자열로 변환 여부
 * @param timezoneOffset 시간대 오프셋
 * @returns 변환된 날짜
 */
export const convertDateToKST = (date: Date, timezoneOffset: number = 0): Date => {
  if (!date) {
    // 현재 시간을 KST로 변환하여 반환
    return new Date(new Date().getTime() + (9 - timezoneOffset) * 60 * 60 * 1000);
  }

  if (!(date instanceof Date)) {
    throw new ValidationError('날짜 형식이 올바르지 않습니다.');
  }

  if (isNaN(date.getTime())) {
    throw new ValidationError('유효하지 않은 날짜입니다.');
  }

  // 주어진 시간대에서 KST로 변환
  return new Date(date.getTime() + (9 - timezoneOffset) * 60 * 60 * 1000);
};

/**
 * 날짜를 UTC로 변환
 * @param date 날짜
 * @param timezoneOffset 시간대 오프셋
 * @returns 변환된 날짜
 */
export const convertDateToUTC = (date: Date, timezoneOffset: number = 9): Date => {
  if (!date) {
    // 현재 시간을 UTC로 변환하여 반환
    return new Date(new Date().getTime() - timezoneOffset * 60 * 60 * 1000);
  }

  if (!(date instanceof Date)) {
    throw new ValidationError('날짜 형식이 올바르지 않습니다.');
  }

  if (isNaN(date.getTime())) {
    throw new ValidationError('유효하지 않은 날짜입니다.');
  }

  // 주어진 시간대에서 UTC로 변환
  return new Date(date.getTime() - timezoneOffset * 60 * 60 * 1000);
};

/**
 * Date 객체를 YYYY-MM-DD HH:mm:ss 형식의 문자열로 변환
 * @param date 변환할 Date 객체
 * @param isIncludeTime 시간 포함 여부
 * @returns YYYY-MM-DD HH:mm:ss 형식의 문자열
 */
export const convertDateToString = (date: Date, isIncludeTime: boolean = true): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new ValidationError('유효하지 않은 날짜입니다.');
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  if (isIncludeTime) {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  return `${year}-${month}-${day}`;
};

/**
 * YYYY-MM-DD HH:mm:ss 형식의 문자열을 Date 객체로 변환
 * @param date 변환할 날짜 문자열
 * @param isIncludeTime 시간 포함 여부
 * @returns Date 객체
 */
export const convertStringToDate = (date: string, isIncludeTime: boolean = true): Date => {
  if (!date || typeof date !== 'string') {
    throw new ValidationError('날짜 문자열이 필요합니다.');
  }

  // YYYY-MM-DD HH:mm:ss 형식 검사
  if (!REG_DATE_PATTERN.test(date.trim())) {
    throw new ValidationError('날짜 형식이 올바르지 않습니다.');
  }

  const result = new Date(date);
  if (isNaN(result.getTime())) {
    throw new ValidationError('유효하지 않은 날짜입니다.');
  }

  if (isIncludeTime) {
    return result;
  }

  return new Date(result.getFullYear(), result.getMonth(), result.getDate());
};

/**
 * 이메일 마스킹 처리
 * @param email 이메일
 * @returns 마스킹 처리된 이메일
 */
export const formatEmailMasking = (email: string): string => {
  // email이 없으면 에러
  if (email === null || email === undefined) {
    throw new ValidationError('이메일이 없습니다.');
  }

  // email이 email 형식이 아니면 에러
  if (!REG_EMAIL_PATTERN.test(email)) {
    throw new ValidationError('이메일 형식이 올바르지 않습니다.');
  }

  // email 마스킹 처리
  const emailArray = email.split('@');
  const emailId = emailArray[0];
  const emailDomain = emailArray[1];
  const emailIdLength = emailId.length;
  const emailIdMasking =
    emailIdLength <= 3
      ? emailId.charAt(0) + '*'.repeat(emailIdLength - 1)
      : emailId.substr(0, 3) + '*'.repeat(emailIdLength - 3);

  return emailIdMasking + '@' + emailDomain;
};

/**
 * API 응답을 JSON 형식으로 변환
 * @param result 결과
 * @param code 코드
 * @param message 메시지
 * @param metadata 메타데이터
 * @param data 데이터
 * @returns API 응답
 */
export const formatApiResponse = (
  result: boolean,
  code: number | undefined | null = null,
  message: string | undefined | null = null,
  metadata: any | undefined | null = null,
  data: any = null
): IApiResponse => {
  code = code;
  message = message || null;
  data = data || null;

  // 응답 데이터 생성
  const resultData: IApiResponse = {
    result,
    code,
    message,
    metadata,
    data,
  };

  return resultData;
};
