import { typeFormattedResult } from '../../types/format';
import { REG_DATE_PATTERN, REG_EMAIL_PATTERN } from '../../config/config';
import { IApiResponse } from '../../types/response';

export const formatDate = (date: string | Date | undefined | null): typeFormattedResult => {
  try {
    // Date가 없으면 현재 날짜로 설정
    if (date === null || date === undefined) {
      return {
        result: false,
        message: '날짜가 없습니다.',
      };
    }

    // Date가 이미 Date 타입이면 그대로 반환
    if (date instanceof Date) {
      return {
        result: true,
        message: '',
        data: date,
      };
    }

    // 양 옆 공백 제거
    date = date.trim();

    if (!REG_DATE_PATTERN.test(date)) {
      return {
        result: false,
        message: '날짜 형식이 올바르지 않습니다.',
      };
    }

    // 날짜 형식 변환
    return {
      result: true,
      message: '',
      data: new Date(date),
    };
  } catch (error) {
    console.error(error);
    return {
      result: false,
      message: '날짜 형식이 올바르지 않습니다.',
    };
  }
};

/**
 *
 * @param date 날짜 형식의 문자열 또는 Date 객체
 * @param isIncludeTime 시간 포함 여부
 * @returns typeFormattedResult 변환 결과
 */
export const formatDateToString = (
  date: string | Date | undefined | null,
  isIncludeTime: boolean = true,
  onlyData = false,
  isUTC = false
): typeFormattedResult | string | null => {
  try {
    let dateObject: Date;

    // Date가 없으면 현재 날짜로 설정
    if (date === null || date === undefined) {
      throw new Error('날짜가 없습니다.');
    }

    // Date가 이미 Date 타입이면 그대로 사용
    if (date instanceof Date) {
      dateObject = date;
    } else {
      // 문자열인 경우 처리
      date = date.trim();

      if (!REG_DATE_PATTERN.test(date)) {
        throw new Error('날짜 형식이 올바르지 않습니다.');
      }

      dateObject = new Date(date);
    }

    /*
    // UTC 시간을 KST로 변환
    const kstDateString = dateObject.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    const kstDateObject = new Date(kstDateString);
    */
    if (isUTC) {
      dateObject = new Date(dateObject.getTime() + 9 * 60 * 60 * 1000);
    }

    // 날짜 부분 포맷팅
    let formattedDate =
      dateObject.getFullYear() +
      '-' +
      String(dateObject.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(dateObject.getDate()).padStart(2, '0');

    // 시간 포함 여부에 따라 포맷팅
    if (isIncludeTime) {
      formattedDate +=
        ' ' +
        String(dateObject.getHours()).padStart(2, '0') +
        ':' +
        String(dateObject.getMinutes()).padStart(2, '0') +
        ':' +
        String(dateObject.getSeconds()).padStart(2, '0');
    }

    if (onlyData) {
      return formattedDate;
    }

    // 날짜 형식 변환
    return {
      result: true,
      message: '',
      data: formattedDate,
    };
  } catch (error) {
    if (onlyData) {
      return null;
    }
    return {
      result: false,
      message: error instanceof Error ? error.message : '변환에 실패하였습니다.',
    };
  }
};

// email 마스킹 처리
export const formatEmailMasking = (email: string | undefined | null): typeFormattedResult => {
  try {
    // email이 없으면 에러
    if (email === null || email === undefined) {
      return {
        result: false,
        message: '이메일이 없습니다.',
      };
    }

    // email이 email 형식이 아니면 에러
    if (!REG_EMAIL_PATTERN.test(email)) {
      return {
        result: false,
        message: '이메일 형식이 올바르지 않습니다.',
      };
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

    return {
      result: true,
      message: '',
      data: emailIdMasking + '@' + emailDomain,
    };
  } catch (error) {
    return {
      result: false,
      message: '이메일 형식이 올바르지 않습니다.',
    };
  }
};

// API 응답을 JSON 형식으로 변환하는 함수
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
