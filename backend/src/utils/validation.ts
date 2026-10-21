import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters long'),
  preferredLanguage: z.enum([
    'en', 'hi', 'hinglish', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'kn', 'ml'
  ]).default('en'),
  careerCategory: z.string().default('Software Engineering'),
  communicationStyle: z.enum([
    'FRIENDLY_FRIEND', 'PROFESSIONAL_MENTOR', 'MOTIVATOR', 'CALM_COMPANION'
  ]).default('FRIENDLY_FRIEND'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const goalCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  category: z.string().default('Career'),
  targetValue: z.number().positive().default(1),
  targetUnit: z.string().default('task'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  schedule: z.string().default('DAILY'),
});

export const goalUpdateSchema = goalCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const goalCompletionSchema = z.object({
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'completionDate must be YYYY-MM-DD').optional(),
  completedValue: z.number().positive().default(1),
  isCompleted: z.boolean().default(true),
});

export const appCreateSchema = z.object({
  packageName: z.string().min(3).max(150),
  displayName: z.string().min(1).max(100),
  dailyLimitMinutes: z.number().int().min(5).max(720).default(60),
});

export const appUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  isEnabled: z.boolean().optional(),
  dailyLimitMinutes: z.number().int().min(5).max(720).optional(),
});

export const thresholdCreateSchema = z.object({
  thresholdMinutes: z.number().int().min(5).max(720),
  reminderMode: z.enum(['TEXT_ONLY', 'VOICE_AND_TEXT', 'VOICE_ONLY', 'SMART_COMPANION']).default('TEXT_ONLY'),
  storyEnabled: z.boolean().default(true),
  voiceEnabled: z.boolean().default(false),
});

export const thresholdUpdateSchema = thresholdCreateSchema.partial().extend({
  isEnabled: z.boolean().optional(),
});

export const usageSyncItemSchema = z.object({
  packageName: z.string().min(1),
  usageDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().min(0),
});

export const usageSyncBatchSchema = z.object({
  deviceId: z.string().min(1),
  platform: z.enum(['ANDROID', 'WEB']).default('ANDROID'),
  deviceName: z.string().optional(),
  summaries: z.array(usageSyncItemSchema),
});

export const focusSessionCreateSchema = z.object({
  goalId: z.string().uuid().optional().nullable(),
  durationSeconds: z.number().int().min(60).max(10800).default(1500),
});

export const focusSessionUpdateSchema = z.object({
  actualDurationSeconds: z.number().int().min(0).optional(),
  status: z.enum(['RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  completedAt: z.string().datetime().optional(),
});

export const preferencesUpdateSchema = z.object({
  deliveryMode: z.enum(['TEXT_ONLY', 'VOICE_AND_TEXT', 'VOICE_ONLY', 'SMART_COMPANION']).optional(),
  voiceAssistantEnabled: z.boolean().optional(),
  voiceRemindersEnabled: z.boolean().optional(),
  spokenStoriesEnabled: z.boolean().optional(),
  preferredVoiceId: z.string().nullable().optional(),
  speakingRate: z.number().min(0.5).max(2.0).optional(),
  notificationSoundEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  timeZone: z.string().optional(),
  reminderFrequencyLimit: z.number().int().min(5).max(180).optional(),
});

export const languageUpdateSchema = z.object({
  preferredLanguage: z.enum([
    'en', 'hi', 'hinglish', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'kn', 'ml'
  ]),
});

export const voiceUpdateSchema = z.object({
  voiceAssistantEnabled: z.boolean().optional(),
  voiceRemindersEnabled: z.boolean().optional(),
  spokenStoriesEnabled: z.boolean().optional(),
  preferredVoiceId: z.string().nullable().optional(),
  speakingRate: z.number().min(0.5).max(2.0).optional(),
  notificationSoundEnabled: z.boolean().optional(),
});

export const notificationsUpdateSchema = z.object({
  quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  reminderFrequencyLimit: z.number().int().min(5).max(180).optional(),
  deliveryMode: z.enum(['TEXT_ONLY', 'VOICE_AND_TEXT', 'VOICE_ONLY', 'SMART_COMPANION']).optional(),
});

export const aiReminderSchema = z.object({
  packageName: z.string(),
  usageMinutes: z.number().positive(),
  thresholdMinutes: z.number().positive(),
  forceFallback: z.boolean().optional().default(false),
});

export const aiStoryPersonalizationSchema = z.object({
  storyId: z.string().uuid(),
  preferredLanguage: z.string().optional(),
});

export const aiGoalSuggestionSchema = z.object({
  timeAvailableMinutes: z.number().int().positive().default(25),
});
