export const NODE_ENV = process.env.NODE_ENV || 'development';

// 프로젝트 설정
export const CONFIG = {
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
