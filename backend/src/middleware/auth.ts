import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/prisma';
import { UnauthorizedError } from '../utils/errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: string;
  careerCategory: string;
  communicationStyle: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. No token provided.');
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    if (!decoded || !decoded.userId) {
      throw new UnauthorizedError('Invalid authentication token.');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        preferredLanguage: true,
        careerCategory: true,
        communicationStyle: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User session expired or user no longer exists.');
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Invalid or expired authentication token.'));
    } else {
      next(error);
    }
  }
};
