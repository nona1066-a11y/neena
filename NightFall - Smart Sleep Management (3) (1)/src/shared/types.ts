import z from "zod";

export const SleepSessionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  sleep_score: z.number().optional(),
  bedtime_at: z.string().optional(),
  wake_time_at: z.string().optional(),
  sleep_duration_minutes: z.number().optional(),
  deep_sleep_minutes: z.number().optional(),
  light_sleep_minutes: z.number().optional(),
  rem_sleep_minutes: z.number().optional(),
  awake_minutes: z.number().optional(),
  sleep_quality_rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SoundSessionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  sound_type: z.string(),
  sound_name: z.string(),
  duration_minutes: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const UserPreferencesSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  bedtime_reminder_enabled: z.boolean(),
  bedtime_reminder_time: z.string().optional(),
  smart_alarm_enabled: z.boolean(),
  preferred_wake_window_minutes: z.number(),
  dnd_enabled: z.boolean(),
  dnd_start_time: z.string().optional(),
  dnd_end_time: z.string().optional(),
  preferred_sound_category: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SleepSession = z.infer<typeof SleepSessionSchema>;
export type SoundSession = z.infer<typeof SoundSessionSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export interface SleepAnalysis {
  averageSleepScore: number;
  averageSleepDuration: number;
  sleepTrend: 'improving' | 'declining' | 'stable';
  bestSleepDay: string;
  worstSleepDay: string;
  weeklyComparison: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
}

export interface SoundCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  sounds: SoundTrack[];
}

export interface SoundTrack {
  id: string;
  nameAr: string;
  nameEn: string;
  url: string;
  duration: number;
  category: string;
}
