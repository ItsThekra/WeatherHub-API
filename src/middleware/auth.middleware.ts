// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.model';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { id: string };

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!req.user) {
         res.status(401).json({ success: false, error: { code: 'NOT_AUTHORIZED', message: 'User not found.' } });
         return;
      }

      next();
      return;
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'JWT expired or malformed.' } });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'No token, authorization denied.' } });
    return;
  }
};