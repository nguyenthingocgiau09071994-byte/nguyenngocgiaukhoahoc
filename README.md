# Masterclass VN — Học Viện Đào Tạo Kinh Doanh

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange?logo=cloudflare)](https://pages.cloudflare.com)
[![License](https://img.shields.io/badge/License-Private-red)](./LICENSE)

**Live URL**: https://masterclass-vn.pages.dev  
**GitHub**: https://github.com/nguyenthingocgiau09071994-byte/nguyenngocgiaukhoahoc

---

## 🏗 Kiến Trúc

```
┌─────────────────────────────────────────────────────┐
│                  Cloudflare Network                  │
│                                                     │
│  ┌─────────────────┐    ┌──────────────────────┐   │
│  │  Cloudflare     │    │  Cloudflare Workers   │   │
│  │  Pages          │───▶│  (API Backend)        │   │
│  │  (Static Site)  │    │  src/index.ts         │   │
│  └─────────────────┘    └──────────┬───────────┘   │
│                                    │                 │
│                         ┌──────────▼───────────┐   │
│                         │  Cloudflare D1        │   │
│                         │  (SQLite Database)    │   │
│                         └──────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Stack
- **Frontend**: Vanilla HTML/CSS/JS (Static — Cloudflare Pages)
- **API Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Session Store**: Cloudflare KV
- **Assets**: Cloudflare Pages (CDN tự động)
- **CI/CD**: GitHub → Cloudflare Pages (auto-deploy on push)

---

## 🚀 Tính Năng

- 📚 Học viện đào tạo kinh doanh & phát triển bản thân
- 🔐 Xác thực JWT (không phụ thuộc Firebase)
- 📊 Quản lý học viên, tiến độ, nội dung
- 🌐 Deploy toàn cầu qua Cloudflare CDN
- 📱 Responsive — hỗ trợ mobile/tablet/desktop
- 🔒 Security headers đầy đủ

---

## 📁 Cấu Trúc Thư Mục

```
nguyenngocgiau.com/
├── index.html          # Trang học viên
├── admin.html          # Trang quản trị
├── app.js              # Logic frontend chính
├── admin.js            # Logic admin
├── admin-content-library.js  # Quản lý nội dung
├── cloudflare-api.js   # Cloudflare API layer (thay Firebase)
├── styles.css          # Stylesheet toàn bộ
├── 404.html            # Trang lỗi 404
├── assets/             # Hình ảnh tĩnh
├── src/
│   └── index.ts        # Cloudflare Workers API (TypeScript)
├── schema.sql          # D1 database schema
├── seed.sql            # Dữ liệu mẫu
├── wrangler.toml       # Cloudflare Workers config
├── _headers            # Cloudflare Pages HTTP headers
├── _redirects          # Cloudflare Pages redirects
└── package.json        # Dependencies & scripts
```

---

## ⚡ Deploy

### Cloudflare Pages (Frontend)
Tự động deploy khi push lên nhánh `main` qua CI/CD.

### Cloudflare Workers (API)
```bash
# 1. Đăng nhập Cloudflare
npx wrangler login

# 2. Tạo D1 database
npm run cf:db:create

# 3. Apply database schema
npm run cf:db:schema

# 4. Set JWT secret
npx wrangler secret put JWT_SECRET

# 5. Deploy Workers API
npm run cf:worker:deploy
```

### Development Local
```bash
npm install
npm run dev          # Vite dev server (port 3000)
npm run cf:worker:dev  # Wrangler local dev
```

---

## 🔧 Cấu Hình

Các biến môi trường cần thiết (set qua Cloudflare Dashboard):

| Variable | Mô tả |
|---|---|
| `JWT_SECRET` | Chuỗi bí mật ≥ 32 ký tự (dùng wrangler secret put) |
| `ADMIN_EMAILS` | Danh sách email admin (phân cách bằng dấu phẩy) |
| `DB` | Cloudflare D1 binding (tự động qua wrangler.toml) |
| `KV` | Cloudflare KV binding (tự động qua wrangler.toml) |

---

## 📝 Lịch Sử Thay Đổi

### v1.0.0 (2026-07-10)
- ✅ Chuyển hoàn toàn từ Firebase → Cloudflare
- ✅ Cloudflare Workers API với JWT auth
- ✅ Cloudflare D1 thay Firestore
- ✅ Cloudflare KV thay Firebase session
- ✅ CI/CD từ GitHub → Cloudflare Pages

---

*© 2026 Nguyễn Ngọc Giàu — Masterclass VN*
