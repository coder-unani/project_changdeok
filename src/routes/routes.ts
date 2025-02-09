export const WEB_BACKEND_PREFIX = '/admin';
export const WEB_BACKEND_ROUTE = {
  INDEX: {
    METHOD: 'GET',
    TITLE: '관리자 홈',
    URL: '/',
    VIEW: 'backend/index',
  },
  DASHBOARD: {
    METHOD: 'GET',
    TITLE: '대시보드',
    URL: '/dashboard',
    VIEW: 'backend/dashboard',
  },
  EMPLOYEE_LIST: {
    METHOD: 'GET',
    TITLE: '직원 목록',
    URL: '/employees',
    VIEW: 'backend/employees/list',
  },
  EMPLOYEE_READ: {
    METHOD: 'GET',
    TITLE: '직원 상세 정보',
    URL: '/employees/:employeeId', 
    VIEW: 'backend/employees/detail', 
  },
  EMPLOYEE_REGIST: {
    METHOD: 'GET',
    TITLE: '직원 등록',
    URL: '/employees/regist',  
    VIEW: 'backend/employees/regist',
  },
  EMPLOYEE_LOGIN: {
    METHOD: 'GET',
    TITLE: '직원 로그인',
    URL: '/employees/login',
    VIEW: 'backend/employees/login',
  },
  EMPLOYEE_UPDATE: {
    METHOD: 'GET',
    TITLE: '직원 정보 수정',
    URL: '/employees/:employeeId/update',
    VIEW: 'backend/employees/update',
  },
  EMPLOYEE_DELETE: {
    METHOD: 'GET',
    TITLE: '직원 정보 삭제',
    URL: '/employees/:employeeId/delete',
    VIEW: 'backend/employees/delete',
  },
  PERMISSION: {
    METHOD: 'GET',
    TITLE: '권한 관리',
    URL: '/permissions',
    VIEW: 'backend/permissions',
  },
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