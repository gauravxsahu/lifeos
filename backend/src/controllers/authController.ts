import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config/env';
import { registerSchema, loginSchema } from '../utils/validation';
import { ValidationError, UnauthorizedError } from '../utils/errors';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = registerSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid registration data', validated.error.flatten());
    }

    const { email, password, displayName, preferredLanguage, careerCategory, communicationStyle } = validated.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'An account with this email already exists.', statusCode: 409 },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        preferredLanguage,
        careerCategory,
        communicationStyle,
        preference: {
          create: {
            deliveryMode: 'TEXT_ONLY',
            voiceAssistantEnabled: true,
            voiceRemindersEnabled: false,
            spokenStoriesEnabled: false,
            speakingRate: 1.0,
            notificationSoundEnabled: true,
            quietHoursStart: '22:00',
            quietHoursEnd: '07:00',
            timeZone: 'UTC',
            reminderFrequencyLimit: 30,
          },
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        preferredLanguage: true,
        careerCategory: true,
        communicationStyle: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid login data', validated.error.flatten());
    }

    const { email, password } = validated.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { preference: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('access_token');
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        preference: true,
        devices: true,
        _count: {
          select: {
            goals: { where: { isActive: true } },
            monitoredApps: { where: { isEnabled: true } },
            savedStories: true,
          },
        },
      },
    });

    if (!user) throw new UnauthorizedError('User not found');
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      success: true,
      data: { user: safeUser },
    });
  } catch (err) {
    next(err);
  }
};
