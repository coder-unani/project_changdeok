import { Router, Request, Response } from 'express';

const router: Router = Router();


router.get('/', (req: Request, res: Response) => {
  res.render('frontend/index', { title: 'Frontend Page' });
});

router.get('/error', (req: Request, res: Response) => {
  throw new Error('Test Error');
});

export default router;