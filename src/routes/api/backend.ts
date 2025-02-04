import { Request, Response, Router } from 'express';
import { ApiBackendController } from '../../controllers/api/backendController';

const router: Router = Router();

router.post('/admin/regist', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiBackendController();
    adminApiController.employeeRegist(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.post('/admin/login', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiBackendController();
    adminApiController.employeeLogin(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.patch('/admin/employee/:employeeId/modify', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiBackendController();
    adminApiController.employeeUpdate(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.delete('/admin/employee/:employeeId/delete', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiBackendController();
    adminApiController.employeeDelete(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

export default router;