import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { goalCreateSchema, goalUpdateSchema, goalCompletionSchema } from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';

export const getGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { isActive, category } = req.query;

    const whereClause: any = { userId };
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    if (category && typeof category === 'string') {
      whereClause.category = category;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const goals = await prisma.dailyGoal.findMany({
      where: whereClause,
      include: {
        completions: {
          where: { completionDate: todayStr },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    const enriched = goals.map((g) => {
      const todayCompletion = g.completions[0];
      return {
        ...g,
        isCompletedToday: todayCompletion ? todayCompletion.isCompleted : false,
        todayCompletedValue: todayCompletion ? todayCompletion.completedValue : 0,
      };
    });

    res.json({
      success: true,
      data: { goals: enriched },
    });
  } catch (err) {
    next(err);
  }
};

export const createGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = goalCreateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid goal data', validated.error.flatten());
    }

    const goal = await prisma.dailyGoal.create({
      data: {
        ...validated.data,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: { goal },
    });
  } catch (err) {
    next(err);
  }
};

export const getGoalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const goal = await prisma.dailyGoal.findFirst({
      where: { id, userId: req.user!.id },
      include: { completions: { orderBy: { completionDate: 'desc' }, take: 30 } },
    });

    if (!goal) throw new NotFoundError('Goal not found');

    res.json({
      success: true,
      data: { goal },
    });
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = goalUpdateSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid goal update data', validated.error.flatten());
    }

    const existing = await prisma.dailyGoal.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) throw new NotFoundError('Goal not found');

    const updated = await prisma.dailyGoal.update({
      where: { id },
      data: validated.data,
    });

    res.json({
      success: true,
      data: { goal: updated },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.dailyGoal.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) throw new NotFoundError('Goal not found');

    await prisma.dailyGoal.delete({ where: { id } });

    res.json({
      success: true,
      data: { message: 'Goal deleted successfully' },
    });
  } catch (err) {
    next(err);
  }
};

export const completeGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = goalCompletionSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid completion payload', validated.error.flatten());
    }

    const existingGoal = await prisma.dailyGoal.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existingGoal) throw new NotFoundError('Goal not found');

    const completionDate = validated.data.completionDate || new Date().toISOString().split('T')[0];
    const completedValue = validated.data.completedValue;
    const isCompleted = validated.data.isCompleted;

    const completion = await prisma.goalCompletion.upsert({
      where: {
        goalId_completionDate: {
          goalId: id,
          completionDate,
        },
      },
      update: {
        completedValue,
        isCompleted,
      },
      create: {
        goalId: id,
        completionDate,
        completedValue,
        isCompleted,
      },
    });

    res.json({
      success: true,
      data: { completion },
    });
  } catch (err) {
    next(err);
  }
};

export const getCompletions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const goal = await prisma.dailyGoal.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!goal) throw new NotFoundError('Goal not found');

    const completions = await prisma.goalCompletion.findMany({
      where: { goalId: id },
      orderBy: { completionDate: 'desc' },
      take: 60,
    });

    res.json({
      success: true,
      data: { completions },
    });
  } catch (err) {
    next(err);
  }
};
