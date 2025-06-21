// src/routes/auth.routes.ts
import { Router } from 'express';
import { signup, signin, signout } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', protect, signout);

export default router;