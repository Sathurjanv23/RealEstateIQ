import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { audit } from '../utils/auditLogger';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ userId }, secret, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      next(createError('An account with this email already exists.', 409, 'EMAIL_EXISTS'));
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ name, email, passwordHash, role: 'USER' });

    await audit({
      userId: user._id.toString(),
      action: 'USER_REGISTER',
      resource: 'users',
      resourceId: user._id.toString(),
      ipAddress: req.ip as string | undefined,
    });

    const token = generateToken(user._id.toString());
    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      next(createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      next(createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
      return;
    }

    const token = generateToken(user._id.toString());

    await audit({
      userId: user._id.toString(),
      action: 'USER_LOGIN',
      resource: 'auth',
      ipAddress: req.ip as string | undefined,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user) {
      await audit({
        userId: req.user._id.toString(),
        action: 'USER_LOGOUT',
        resource: 'auth',
        ipAddress: req.ip as string | undefined,
      });
    }
    res.json({ success: true, data: { message: 'Logged out successfully.' } });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(createError('Not authenticated.', 401, 'AUTH_REQUIRED'));
      return;
    }
    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};


