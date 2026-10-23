let NativeModules: any = {};
let Platform: any = { OS: 'web' };

try {
  const rn = require('react-native');
  NativeModules = rn.NativeModules;
  Platform = rn.Platform;
} catch (e) {
  // Graceful fallback in test or web environments
}

export interface AppUsageStat {
  packageName: string;
  totalMinutes: number;
  lastTimeUsed: number;
}

export const UsageStatsBridge = {
  async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModules?.UsageStatsModule?.hasUsagePermission) {
      try {
        return await NativeModules.UsageStatsModule.hasUsagePermission();
      } catch (e) {
        console.warn('Native usage permission check failed:', e);
      }
    }
    return true;
  },

  async openSettings(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModules?.UsageStatsModule?.openUsageSettings) {
      try {
        return await NativeModules.UsageStatsModule.openUsageSettings();
      } catch (e) {
        console.warn('Native openUsageSettings failed:', e);
      }
    }
    return true;
  },

  async hasOverlayPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModules?.UsageStatsModule?.hasOverlayPermission) {
      try {
        return await NativeModules.UsageStatsModule.hasOverlayPermission();
      } catch (e) {
        console.warn('Native hasOverlayPermission failed:', e);
      }
    }
    return true;
  },

  async openOverlaySettings(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModules?.UsageStatsModule?.openOverlaySettings) {
      try {
        return await NativeModules.UsageStatsModule.openOverlaySettings();
      } catch (e) {
        console.warn('Native openOverlaySettings failed:', e);
      }
    }
    return true;
  },

  async showOverlay(title: string, message: string): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModules?.UsageStatsModule?.showOverlay) {
      try {
        return await NativeModules.UsageStatsModule.showOverlay(title, message);
      } catch (e) {
        console.warn('Native showOverlay failed:', e);
      }
    }
    return true;
  },

  async queryDailyUsage(packageNames: string[]): Promise<AppUsageStat[]> {
    if (Platform.OS === 'android' && NativeModules?.UsageStatsModule?.queryDailyUsage) {
      try {
        return await NativeModules.UsageStatsModule.queryDailyUsage(packageNames);
      } catch (e) {
        console.warn('Native queryDailyUsage failed:', e);
      }
    }

    return packageNames.map((pkg) => {
      let mockMinutes = 15;
      if (pkg.includes('instagram')) mockMinutes = 35;
      if (pkg.includes('youtube')) mockMinutes = 22;
      return {
        packageName: pkg,
        totalMinutes: mockMinutes,
        lastTimeUsed: Date.now() - 1000 * 60 * 10,
      };
    });
  },
};
