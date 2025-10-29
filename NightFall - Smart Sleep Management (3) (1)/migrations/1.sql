
CREATE TABLE sleep_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  sleep_score INTEGER,
  bedtime_at DATETIME,
  wake_time_at DATETIME,
  sleep_duration_minutes INTEGER,
  deep_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  sleep_quality_rating INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sound_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  sound_type TEXT NOT NULL,
  sound_name TEXT NOT NULL,
  duration_minutes INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE,
  bedtime_reminder_enabled BOOLEAN DEFAULT 1,
  bedtime_reminder_time TEXT,
  smart_alarm_enabled BOOLEAN DEFAULT 1,
  preferred_wake_window_minutes INTEGER DEFAULT 30,
  dnd_enabled BOOLEAN DEFAULT 1,
  dnd_start_time TEXT,
  dnd_end_time TEXT,
  preferred_sound_category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sleep_sessions_user_id ON sleep_sessions(user_id);
CREATE INDEX idx_sound_sessions_user_id ON sound_sessions(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
