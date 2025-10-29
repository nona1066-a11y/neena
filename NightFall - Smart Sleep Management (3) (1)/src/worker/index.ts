import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import {
  authMiddleware,
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { SleepSessionSchema, SoundSessionSchema, UserPreferencesSchema } from "@/shared/types";

interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

// Auth routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Sleep tracking routes
app.get('/api/sleep-sessions', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const limit = c.req.query('limit') || '30';
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM sleep_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).bind(user.id, parseInt(limit)).all();

  return c.json(results);
});

app.post('/api/sleep-sessions', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = SleepSessionSchema.omit({ 
    id: true, 
    user_id: true, 
    created_at: true, 
    updated_at: true 
  }).parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO sleep_sessions (
      user_id, sleep_score, bedtime_at, wake_time_at, sleep_duration_minutes,
      deep_sleep_minutes, light_sleep_minutes, rem_sleep_minutes, awake_minutes,
      sleep_quality_rating, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(
    user.id,
    validatedData.sleep_score,
    validatedData.bedtime_at,
    validatedData.wake_time_at,
    validatedData.sleep_duration_minutes,
    validatedData.deep_sleep_minutes,
    validatedData.light_sleep_minutes,
    validatedData.rem_sleep_minutes,
    validatedData.awake_minutes,
    validatedData.sleep_quality_rating,
    validatedData.notes
  ).run();

  return c.json({ id: result.meta.last_row_id });
});

// Sound tracking routes
app.get('/api/sound-sessions', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const limit = c.req.query('limit') || '50';
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM sound_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).bind(user.id, parseInt(limit)).all();

  return c.json(results);
});

app.post('/api/sound-sessions', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = SoundSessionSchema.omit({ 
    id: true, 
    user_id: true, 
    created_at: true, 
    updated_at: true 
  }).parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO sound_sessions (user_id, sound_type, sound_name, duration_minutes, created_at, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(user.id, validatedData.sound_type, validatedData.sound_name, validatedData.duration_minutes).run();

  return c.json({ id: result.meta.last_row_id });
});

// User preferences routes
app.get('/api/preferences', authMiddleware, async (c) => {
  const user = c.get('user')!;
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM user_preferences WHERE user_id = ?'
  ).bind(user.id).all();

  if (results.length === 0) {
    // Create default preferences
    await c.env.DB.prepare(
      `INSERT INTO user_preferences (
        user_id, bedtime_reminder_enabled, smart_alarm_enabled,
        preferred_wake_window_minutes, dnd_enabled,
        created_at, updated_at
      ) VALUES (?, 1, 1, 30, 1, datetime('now'), datetime('now'))`
    ).bind(user.id).run();
    
    const { results: newResults } = await c.env.DB.prepare(
      'SELECT * FROM user_preferences WHERE user_id = ?'
    ).bind(user.id).all();
    
    return c.json(newResults[0]);
  }

  return c.json(results[0]);
});

app.put('/api/preferences', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = UserPreferencesSchema.omit({ 
    id: true, 
    user_id: true, 
    created_at: true, 
    updated_at: true 
  }).partial().parse(body);

  const fields = Object.keys(validatedData);
  const values = Object.values(validatedData);
  const setClause = fields.map(field => `${field} = ?`).join(', ');

  await c.env.DB.prepare(
    `UPDATE user_preferences SET ${setClause}, updated_at = datetime('now') WHERE user_id = ?`
  ).bind(...values, user.id).run();

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM user_preferences WHERE user_id = ?'
  ).bind(user.id).all();

  return c.json(results[0]);
});

// Sleep analysis endpoint
app.get('/api/sleep-analysis', authMiddleware, async (c) => {
  const user = c.get('user')!;
  
  // Get sleep sessions from last 30 days
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM sleep_sessions 
     WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
     ORDER BY created_at DESC`
  ).bind(user.id).all();

  if (results.length === 0) {
    return c.json({
      averageSleepScore: 0,
      averageSleepDuration: 0,
      sleepTrend: 'stable',
      bestSleepDay: '',
      worstSleepDay: '',
      weeklyComparison: { thisWeek: 0, lastWeek: 0, change: 0 }
    });
  }

  const scores = results.filter((s: any) => s.sleep_score).map((s: any) => s.sleep_score);
  const durations = results.filter((s: any) => s.sleep_duration_minutes).map((s: any) => s.sleep_duration_minutes);
  
  const averageSleepScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const averageSleepDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  // Simple trend calculation
  const recentScores = scores.slice(0, 7);
  const olderScores = scores.slice(7, 14);
  let sleepTrend: 'improving' | 'declining' | 'stable' = 'stable';
  
  if (recentScores.length > 0 && olderScores.length > 0) {
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    
    if (recentAvg > olderAvg + 5) sleepTrend = 'improving';
    else if (recentAvg < olderAvg - 5) sleepTrend = 'declining';
  }

  return c.json({
    averageSleepScore: Math.round(averageSleepScore),
    averageSleepDuration: Math.round(averageSleepDuration),
    sleepTrend,
    bestSleepDay: results.length > 0 ? new Date(results[0].created_at as string).toISOString().split('T')[0] : '',
    worstSleepDay: results.length > 0 ? new Date(results[results.length - 1].created_at as string).toISOString().split('T')[0] : '',
    weeklyComparison: {
      thisWeek: recentScores.length > 0 ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length) : 0,
      lastWeek: olderScores.length > 0 ? Math.round(olderScores.reduce((a, b) => a + b, 0) / olderScores.length) : 0,
      change: recentScores.length > 0 && olderScores.length > 0 ? 
        Math.round((recentScores.reduce((a, b) => a + b, 0) / recentScores.length) - (olderScores.reduce((a, b) => a + b, 0) / olderScores.length)) : 0
    }
  });
});

export default app;
