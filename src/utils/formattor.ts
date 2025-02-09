import { typeFormattedResult } from "../types/format";
import { REG_DATE_PATTERN, REG_EMAIL_PATTERN } from "../config/constants";
import { IApiResponse } from "../types/api/response";

export const formatDate = (date: string | Date | undefined | null): typeFormattedResult =>{
  try {

    // Date가 없으면 현재 날짜로 설정
    if (date === null || date === undefined) {
      return {
        result: false,
        message: '날짜가 없습니다.'
      }
    }

    // Date가 이미 Date 타입이면 그대로 반환
    if (date instanceof Date) {
      return {
        result: true,
        message: '',
        data: date
      }
    }

    // 양 옆 공백 제거
    date = date.trim();

    // date가 .으로 구분되어 있으면 -로 변경
    date = date.replace(/\./g, '-');

    
    if (!REG_DATE_PATTERN.test(date)) {
      return {
        result: false,
        message: '날짜 형식이 올바르지 않습니다.'
      }
    }

    // 날짜 형식 변환
    return {
      result: true,
      message: '',
      data: new Date(date)
    }

  } catch (error) {
    console.error(error);
    return {
      result: false,
      message: '날짜 형식이 올바르지 않습니다.'
    }

  }
}

// email 마스킹 처리
export const formatEmailMasking = (email: string | undefined | null): typeFormattedResult => {
  try {
    // email이 없으면 에러
    if (email === null || email === undefined) {
      return {
        result: false,
        message: '이메일이 없습니다.'
      }
    }

    // email이 email 형식이 아니면 에러
    if (!REG_EMAIL_PATTERN.test(email)) {
      return {
        result: false,
        message: '이메일 형식이 올바르지 않습니다.'
      }
    }

    // email 마스킹 처리
    const emailArray = email.split('@');
    const emailId = emailArray[0];
    const emailDomain = emailArray[1];
    const emailIdLength = emailId.length;
    const emailIdMasking = emailId.substr(0, 3) + '*'.repeat(emailIdLength - 3);

    return {
      result: true,
      message: '',
      data: emailIdMasking + '@' + emailDomain
    }

  } catch (error) {
    return {
      result: false,
      message: '이메일 형식이 올바르지 않습니다.'
    }
    
  }
}

// API 응답을 JSON 형식으로 변환하는 함수
export const formatApiResponse = (
  result: boolean, 
  code: string | undefined | null = null, 
  message: string | undefined | null = null,
  metadata: any | undefined | null = null,
  data: any = null
): IApiResponse => {
  code = code || null;
  message = message || null;
  data = data || null;

  // 응답 데이터 생성
  const resultData: IApiResponse = {
    result,
    code,
    message,
    metadata,
    data
  };
  
  return resultData;

}