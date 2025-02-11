export const apiBackendBaseUrl = 'http://localhost:3000';
export const apiBackendRoutesPrefix = '/api/backend';
export const apiBackendRoutes = {
  employeesRegist: {
    method: 'POST',
    title: '관리자 등록',
    url: `${apiBackendRoutesPrefix}/employees`,
  },
  employeesDetail: {
    method: 'GET',
    title: '관리자 상세 정보',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId`,
  },
  employeesModify: {
    method: 'PUT',
    title: '관리자 정보 수정',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId`,
  },
  employeesModifyPassword: {
    method: 'PATCH',
    title: '관리자 비밀번호 수정',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId/password`,
  },
  employeesDelete: {
    method: 'DELETE',
    title: '관리자 삭제',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId`,
  },
  employees: {
    method: 'GET',
    title: '관리자 목록',
    url: `${apiBackendRoutesPrefix}/employees`,
  },
  employeesLogin: {
    method: 'POST',
    title: '관리자 로그인',
    url: `${apiBackendRoutesPrefix}/employees/login`,
  },
  employeesLogout: {
    method: 'GET',
    title: '관리자 로그아웃',
    url: `${apiBackendRoutesPrefix}/employees/logout`,
  }
}

export const backendRoutesPrefix = '/admin';
export const backendRoutesLayout = 'layouts/backend/layout';
export const backendRoutes = {
  index: {
    method: 'GET',
    title: '관리 시스템 홈',
    url: `${backendRoutesPrefix}/`,
    view: 'backend/index',
    layout: backendRoutesLayout
  },
  error: {
    method: 'GET',
    title: 'ERROR',
    url: `${backendRoutesPrefix}/error`,
    view: 'backend/error',
    layout: backendRoutesLayout
  },
  dashboard: {
    method: 'GET',
    title: '대시보드',
    url: `${backendRoutesPrefix}/dashboard`,
    view: 'backend/dashboard',
    layout: backendRoutesLayout
  },
  employeesRegist: {
    method: 'GET',
    title: '관리자 등록',
    url: `${backendRoutesPrefix}/employees/regist`,
    view: 'backend/employees/regist',
    layout: backendRoutesLayout
  },
  employeesDetail: {
    method: 'GET',
    title: '관리자 상세 정보',
    url: `${backendRoutesPrefix}/employees/:employeeId`, 
    view: 'backend/employees/detail',
    layout: backendRoutesLayout
  },
  employeesModify: {
    method: 'GET',
    title: '관리자 정보 수정',
    url: `${backendRoutesPrefix}/employees/:employeeId/modify`,
    view: 'backend/employees/modify',
    layout: backendRoutesLayout
  },
  employeesModifyPassword: {
    method: 'GET',
    title: '관리자 비밀번호 수정',
    url: `${backendRoutesPrefix}/employees/:employeeId/modify-password`,
    view: 'backend/employees/modify-password',
    layout: backendRoutesLayout
  },
  employeesDelete: {
    method: 'GET',
    title: '관리자 삭제',
    url: `${backendRoutesPrefix}/employees/:employeeId/delete`,
    view: 'backend/employees/delete',
    layout: backendRoutesLayout
  },
  employees: {
    method: 'GET',
    title: '관리자 목록',
    url: `${backendRoutesPrefix}/employees`,
    view: 'backend/employees/list',
    layout: backendRoutesLayout
  },
  employeesLogin: {
    method: 'GET',
    title: '관리자 로그인',
    url: `${backendRoutesPrefix}/employees/login`,
    view: 'backend/employees/login',
    layout: 'layouts/backend/layoutNonHeader'
  },
  employeesLogout: {
    method: 'GET',
    title: '관리자 로그아웃',
    url: `${backendRoutesPrefix}/employees/logout`,
    view: 'backend/employees/logout',
    layout: backendRoutesLayout
  },
  permissions: {
    method: 'GET',
    title: '권한 설정',
    url: `${backendRoutesPrefix}/permissions`,
    view: 'backend/permissions',
    layout: backendRoutesLayout
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