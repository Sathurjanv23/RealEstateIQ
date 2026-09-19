import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { Otp } from '../models/Otp';
import { emailService } from '../services/emailService';
import { audit } from '../utils/auditLogger';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const googleAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential) {
      next(createError('Google credential token is required.', 400, 'MISSING_CREDENTIAL'));
      return;
    }

    let payload: any;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr: any) {
      logger.error(`Google token verification failed: ${verifyErr.message}`);
      next(createError('Invalid or expired Google token.', 401, 'INVALID_GOOGLE_TOKEN'));
      return;
    }

    if (!payload || !payload.email) {
      next(createError('Unable to extract user profile from Google token.', 400, 'INVALID_GOOGLE_PAYLOAD'));
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
        role: 'USER',
      });

      await audit({
        userId: user._id.toString(),
        action: 'USER_REGISTER',
        resource: 'users',
        resourceId: user._id.toString(),
        metadata: { provider: 'google' },
        ipAddress: req.ip as string | undefined,
      });
    }

    await audit({
      userId: user._id.toString(),
      action: 'USER_LOGIN',
      resource: 'auth',
      metadata: { provider: 'google' },
      ipAddress: req.ip as string | undefined,
    });

    const token = generateToken(user._id.toString());
    logger.info(`User logged in via Google OAuth: ${email}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Send Registration OTP ───────────────────────────────────────────────────
export const sendRegistrationOtp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, name } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      next(createError('An account with this email already exists.', 409, 'EMAIL_EXISTS'));
      return;
    }

    // Generate cryptographically random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any old OTPs for this email and save new one
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    // Send email via emailService
    await emailService.sendOtpEmail(normalizedEmail, otp, name);

    res.json({
      success: true,
      data: {
        message: 'A 6-digit verification code has been sent to your email.',
        expiresInSeconds: 600,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Verify OTP and Complete Registration ────────────────────────────────────
export const verifyOtpAndRegister = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      next(createError('An account with this email already exists.', 409, 'EMAIL_EXISTS'));
      return;
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      next(
        createError(
          'No verification code found or code has expired. Please request a new code.',
          400,
          'OTP_EXPIRED'
        )
      );
      return;
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      next(
        createError(
          'Verification code has expired. Please request a new code.',
          400,
          'OTP_EXPIRED'
        )
      );
      return;
    }

    if (otpRecord.otp !== otp.trim()) {
      next(
        createError(
          'Invalid verification code. Please check your email and try again.',
          400,
          'INVALID_OTP'
        )
      );
      return;
    }

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Hash password & create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'USER',
    });

    await audit({
      userId: user._id.toString(),
      action: 'USER_REGISTER',
      resource: 'users',
      resourceId: user._id.toString(),
      metadata: { verificationMethod: 'email_otp' },
      ipAddress: req.ip as string | undefined,
    });

    const token = generateToken(user._id.toString());
    logger.info(`User registered with verified OTP: ${normalizedEmail}`);

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




