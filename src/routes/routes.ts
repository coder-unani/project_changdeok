import { IRoute } from '../types/object';

export const apiBackendBaseUrl = 'http://localhost:3000';
export const apiBackendRoutesPrefix = '/api/backend';
export const apiBackendRoutes = {
  banners: {
    method: 'GET',
    title: '배너 목록',
    url: `${apiBackendRoutesPrefix}/banners`,
    permissions: [1, 5],
  },
  bannerWrite: {
    method: 'POST',
    title: '배너 등록',
    url: `${apiBackendRoutesPrefix}/banners/write`,
    permissions: [1, 5],
  },
  bannerDetail: {
    method: 'GET',
    title: '배너 상세 정보',
    url: `${apiBackendRoutesPrefix}/banners/:bannerId`,
    permissions: [1, 5],
  },
  bannerUpdate: {
    method: 'PUT',
    title: '배너 수정',
    url: `${apiBackendRoutesPrefix}/banners/:bannerId`,
    permissions: [1, 5],
  },
  bannerDelete: {
    method: 'DELETE',
    title: '배너 삭제',
    url: `${apiBackendRoutesPrefix}/banners/:bannerId`,
    permissions: [1, 5],
  },
  bannerGroup: {
    method: 'GET',
    title: '배너 그룹 정보',
    url: `${apiBackendRoutesPrefix}/banners/groups/:groupId`,
    permissions: [1, 5],
  },
  contents: {
    method: 'GET',
    title: '게시판 관리',
    url: `${apiBackendRoutesPrefix}/contents/:groupId`,
    permissions: [1, 4],
  },
  contentWrite: {
    method: 'POST',
    title: '게시글 작성',
    url: `${apiBackendRoutesPrefix}/contents/:groupId/write`,
    permissions: [1, 4],
  },
  contentDetail: {
    method: 'GET',
    title: '게시글 상세',
    url: `${apiBackendRoutesPrefix}/contents/:groupId/:contentId`,
    permissions: [1, 4],
  },
  contentUpdate: {
    method: 'PUT',
    title: '게시글 수정',
    url: `${apiBackendRoutesPrefix}/contents/:groupId/:contentId`,
    permissions: [1, 4],
  },
  contentDelete: {
    method: 'DELETE',
    title: '게시글 삭제',
    url: `${apiBackendRoutesPrefix}/contents/:groupId/:contentId`,
    permissions: [1, 4],
  },
  employeeRegist: {
    method: 'POST',
    title: '관리자 등록',
    url: `${apiBackendRoutesPrefix}/employees/regist`,
    permissions: [1, 2],
  },
  employeeDetail: {
    method: 'GET',
    title: '관리자 상세 정보',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId`,
    permissions: [1, 2],
  },
  employeeUpdate: {
    method: 'PUT',
    title: '관리자 정보 수정',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId`,
    permissions: [1, 2],
  },
  employeeUpdatePassword: {
    method: 'PATCH',
    title: '관리자 비밀번호 수정',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId/password`,
    permissions: [1, 2],
  },
  employeeDelete: {
    method: 'DELETE',
    title: '관리자 삭제',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId`,
    permissions: [1, 2],
  },
  employeePermissions: {
    method: 'PATCH',
    title: '관리자 권한 등록/수정',
    url: `${apiBackendRoutesPrefix}/employees/:employeeId/permissions`,
    permissions: [1, 3],
  },
  employees: {
    method: 'GET',
    title: '관리자 목록',
    url: `${apiBackendRoutesPrefix}/employees`,
    permissions: [1, 2],
  },
  employeeLogin: {
    method: 'POST',
    title: '관리자 로그인',
    url: `${apiBackendRoutesPrefix}/employees/login`,
    permissions: [],
  },
  employeeLogout: {
    method: 'POST',
    title: '관리자 로그아웃',
    url: `${apiBackendRoutesPrefix}/employees/logout`,
    permissions: [],
  },
  permissions: {
    method: 'GET',
    title: '권한 목록',
    url: `${apiBackendRoutesPrefix}/permissions`,
    permissions: [1, 3],
  },
};

export const apiBaseUrl = 'http://localhost:3000';
export const apiRoutesPrefix = '/api';
export const apiRoutes = {
  info: {
    method: 'GET',
    title: '사이트 정보',
    url: `${apiRoutesPrefix}/info`,
  },
  banners: {
    method: 'GET',
    title: '배너 목록',
    url: `${apiRoutesPrefix}/banners/:groupId`,
  },
  contents: {
    method: 'GET',
    title: '게시판 목록',
    url: `${apiRoutesPrefix}/contents/:groupId`,
  },
  contentDetail: {
    method: 'GET',
    title: '게시글 상세',
    url: `${apiRoutesPrefix}/contents/:groupId/:contentId`,
  },
  contentLike: {
    method: 'POST',
    title: '게시글 좋아요',
    url: `${apiRoutesPrefix}/contents/:groupId/:contentId/like`,
  },
};

export const backendRoutesPrefix = '/admin';
export const backendRoutesLayout = 'layouts/backend/layout';
export const backendRoutesNonHeaderLayout = 'layouts/backend/layoutNonHeader';
export const backendRoutes: { [key: string]: IRoute } = {
  index: {
    method: 'GET',
    title: '관리 시스템 홈',
    url: `${backendRoutesPrefix}/`,
    view: 'backend/index',
    layout: backendRoutesLayout,
    permissions: [],
  },
  error: {
    method: 'GET',
    title: 'ERROR',
    url: `${backendRoutesPrefix}/error`,
    view: 'backend/error',
    layout: backendRoutesNonHeaderLayout,
    permissions: [],
  },
  // 대시보드
  dashboard: {
    method: 'GET',
    title: '대시보드',
    url: `${backendRoutesPrefix}/dashboard`,
    view: 'backend/dashboard',
    layout: backendRoutesLayout,
    permissions: [1, 6],
  },
  // 배너 관리
  banners: {
    method: 'GET',
    title: '배너 목록',
    url: `${backendRoutesPrefix}/banners`,
    view: 'backend/banners/list',
    layout: backendRoutesLayout,
    permissions: [1, 5],
  },
  bannerWrite: {
    method: 'GET',
    title: '배너 등록',
    url: `${backendRoutesPrefix}/banners/write`,
    view: 'backend/banners/write',
    layout: backendRoutesLayout,
    permissions: [1, 5],
  },
  bannerDetail: {
    method: 'GET',
    title: '배너 상세',
    url: `${backendRoutesPrefix}/banners/:bannerId`,
    view: 'backend/banners/detail',
    layout: backendRoutesLayout,
    permissions: [1, 5],
  },
  bannerUpdate: {
    method: 'GET',
    title: '배너 수정',
    url: `${backendRoutesPrefix}/banners/:bannerId/update`,
    view: 'backend/banners/update',
    layout: backendRoutesLayout,
    permissions: [1, 5],
  },
  // 배너 관리: 화면 관리
  screenBanners: {
    method: 'GET',
    title: '배너 관리',
    url: `${backendRoutesPrefix}/banners/screens`,
    view: 'backend/banners/screen',
    layout: backendRoutesLayout,
    permissions: [1, 5],
  },
  // 배너 관리: 팝업 관리
  popupBanners: {
    method: 'GET',
    title: '팝업 관리',
    url: `${backendRoutesPrefix}/banners/popups`,
    view: 'backend/banners/popup',
    layout: backendRoutesLayout,
    permissions: [1, 5],
  },
  // 게시판 관리
  contents: {
    method: 'GET',
    title: '게시판 관리',
    url: `${backendRoutesPrefix}/contents/:groupId`,
    view: 'backend/contents/list',
    layout: backendRoutesLayout,
    permissions: [1, 4],
  },
  contentWrite: {
    method: 'GET',
    title: '게시글 작성',
    url: `${backendRoutesPrefix}/contents/:groupId/write`,
    view: 'backend/contents/write',
    layout: backendRoutesLayout,
    permissions: [1, 4],
  },
  contentDetail: {
    method: 'GET',
    title: '게시글 상세',
    url: `${backendRoutesPrefix}/contents/:groupId/:contentId`,
    view: 'backend/contents/detail',
    layout: backendRoutesLayout,
    permissions: [1, 4],
  },
  contentUpdate: {
    method: 'GET',
    title: '게시글 수정',
    url: `${backendRoutesPrefix}/contents/:groupId/:contentId/update`,
    view: 'backend/contents/update',
    layout: backendRoutesLayout,
    permissions: [1, 4],
  },
  // 사이트관리
  employeeRegist: {
    method: 'GET',
    title: '관리자 등록',
    url: `${backendRoutesPrefix}/employees/regist`,
    view: 'backend/employees/regist',
    layout: backendRoutesLayout,
    permissions: [1, 2],
  },
  employeeDetail: {
    method: 'GET',
    title: '관리자 상세 정보',
    url: `${backendRoutesPrefix}/employees/:employeeId`,
    view: 'backend/employees/detail',
    layout: backendRoutesLayout,
    permissions: [1, 2],
  },
  employeeUpdate: {
    method: 'GET',
    title: '관리자 정보 수정',
    url: `${backendRoutesPrefix}/employees/:employeeId/update`,
    view: 'backend/employees/update',
    layout: backendRoutesLayout,
    permissions: [1, 2],
  },
  employeeUpdatePassword: {
    method: 'GET',
    title: '관리자 비밀번호 수정',
    url: `${backendRoutesPrefix}/employees/:employeeId/update-password`,
    view: 'backend/employees/update-password',
    layout: backendRoutesLayout,
    permissions: [1, 2],
  },
  employeeDelete: {
    method: 'GET',
    title: '관리자 삭제',
    url: `${backendRoutesPrefix}/employees/:employeeId/delete`,
    view: 'backend/employees/delete',
    layout: backendRoutesLayout,
    permissions: [1, 2],
  },
  employeePermissions: {
    method: 'GET',
    title: '관리자 권한 변경',
    url: `${backendRoutesPrefix}/employees/:employeeId/permissions`,
    view: 'backend/employees/permissions',
    layout: backendRoutesLayout,
    permissions: [1, 3],
  },
  employees: {
    method: 'GET',
    title: '관리자 목록',
    url: `${backendRoutesPrefix}/employees`,
    view: 'backend/employees/list',
    layout: backendRoutesLayout,
    permissions: [1, 2],
  },
  employeeLogin: {
    method: 'GET',
    title: '관리자 로그인',
    url: `${backendRoutesPrefix}/employees/login`,
    view: 'backend/employees/login',
    layout: backendRoutesNonHeaderLayout,
    permissions: [],
  },
  employeeForgotPassword: {
    method: 'GET',
    title: '비밀번호 찾기',
    url: `${backendRoutesPrefix}/employees/forgot-password`,
    view: 'backend/employees/forgot-password',
    layout: backendRoutesNonHeaderLayout,
    permissions: [],
  },
};

export const frontendRoutesPrefix = '';
export const frontendRoutesLayout = 'layouts/frontend/layout';
export const frontendRoutes: { [key: string]: IRoute } = {
  index: {
    method: 'GET',
    title: '홈',
    url: `${frontendRoutesPrefix}/`,
    view: 'frontend/index',
    layout: frontendRoutesLayout,
    permissions: [],
  },
  error: {
    method: 'GET',
    title: 'ERROR',
    url: `${frontendRoutesPrefix}/error`,
    view: 'frontend/error',
    layout: frontendRoutesLayout,
    permissions: [],
  },
};
