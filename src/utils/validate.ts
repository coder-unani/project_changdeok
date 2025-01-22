import type { typeValidatedResult } from "types/admin/validate";

// Email 형식 체크 함수
export const validateEmail = (email: string): typeValidatedResult => {
  // Email 필수 체크
  if (!email) {
    return {
      result: false,
      message: '이메일을 입력해주세요.'
    }
  }

  // Email 형식 체크
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    return {
      result: false,
      message: '이메일 형식이 올바르지 않습니다.'
    }
  }

  // 모든 체크 통과
  return {
    result: true,
    message: ''
  }
}

// 비밀번호 체크 함수 (typeResponse 반환)
export const validatePassword = (password: string | null | undefined, passwordConfirm: string | null | undefined): typeValidatedResult => {
  // 비밀번호 필수 체크
  if (!password) {
    return {
      result: false,
      message: '비밀번호를 입력해주세요.'
    }
  }

  // 비밀번호 확인 값이 있으면 비밀번호 확인 필수 체크
  if (passwordConfirm && password !== passwordConfirm) {
    return {
      result: false,
      message: '패스워드가 일치하지 않습니다.'
    }
  }

  // 비밀번호 8자리 이상, 숫자, 문자, 특수문자 포함 체크
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
  if (!passwordPattern.test(password)) {
    return {
      result: false,
      message: '비밀번호는 8자리 이상, 숫자, 문자, 특수문자를 포함해야 합니다.'
    }
  }

  // 모든 체크 통과
  return {
    result: true,
    message: ''
  }
}

// 전화번호 형식 체크 함수 
export const validatePhone = (phone: string): typeValidatedResult => {
  // 전화번호 하이픈 제거
  const phoneNum = phone.replace(/-/g, '');
  
  // 전화번호 형식 체크
  const phonePattern = /^\d{9,11}$/;
  if (!phonePattern.test(phoneNum)) {
    return {
      result: false,
      message: '전화번호 형식이 올바르지 않습니다.'
    }
  }
  
  // 모든 체크 통과
  return {
    result: true,
    message: ''
  }
}

// 날짜 형식 체크 함수
export const validateDate = (date: string): typeValidatedResult => {
  // 날짜 형식 체크
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) {
    return {
      result: false,
      message: '날짜 형식이 올바르지 않습니다.'
    }
  }

  // 모든 체크 통과
  return {
    result: true,
    message: ''
  }
}

// 날짜 및 시간 형식 체크 함수
export const validateDateTime = (dateTime: string): typeValidatedResult => {
  // 날짜 및 시간 형식 체크
  const dateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!dateTimePattern.test(dateTime)) {
    return {
      result: false,
      message: '날짜 및 시간 형식이 올바르지 않습니다.'
    }
  }

  // 모든 체크 통과
  return {
    result: true,
    message: ''
  }
}