import { IApiRoute, IApiRoutes, IRoute, IRoutes } from '../types/object';

export const apiBaseUrl = 'http://localhost:3000';
export const apiRoutesPrefix = '/api';

const createApiRoute = (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  title: string,
  path: string,
  permissions: number[]
): IApiRoute => ({
  method,
  title,
  url: `${apiRoutesPrefix}${path}`,
  permissions,
});

const createRoute = (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  title: string,
  path: string,
  view: string,
  layout: string,
  permissions: number[]
): IRoute => ({
  method,
  title,
  url: `${path}`,
  view,
  layout,
  permissions,
});

export const apiRoutes = {
  banners: {
    list: createApiRoute('GET', '배너 목록', '/banners', [1, 5]),
    write: createApiRoute('POST', '배너 등록', '/banners/write', [1, 5]),
    detail: createApiRoute('GET', '배너 상세 정보', '/banners/:bannerId', [1, 5]),
    update: createApiRoute('PUT', '배너 수정', '/banners/:bannerId', [1, 5]),
    delete: createApiRoute('DELETE', '배너 삭제', '/banners/:bannerId', [1, 5]),
    group: createApiRoute('GET', '배너 그룹 정보', '/banners/groups/:groupId', [1, 5]),
    screen: createApiRoute('GET', '배너 화면 정보', '/banners/screens', [1, 5]),
    popup: createApiRoute('GET', '배너 팝업 정보', '/banners/popups', [1, 5]),
  },
  contents: {
    list: createApiRoute('GET', '게시판 관리', '/contents/:groupId', [1, 4]),
    write: createApiRoute('POST', '게시글 작성', '/contents/:groupId/write', [1, 4]),
    detail: createApiRoute('GET', '게시글 상세', '/contents/:groupId/:contentId', [1, 4]),
    update: createApiRoute('PUT', '게시글 수정', '/contents/:groupId/:contentId', [1, 4]),
    delete: createApiRoute('DELETE', '게시글 삭제', '/contents/:groupId/:contentId', [1, 4]),
    group: createApiRoute('GET', '게시판 그룹 정보', '/contents/groups/:groupId', [1, 4]),
  },
  employees: {
    list: createApiRoute('GET', '관리자 목록', '/employees', [1, 2]),
    regist: createApiRoute('POST', '관리자 등록', '/employees/regist', [1, 2]),
    detail: createApiRoute('GET', '관리자 상세 정보', '/employees/:employeeId', [1, 2]),
    update: createApiRoute('PUT', '관리자 정보 수정', '/employees/:employeeId', [1, 2]),
    updatePassword: createApiRoute('PATCH', '관리자 비밀번호 수정', '/employees/:employeeId/password', [1, 2]),
    delete: createApiRoute('DELETE', '관리자 삭제', '/employees/:employeeId', [1, 2]),
    permissions: createApiRoute('PATCH', '관리자 권한 등록/수정', '/employees/:employeeId/permissions', [1, 3]),
    login: createApiRoute('POST', '관리자 로그인', '/employees/login', [1, 2]),
    logout: createApiRoute('POST', '관리자 로그아웃', '/employees/logout', [1, 2]),
  },

  permissions: createApiRoute('GET', '권한 목록', '/permissions', [1, 3]),
};

export const backendRoutesPrefix = '/admin';
export const backendRoutesLayout = 'layouts/backend/layout';
export const backendRoutesNonHeaderLayout = 'layouts/backend/layoutNonHeader';
export const backendRoutes = {
  index: createRoute('GET', '관리 시스템 홈', `${backendRoutesPrefix}/`, 'backend/index', backendRoutesLayout, []),
  error: createRoute('GET', 'ERROR', '/error', `${backendRoutesPrefix}/error`, backendRoutesNonHeaderLayout, []),
  // 대시보드
  dashboard: createRoute(
    'GET',
    '대시보드',
    `${backendRoutesPrefix}/dashboard`,
    'backend/dashboard',
    backendRoutesLayout,
    [1, 6]
  ),
  // 배너 관리
  banners: {
    list: createRoute(
      'GET',
      '배너 목록',
      `${backendRoutesPrefix}/banners`,
      'backend/banners/list',
      backendRoutesLayout,
      [1, 5]
    ),
    write: createRoute(
      'GET',
      '배너 등록',
      `${backendRoutesPrefix}/banners/write`,
      'backend/banners/write',
      backendRoutesLayout,
      [1, 5]
    ),
    detail: createRoute(
      'GET',
      '배너 상세',
      `${backendRoutesPrefix}/banners/:bannerId`,
      'backend/banners/detail',
      backendRoutesLayout,
      [1, 5]
    ),
    update: createRoute(
      'GET',
      '배너 수정',
      `${backendRoutesPrefix}/banners/:bannerId/update`,
      'backend/banners/update',
      backendRoutesLayout,
      [1, 5]
    ),
    screens: createRoute(
      'GET',
      '배너 관리',
      `${backendRoutesPrefix}/banners/screens`,
      'backend/banners/screen',
      backendRoutesLayout,
      [1, 5]
    ),
    popups: createRoute(
      'GET',
      '팝업 관리',
      `${backendRoutesPrefix}/banners/popups`,
      'backend/banners/popup',
      backendRoutesLayout,
      [1, 5]
    ),
  },
  // 게시판 관리
  contents: {
    list: createRoute(
      'GET',
      '게시판 관리',
      `${backendRoutesPrefix}/contents/:groupId`,
      'backend/contents/list',
      backendRoutesLayout,
      [1, 4]
    ),
    write: createRoute(
      'GET',
      '게시글 작성',
      `${backendRoutesPrefix}/contents/:groupId/write`,
      'backend/contents/write',
      backendRoutesLayout,
      [1, 4]
    ),
    detail: createRoute(
      'GET',
      '게시글 상세',
      `${backendRoutesPrefix}/contents/:groupId/:contentId`,
      'backend/contents/detail',
      backendRoutesLayout,
      [1, 4]
    ),
    update: createRoute(
      'GET',
      '게시글 수정',
      `${backendRoutesPrefix}/contents/:groupId/:contentId/update`,
      'backend/contents/update',
      backendRoutesLayout,
      [1, 4]
    ),
  },
  // 사이트관리
  employees: {
    list: createRoute(
      'GET',
      '관리자 목록',
      `${backendRoutesPrefix}/employees`,
      'backend/employees/list',
      backendRoutesLayout,
      [1, 2]
    ),
    regist: createRoute(
      'GET',
      '관리자 등록',
      `${backendRoutesPrefix}/employees/regist`,
      'backend/employees/regist',
      backendRoutesLayout,
      [1, 2]
    ),
    detail: createRoute(
      'GET',
      '관리자 상세 정보',
      `${backendRoutesPrefix}/employees/:employeeId`,
      'backend/employees/detail',
      backendRoutesLayout,
      [1, 2]
    ),
    update: createRoute(
      'GET',
      '관리자 정보 수정',
      `${backendRoutesPrefix}/employees/:employeeId/update`,
      'backend/employees/update',
      backendRoutesLayout,
      [1, 2]
    ),
    updatePassword: createRoute(
      'GET',
      '관리자 비밀번호 수정',
      `${backendRoutesPrefix}/employees/:employeeId/update-password`,
      'backend/employees/update-password',
      backendRoutesLayout,
      [1, 2]
    ),
    delete: createRoute(
      'GET',
      '관리자 삭제',
      `${backendRoutesPrefix}/employees/:employeeId/delete`,
      'backend/employees/delete',
      backendRoutesLayout,
      [1, 2]
    ),
    permissions: createRoute(
      'GET',
      '관리자 권한 변경',
      `${backendRoutesPrefix}/employees/:employeeId/permissions`,
      'backend/employees/permissions',
      backendRoutesLayout,
      [1, 3]
    ),
    login: createRoute(
      'GET',
      '관리자 로그인',
      `${backendRoutesPrefix}/employees/login`,
      'backend/employees/login',
      backendRoutesNonHeaderLayout,
      []
    ),
    logout: createRoute(
      'GET',
      '관리자 로그아웃',
      `${backendRoutesPrefix}/employees/logout`,
      'backend/employees/logout',
      backendRoutesNonHeaderLayout,
      []
    ),
    forgotPassword: createRoute(
      'GET',
      '관리자 비밀번호 찾기',
      `${backendRoutesPrefix}/employees/forgot-password`,
      'backend/employees/forgot-password',
      backendRoutesNonHeaderLayout,
      []
    ),
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
  about: {
    method: 'GET',
    title: '법무법인 소개',
    url: `${frontendRoutesPrefix}/about`,
    view: 'frontend/about',
    layout: frontendRoutesLayout,
    permissions: [],
  },
  services: {
    method: 'GET',
    title: '업무분야',
    url: `${frontendRoutesPrefix}/services`,
    view: 'frontend/services',
    layout: frontendRoutesLayout,
    permissions: [],
  },
  results: {
    method: 'GET',
    title: '성공사례',
    url: `${frontendRoutesPrefix}/results`,
    view: 'frontend/results',
    layout: frontendRoutesLayout,
    permissions: [],
  },
  qna: {
    method: 'GET',
    title: 'Q&A',
    url: `${frontendRoutesPrefix}/qna`,
    view: 'frontend/qna',
    layout: frontendRoutesLayout,
    permissions: [],
  },
  contact: {
    method: 'GET',
    title: '상담 및 의뢰',
    url: `${frontendRoutesPrefix}/contact`,
    view: 'frontend/contact',
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
