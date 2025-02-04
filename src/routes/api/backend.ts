import { Request, Response, Router } from 'express';
import { ApiBackendController } from '../../controllers/api/backendController';

const router: Router = Router();

router.post('/employee/regist', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiBackendController();
    adminApiController.employeeRegist(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.post('/employee/login', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiBackendController();
    adminApiController.employeeLogin(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.patch('/employee/:employeeId/update', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiBackendController();
    adminApiController.employeeUpdate(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

router.delete('/employee/:employeeId/delete', (req: Request, res: Response) => {
  try {
    const adminApiController = new ApiBackendController();
    adminApiController.employeeDelete(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  }
});

export default router;