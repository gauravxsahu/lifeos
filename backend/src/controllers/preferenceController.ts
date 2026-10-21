import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import {
  preferencesUpdateSchema,
  languageUpdateSchema,
  voiceUpdateSchema,
  notificationsUpdateSchema,
} from '../utils/validation';
import { ValidationError } from '../utils/errors';

export const getPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    let preference = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          userId,
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
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredLanguage: true,
        careerCategory: true,
        communicationStyle: true,
      },
    });

    res.json({
      success: true,
      data: {
        ...preference,
        preferredLanguage: user?.preferredLanguage || 'en',
        careerCategory: user?.careerCategory || 'Software Engineering',
        communicationStyle: user?.communicationStyle || 'FRIENDLY_FRIEND',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validated = preferencesUpdateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid preference data', validated.error.flatten());
    }

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: validated.data,
      create: {
        userId,
        ...validated.data,
      },
    });

    res.json({
      success: true,
      data: { preference: updated },
    });
  } catch (err) {
    next(err);
  }
};

export const updateLanguage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validated = languageUpdateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid language selection', validated.error.flatten());
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { preferredLanguage: validated.data.preferredLanguage },
      select: { id: true, preferredLanguage: true },
    });

    res.json({
      success: true,
      data: { preferredLanguage: updatedUser.preferredLanguage },
    });
  } catch (err) {
    next(err);
  }
};

export const updateVoiceSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validated = voiceUpdateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid voice settings', validated.error.flatten());
    }

    const updated = await prisma.userPreference.update({
      where: { userId },
      data: validated.data,
    });

    res.json({
      success: true,
      data: { preference: updated },
    });
  } catch (err) {
    next(err);
  }
};

export const updateNotificationSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validated = notificationsUpdateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid notification settings', validated.error.flatten());
    }

    const updated = await prisma.userPreference.update({
      where: { userId },
      data: validated.data,
    });

    res.json({
      success: true,
      data: { preference: updated },
    });
  } catch (err) {
    next(err);
  }
};

// Privacy & Data Rights
export const exportUserData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preference: true,
        devices: {
          include: { usageSummaries: true },
        },
        goals: {
          include: { completions: true },
        },
        monitoredApps: {
          include: { thresholds: true },
        },
        savedStories: {
          include: { story: true },
        },
        focusSessions: true,
        interventions: true,
      },
    });

    if (!user) throw new Error('User not found');
    const { passwordHash: _, ...safeUserExport } = user;

    res.json({
      success: true,
      data: { exportDate: new Date(), user: safeUserExport },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUsageData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const devices = await prisma.device.findMany({ where: { userId }, select: { id: true } });
    const deviceIds = devices.map((d) => d.id);

    await prisma.appUsageSummary.deleteMany({
      where: { deviceId: { in: deviceIds } },
    });

    res.json({
      success: true,
      data: { message: 'All device usage summaries have been purged permanently.' },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    await prisma.user.delete({ where: { id: userId } });
    res.clearCookie('access_token');
    res.json({
      success: true,
      data: { message: 'Account and associated records deleted permanently.' },
    });
  } catch (err) {
    next(err);
  }
};
