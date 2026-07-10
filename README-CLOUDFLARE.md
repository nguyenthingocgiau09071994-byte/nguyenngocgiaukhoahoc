# 🔥 Chuyển Firebase → Cloudflare — Hướng Dẫn Deploy

## Tổng Quan Kiến Trúc Mới

```
Trước (Firebase):
  Firebase Hosting → Firebase Auth → Firestore

Sau (Cloudflare):
  Cloudflare Pages → Cloudflare Workers (API) → Cloudflare D1 (Database)
```

## Bước 1: Tạo D1 Database

```bash
# Login Cloudflare
npx wrangler login

# Tạo database
npx wrangler d1 create masterclass-db

# Copy database_id vào wrangler.toml
# Thay "REPLACE_WITH_YOUR_D1_DATABASE_ID" bằng ID thực tế
```

## Bước 2: Tạo Schema

```bash
# Apply schema lên D1 (production)
npx wrangler d1 execute masterclass-db --file=schema.sql --remote

# Hoặc test local
npx wrangler d1 execute masterclass-db --file=schema.sql --local
```

## Bước 3: Deploy Workers API

```bash
# Set JWT_SECRET
npx wrangler secret put JWT_SECRET
# → Nhập: một chuỗi ngẫu nhiên dài ≥32 ký tự
# Ví dụ: openssl rand -base64 48

# Deploy
npx wrangler deploy

# Ghi nhớ URL Workers (sẽ dùng ở bước 4)
# Ví dụ: https://masterclass-api.<your-subdomain>.workers.dev
```

## Bước 4: Cấu Hình API Base URL

Mở `cloudflare-api.js`, sửa dòng:

```javascript
// Tùy cách deploy:
const API_BASE = 'https://masterclass-api.<account>.workers.dev/api';
// HOẶC nếu dùng custom domain:
const API_BASE = 'https://api.nguyenngocgiau.com/api';
```

## Bước 5: Deploy Static Files lên Cloudflare Pages

```bash
# Cách 1: qua Wrangler
npx wrangler pages deploy . --project-name=masterclass-vn

# Cách 2: qua Cloudflare Dashboard
#   1. Vào https://dash.cloudflare.com
#   2. Workers & Pages → Create application → Pages → Direct upload
#   3. Kéo thư mục hiện tại vào
#   4. Build command: (để trống vì static)
#   5. Deploy!
```

## Bước 6: Tạo Tài Khoản Admin Đầu Tiên

Dùng Postman / curl hoặc tạo script đăng ký:

```bash
curl -X POST https://api.nguyenngocgiau.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Ngọc Giàu",
    "email": "admin@masterclass.vn",
    "phone": "0774480916",
    "password": "YOUR_ADMIN_PASSWORD"
  }'
```

Sau đó trong D1 console, set role = 'admin' và plan = 'pro':

```bash
npx wrangler d1 execute masterclass-db --remote --command="
  UPDATE users SET role='admin', plan='pro' WHERE email='admin@masterclass.vn';
"
```

## Bước 7: Cloudflare KV (tùy chọn — cho session storage)

```bash
npx wrangler kv:namespace create "SESSION_KV"
# Copy ID vào wrangler.toml
```

## Kiểm Tra Hoạt Động

```bash
# Health check
curl https://api.nguyenngocgiau.com/api/health

# Kết quả mong đợi:
# {"status":"ok","service":"masterclass-api","timestamp":...}
```

## Cấu Hình Custom Domain cho API

Trong Cloudflare Dashboard:
1. Workers & Pages → masterclass-api → Settings → Triggers
2. Custom Domains → Add custom domain
3. Nhập: `api.nguyenngocgiau.com`

## So Sánh Firestore → D1

| Firestore | Cloudflare D1 |
|---|---|
| `db.collection("content")` | `SELECT * FROM content` |
| `onSnapshot()` | WebSocket / polling |
| `doc(id).set()` | `INSERT OR REPLACE` |
| `doc(id).update()` | `UPDATE ... WHERE` |
| Firebase Auth | JWT tokens ( Workers ) |
| Firestore Rules | SQL GRANT / API-level auth |

## Môi Trường Development Local

```bash
# Chạy Workers local
npx wrangler dev

# Chạy D1 local
npx wrangler d1 local execute masterclass-db --file=schema.sql

# Chạy site local
npx vite --port=3000
```

## Các File Đã Tạo

| File | Mục đích |
|---|---|
| `wrangler.json` / `wrangler.toml` | Cloudflare Workers config |
| `schema.sql` | D1 database schema |
| `src/index.ts` | Workers API (tất cả endpoints) |
| `cloudflare-api.js` | Thay thế firebase-config.js |
| `_headers` | Cache headers cho Cloudflare Pages |
| `README-CLOUDFLARE.md` | File này |

## Khắc Phục Lỗi Thường Gặp

**Lỗi 401 Unauthorized:**
→ Kiểm tra JWT_SECRET đã set đúng chưa (`wrangler secret list`)

**Lỗi 500 Internal Error:**
→ Kiểm tra D1 database_id trong wrangler.toml đúng chưa
→ Chạy `wrangler d1 execute ... --remote` để apply schema

**CORS error:**
→ Kiểm tra `_headers` đã deploy chưa (áp dụng cho Pages, không phải Workers)

**Data không đồng bộ:**
→ Workers chỉ sync khi có network; dữ liệu cũ vẫn nằm trong localStorage
→ Clear localStorage hoặc dùng Incognito để test sạch

## Chi Phí Ước Tính (Free Tier)

- **Cloudflare Pages**: Miễn phí (500 phút build/tháng, bandwidth không giới hạn)
- **Cloudflare Workers**: Miễn phí (100.000 request/ngày)
- **Cloudflare D1**: Miễn phí (5GB storage, 10 triệu read/ngày)
- **Cloudflare KV**: Miễn phí (1 triệu read, 1 triệu write/ngày)

→ Tổng: **~$0/tháng** cho dự án nhỏ và vừa!
