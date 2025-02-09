export const WEB_BACKEND_PREFIX = '/admin';
export const WEB_BACKEND_ROUTE = {
  INDEX: '/',
  EMPLOYEE_LIST: '/employees',
  EMPLOYEE_READ: '/employees/:employeeId',
  EMPLOYEE_UPDATE: '/employees/:employeeId/update',
  EMPLOYEE_DELETE: '/employees/:employeeId/delete',
  EMPLOYEE_REGIST: '/employees/regist',
  EMPLOYEE_LOGIN: '/employees/login',
  PERMISSION: '/permissions',
}

export const WEB_FRONTEND_PREFIX = '/';
export const WEB_FRONTEND_ROUTE = {
  INDEX: '/',
  ERROR: '/error',
}

export const API_BACKEND_PREFIX = '/api/backend';
export const API_BACKEND_ROUTE = {
  EMPLOYEE_LIST: '/employees',
  EMPLOYEE_READ: '/employees/:employeeId',
  EMPLOYEE_REGIST: '/employees/regist',
  EMPLOYEE_LOGIN: '/employees/login',
  EMPLOYEE_UPDATE: '/employees/:employeeId/update',
  EMPLOYEE_DELETE: '/employees/:employeeId/delete',
}

export const API_FRONTEND_PREFIX = '/api';
export const API_FRONTEND_ROUTE = {
}