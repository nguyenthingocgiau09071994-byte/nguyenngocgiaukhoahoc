-- ============================================================
-- Masterclass VN — Cloudflare D1 Database Schema
-- Chuyển từ Firebase Firestore → Cloudflare D1 + Workers
-- ============================================================

-- ============================================================
-- 1. USERS — Hồ sơ người dùng
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin')),
    plan TEXT DEFAULT 'starter' CHECK(plan IN ('starter', 'pro', 'mentoring', '999k', '699k')),
    avatar TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    login_at INTEGER DEFAULT 0,
    password_hash TEXT NOT NULL DEFAULT ''
);

-- ============================================================
-- 2. USER_ACCESS — Gói truy cập
-- ============================================================
CREATE TABLE IF NOT EXISTS user_access (
    email TEXT PRIMARY KEY,
    plan TEXT DEFAULT 'starter' CHECK(plan IN ('starter', 'pro', 'mentoring', '999k', '699k')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 3. MEMBERS — Đăng ký thành viên (học viên)
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
    email TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    birth TEXT DEFAULT '',
    plan TEXT DEFAULT 'Starter' CHECK(plan IN ('Starter', 'Professional', 'Mentoring')),
    goal TEXT DEFAULT '',
    source TEXT DEFAULT '',
    registered_at TEXT DEFAULT (datetime('now', 'localtime')),
    date_key TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 4. CONTENT — Bài viết / Video từ admin
-- ============================================================
CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'Bài viết' CHECK(type IN ('Bài viết', 'Video')),
    category TEXT DEFAULT '',
    placement TEXT DEFAULT '',
    access_plan TEXT DEFAULT 'public' CHECK(access_plan IN ('public', 'starter', 'pro', 'mentoring', '999k', '699k')),
    status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
    title TEXT NOT NULL DEFAULT '',
    summary TEXT DEFAULT '',
    content TEXT DEFAULT '',
    image TEXT DEFAULT '',
    video TEXT DEFAULT '',
    date TEXT DEFAULT (datetime('now', 'localtime')),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- 5. USER_PROGRESS — Tiến độ học tập
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
    email TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed_at TEXT DEFAULT (datetime('now', 'localtime')),
    PRIMARY KEY (email, lesson_id),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 6. USER_FAVORITES — Bài đã lưu yêu thích
-- ============================================================
CREATE TABLE IF NOT EXISTS user_favorites (
    email TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    PRIMARY KEY (email, lesson_id),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 7. USER_NOTES — Ghi chú cá nhân
-- ============================================================
CREATE TABLE IF NOT EXISTS user_notes (
    email TEXT PRIMARY KEY,
    note TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 8. LESSON_QA — Hỏi đáp theo bài học
-- ============================================================
CREATE TABLE IF NOT EXISTS lesson_qa (
    lesson_id TEXT PRIMARY KEY,
    questions TEXT DEFAULT '[]',
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- 9. SESSIONS — JWT session store (Durable Objects alternative)
--    Dùng KV nếu cần, ở đây lưu hashed token → user
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES cho performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_plan ON members(plan);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_access ON content(access_plan);
CREATE INDEX IF NOT EXISTS idx_progress_email ON user_progress(email);
CREATE INDEX IF NOT EXISTS idx_favorites_email ON user_favorites(email);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ============================================================
-- ADMIN SEED DATA — Tài khoản admin mặc định
-- (sẽ được insert riêng bằng wrangler script hoặc seed.sql)
-- ============================================================
-- INSERT OR IGNORE INTO users (email, name, role, plan, password_hash)
-- VALUES ('admin@masterclass.vn', 'Admin Masterclass', 'admin', 'pro', 'PLACEHOLDER_HASH');
