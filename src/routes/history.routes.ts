// src/routes/history.routes.ts
import { Router } from 'express';
import { getHistory } from '../controllers/history.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getHistory);

export default router;