export const apiBackendBaseUrl = 'http://localhost:3000';
export const apiBackendRoutesPrefix = '/api/backend';
export const apiBackendRoutes = {
  employeesRegist: {
    method: 'POST',
    title: '관리자 등록',
    url: `${apiBackendRoutesPrefix}/employees/regist`,
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
  employeesPermissions: {
    method: 'POST',
    title: '관리자 권한 등록/수정',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId/permissions`,
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
  },
}

export const backendRoutesPrefix = '/admin';
export const backendRoutesLayout = 'layouts/backend/layout';
export const backendRoutesNonHeaderLayout = 'layouts/backend/layoutNonHeader';
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
    layout: backendRoutesNonHeaderLayout
  },
  // 대시보드
  dashboard: {
    method: 'GET',
    title: '대시보드',
    url: `${backendRoutesPrefix}/dashboard`,
    view: 'backend/dashboard',
    layout: backendRoutesLayout
  },
  // 화면관리
  screensBanner: {
    method: 'GET',
    title: '배너 관리',
    url: `${backendRoutesPrefix}/screens/banners`,
    view: 'backend/screens/banner',
    layout: backendRoutesLayout
  },
  screensPopup: {
    method: 'GET',
    title: '팝업 관리',
    url: `${backendRoutesPrefix}/screens/popups`,
    view: 'backend/screens/popup',
    layout: backendRoutesLayout
  },
  // 게시판 관리
  contents: {
    method: 'GET',
    title: '게시판 관리',
    url: `${backendRoutesPrefix}/contents/:contentId`,
    view: 'backend/contents/list',
    layout: backendRoutesLayout
  },
  // 사이트관리
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
    view: 'backend/employees/password-modify',
    layout: backendRoutesLayout
  },
  employeesDelete: {
    method: 'GET',
    title: '관리자 삭제',
    url: `${backendRoutesPrefix}/employees/:employeeId/delete`,
    view: 'backend/employees/delete',
    layout: backendRoutesLayout
  },
  employeesPermissions: {
    method: 'GET',
    title: '관리자 권한 변경',
    url: `${backendRoutesPrefix}/employees/:employeeId/permissions`,
    view: 'backend/employees/permissions',
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
    layout: backendRoutesNonHeaderLayout
  },
  employeesLogout: {
    method: 'GET',
    title: '관리자 로그아웃',
    url: `${backendRoutesPrefix}/employees/logout`,
    view: 'backend/employees/logout',
    layout: backendRoutesLayout
  },
  employeesForgotPassword: {
    method: 'GET',
    title: '비밀번호 찾기',
    url: `${backendRoutesPrefix}/employees/forgot-password`,
    view: 'backend/employees/password-forgot',
    layout: backendRoutesNonHeaderLayout
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