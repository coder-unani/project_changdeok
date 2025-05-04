export const NODE_ENV = process.env.NODE_ENV || 'development';

// 프로젝트 설정
export const CONFIG = {
  /**
   * 실행 환경
   */
  ENV: process.env.NODE_ENV || 'development',
  /**
   * 서비스 URL
   */
  SERVICE_URL: process.env.SERVICE_URL || '',
  /**
   * 서비스 포트
   */
  SERVICE_PORT: Number.isNaN(parseInt(process.env.SERVICE_PORT || ''))
    ? 3000
    : parseInt(process.env.SERVICE_PORT || '3000'),
  /**
   * 정적 파일 경로
   */
  STATIC_PATH: process.env.STATIC_PATH || undefined,
  /**
   * 로그 경로 및 레벨
   */
  LOG_PATH: process.env.LOG_PATH || undefined,
  LOG_LEVEL: process.env.LOG_LEVEL || undefined,

  MAX_FILE_UPLOAD_SIZE: Number(process.env.MAX_FILE_UPLOAD_SIZE) || 20, // 20MB
  /**
   * Crypto 비밀키 (32바이트)
   * openssl rand -base64 32 (납품처가 변경될 때마다 새로운 키를 생성)
   * *** 이 키를 분실 할 경우.. 데이터 복구가 불가능합니다. ***
   */
  CRYPTO_SECRET_KEY: process.env.CRYPTO_SECRET_KEY ? process.env.CRYPTO_SECRET_KEY : '',
  /**
   * JWT 비밀키 (32바이트)
   * openssl rand -base64 32 (납품처가 변경될 때마다 새로운 키를 생성)
   */
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ? process.env.JWT_SECRET_KEY : '',
  /**
   * JWT 만료 시간
   * 1시간 = 3600초
   * 1일 = 86400초
   * 1주일 = 604800초
   */
  JWT_EXPIRE_SECOND: Number.isNaN(parseInt(process.env.JWT_EXPIRE_SECOND || ''))
    ? 3600
    : parseInt(process.env.JWT_EXPIRE_SECOND || '3600'),
};

export const CORS_API_OPTIONS = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24시간
  optionsSuccessStatus: 200,
};

export const CORS_OPTIONS = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200,
};

export const CORS_BACKEND_OPTIONS = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200,
};

// 허용할 HTML 태그
export const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'p',
  'a',
  'ul',
  'ol',
  'nl',
  'li',
  'b',
  'i',
  'strong',
  'em',
  'strike',
  'code',
  'hr',
  'br',
  'div',
  'table',
  'thead',
  'caption',
  'tbody',
  'tr',
  'th',
  'td',
  'pre',
  'iframe',
  'img',
  'span',
  'font',
  'del',
  'ins',
];

export const PERMISSIONS_DEFINE = {
  1: '최고 관리자',
  2: '직원 관리',
  3: '권한 관리',
  4: '게시판 관리',
  5: '광고 관리',
  6: '통계 관리',
};
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
