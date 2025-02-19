export const CODE_FAIL_SERVER = 500;
export const CODE_BAD_REQUEST = 400;
export const CODE_UNAUTHORIZED = 401;
export const CODE_FORBIDDEN = 403;

export const MESSAGE_FAIL_SERVER = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

export const PERMISSIONS_DEFINE = {
  1: '최고 관리자',
  2: '직원 관리',
  3: '권한 관리',
  4: '게시판 관리',
  5: '광고 관리',
  6: '통계 관리',
}
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
export const REG_DATE_PATTERN = /^(\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01]))(?:[T\s](?:((?:[01]\d|2[0-3]):[0-5]\d)(?::(?:[0-5]\d)(?:\.\d{3})?)?)(Z)?)?$/;

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