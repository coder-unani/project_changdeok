import { permission } from "process";

export const apiBackendBaseUrl = 'http://localhost:3000';
export const apiBackendRoutesPrefix = '/api/backend';
export const apiBackendRoutes = {
  contents: {
    method: 'GET',
    title: '게시판 관리',
    url: `${apiBackendRoutesPrefix}/contents/:groupId`,
    permissions: [1, 4]
  },
  contentsWrite: {
    method: 'POST',
    title: '게시글 작성',
    url: `${apiBackendRoutesPrefix}/contents/:groupId/write`,
    permissions: [1, 4]
  },
  contentsDetail: {
    method: 'GET',
    title: '게시글 상세',
    url: `${apiBackendRoutesPrefix}/contents/:groupId/:contentId`,
    permissions: [1, 4]
  },
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
  employeesUpdate: {
    method: 'PUT',
    title: '관리자 정보 수정',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId`,
  },
  employeesUpdatePassword: {
    method: 'PATCH',
    title: '관리자 비밀번호 수정',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId/password`,
    permissions: [1, 2]
  },
  employeesDelete: {
    method: 'DELETE',
    title: '관리자 삭제',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId`,
  },
  employeesPermissions: {
    method: 'PATCH',
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
    method: 'POST',
    title: '관리자 로그아웃',
    url: `${apiBackendRoutesPrefix}/employees/logout`,
  },
  permissions: {
    method: 'GET',
    title: '권한 목록',
    url: `${apiBackendRoutesPrefix}/permissions`,
  }
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
    layout: backendRoutesLayout,
    permissions: [1, 6]
  },
  // 화면관리
  screensBanner: {
    method: 'GET',
    title: '배너 관리',
    url: `${backendRoutesPrefix}/screens/banners`,
    view: 'backend/screens/banner',
    layout: backendRoutesLayout,
    permissions: [1, 5]
  },
  screensPopup: {
    method: 'GET',
    title: '팝업 관리',
    url: `${backendRoutesPrefix}/screens/popups`,
    view: 'backend/screens/popup',
    layout: backendRoutesLayout,
    permissions: [1, 5]
  },
  // 게시판 관리
  contents: {
    method: 'GET',
    title: '게시판 관리',
    url: `${backendRoutesPrefix}/contents/:groupId`,
    view: 'backend/contents/list',
    layout: backendRoutesLayout,
    permissions: [1, 4]
  },
  contentsWrite: {
    method: 'GET',
    title: '게시글 작성',
    url: `${backendRoutesPrefix}/contents/:groupId/write`,
    view: 'backend/contents/write',
    layout: backendRoutesLayout,
    permissions: [1, 4]
  },
  contentsDetail: {
    method: 'GET',
    title: '게시글 상세',
    url: `${backendRoutesPrefix}/contents/:groupId/:contentId`,
    view: 'backend/contents/detail',
    layout: backendRoutesLayout,
    permissions: [1, 4]
  },
  contentsUpdate: {
    method: 'GET',
    title: '게시글 수정',
    url: `${backendRoutesPrefix}/contents/:groupId/:contentId/update`,
    view: 'backend/contents/update',
    layout: backendRoutesLayout,
    permissions: [1, 4]
  },
  // 사이트관리
  employeesRegist: {
    method: 'GET',
    title: '관리자 등록',
    url: `${backendRoutesPrefix}/employees/regist`,
    view: 'backend/employees/regist',
    layout: backendRoutesLayout,
    permissions: [1, 2]
  },
  employeesDetail: {
    method: 'GET',
    title: '관리자 상세 정보',
    url: `${backendRoutesPrefix}/employees/:employeeId`, 
    view: 'backend/employees/detail',
    layout: backendRoutesLayout,
    permissions: [1, 2]
  },
  employeesUpdate: {
    method: 'GET',
    title: '관리자 정보 수정',
    url: `${backendRoutesPrefix}/employees/:employeeId/update`,
    view: 'backend/employees/update',
    layout: backendRoutesLayout,
    permissions: [1, 2]
  },
  employeesUpdatePassword: {
    method: 'GET',
    title: '관리자 비밀번호 수정',
    url: `${backendRoutesPrefix}/employees/:employeeId/update-password`,
    view: 'backend/employees/update-password',
    layout: backendRoutesLayout,
    permissions: [1, 2]
  },
  employeesDelete: {
    method: 'GET',
    title: '관리자 삭제',
    url: `${backendRoutesPrefix}/employees/:employeeId/delete`,
    view: 'backend/employees/delete',
    layout: backendRoutesLayout,
    permissions: [1, 2]
  },
  employeesPermissions: {
    method: 'GET',
    title: '관리자 권한 변경',
    url: `${backendRoutesPrefix}/employees/:employeeId/permissions`,
    view: 'backend/employees/permissions',
    layout: backendRoutesLayout,
    permissions: [1, 3]
  },
  employees: {
    method: 'GET',
    title: '관리자 목록',
    url: `${backendRoutesPrefix}/employees`,
    view: 'backend/employees/list',
    layout: backendRoutesLayout,
    permissions: [1, 2]
  },
  employeesLogin: {
    method: 'GET',
    title: '관리자 로그인',
    url: `${backendRoutesPrefix}/employees/login`,
    view: 'backend/employees/login',
    layout: backendRoutesNonHeaderLayout,
    permissions: []
  },
  employeesForgotPassword: {
    method: 'GET',
    title: '비밀번호 찾기',
    url: `${backendRoutesPrefix}/employees/forgot-password`,
    view: 'backend/employees/forgot-password',
    layout: backendRoutesNonHeaderLayout,
    permissions: []
  },
}