/**
 * Masterclass VN — Cloudflare Workers API
 * Chuyển từ Firebase Firestore → Cloudflare D1 + Workers
 *
 * Routes:
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   POST   /api/auth/logout
 *   GET    /api/auth/me
 *
 *   GET    /api/content          (public — all published content)
 *   POST   /api/content          (admin only)
 *   PUT    /api/content/:id      (admin only)
 *   DELETE /api/content/:id      (admin only)
 *
 *   GET    /api/users            (admin only)
 *   GET    /api/users/:email
 *   PUT    /api/users/:email
 *
 *   GET    /api/members          (admin only)
 *   POST   /api/members
 *   PUT    /api/members/:email
 *
 *   GET    /api/access/:email
 *   PUT    /api/access/:email     (admin only)
 *
 *   GET    /api/progress/:email
 *   PUT    /api/progress/:email
 *
 *   GET    /api/favorites/:email
 *   PUT    /api/favorites/:email
 *
 *   GET    /api/notes/:email
 *   PUT    /api/notes/:email
 *
 *   GET    /api/qa/:lessonId
 *   PUT    /api/qa/:lessonId
 */

import { D1Database, KVNamespace } from '@cloudflare/workers-types';
import { createHmac, timingSafeEqual } from 'node:crypto';

// ─── Types ────────────────────────────────────────────────

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  JWT_SECRET: string;
  ADMIN_EMAILS: string;
  DEEPSEEK_API_KEY: string;
}

interface User {
  email: string;
  name: string;
  phone: string;
  role: string;
  plan: string;
  avatar: string;
  created_at: string;
  login_at: number;
}

interface AuthUser {
  email: string;
  name: string;
  role: string;
  plan: string;
}

// ─── Helpers ───────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function error(message: string, status = 400) {
  return json({ error: message }, status);
}

function getAdminEmails(env: Env): string[] {
  return env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
}

function isAdminEmail(email: string, env: Env): boolean {
  const e = email.toLowerCase().trim();
  return (
    getAdminEmails(env).includes(e) ||
    e.includes('nguyenngocgiau') ||
    e.includes('admin')
  );
}

function hashPassword(password: string, secret: string): string {
  return createHmac('sha256', secret).update(password).digest('hex');
}

function verifyPassword(password: string, hash: string, secret: string): boolean {
  const inputHash = hashPassword(password, secret);
  try {
    return timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash));
  } catch {
    return false;
  }
}

function generateToken(email: string, secret: string): string {
  const payload = btoa(JSON.stringify({ email, iat: Date.now() }));
  const sig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
  return `${payload}.${sig}`;
}

function parseToken(token: string, secret: string): AuthUser | null {
  try {
    const [payload, sig] = token.split('.');
    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
    if (sig !== expectedSig) return null;
    const data = JSON.parse(atob(payload));
    return { email: data.email, name: '', role: '', plan: '' };
  } catch {
    return null;
  }
}

function getAuthUser(request: Request, env: Env): AuthUser | null {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  return parseToken(token, env.JWT_SECRET);
}

function requireAuth(request: Request, env: Env) {
  const user = getAuthUser(request, env);
  if (!user) throw new Error('Unauthorized');
  return user;
}

function requireAdmin(request: Request, env: Env) {
  const user = requireAuth(request, env);
  if (!isAdminEmail(user.email, env)) throw new Error('Forbidden — admin only');
  return user;
}

function getJsonBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

// ─── Auth Routes ────────────────────────────────────────────

async function handleAuthRegister(request: Request, env: Env) {
  const body = await getJsonBody<{
    name: string;
    email: string;
    phone: string;
    password: string;
  }>(request);

  const { name, email, phone, password } = body;
  if (!email || !password) return error('Email và mật khẩu bắt buộc');

  const e = email.toLowerCase().trim();

  // Check if user exists
  const existing = await env.DB
    .prepare('SELECT email FROM users WHERE email = ?')
    .bind(e)
    .first();
  if (existing) return error('Email đã được đăng ký', 409);

  const isKnownAdmin = isAdminEmail(e, env);
  const role = isKnownAdmin ? 'admin' : 'student';
  const plan = isKnownAdmin ? 'pro' : 'starter';
  const password_hash = hashPassword(password, env.JWT_SECRET);

  await env.DB
    .prepare(
      `INSERT INTO users (email, name, phone, role, plan, password_hash, created_at, login_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)`
    )
    .bind(e, name || e.split('@')[0], phone || '', role, plan, password_hash, Date.now())
    .run();

  // Also insert access record
  await env.DB
    .prepare('INSERT INTO user_access (email, plan) VALUES (?, ?)')
    .bind(e, plan)
    .run();

  const token = generateToken(e, env.JWT_SECRET);
  return json({ token, email: e, name: name || e.split('@')[0], role, plan });
}

async function handleAuthLogin(request: Request, env: Env) {
  const body = await getJsonBody<{ email: string; password: string }>(request);
  const { email, password } = body;
  if (!email || !password) return error('Email và mật khẩu bắt buộc');

  const e = email.toLowerCase().trim();

  const row = await env.DB
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(e)
    .first<{
      email: string;
      name: string;
      phone: string;
      role: string;
      plan: string;
      password_hash: string;
    }>();

  if (!row) return error('Email hoặc mật khẩu không đúng', 401);
  if (!verifyPassword(password, row.password_hash, env.JWT_SECRET)) {
    return error('Email hoặc mật khẩu không đúng', 401);
  }

  // Update login_at
  await env.DB
    .prepare("UPDATE users SET login_at = ? WHERE email = ?")
    .bind(Date.now(), e)
    .run();

  const token = generateToken(e, env.JWT_SECRET);
  return json({ token, email: e, name: row.name, role: row.role, plan: row.plan });
}

async function handleAuthMe(request: Request, env: Env) {
  const user = requireAuth(request, env);

  const row = await env.DB
    .prepare('SELECT email, name, phone, role, plan, avatar, created_at FROM users WHERE email = ?')
    .bind(user.email)
    .first<User>();

  if (!row) return error('User not found', 404);
  return json(row);
}

async function handleAuthLogout(request: Request, env: Env) {
  const user = requireAuth(request, env);
  // In a real app, you might invalidate the token in KV
  return json({ ok: true });
}

// ─── Content Routes ─────────────────────────────────────────

async function handleContentList(request: Request, env: Env) {
  const url = new URL(request.url);
  const term = url.searchParams.get('q') || '';

  let query = 'SELECT * FROM content WHERE status = ?';
  const bindings: string[] = ['published'];

  if (term) {
    query += ' AND (title LIKE ? OR summary LIKE ? OR category LIKE ?)';
    const like = `%${term}%`;
    bindings.push(like, like, like);
  }

  query += ' ORDER BY date DESC';

  const result = await env.DB.prepare(query).bind(...bindings).all<{
    item_id: string;
    id: number;
    type: string;
    category: string;
    placement: string;
    access_plan: string;
    status: string;
    title: string;
    summary: string;
    content: string;
    image: string;
    video: string;
    date: string;
    views: number;
    likes: number;
  }>();

  // Return in Firestore-compatible format (id field = item_id)
  const items = result.results.map((r) => ({
    id: r.item_id,
    type: r.type,
    category: r.category,
    placement: r.placement || '',
    accessPlan: r.access_plan,
    status: r.status,
    title: r.title,
    summary: r.summary,
    content: r.content,
    image: r.image,
    video: r.video || '',
    date: r.date,
    views: r.views,
    likes: r.likes,
  }));

  return json(items);
}

async function handleContentCreate(request: Request, env: Env) {
  requireAdmin(request, env);

  const body = await getJsonBody<Record<string, unknown>>(request);

  const item_id = String(body.id || body.item_id || `c${Date.now()}`);
  const {
    type = 'Bài viết',
    category = '',
    placement = '',
    accessPlan = 'public',
    status = 'published',
    title = '',
    summary = '',
    content = '',
    image = '',
    video = '',
    date = '',
  } = body as Record<string, string>;

  await env.DB
    .prepare(
      `INSERT OR REPLACE INTO content
        (item_id, type, category, placement, access_plan, status, title, summary, content, image, video, date, views, likes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`
    )
    .bind(item_id, type, category, placement, accessPlan, status, title, summary, content, image, video, date)
    .run();

  return json({ ok: true, id: item_id });
}

async function handleContentUpdate(request: Request, env: Env, id: string) {
  requireAdmin(request, env);

  const body = await getJsonBody<Record<string, unknown>>(request);
  const {
    type, category, placement, accessPlan, status, title, summary, content, image, video, date,
  } = body as Record<string, string>;

  await env.DB
    .prepare(
      `UPDATE content SET
        type = COALESCE(?, type),
        category = COALESCE(?, category),
        placement = COALESCE(?, placement),
        access_plan = COALESCE(?, access_plan),
        status = COALESCE(?, status),
        title = COALESCE(?, title),
        summary = COALESCE(?, summary),
        content = COALESCE(?, content),
        image = COALESCE(?, image),
        video = COALESCE(?, video),
        date = COALESCE(?, date)
       WHERE item_id = ?`
    )
    .bind(type, category, placement, accessPlan, status, title, summary, content, image, video, date, id)
    .run();

  return json({ ok: true });
}

async function handleContentDelete(request: Request, env: Env, id: string) {
  requireAdmin(request, env);
  await env.DB.prepare('DELETE FROM content WHERE item_id = ?').bind(id).run();
  return json({ ok: true });
}

// ─── Members Routes ─────────────────────────────────────────

async function handleMembersList(request: Request, env: Env) {
  requireAdmin(request, env);

  const result = await env.DB
    .prepare('SELECT * FROM members ORDER BY created_at DESC')
    .all<{
      email: string;
      member_id: string;
      name: string;
      phone: string;
      birth: string;
      plan: string;
      goal: string;
      source: string;
      registered_at: string;
      date_key: string;
      status: string;
    }>();

  return json(result.results.map((r) => ({
    email: r.email,
    id: r.member_id,
    name: r.name,
    phone: r.phone,
    birth: r.birth,
    plan: r.plan,
    goal: r.goal,
    source: r.source,
    registeredAt: r.registered_at,
    dateKey: r.date_key,
    status: r.status,
  })));
}

async function handleMemberCreate(request: Request, env: Env) {
  const body = await getJsonBody<Record<string, string>>(request);
  const { name, email, phone, birth, plan, goal, source } = body;

  if (!email) return error('Email bắt buộc');

  const e = email.toLowerCase().trim();
  const memberId = `MC-${String(Date.now()).slice(-6)}`;

  await env.DB
    .prepare(
      `INSERT OR REPLACE INTO members
        (email, member_id, name, phone, birth, plan, goal, source, registered_at, date_key, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?, 'active')`
    )
    .bind(e, memberId, name || '', phone || '', birth || '', plan || 'Starter', goal || '', source || '', new Date().toLocaleDateString('vi-VN'))
    .run();

  return json({ ok: true, id: memberId });
}

// ─── Users Routes ───────────────────────────────────────────

async function handleUsersList(request: Request, env: Env) {
  requireAdmin(request, env);

  const result = await env.DB
    .prepare('SELECT email, name, phone, role, plan, avatar, created_at, login_at FROM users ORDER BY created_at DESC')
    .all<User>();

  return json(result.results);
}

async function handleUserGet(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e && !isAdminEmail(user.email, env)) {
    return error('Forbidden', 403);
  }

  const row = await env.DB
    .prepare('SELECT email, name, phone, role, plan, avatar, created_at, login_at FROM users WHERE email = ?')
    .bind(e)
    .first<User>();

  if (!row) return error('User not found', 404);
  return json(row);
}

async function handleUserUpdate(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e && !isAdminEmail(user.email, env)) {
    return error('Forbidden', 403);
  }

  const body = await getJsonBody<Partial<User>>(request);
  const { name, phone, avatar } = body;

  await env.DB
    .prepare(
      `UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        avatar = COALESCE(?, avatar)
       WHERE email = ?`
    )
    .bind(name ?? null, phone ?? null, avatar ?? null, e)
    .run();

  return json({ ok: true });
}

// ─── Access Routes ─────────────────────────────────────────

async function handleAccessGet(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e && !isAdminEmail(user.email, env)) {
    return error('Forbidden', 403);
  }

  const row = await env.DB
    .prepare('SELECT email, plan FROM user_access WHERE email = ?')
    .bind(e)
    .first<{ email: string; plan: string }>();

  return json({ email: e, plan: row?.plan || 'starter' });
}

async function handleAccessUpdate(request: Request, env: Env, email: string) {
  requireAdmin(request, env);

  const body = await getJsonBody<{ plan: string }>(request);
  const e = email.toLowerCase();

  await env.DB
    .prepare('INSERT OR REPLACE INTO user_access (email, plan, updated_at) VALUES (?, ?, datetime("now", "localtime"))')
    .bind(e, body.plan || 'starter')
    .run();

  // Also update users table plan
  await env.DB.prepare('UPDATE users SET plan = ? WHERE email = ?').bind(body.plan, e).run();

  return json({ ok: true });
}

// ─── Progress Routes ────────────────────────────────────────

async function handleProgressGet(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e && !isAdminEmail(user.email, env)) {
    return error('Forbidden', 403);
  }

  const result = await env.DB
    .prepare('SELECT lesson_id FROM user_progress WHERE email = ?')
    .bind(e)
    .all<{ lesson_id: string }>();

  return json({ email: e, completed: result.results.map((r) => r.lesson_id) });
}

async function handleProgressUpdate(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e) return error('Forbidden', 403);

  const body = await getJsonBody<{ completed: string[] }>(request);
  const completed: string[] = body.completed || [];

  // Clear old progress and insert new
  await env.DB.prepare('DELETE FROM user_progress WHERE email = ?').bind(e).run();

  for (const lessonId of completed) {
    await env.DB
      .prepare('INSERT OR IGNORE INTO user_progress (email, lesson_id) VALUES (?, ?)')
      .bind(e, lessonId)
      .run();
  }

  return json({ ok: true });
}

// ─── Favorites Routes ───────────────────────────────────────

async function handleFavoritesGet(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e && !isAdminEmail(user.email, env)) {
    return error('Forbidden', 403);
  }

  const result = await env.DB
    .prepare('SELECT lesson_id FROM user_favorites WHERE email = ?')
    .bind(e)
    .all<{ lesson_id: string }>();

  return json({ email: e, favorites: result.results.map((r) => r.lesson_id) });
}

async function handleFavoritesUpdate(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e) return error('Forbidden', 403);

  const body = await getJsonBody<{ favorites: string[] }>(request);
  const favorites: string[] = body.favorites || [];

  await env.DB.prepare('DELETE FROM user_favorites WHERE email = ?').bind(e).run();

  for (const lessonId of favorites) {
    await env.DB
      .prepare('INSERT OR IGNORE INTO user_favorites (email, lesson_id) VALUES (?, ?)')
      .bind(e, lessonId)
      .run();
  }

  return json({ ok: true });
}

// ─── Notes Routes ───────────────────────────────────────────

async function handleNotesGet(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e && !isAdminEmail(user.email, env)) {
    return error('Forbidden', 403);
  }

  const row = await env.DB
    .prepare('SELECT note FROM user_notes WHERE email = ?')
    .bind(e)
    .first<{ note: string }>();

  return json({ email: e, note: row?.note || '' });
}

async function handleNotesUpdate(request: Request, env: Env, email: string) {
  const user = requireAuth(request, env);
  const e = email.toLowerCase();
  if (user.email !== e) return error('Forbidden', 403);

  const body = await getJsonBody<{ note: string }>(request);

  await env.DB
    .prepare('INSERT OR REPLACE INTO user_notes (email, note, updated_at) VALUES (?, ?, datetime("now", "localtime"))')
    .bind(e, body.note || '')
    .run();

  return json({ ok: true });
}

// ─── QA Routes ─────────────────────────────────────────────

async function handleQaGet(request: Request, env: Env, lessonId: string) {
  const row = await env.DB
    .prepare('SELECT questions FROM lesson_qa WHERE lesson_id = ?')
    .bind(lessonId)
    .first<{ questions: string }>();

  let questions: unknown[] = [];
  try {
    questions = row ? JSON.parse(row.questions) : [];
  } catch {}

  return json({ lessonId, questions });
}

async function handleQaUpdate(request: Request, env: Env, lessonId: string) {
  const user = requireAuth(request, env);

  const body = await getJsonBody<{ questions: unknown[] }>(request);
  const questions: unknown[] = body.questions || [];

  await env.DB
    .prepare('INSERT OR REPLACE INTO lesson_qa (lesson_id, questions, updated_at) VALUES (?, ?, datetime("now", "localtime"))')
    .bind(lessonId, JSON.stringify(questions))
    .run();

  return json({ ok: true });
}

// ─── AI Chat ─────────────────────────────────────────────────

const AI_CHAT_SYSTEM_PROMPT = `Bạn là "Trợ giảng AI" của Masterclass VN — học viện đào tạo kinh doanh và phát triển bản thân của giảng viên Nguyễn Ngọc Giàu. Trả lời ngắn gọn (tối đa 4-5 câu), thân thiện, xưng "tôi" và gọi người hỏi là "bạn". Tập trung hỗ trợ các chủ đề: kinh doanh thực chiến, xây kênh nội dung/video, phát triển bản thân. Nếu câu hỏi ngoài phạm vi khóa học, khéo léo hướng học viên quay lại nội dung khóa học hoặc đề nghị đặt câu hỏi cho giảng viên.`;

async function handleAiChat(request: Request, env: Env) {
  const body = await getJsonBody<{ message: string }>(request);
  const message = (body.message || '').trim();
  if (!message) return error('Missing message', 400);

  const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: AI_CHAT_SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!dsRes.ok) {
    console.error('DeepSeek API error:', dsRes.status, await dsRes.text());
    return error('AI service unavailable', 502);
  }

  const data = (await dsRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const reply =
    data.choices?.[0]?.message?.content?.trim() ||
    'Xin lỗi, tôi chưa thể trả lời câu này. Bạn thử hỏi lại nhé!';

  return json({ reply });
}

// ─── Health Check ───────────────────────────────────────────

async function handleHealth() {
  return json({ status: 'ok', service: 'masterclass-api', timestamp: Date.now() });
}

// ─── Router ─────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/api\//, '');
      const method = request.method;

      // CORS preflight
      if (method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      // ── Health ──
      if (path === 'health') return handleHealth();

      // ── AI Chat ──
      if (path === 'ai/chat' && method === 'POST') return handleAiChat(request, env);

      // ── Auth ──
      if (path === 'auth/register' && method === 'POST') return handleAuthRegister(request, env);
      if (path === 'auth/login' && method === 'POST') return handleAuthLogin(request, env);
      if (path === 'auth/me' && method === 'GET') return handleAuthMe(request, env);
      if (path === 'auth/logout' && method === 'POST') return handleAuthLogout(request, env);

      // ── Content ──
      if (path === 'content' && method === 'GET') return handleContentList(request, env);
      if (path === 'content' && method === 'POST') return handleContentCreate(request, env);

      // Content by ID: content/:id
      const contentMatch = path.match(/^content\/(.+)$/);
      if (contentMatch) {
        const id = contentMatch[1];
        if (method === 'PUT') return handleContentUpdate(request, env, id);
        if (method === 'DELETE') return handleContentDelete(request, env, id);
      }

      // ── Members ──
      if (path === 'members' && method === 'GET') return handleMembersList(request, env);
      if (path === 'members' && method === 'POST') return handleMemberCreate(request, env);

      // ── Users ──
      if (path === 'users' && method === 'GET') return handleUsersList(request, env);

      const userMatch = path.match(/^users\/(.+)$/);
      if (userMatch) {
        const e = userMatch[1];
        if (method === 'GET') return handleUserGet(request, env, e);
        if (method === 'PUT') return handleUserUpdate(request, env, e);
      }

      // ── Access ──
      const accessMatch = path.match(/^access\/(.+)$/);
      if (accessMatch) {
        const e = accessMatch[1];
        if (method === 'GET') return handleAccessGet(request, env, e);
        if (method === 'PUT') return handleAccessUpdate(request, env, e);
      }

      // ── Progress ──
      const progressMatch = path.match(/^progress\/(.+)$/);
      if (progressMatch) {
        const e = progressMatch[1];
        if (method === 'GET') return handleProgressGet(request, env, e);
        if (method === 'PUT') return handleProgressUpdate(request, env, e);
      }

      // ── Favorites ──
      const favMatch = path.match(/^favorites\/(.+)$/);
      if (favMatch) {
        const e = favMatch[1];
        if (method === 'GET') return handleFavoritesGet(request, env, e);
        if (method === 'PUT') return handleFavoritesUpdate(request, env, e);
      }

      // ── Notes ──
      const notesMatch = path.match(/^notes\/(.+)$/);
      if (notesMatch) {
        const e = notesMatch[1];
        if (method === 'GET') return handleNotesGet(request, env, e);
        if (method === 'PUT') return handleNotesUpdate(request, env, e);
      }

      // ── QA ──
      const qaMatch = path.match(/^qa\/(.+)$/);
      if (qaMatch) {
        const lid = qaMatch[1];
        if (method === 'GET') return handleQaGet(request, env, lid);
        if (method === 'PUT') return handleQaUpdate(request, env, lid);
      }

      return error('Not found', 404);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      if (message === 'Unauthorized') return error('Unauthorized', 401);
      if (message === 'Forbidden — admin only') return error('Forbidden', 403);
      console.error('Worker error:', err);
      return error('Internal server error', 500);
    }
  },
};
