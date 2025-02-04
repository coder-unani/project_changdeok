export const CODE_ERROR = 'ERR';
export const CODE_FAIL_SERVER = 'FAIL_SERVER';
export const CODE_FAIL_VALIDATION = 'FAIL_VALIDATION';

export const MESSAGE_FAIL_SERVER = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

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
 */
export const REG_DATE_PATTERN = /^\d{4}[-/]\d{2}[-/]\d{2}([T\s]\d{2}:\d{2}(:\d{2})?)?$/;

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