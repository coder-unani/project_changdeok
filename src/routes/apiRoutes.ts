import { Request, Response, Router } from 'express';
import { AdminApiController } from '../controllers/adminApiController';

const router: Router = Router();

router.post('/admin/regist', function (req: Request, res: Response) {
  try {
    const adminApiController = new AdminApiController();
    adminApiController.regist(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.post('/admin/login', function (req: Request, res: Response) {
  try {
    const adminApiController = new AdminApiController();
    adminApiController.login(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

export default router;