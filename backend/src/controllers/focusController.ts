import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { focusSessionCreateSchema, focusSessionUpdateSchema } from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';

export const startFocusSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = focusSessionCreateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid session start data', validated.error.flatten());
    }

    const userId = req.user!.id;
    const { goalId, durationSeconds } = validated.data;

    // Check if goal belongs to user if provided
    if (goalId) {
      const goal = await prisma.dailyGoal.findFirst({
        where: { id: goalId, userId },
      });
      if (!goal) throw new NotFoundError('Associated goal not found');
    }

    const session = await prisma.focusSession.create({
      data: {
        userId,
        goalId: goalId || null,
        durationSeconds,
        actualDurationSeconds: 0,
        status: 'RUNNING',
        startedAt: new Date(),
      },
      include: { goal: true },
    });

    res.status(201).json({
      success: true,
      data: { session },
    });
  } catch (err) {
    next(err);
  }
};

export const getFocusSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status, limit } = req.query;

    const whereClause: any = { userId };
    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    const take = limit ? Math.min(100, parseInt(limit as string, 10)) : 30;

    const sessions = await prisma.focusSession.findMany({
      where: whereClause,
      include: { goal: true },
      orderBy: { startedAt: 'desc' },
      take,
    });

    // Compute stats
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
    const totalFocusSeconds = completedSessions.reduce((sum, s) => sum + s.actualDurationSeconds, 0);

    res.json({
      success: true,
      data: {
        totalFocusMinutes: Math.round(totalFocusSeconds / 60),
        totalCompletedSessions: completedSessions.length,
        sessions,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateFocusSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const validated = focusSessionUpdateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid session update payload', validated.error.flatten());
    }

    const session = await prisma.focusSession.findFirst({
      where: { id, userId },
    });
    if (!session) throw new NotFoundError('Focus session not found');

    const dataToUpdate: any = {};
    if (validated.data.actualDurationSeconds !== undefined) {
      dataToUpdate.actualDurationSeconds = validated.data.actualDurationSeconds;
    }
    if (validated.data.status) {
      dataToUpdate.status = validated.data.status;
      if (validated.data.status === 'COMPLETED' || validated.data.status === 'CANCELLED') {
        dataToUpdate.completedAt = new Date();
      }
    }

    const updated = await prisma.focusSession.update({
      where: { id },
      data: dataToUpdate,
      include: { goal: true },
    });

    res.json({
      success: true,
      data: { session: updated },
    });
  } catch (err) {
    next(err);
  }
};
