import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Middleware: Verify JWT and attach the authenticated user to req.user.
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Provide a Bearer token.',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      logger.error('JWT_SECRET is not set in environment variables.');
      res.status(500).json({
        success: false,
        message: 'Server configuration error.',
        code: 'SERVER_ERROR',
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN',
      });
    } else {
      next(error);
    }
  }
};

/**
 * Middleware factory: Require a specific role (or multiple).
 * Must be used AFTER requireAuth.
 */
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
};
