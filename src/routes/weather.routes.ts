// src/routes/weather.routes.ts
import { Router } from 'express';
import { getWeather } from '../controllers/weather.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getWeather);

export default router;