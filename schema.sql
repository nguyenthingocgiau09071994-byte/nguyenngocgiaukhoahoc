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
    password_hash TEXT NOT NULL DEFAULT '',
    user_code TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    permissions TEXT DEFAULT '[]'
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
-- 4b. USER_PROGRESS — Bài học đã hoàn thành (dùng bởi /api/progress)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
    email TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    PRIMARY KEY (email, lesson_id),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 5. USER_VIDEO_PROGRESS — Tiến độ học tập (Sprint 06)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_video_progress (
    email TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    watch_time_seconds INTEGER DEFAULT 0,
    last_watched_at TEXT DEFAULT (datetime('now', 'localtime')),
    completed_at TEXT,
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
-- 6b. PASSWORD_RESETS — Token khôi phục mật khẩu (hết hạn 30 phút)
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 6c. STUDENT_STAFF_ASSIGNMENTS — Nhân viên phụ trách học viên
-- ============================================================
CREATE TABLE IF NOT EXISTS student_staff_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_email TEXT NOT NULL,
    staff_email TEXT NOT NULL,
    assigned_at TEXT DEFAULT (datetime('now', 'localtime')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    UNIQUE(student_email, staff_email),
    FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (staff_email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 6d. SUBMISSIONS — Bài tập học viên nộp
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_email TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'graded')),
    grade TEXT DEFAULT '',
    feedback TEXT DEFAULT '',
    graded_by TEXT DEFAULT '',
    submitted_at TEXT DEFAULT (datetime('now', 'localtime')),
    graded_at TEXT,
    FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE
);

-- ============================================================
-- 6e. CARE_NOTES — Lịch sử chăm sóc học viên
-- ============================================================
CREATE TABLE IF NOT EXISTS care_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_email TEXT NOT NULL,
    staff_email TEXT NOT NULL,
    type TEXT DEFAULT 'note' CHECK(type IN ('call', 'chat', 'note')),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (staff_email) REFERENCES users(email) ON DELETE CASCADE
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
-- 10. COURSES — Khóa học (Sprint 02)
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    description TEXT DEFAULT '',
    price INTEGER DEFAULT 0,
    thumbnail TEXT DEFAULT '',
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- 11. COURSE_MODULES — Chương học (Sprint 03)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT DEFAULT '',
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================
-- 12. LESSONS — Bài học / Video (Sprint 04)
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    video_url TEXT DEFAULT '',
    content_text TEXT DEFAULT '',
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);

-- ============================================================
-- 13. ENROLLMENTS — Ghi danh khóa học (Sprint 05)
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    course_id TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'revoked')),
    enrolled_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES cho performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_plan ON members(plan);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_access ON content(access_plan);
CREATE INDEX IF NOT EXISTS idx_progress_email ON user_video_progress(email);
CREATE INDEX IF NOT EXISTS idx_favorites_email ON user_favorites(email);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_email);

-- ============================================================
-- ADMIN SEED DATA — Tài khoản admin mặc định
-- ============================================================
-- INSERT OR IGNORE INTO users (email, name, role, plan, password_hash)
-- VALUES ('admin@masterclass.vn', 'Admin Masterclass', 'admin', 'pro', 'PLACEHOLDER_HASH');
