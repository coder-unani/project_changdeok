import { IApiRoute, IApiRoutes, IRoute, IRoutes } from '../types/config';

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
  health: createApiRoute('GET', '헬스 체크', '/health', []),
  banners: {
    list: createApiRoute('GET', '배너 목록', '/banners', []),
    write: createApiRoute('POST', '배너 등록', '/banners/write', [1, 2]),
    detail: createApiRoute('GET', '배너 상세 정보', '/banners/:bannerId', [1, 2]),
    update: createApiRoute('PUT', '배너 수정', '/banners/:bannerId', [1, 2]),
    delete: createApiRoute('DELETE', '배너 삭제', '/banners/:bannerId', [1, 2]),
    group: createApiRoute('GET', '배너 그룹 정보', '/banners/groups/:groupIds', [1, 2]),
    screen: createApiRoute('GET', '배너 화면 정보', '/banners/screens', [1, 2]),
    popup: createApiRoute('GET', '배너 팝업 정보', '/banners/popups', [1, 2]),
  },
  contents: {
    list: createApiRoute('GET', '게시판 관리', '/contents/:groupId', [1, 3]),
    write: createApiRoute('POST', '게시글 작성', '/contents/:groupId/write', [1, 3]),
    detail: createApiRoute('GET', '게시글 상세', '/contents/:groupId/:contentId', [1, 3]),
    update: createApiRoute('PUT', '게시글 수정', '/contents/:groupId/:contentId', [1, 3]),
    delete: createApiRoute('DELETE', '게시글 삭제', '/contents/:groupId/:contentId', [1, 3]),
    group: createApiRoute('GET', '게시판 그룹 정보', '/contents/groups/:groupId', [1, 3]),
    updateGroup: createApiRoute('PUT', '게시판 그룹 수정', '/contents/groups/:groupId', [1, 3]),
    uploadImage: createApiRoute('POST', '게시글 이미지 업로드', '/contents/:groupId/upload-image', [1, 3]),
  },
  employees: {
    list: createApiRoute('GET', '관리자 목록', '/employees', [1, 4]),
    regist: createApiRoute('POST', '관리자 등록', '/employees/regist', [1, 4]),
    detail: createApiRoute('GET', '관리자 상세 정보', '/employees/:employeeId', [1, 4]),
    update: createApiRoute('PUT', '관리자 정보 수정', '/employees/:employeeId', [1, 4]),
    updatePassword: createApiRoute('PATCH', '관리자 비밀번호 수정', '/employees/:employeeId/password', [1, 4]),
    delete: createApiRoute('DELETE', '관리자 삭제', '/employees/:employeeId', [1, 4]),
    permissions: createApiRoute('PATCH', '관리자 권한 등록/수정', '/employees/:employeeId/permissions', [1, 4]),
    login: createApiRoute('POST', '관리자 로그인', '/employees/login', []),
    logout: createApiRoute('POST', '관리자 로그아웃', '/employees/logout', []),
    loginHistory: createApiRoute('GET', '관리자 로그인 히스토리', '/employees/login-history', [1, 4]),
  },
  permissions: createApiRoute('GET', '권한 목록', '/permissions', [1, 2]),
  stats: {
    visitor: createApiRoute('GET', '방문자 통계', '/stats/visitor', [1, 5]),
    dailyVisitor: createApiRoute('GET', '일일 방문자 통계', '/stats/daily-visitor', [1, 5]),
    pageView: createApiRoute('GET', '페이지뷰 통계', '/stats/page-view', [1, 5]),
    country: createApiRoute('GET', '국가별 통계', '/stats/country', [1, 5]),
    referrer: createApiRoute('GET', '유입처별 통계', '/stats/referrer', [1, 5]),
    hourly: createApiRoute('GET', '시간대별 통계', '/stats/hourly', [1, 5]),
    browser: createApiRoute('GET', '브라우저별 통계', '/stats/browser', [1, 5]),
    accessLogs: createApiRoute('GET', '접속 로그 통계', '/stats/access-logs', [1, 5]),
  },
  settings: {
    read: createApiRoute('GET', '설정 조회', '/settings', [1, 5]),
    updateSite: createApiRoute('PATCH', '사이트 설정 수정', '/settings/site', [1, 5]),
    updateCompany: createApiRoute('PATCH', '회사 설정 수정', '/settings/company', [1, 5]),
    updateAccess: createApiRoute('PATCH', '접속 제한 수정', '/settings/access', [1, 5]),
    updateSystem: createApiRoute('PATCH', '시스템 설정 수정', '/settings/system', [1, 5]),
  },
  systems: {
    restart: createApiRoute('POST', '서버 재시작', '/systems/restart', [1]),
    status: createApiRoute('GET', '서버 상태 확인', '/systems/status', [1]),
  },
};

export const backendRoutesPrefix = '/admin';
export const backendRoutesLayout = 'layouts/backend/layout';
export const backendRoutesNonHeaderLayout = 'layouts/backend/layoutNonHeader';
export const backendRoutes = {
  index: createRoute('GET', '관리 시스템 홈', `${backendRoutesPrefix}/`, 'backend/index', backendRoutesLayout, []),
  error: createRoute('GET', 'ERROR', '${backendRoutesPrefix}/error', `backend/error`, backendRoutesNonHeaderLayout, []),
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
      [1, 2]
    ),
    write: createRoute(
      'GET',
      '배너 등록',
      `${backendRoutesPrefix}/banners/write`,
      'backend/banners/write',
      backendRoutesLayout,
      [1, 2]
    ),
    detail: createRoute(
      'GET',
      '배너 상세',
      `${backendRoutesPrefix}/banners/:bannerId`,
      'backend/banners/detail',
      backendRoutesLayout,
      [1, 2]
    ),
    update: createRoute(
      'GET',
      '배너 수정',
      `${backendRoutesPrefix}/banners/:bannerId/update`,
      'backend/banners/update',
      backendRoutesLayout,
      [1, 2]
    ),
    screens: createRoute(
      'GET',
      '배너 관리',
      `${backendRoutesPrefix}/banners/screens`,
      'backend/banners/screen',
      backendRoutesLayout,
      [1, 2]
    ),
    popups: createRoute(
      'GET',
      '팝업 관리',
      `${backendRoutesPrefix}/banners/popups`,
      'backend/banners/popup',
      backendRoutesLayout,
      [1, 2]
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
      [1, 3]
    ),
    write: createRoute(
      'GET',
      '게시글 작성',
      `${backendRoutesPrefix}/contents/:groupId/write`,
      'backend/contents/write',
      backendRoutesLayout,
      [1, 3]
    ),
    detail: createRoute(
      'GET',
      '게시글 상세',
      `${backendRoutesPrefix}/contents/:groupId/:contentId`,
      'backend/contents/detail',
      backendRoutesLayout,
      [1, 3]
    ),
    update: createRoute(
      'GET',
      '게시글 수정',
      `${backendRoutesPrefix}/contents/:groupId/:contentId/update`,
      'backend/contents/update',
      backendRoutesLayout,
      [1, 3]
    ),
  },
  // 사이트관리
  employees: {
    list: createRoute(
      'GET',
      '관리자',
      `${backendRoutesPrefix}/employees`,
      'backend/employees/index',
      backendRoutesLayout,
      [1, 4]
    ),
    regist: createRoute(
      'GET',
      '관리자 등록',
      `${backendRoutesPrefix}/employees/regist`,
      'backend/employees/regist',
      backendRoutesLayout,
      [1, 4]
    ),
    detail: createRoute(
      'GET',
      '관리자 상세 정보',
      `${backendRoutesPrefix}/employees/:employeeId`,
      'backend/employees/detail',
      backendRoutesLayout,
      [1, 4]
    ),
    update: createRoute(
      'GET',
      '관리자 정보 수정',
      `${backendRoutesPrefix}/employees/:employeeId/update`,
      'backend/employees/update',
      backendRoutesLayout,
      [1, 4]
    ),
    updatePassword: createRoute(
      'GET',
      '관리자 비밀번호 변경',
      `${backendRoutesPrefix}/employees/:employeeId/update-password`,
      'backend/employees/update-password',
      backendRoutesLayout,
      [1, 4]
    ),
    delete: createRoute(
      'GET',
      '관리자 삭제',
      `${backendRoutesPrefix}/employees/:employeeId/delete`,
      'backend/employees/delete',
      backendRoutesLayout,
      [1, 4]
    ),
    permissions: createRoute(
      'GET',
      '관리자 권한 변경',
      `${backendRoutesPrefix}/employees/:employeeId/permissions`,
      'backend/employees/permissions',
      backendRoutesLayout,
      [1, 4]
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
  stats: createRoute(
    'GET',
    '접속 통계',
    `${backendRoutesPrefix}/stats`,
    'backend/stats/index',
    backendRoutesLayout,
    [1, 5]
  ),
  settings: createRoute(
    'GET',
    '설정',
    `${backendRoutesPrefix}/settings`,
    'backend/settings/index',
    backendRoutesLayout,
    [1, 5]
  ),
};

export const frontendRoutesPrefix = '';
export const frontendRoutesLayout = 'layouts/frontend/layout';
export const frontendRoutes = {
  index: createRoute('GET', '홈', `${frontendRoutesPrefix}/`, 'frontend/index', frontendRoutesLayout, []),
  about: createRoute(
    'GET',
    '법률 사무소 소개',
    `${frontendRoutesPrefix}/about`,
    'frontend/about',
    frontendRoutesLayout,
    []
  ),
  services: createRoute(
    'GET',
    '업무분야',
    `${frontendRoutesPrefix}/services`,
    'frontend/services',
    frontendRoutesLayout,
    []
  ),
  results: createRoute(
    'GET',
    '성공사례',
    `${frontendRoutesPrefix}/results`,
    'frontend/results',
    frontendRoutesLayout,
    []
  ),
  qna: createRoute('GET', 'Q&A', `${frontendRoutesPrefix}/qna`, 'frontend/qna', frontendRoutesLayout, []),
  contact: createRoute(
    'GET',
    '상담 및 의뢰',
    `${frontendRoutesPrefix}/contact`,
    'frontend/contact',
    frontendRoutesLayout,
    []
  ),
  error: createRoute('GET', 'ERROR', `${frontendRoutesPrefix}/error`, 'frontend/error', frontendRoutesLayout, []),
};
