# 🎨 UI/UX AUDIT REPORT — MASTERCLASS VN
**Ngày kiểm tra:** 08/07/2026  
**Người kiểm tra:** Senior UI/UX Designer · Design System Architect · Front-end Reviewer  
**Dự án:** d:\nguyenngocgiau.com  
**Tổng số trang:** 3 (index.html · admin.html · 404.html)

---

## 📊 ĐIỂM TỔNG QUAN

| Hạng mục | Điểm | Nhận xét ngắn |
|---|---|---|
| Layout | 6/10 | Nhiều lớp override gây xung đột layout |
| Typography | 5/10 | Font size dải quá rộng, không có scale hệ thống |
| Colors | 6/10 | Nhiều màu hardcode trùng lặp, thiếu token thống nhất |
| Components | 6/10 | Dùng `!important` quá mức, thiếu state disabled/loading |
| UX | 7/10 | Flow học viên rõ ràng, nhưng một số modal bị lỗi UX |
| Performance | 4/10 | CSS 277KB chưa tối ưu, không lazy load, không cachebusting đúng |
| Accessibility | 3/10 | Thiếu focus ring, ARIA, label nhiều chỗ, alt text sơ sài |
| Consistency | 4/10 | `!important` đè CSS gốc tạo ra hành vi không thể đoán trước |
| Responsive | 6/10 | Vỡ layout ở 320–375px, admin sidebar thu hẹp quá nhỏ |

---

## 📁 DANH SÁCH CÁC FILE PHÂN TÍCH

| File | Kích thước | Vai trò |
|---|---|---|
| index.html | 23.9 KB | Trang học viên chính |
| admin.html | 8.8 KB | Trang quản trị |
| 404.html | 1.4 KB | Trang lỗi 404 |
| styles.css | 277 KB / 6571 dòng | CSS toàn bộ dự án |
| app.js | 70.6 KB | Logic học viên |
| admin.js | 36.9 KB | Logic admin |
| firebase-config.js | 20.6 KB | Firebase sync |

---

## 🔴 CRITICAL — PHẢI SỬA NGAY

### C-01 · CSS `!important` Overload — CRITICAL
**File:** styles.css (dòng 200–6571)  
**Vấn đề:** Toàn bộ phần styling từ dòng 200 trở đi sử dụng `!important` gần như 100% các thuộc tính. Điều này khiến:
- Không thể override bằng bất kỳ rule nào khác → dead CSS
- CSS cascade hoàn toàn phá vỡ → khó debug
- Nhiều rule mâu thuẫn nhau (`.homeSlider` được định nghĩa lại 5 lần với `max-width` khác nhau)
- Rule cuối cùng thắng nhưng không có thứ tự logic, phụ thuộc vào vị trí dòng code

```css
/* Ví dụ: .homeSlider được khai báo 5 lần riêng biệt */
/* Dòng 729: */  .homeSlider { max-width: 100% !important; }
/* Dòng 972: */  .homeSlider { max-width: calc(100% - 48px) !important; }
/* Dòng 1253: */ .homeSlider { max-width: calc(100% - 140px) !important; }
/* Dòng 1665: */ .homeSlider { max-width: 1360px !important; }
```

**Đề xuất:** Tái cấu trúc CSS thành một Design Token System. Xóa toàn bộ `!important` ngoại trừ utility override.

---

### C-02 · `admin-content-library.js` Không Tồn Tại — CRITICAL
**File:** admin.html dòng 15  
**Vấn đề:** Script được include nhưng file này không tồn tại trong dự án.

```html
<script src="admin-content-library.js?v=20260708-0180"></script>
```

→ Gây lỗi 404 Not Found console error mỗi khi load trang admin.  
**Đề xuất:** Xóa dòng này hoặc tạo file tương ứng.

---

### C-03 · `window.sessionUser` Truy Cập Không Được Guard — CRITICAL
**File:** app.js (nhiều chỗ)  
**Vấn đề:** Nhiều chỗ trong app.js gọi `window.sessionUser.email` trực tiếp mà không kiểm tra null → crash runtime nếu user chưa đăng nhập.  
**Đề xuất:** Guard `if (window.sessionUser && window.sessionUser.email)` trước mọi truy cập.

---

### C-04 · Trang 404 Không Dùng Cùng Style System — CRITICAL
**File:** 404.html  
**Vấn đề:** 404.html tải riêng Be Vietnam Pro bằng inline `<style>` thay vì dùng styles.css chính. Nếu brand thay đổi, 404 sẽ bị lệch.  
**Đề xuất:** Link đến styles.css chính.

---

## 🟠 MEDIUM — SỬA TRONG SPRINT TỚI

### M-01 · Không Có Design Token Nhất Quán — MEDIUM
**Vấn đề:** `:root` có khai báo `--p, --m, --a, --l, --x` nhưng sau đó hàng trăm chỗ dùng hardcode hex:
- `#105f68` (≥ 200 lần)
- `#0b3d43` (≥ 80 lần)
- `#ffd875` (≥ 60 lần)
- `#e7b84f` (≥ 40 lần)
- `#06383e`, `#04292e`, `#063d43` — 3 biến tối gần giống nhau

**Token đề xuất:**
```css
:root {
  --brand-900: #04292e;
  --brand-700: #0d5962;
  --brand-500: #105f68;   /* primary action */
  --brand-300: #3a9295;
  --brand-200: #63c1bb;   /* accent */
  --brand-100: #9ed5d1;
  --gold-500:  #e7b84f;
  --gold-300:  #ffd875;
  --text-primary:   #0b3d43;
  --text-secondary: #2c6368;
  --text-muted:     #647b7e;
  --surface:        #f0f9f8;
  --border:         #bce2de;
  --danger:         #d9383a;
}
```

---

### M-02 · Typography Scale Không Có Hệ Thống — MEDIUM
**Vấn đề:** Font size trải rộng 6px–66px không theo quy tắc:
- `6px` (`.supportHub small`) — **dưới WCAG minimum**
- `7px–8px` (nhiều caption/meta) — **WCAG fail**
- Không có type scale thống nhất

**Đề xuất type scale:**
```
--text-xs:   11px  (caption, badge)
--text-sm:   13px  (secondary, meta)
--text-base: 15px  (body)
--text-md:   17px  (subtitle)
--text-lg:   21px  (card title)
--text-xl:   27px  (section title)
--text-hero: clamp(38px, 4.5vw, 62px)
```

---

### M-03 · Border Radius Không Đồng Nhất — MEDIUM
Có ít nhất **19 giá trị border-radius** trong dự án: 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 36px.

**Đề xuất chuẩn hóa:**
```
--radius-sm:  8px   (tag, badge)
--radius-md:  12px  (input, nút)
--radius-lg:  16px  (card nhỏ)
--radius-xl:  22px  (card lớn, modal)
--radius-2xl: 28px  (section)
```

---

### M-04 · Icon System Hỗn Loạn — MEDIUM
Dự án dùng 3 icon style cùng lúc:
- **Emoji** `👥 ▶️ 💬 📈 👑 ⚡` trong admin — pixelate trên retina, platform-dependent
- **Unicode symbol** `⌂ ▤ ▶ ✎ ♕ ◇` trong nav/buttons
- **CSS pseudo-element** `::before` với content ký tự

**Đề xuất:** Chuẩn hóa sang Lucide Icons SVG cho tất cả icon functional.

---

### M-05 · Z-Index Không Có Layer Map — MEDIUM
Z-index hiện tại không có quy tắc:
- `.modal`: 100 · `.loginModal`: 160 · `.articleModal`: 120/500 (conflict!) · `.contentEditor`: 200

**Đề xuất:**
```
Sticky header:    30
Sidebar:          50
Toast:           150
Modal overlays:  200
Critical modals: 400
Top-level:       9999
```

---

### M-06 · Admin Sidebar Collapse UX Kém — MEDIUM
**File:** styles.css dòng 26  
Ở `max-width: 900px`, sidebar thu thành 76px và text `font-size: 0` — chỉ show ký tự đầu:
```css
.adminSide nav button:first-letter { font-size: 18px; }
```
→ Users không nhận ra đây là navigation.  
**Đề xuất:** Dùng icon SVG thực sự cho collapsed state.

---

### M-07 · Admin Table Không Responsive — MEDIUM
**File:** styles.css dòng 25  
`adminRow` có `min-width: 800px` và không có responsive fallback cho mobile/tablet → horizontal scroll trên < 800px viewport.

---

### M-08 · Password Lưu Base64 Trong localStorage — MEDIUM (Security)
**File:** index.html dòng 17  
```js
const hash = s => btoa(unescape(encodeURIComponent(s)))
```
Base64 không phải cryptographic hash — dễ decode. Password admin được embed trực tiếp trong HTML.  
**Đề xuất:** Dùng Firebase Auth hoàn toàn, bỏ localStorage password.

---

## 🟡 MINOR — BACKLOG

| ID | Vấn đề | File |
|---|---|---|
| m-01 | Contrast < 4.5:1 ở text 6–8px | styles.css |
| m-02 | Focus ring thiếu trên hầu hết button | styles.css |
| m-03 | `aria-label` thiếu: `#menu`, `#closeSide`, `#notificationButton` | index.html |
| m-04 | Slide background-image thiếu accessible description | index.html |
| m-05 | `rel="noopener"` thiếu `noreferrer` | index.html |
| m-06 | `<iframe>` thiếu `title` attribute | index.html |
| m-07 | Cache busting version thủ công, dễ quên | All HTML |
| m-08 | JS/CSS chưa minify cho production (đang chạy dev mode) | - |
| m-09 | `prefers-reduced-motion` bị vô hiệu bởi `!important` | styles.css |
| m-10 | `#save` selector có thể leak ra ngoài `.notes` context | styles.css |
| m-11 | Close button `rotate(90deg)` hover không phù hợp brand tone | styles.css |

---

## 🏗️ 1. LAYOUT AUDIT

### Vấn đề Layout

| # | Mô tả | Mức độ |
|---|---|---|
| L1 | `.homeSlider` khai báo `max-width` 5 lần với giá trị khác nhau | Critical |
| L2 | `.dashboard` grid conflict với `width: calc(100% - 80px)` | Medium |
| L3 | `padding` của dashboard bị override 3 lần (34px → 32px → 26px) | Minor |
| L4 | `footer.pageFoot` padding không nhất quán (18px vs 30px bottom) | Minor |
| L5 | `.awards > div:last-child` có 2 grid template mâu thuẫn | Medium |
| L6 | `.continueCard` padding được set ở 4 chỗ khác nhau | Minor |

---

## ✍️ 2. TYPOGRAPHY AUDIT

| Element | Size hiện tại | Vấn đề |
|---|---|---|
| `h1` hero slide | `clamp(34px, 4.2vw, 62px)` | ✅ Tốt |
| Section title | `27px` → override `26px` | Mâu thuẫn |
| Body text | `12px–16px` (không nhất quán) | Nên chuẩn 15px |
| `.tag`, `.badge` | `7px–11px` | Dưới WCAG minimum |
| `.supportHub small` | `6px` | WCAG violation |
| Button text | `8px–15px` | Nên chuẩn 13px+ |
| Admin table text | `8px–9px` | Khó đọc |

---

## 🎨 3. COLOR SYSTEM AUDIT

**Tokens đã có nhưng không được dùng:**
```css
--p: #105f68   --m: #3a9295   --a: #63c1bb
--l: #9ed5d1   --x: #c8e6e2   --ink: #12373b
```

**Màu hardcode cần gom thành token:**

| Nhóm | Các giá trị | Token đề xuất |
|---|---|---|
| Brand tối nhất | `#04292e`, `#052629`, `#052c30`, `#06272a` | `--brand-900` |
| Brand tối | `#063d43`, `#06383e`, `#07434b` | `--brand-800` |
| Brand trung | `#0d5962`, `#084b53`, `#09474f` | `--brand-700` |
| Brand sáng | `#18828e`, `#1a8894`, `#1c8894` | `--brand-400` |
| Vàng đậm | `#d99b26`, `#d49a1c` | `--gold-400` |
| Vàng sáng | `#ffd875` | `--gold-300` |
| Danger | `#d9383a`, `#a44141` | `--danger` |

---

## 🔧 4. ICON SYSTEM AUDIT

| Context | Style | Vấn đề |
|---|---|---|
| Side nav | Unicode `::before` pseudo | Không accessible, không scale |
| Admin stats | Emoji `👥 ▶️ 💬 📈` | Pixelate retina, platform-dependent |
| Notification btn | `♢` (diamond) | Không intuitive, không phải bell |
| Awards | Mix emoji `🏆 ⚡` + Unicode `◆` | Inconsistent |
| Menu | `☰` | ✅ Standard |
| Close | `×` | ✅ Standard |

---

## 🧩 5. COMPONENTS AUDIT

### Button States
| Variant | Status |
|---|---|
| Primary `.primary` | ✅ Có, nhưng bị override nhiều lần |
| Secondary | ❌ Không có class chuẩn |
| Danger | ❌ Không có class |
| Disabled | ❌ `disabled` attr có nhưng không có CSS style |
| Loading | ❌ Không có |

### Modal Summary
| Modal | Z-index | Shade | Trạng thái |
|---|---|---|---|
| `.modal` (video) | 100 | ✅ | ✅ |
| `.loginModal` | 160 | ✅ | ✅ |
| `.articleModal` | 120 / 500 conflict | ✅ | ⚠️ z-index conflict |
| `.registerModal` | undefined | ❌ Thiếu shade | ⚠️ |
| `.quizModal` | undefined | ✅ | ⚠️ |
| `.certificateModal` | undefined | ✅ | ⚠️ |

### Toast
- ✅ Có `.show` animation
- ❌ Thiếu `role="alert"` → screen reader không announce
- ❌ Không có accessible dismiss

---

## ✨ 6. ANIMATION & EFFECTS AUDIT

| Animation | Duration | Đánh giá |
|---|---|---|
| `.siteProgressVisual` header bar | 3s infinite | ⚠️ Distraction liên tục |
| `accentFlow` (underline width) | 3s infinite | ❌ Gây layout shift |
| Shimmer sweep cards | 0.75s | ⚠️ Nhiều card cùng lúc → GPU load |
| Close button `rotate(90deg)` | 0.2s | ❌ Không phù hợp brand |
| `prefers-reduced-motion` | Khai báo có | ❌ Bị `!important` vô hiệu |
| Slide hero transition | 0.65s | ✅ Mượt |
| Card hover lift | 0.32s cubic | ✅ Premium feel |

---

## ♿ 7. ACCESSIBILITY AUDIT

| Tiêu chí | Tình trạng |
|---|---|
| `lang="vi"` | ✅ |
| `<h1>` duy nhất/trang | ✅ |
| Heading hierarchy | ⚠️ Không theo thứ tự h1→h2→h3 |
| `alt` cho img | ⚠️ Một số có, instructor photo có |
| `aria-label` icon buttons | ❌ Thiếu nhiều chỗ |
| `role="alert"` Toast | ❌ Thiếu |
| `role="dialog"` Modal | ❌ Không có |
| Focus trap trong modal | ❌ Không có |
| Escape close modal | ✅ Có cho video modal |
| Tab order | ⚠️ Modal mở nhưng focus không move vào |
| Contrast ratio | ❌ Nhiều chỗ < 4.5:1 |
| `:focus-visible` | ❌ Không có global rule |
| Skip link | ❌ Không có |
| Form labels | ⚠️ `#qaForm textarea` không có label |

---

## 📱 8. RESPONSIVE AUDIT

### index.html

| Viewport | Tình trạng |
|---|---|
| 1920px | ✅ Đẹp |
| 1440px | ✅ Tốt |
| 1280px | ✅ Tốt |
| 1024px | ⚠️ Sidebar 220px hơi hẹp |
| 768px | ⚠️ Sidebar collapse ok nhưng close button thiếu aria |
| 414px | ⚠️ Tabs có thể overflow |
| 375px | ⚠️ continueCard squeeze |
| 320px | ❌ Tabs flex overflow, header wrapping phức tạp |

### admin.html

| Viewport | Tình trạng |
|---|---|
| 1440px | ✅ Tốt |
| 900px | ❌ Sidebar collapse UX kém (ký tự đầu không đủ affordance) |
| 768px | ❌ Table `min-width: 800px` → horizontal overflow |
| 414px | ❌ Table không responsive |

---

## ⚡ 9. PERFORMANCE AUDIT

| Vấn đề | Ảnh hưởng |
|---|---|
| `styles.css` 277KB chưa minify | +~200ms trên 3G |
| `app.js` 70KB raw | +~50ms |
| Firebase SDK CDN 3 files ~120KB | Không tree-shaking |
| CSS background images không lazy load | Tất cả load khi trang mở |
| Không `loading="lazy"` cho `<img>` | - |
| Không `<link rel="preload">` critical CSS | LCP chậm |
| Đang chạy Vite dev mode (không production) | Bundle to hơn 3-5x |
| Version cache busting thủ công | Dễ quên update |

---

## 🎯 10. DESIGN CONSISTENCY AUDIT

| Hạng mục | Giá trị khác nhau | Đánh giá |
|---|---|---|
| Border radius | 19 giá trị | ❌ Quá nhiều |
| Box shadow | 30+ giá trị | ❌ Không hệ thống |
| Spacing | Tự do 5–64px | ⚠️ Cần 4px grid |
| Màu | 50+ hardcode hex | ❌ Cần token |
| Font | Be Vietnam Pro | ✅ Nhất quán |
| Icon | 3 style hỗn hợp | ❌ Cần chuẩn hóa |
| Background color | Teal dark theme | ✅ Nhất quán |

---

## ✅ NHỮNG GÌ LÀM TỐT

- ✅ Font `Be Vietnam Pro` — phù hợp thương hiệu Việt, dễ đọc
- ✅ Color palette tổng thể (teal + gold) premium và nhất quán
- ✅ Slide hero animation mượt (`opacity + transform`)
- ✅ `prefers-reduced-motion` được khai báo (dù bị vô hiệu một phần)
- ✅ Firebase Auth architecture đúng hướng
- ✅ `viewport-fit=cover` cho iOS notch
- ✅ Cache headers đã set trong firebase.json
- ✅ Member registration flow 3-step rõ ràng
- ✅ Keyboard Escape close video modal
- ✅ Responsive breakpoints cover đủ thiết bị

---

## 📋 TỔNG KẾT

| | Count |
|---|---|
| 🔴 Critical | 4 |
| 🟠 Medium | 8 |
| 🟡 Minor | 11 |
| **Tổng** | **23 issues** |

---

*Báo cáo này chỉ phân tích và ghi nhận — không có bất kỳ code nào bị thay đổi.*
