import { Request, Response, Router } from 'express';
import { ApiAdminController } from '../../controllers/api/adminController';

const router: Router = Router();

router.post('/admin/regist', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiAdminController();
    adminApiController.regist(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.post('/admin/login', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiAdminController();
    adminApiController.login(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.patch('/admin/employee/:employeeId/modify', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiAdminController();
    adminApiController.modify(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.delete('/admin/employee/:employeeId/delete', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiAdminController();
    adminApiController.delete(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

export default router;