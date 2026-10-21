import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';

export const getStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, language } = req.query;
    const userId = req.user!.id;

    const whereClause: any = {};
    if (category && typeof category === 'string') {
      whereClause.careerCategory = { contains: category, mode: 'insensitive' };
    }
    if (language && typeof language === 'string') {
      whereClause.supportedLanguages = { has: language };
    }

    const stories = await prisma.motivationalStory.findMany({
      where: whereClause,
      include: {
        sources: true,
        savedByUsers: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = stories.map((s) => ({
      ...s,
      isSaved: s.savedByUsers.length > 0,
    }));

    res.json({
      success: true,
      data: { stories: enriched },
    });
  } catch (err) {
    next(err);
  }
};

export const getStoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const story = await prisma.motivationalStory.findUnique({
      where: { id },
      include: {
        sources: true,
        savedByUsers: { where: { userId } },
      },
    });

    if (!story) throw new NotFoundError('Story not found');

    res.json({
      success: true,
      data: {
        story: {
          ...story,
          isSaved: story.savedByUsers.length > 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const saveStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const story = await prisma.motivationalStory.findUnique({ where: { id } });
    if (!story) throw new NotFoundError('Story not found');

    const existing = await prisma.savedStory.findUnique({
      where: {
        userId_storyId: { userId, storyId: id },
      },
    });

    if (existing) {
      // Toggle off / unsave
      await prisma.savedStory.delete({
        where: { userId_storyId: { userId, storyId: id } },
      });
      return res.json({
        success: true,
        data: { isSaved: false, message: 'Story removed from saved collection' },
      });
    }

    await prisma.savedStory.create({
      data: { userId, storyId: id },
    });

    res.json({
      success: true,
      data: { isSaved: true, message: 'Story bookmarked to your library' },
    });
  } catch (err) {
    next(err);
  }
};

export const getSavedStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const saved = await prisma.savedStory.findMany({
      where: { userId },
      include: {
        story: {
          include: { sources: true },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        stories: saved.map((s) => ({
          ...s.story,
          savedAt: s.savedAt,
          isSaved: true,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const recommendStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { careerCategory: true, preferredLanguage: true },
    });

    // Attempt to find stories matching user's career category
    let story = await prisma.motivationalStory.findFirst({
      where: {
        careerCategory: { contains: user?.careerCategory || 'Software', mode: 'insensitive' },
      },
      include: { sources: true },
    });

    // Fallback to any verified story
    if (!story) {
      story = await prisma.motivationalStory.findFirst({
        include: { sources: true },
      });
    }

    if (!story) throw new NotFoundError('No stories available in library');

    res.json({
      success: true,
      data: { story },
    });
  } catch (err) {
    next(err);
  }
};
