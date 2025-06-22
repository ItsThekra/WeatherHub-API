// src/server.ts
import express, {  Request, Response } from "express"
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import cors from 'cors';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const windowMinutes = process.env.RATE_LIMIT_WINDOW_MINUTES ? parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) : 15;
const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : 100;

const limiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.'
    }
  }
});

app.use(limiter);

import authRoutes from './routes/auth.routes';
import weatherRoutes from './routes/weather.routes';
import historyRoutes from './routes/history.routes';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/history', historyRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { message: "WeatherHub API - Welcome!" },
  })
})
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('unhandledRejection', (err: unknown) => {
  if (err && typeof err === 'object' && 'message' in err) {
  
    console.log(`Error: ${err.message}`);
  } else {
    console.log('Unhandled rejection', err);
  }
});