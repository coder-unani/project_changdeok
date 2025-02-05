export const SERVICE_PORT = parseInt(process.env.SERVICE_PORT || '3000');
export const STATIC_PATH = process.env.STATIC_PATH || undefined;
export const LOG_PATH = process.env.LOG_PATH || undefined;
export const LOG_LEVEL = process.env.LOG_LEVEL || undefined;
export const CORS_OPTIONS = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200,
}
export const CORS_BACKEND_OPTIONS = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200,
}

// Crypto Secret Key
export const CRYPTO_SECRET_KEY = (process.env.CRYPTO_SECRET) ? process.env.CRYPTO_SECRET : ''; 

// 허용할 HTML 태그
export const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul',
  'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code',
  'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr',
  'th', 'td', 'pre', 'iframe', 'img', 'span', 'font', 'del', 'ins'
];