import { Router } from 'express';

import { BackendController } from '../../controllers/web/backendController';

const router: Router = Router();

/**
  * 
  * 
  * /admin/{userId}/list GET - 회원 목록 페이지
  * /admin/permission GET - 권한 부여 페이지
  * /admin/permission POST - 권한 부여 처리
 **/

// 라우트 경로
const ROUTE = {
  INDEX: '/',
  EMPLOYEE_LIST: '/employee',
  EMPLOYEE_REGIST: '/employee/regist',
  EMPLOYEE_LOGIN: '/employee/login',
  EMPLOYEE_UPDATE: '/employee/:employeeId/update',
  EMPLOYEE_DELETE: '/employee/:employeeId/delete',
}

// 컨트롤러
const backendController = new BackendController();

// 관리자 홈
router.get(ROUTE.INDEX, function (req, res) {
  backendController.index(req, res);
});

// 직원 등록
router.get(ROUTE.EMPLOYEE_REGIST, function (req, res) {
  backendController.regist(req, res);
});

// 직원 로그인
router.get(ROUTE.EMPLOYEE_LOGIN, function (req, res) {
  backendController.login(req, res);
});

// 직원 정보 수정
router.get(ROUTE.EMPLOYEE_UPDATE, function (req, res) {
  backendController.update(req, res);
});

// 직원 탈퇴
router.post(ROUTE.EMPLOYEE_DELETE, function (req, res) {
  backendController.delete(req, res);
});

// 직원 목록
router.get(ROUTE.EMPLOYEE_LIST, function (req, res) {
  backendController.list(req, res);
});


export default router;