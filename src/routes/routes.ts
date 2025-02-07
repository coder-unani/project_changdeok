export const WEB_BACKEND_PREFIX = '/admin';
export const WEB_BACKEND_ROUTE = {
  INDEX: '/',
  EMPLOYEE_LIST: '/employee',
  EMPLOYEE_READ: '/employee/:employeeId',
  EMPLOYEE_UPDATE: '/employee/:employeeId/update',
  EMPLOYEE_DELETE: '/employee/:employeeId/delete',
  EMPLOYEE_REGIST: '/employee/regist',
  EMPLOYEE_LOGIN: '/employee/login',
  PERMISSION: '/permission',
}

export const WEB_FRONTEND_PREFIX = '/';
export const WEB_FRONTEND_ROUTE = {
  INDEX: '/',
  ERROR: '/error',
}

export const API_BACKEND_PREFIX = '/api/backend';
export const API_BACKEND_ROUTE = {
  EMPLOYEE_LIST: '/employee',
  EMPLOYEE_READ: '/employee/:employeeId',
  EMPLOYEE_REGIST: '/employee/regist',
  EMPLOYEE_LOGIN: '/employee/login',
  EMPLOYEE_UPDATE: '/employee/:employeeId/update',
  EMPLOYEE_DELETE: '/employee/:employeeId/delete',
}

export const API_FRONTEND_PREFIX = '/api';
export const API_FRONTEND_ROUTE = {
}