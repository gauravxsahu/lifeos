import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { aiService } from '../services/aiService';
import {
  aiReminderSchema,
  aiStoryPersonalizationSchema,
  aiGoalSuggestionSchema,
} from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';

export const generateReminder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = aiReminderSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid reminder request payload', validated.error.flatten());
    }

    const userId = req.user!.id;
    const { packageName, usageMinutes, thresholdMinutes, forceFallback } = validated.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preference: true,
        monitoredApps: { where: { packageName } },
        goals: { where: { isActive: true } },
      },
    });

    if (!user) throw new NotFoundError('User not found');

    const appName = user.monitoredApps[0]?.displayName || packageName;

    // Filter incomplete goals for today
    const unfinishedGoals = user.goals.map((g) => ({
      id: g.id,
      title: g.title,
      targetValue: g.targetValue,
      targetUnit: g.targetUnit,
    }));

    const reminder = await aiService.generateReminder(
      {
        userName: user.displayName,
        language: user.preferredLanguage,
        careerCategory: user.careerCategory,
        communicationStyle: user.communicationStyle,
        packageName,
        appName,
        usageMinutes,
        thresholdMinutes,
        unfinishedGoals,
      },
      forceFallback
    );

    // Record intervention in DB
    const intervention = await prisma.intervention.create({
      data: {
        userId,
        packageName,
        thresholdMinutes,
        interventionType: 'USAGE_THRESHOLD',
        deliveryMode: user.preference?.deliveryMode || 'TEXT_ONLY',
        status: 'DELIVERED',
        triggeredAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        interventionId: intervention.id,
        reminder,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const personalizeStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = aiStoryPersonalizationSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid story personalization payload', validated.error.flatten());
    }

    const { storyId, preferredLanguage } = validated.data;
    const story = await prisma.motivationalStory.findUnique({
      where: { id: storyId },
      include: { sources: true },
    });

    if (!story) throw new NotFoundError('Story not found');

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { goals: { where: { isActive: true }, take: 1 } },
    });

    const activeGoal = user?.goals[0];
    const lang = preferredLanguage || user?.preferredLanguage || 'en';

    // Personalize actionable bridge connecting verified story with user's actual goal
    let connectedAction = `Connect this lesson: Spend 20 minutes making progress on your current objectives today.`;
    if (activeGoal) {
      connectedAction = `Connect this lesson: Spend 20 minutes taking one concrete step on "${activeGoal.title}".`;
    }

    res.json({
      success: true,
      data: {
        story,
        language: lang,
        personalizedBridge: connectedAction,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const suggestGoalRescue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = aiGoalSuggestionSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid goal suggestion payload', validated.error.flatten());
    }

    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        goals: {
          where: { isActive: true },
          include: {
            completions: {
              where: { completionDate: new Date().toISOString().split('T')[0] },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundError('User not found');

    // Identify unfinished goals
    const unfinished = user.goals.filter((g) => {
      const comp = g.completions[0];
      return !comp || !comp.isCompleted;
    });

    if (unfinished.length === 0) {
      return res.json({
        success: true,
        data: {
          hasPendingGoals: false,
          message: 'All daily goals completed! Enjoy your evening or rest.',
          suggestedGoal: null,
        },
      });
    }

    // Pick top priority goal
    const targetGoal = unfinished.find((g) => g.priority === 'HIGH') || unfinished[0];
    const suggestedMinutes = Math.min(25, validated.data.timeAvailableMinutes);

    res.json({
      success: true,
      data: {
        hasPendingGoals: true,
        pendingCount: unfinished.length,
        suggestedGoal: {
          id: targetGoal.id,
          title: targetGoal.title,
          category: targetGoal.category,
          suggestedMinutes,
        },
        rescueMessage: `You still have ${unfinished.length} pending goal${unfinished.length > 1 ? 's' : ''}. How about spending just ${suggestedMinutes} minutes on "${targetGoal.title}" right now?`,
      },
    });
  } catch (err) {
    next(err);
  }
};
