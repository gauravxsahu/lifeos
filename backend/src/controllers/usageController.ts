import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { usageSyncBatchSchema } from '../utils/validation';
import { ValidationError } from '../utils/errors';

export const syncUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = usageSyncBatchSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid usage sync payload', validated.error.flatten());
    }

    const userId = req.user!.id;
    const { deviceId, platform, deviceName, summaries } = validated.data;

    // 1. Upsert Device for this user
    const device = await prisma.device.upsert({
      where: { id: deviceId },
      update: {
        platform,
        deviceName,
        lastSyncAt: new Date(),
      },
      create: {
        id: deviceId,
        userId,
        platform,
        deviceName,
        lastSyncAt: new Date(),
      },
    });

    // 2. Upsert usage summaries for device
    const syncedRecords = [];
    for (const item of summaries) {
      const summary = await prisma.appUsageSummary.upsert({
        where: {
          deviceId_packageName_usageDate: {
            deviceId: device.id,
            packageName: item.packageName,
            usageDate: item.usageDate,
          },
        },
        update: {
          durationMinutes: item.durationMinutes,
          syncedAt: new Date(),
        },
        create: {
          deviceId: device.id,
          packageName: item.packageName,
          usageDate: item.usageDate,
          durationMinutes: item.durationMinutes,
        },
      });
      syncedRecords.push(summary);
    }

    res.json({
      success: true,
      data: {
        message: `Successfully synchronized ${syncedRecords.length} usage records.`,
        deviceSyncTime: device.lastSyncAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getDailyUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    // Find all devices of user
    const devices = await prisma.device.findMany({
      where: { userId },
      select: { id: true },
    });
    const deviceIds = devices.map((d) => d.id);

    const summaries = await prisma.appUsageSummary.findMany({
      where: {
        deviceId: { in: deviceIds },
        usageDate: date,
      },
    });

    // Fetch user's monitored apps for metadata mapping
    const monitoredApps = await prisma.monitoredApplication.findMany({
      where: { userId },
      include: { thresholds: true },
    });

    const appMap = new Map(monitoredApps.map((a) => [a.packageName, a]));

    const enriched = summaries.map((s) => {
      const app = appMap.get(s.packageName);
      return {
        ...s,
        displayName: app ? app.displayName : s.packageName,
        dailyLimitMinutes: app ? app.dailyLimitMinutes : 60,
        thresholds: app ? app.thresholds : [],
      };
    });

    const totalMinutes = enriched.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    res.json({
      success: true,
      data: {
        date,
        totalMinutes,
        hasSyncedDevice: deviceIds.length > 0,
        summaries: enriched,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getWeeklyUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const devices = await prisma.device.findMany({
      where: { userId },
      select: { id: true },
    });
    const deviceIds = devices.map((d) => d.id);

    // Compute last 7 days dates
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const summaries = await prisma.appUsageSummary.findMany({
      where: {
        deviceId: { in: deviceIds },
        usageDate: { in: dates },
      },
    });

    // Also fetch focus sessions in the same window
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        startedAt: {
          gte: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        },
      },
    });

    const weeklyData = dates.map((d) => {
      const daySummaries = summaries.filter((s) => s.usageDate === d);
      const socialMinutes = daySummaries.reduce((sum, item) => sum + item.durationMinutes, 0);

      // Focus minutes on that day
      const dayFocus = focusSessions.filter(
        (f) => f.startedAt.toISOString().split('T')[0] === d
      );
      const focusMinutes = dayFocus.reduce((sum, f) => sum + Math.round(f.actualDurationSeconds / 60), 0);

      return {
        date: d,
        socialMinutes: Math.round(socialMinutes),
        focusMinutes,
      };
    });

    res.json({
      success: true,
      data: {
        weeklyTrend: weeklyData,
        hasSyncedDevice: deviceIds.length > 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAppUsageHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { packageName } = req.params;

    const devices = await prisma.device.findMany({
      where: { userId },
      select: { id: true },
    });
    const deviceIds = devices.map((d) => d.id);

    const history = await prisma.appUsageSummary.findMany({
      where: {
        deviceId: { in: deviceIds },
        packageName,
      },
      orderBy: { usageDate: 'desc' },
      take: 30,
    });

    res.json({
      success: true,
      data: { packageName, history },
    });
  } catch (err) {
    next(err);
  }
};
