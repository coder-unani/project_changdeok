import { AdminController } from '../controllers/adminController';
import { Router } from 'express';

const router: Router = Router();

/**
  * 
  * 
  * /admin/{userId}/delete POST - 회원탈퇴 처리
  * /admin/{userId}/list GET - 회원 목록 페이지
  * /admin/{userId}/detail GET - 회원 상세 페이지
  * /admin/{userId}/detail POST - 회원 상세 처리
  * /admin/permission GET - 권한 부여 페이지
  * /admin/permission POST - 권한 부여 처리
 **/

const adminController = new AdminController();

// admin GET - 관리자 홈
router.get('/', function (req, res) {
  adminController.index(req, res);
});

// admin/regist GET - 회원가입 페이지
// admin/regist POST - 회원가입 처리 (API)
router.get('/employee/regist', function (req, res) {
  adminController.regist(req, res);
});

// admin/login GET - 로그인 페이지
// admin/login POST - 로그인 처리 (API)
router.get('/employee/login', function (req, res) {
  adminController.login(req, res);
});

// admin/{userId}/logout POST - 로그아웃 처리
// TODO: 로그인 이력 관리 테이블 생성 후 처리 예정

// admin/{userId}/modify GET - 회원정보 수정 페이지
// admin/{userId}/modify PATCH - 회원정보 수정 처리 (API)
router.get('/employee/:employeeId/modify', function (req, res) {
  adminController.modify(req, res);
});

export default router;