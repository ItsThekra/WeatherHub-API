// src/controllers/auth.controller.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

// Generate JWT
const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id }, secret, expiresIn ? { expiresIn: expiresIn as any } : undefined);
};

// F1: /auth/signup
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(409); // Conflict
        throw new Error('User already exists');
    }

    const user = await User.create({ email, passwordHash: password });

    if (user) {
      res.status(201).json({
        success: true,
        data: { token: generateToken(String(user._id)) },
      });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
  } catch (error: any) {
   res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

// F2: /auth/signin
export const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.status(200).json({
        success: true,
        data: { token: generateToken(String(user._id)) },
      });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

// F3: /auth/signout
// Based on the PRD, we rely on short JWT TTL. A blacklist is more complex.
// If a blacklist were implemented, this is where the token would be added to it.
export const signout = (req: Request, res: Response) => {
  // With JWT, true sign-out is handled client-side by deleting the token.
  // The server can't force a token to expire. A blacklist is the server-side solution.
  // For this project, we confirm the action and rely on the token's expiration.
  res.status(200).json({ 
    success: true, 
    data: { message: 'Signed out successfully. Please discard the token.' }
  });
};