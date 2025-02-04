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