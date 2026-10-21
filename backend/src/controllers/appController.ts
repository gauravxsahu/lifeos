import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import {
  appCreateSchema,
  appUpdateSchema,
  thresholdCreateSchema,
  thresholdUpdateSchema,
} from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';

export const getApps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apps = await prisma.monitoredApplication.findMany({
      where: { userId: req.user!.id },
      include: {
        thresholds: {
          orderBy: { thresholdMinutes: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: { apps },
    });
  } catch (err) {
    next(err);
  }
};

export const createApp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = appCreateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid app creation payload', validated.error.flatten());
    }

    const { packageName, displayName, dailyLimitMinutes } = validated.data;

    const existing = await prisma.monitoredApplication.findUnique({
      where: {
        userId_packageName: {
          userId: req.user!.id,
          packageName,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: 'Application is already monitored.', statusCode: 409 },
      });
    }

    // Default thresholds: 20m, 40m, 60m
    const app = await prisma.monitoredApplication.create({
      data: {
        userId: req.user!.id,
        packageName,
        displayName,
        dailyLimitMinutes,
        thresholds: {
          create: [
            { thresholdMinutes: 20, reminderMode: 'TEXT_ONLY', storyEnabled: true, voiceEnabled: false },
            { thresholdMinutes: 40, reminderMode: 'VOICE_AND_TEXT', storyEnabled: true, voiceEnabled: true },
            { thresholdMinutes: 60, reminderMode: 'SMART_COMPANION', storyEnabled: true, voiceEnabled: true },
          ],
        },
      },
      include: { thresholds: true },
    });

    res.status(201).json({
      success: true,
      data: { app },
    });
  } catch (err) {
    next(err);
  }
};

export const updateApp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = appUpdateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid update payload', validated.error.flatten());
    }

    const existing = await prisma.monitoredApplication.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) throw new NotFoundError('Monitored application not found');

    const updated = await prisma.monitoredApplication.update({
      where: { id },
      data: validated.data,
      include: { thresholds: true },
    });

    res.json({
      success: true,
      data: { app: updated },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteApp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.monitoredApplication.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) throw new NotFoundError('Monitored application not found');

    await prisma.monitoredApplication.delete({ where: { id } });

    res.json({
      success: true,
      data: { message: 'Application removed from monitoring' },
    });
  } catch (err) {
    next(err);
  }
};

// Thresholds Controllers
export const getAppThresholds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const app = await prisma.monitoredApplication.findFirst({
      where: { id, userId: req.user!.id },
      include: { thresholds: { orderBy: { thresholdMinutes: 'asc' } } },
    });

    if (!app) throw new NotFoundError('App not found');

    res.json({
      success: true,
      data: { thresholds: app.thresholds },
    });
  } catch (err) {
    next(err);
  }
};

export const createThreshold = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = thresholdCreateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid threshold payload', validated.error.flatten());
    }

    const app = await prisma.monitoredApplication.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!app) throw new NotFoundError('App not found');

    const threshold = await prisma.usageThreshold.create({
      data: {
        ...validated.data,
        monitoredApplicationId: id,
      },
    });

    res.status(201).json({
      success: true,
      data: { threshold },
    });
  } catch (err) {
    next(err);
  }
};

export const updateThreshold = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = thresholdUpdateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid update payload', validated.error.flatten());
    }

    const existing = await prisma.usageThreshold.findFirst({
      where: {
        id,
        monitoredApp: { userId: req.user!.id },
      },
    });
    if (!existing) throw new NotFoundError('Threshold not found');

    const updated = await prisma.usageThreshold.update({
      where: { id },
      data: validated.data,
    });

    res.json({
      success: true,
      data: { threshold: updated },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteThreshold = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.usageThreshold.findFirst({
      where: {
        id,
        monitoredApp: { userId: req.user!.id },
      },
    });
    if (!existing) throw new NotFoundError('Threshold not found');

    await prisma.usageThreshold.delete({ where: { id } });

    res.json({
      success: true,
      data: { message: 'Threshold removed successfully' },
    });
  } catch (err) {
    next(err);
  }
};
