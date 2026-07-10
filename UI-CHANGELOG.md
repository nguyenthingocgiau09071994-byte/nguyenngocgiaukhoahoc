# 📋 UI-CHANGELOG — MASTERCLASS VN
**Ngày:** 08/07/2026  
**Người thực hiện:** Senior UI/UX Designer  
**Phiên bản CSS:** 20260708-0200

---

## [C-02] ✅ Xóa admin-content-library.js không tồn tại
**File:** admin.html  
**Vấn đề:** Script tag gây 404 error mỗi khi load trang admin  
**Fix:** Xóa dòng `<script src="admin-content-library.js">`  
**Ảnh hưởng:** Không có ảnh hưởng visual. Loại bỏ console error.

---

## [C-04] ✅ Redesign trang 404.html
**File:** 404.html  
**Vấn đề:** Trang 404 dùng inline style riêng biệt, không nhất quán với brand  
**Fix:** Redesign hoàn toàn với design system Masterclass VN:
- Brand logo + tên đầy đủ
- Số "404" dùng gradient brand (teal-gold)
- Badge "TRANG KHÔNG TỒN TẠI"
- Nút CTA vàng + nút ghost
- CSS standalone với design tokens chuẩn  
**Ảnh hưởng:** Visual đẹp hơn và nhất quán với brand.

---

## [M-01] ✅ Design Token System v2.0
**File:** styles.css (thêm vào cuối)  
**Vấn đề:** 50+ màu hardcode, không có token chuẩn  
**Fix:** Thêm block `:root` đầy đủ:
- Color scale: `--brand-950` → `--brand-25` (12 bước)
- Gold scale: `--gold-400`, `--gold-500`, `--gold-600`
- Semantic colors: `--color-text-*`, `--color-surface`, `--color-border`, `--color-danger`  
**Token count:** 45+ CSS variables mới

---

## [M-02] ✅ Typography Scale Fix
**File:** styles.css  
**Vấn đề:** Font size từ 6px–66px, nhiều chỗ dưới WCAG minimum 11px  
**Fix:**
- Thêm type scale tokens `--text-2xs` (11px) → `--text-hero`
- Fix tất cả element dưới 11px lên `--text-2xs`
- Fix element 8px lên `--text-xs` (12px)  
**Element được fix:** 50+ selectors (`supportHub small`, tags, labels, meta text, admin table...)

---

## [M-03] ✅ Border Radius Token System
**File:** styles.css  
**Vấn đề:** 19 giá trị border-radius khác nhau  
**Fix:** 7-step scale từ `--radius-xs` (6px) đến `--radius-full`

---

## [M-05] ✅ Z-Index Layer Map
**File:** styles.css  
**Vấn đề:** Modal z-index conflict (articleModal: 120 vs 500)  
**Fix:**
- `--z-modal: 200` — standard modal base
- `articleModal` → 200
- `quizModal`, `certificateModal` → 250
- `loginModal`, `contentEditor` → 300
- `#toast` → 300 (`--z-toast`)

---

## [M-06] ✅ Admin Sidebar Tooltip Labels
**File:** styles.css  
**Vấn đề:** Sidebar collapse ở < 900px chỉ show ký tự đầu của button text  
**Fix:** CSS tooltip `::after` với `content: attr(data-label)` khi hover collapsed state

---

## [M-07] ✅ Admin Table Responsive
**File:** styles.css  
**Vấn đề:** `adminRow min-width: 800px` gây horizontal scroll trên mobile  
**Fix:**
- `overflow-x: auto` trên `.adminTable` wrapper
- Stacked grid layout ở < 768px
- `::before` labels cho mỗi column khi stacked

---

## [m-02] ✅ Global Focus Ring
**File:** styles.css  
**Vấn đề:** Không có `:focus-visible` global rule — keyboard users không thấy focus  
**Fix:**
`css
:focus-visible {
  outline: 3px solid var(--brand-300);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
`

---

## [m-03] ✅ Aria Labels cho Icon Buttons
**File:** index.html  
**Vấn đề:** `#menu`, `#closeSide`, `#notificationButton` thiếu aria-label  
**Fix:**
- `#menu`: `aria-label="Mở menu điều hướng" aria-expanded="false" aria-controls="side"`
- `#closeSide`: `aria-label="Đóng sidebar điều hướng"`
- `#notificationButton`: `aria-label="Thông báo" aria-haspopup="true" aria-expanded="false"`

---

## [m-05] ✅ External Link Security
**File:** index.html  
**Vấn đề:** `rel="noopener"` thiếu `noreferrer`  
**Fix:** `rel="noopener noreferrer"` trên YouTube link

---

## [m-06] ✅ iframe title
**File:** index.html  
**Vấn đề:** `<iframe>` thiếu `title` attribute  
**Fix:** `title="Video bài giảng Masterclass VN"`

---

## [m-09] ✅ prefers-reduced-motion Fix
**File:** styles.css  
**Vấn đề:** Media query bị vô hiệu bởi `!important` ở nhiều nơi  
**Fix:** Thêm media query với `!important` ở cuối file để override:
`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`

---

## [m-10] ✅ #save Selector Scope Fix
**File:** styles.css  
**Vấn đề:** `#save` selector có thể match ngoài `.notes` context  
**Fix:** Đổi thành `.notes #save, .notes button.primary` để scope chính xác

---

## [m-11] ✅ Close Button Hover Fix
**File:** styles.css  
**Vấn đề:** Close button hover có `rotate(90deg)` không phù hợp tonality  
**Fix:** Override thành `transform: scale(1.1)` — không có rotation

---

## [toast] ✅ Toast Accessibility
**File:** index.html  
**Fix:** Thêm `role="status" aria-live="polite" aria-atomic="true"` vào `#toast`

---

## [qaForm] ✅ Form Textarea Label
**File:** index.html  
**Fix:** Thêm `aria-label="Nhập câu hỏi về nội dung bài học"` vào `#qaInput`

---

## [registerModal] ✅ Overlay Shade
**File:** styles.css  
**Fix:** Thêm backdrop `rgba(6,39,42,0.82)` và `backdrop-filter: blur(10px)` cho `.registerModal`

---

## [button disabled] ✅ Disabled CSS State
**File:** styles.css  
**Fix:**
`css
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
`

---

## [Layout] ✅ homeSlider Consistent
**File:** styles.css  
**Vấn đề:** `.homeSlider` bị khai báo max-width 5 lần với giá trị khác nhau  
**Fix:** 1 rule duy nhất với 3 responsive overrides theo breakpoint chuẩn

---

## [Layout] ✅ Section Container Alignment
**File:** styles.css  
**Fix:** Tất cả section container (`.learnerHub`, `.published`, `.videos`...) dùng cùng 1 formula:
`width: calc(100% - 80px); max-width: 1360px; margin: auto`

---

## [Layout] ✅ Dashboard Grid Fix
**File:** styles.css  
**Vấn đề:** `.dashboard` width conflict với grid `grid-template-columns: 1fr 280px`  
**Fix:** `padding: 12px 0 34px` thay vì `padding: 12px 34px 34px` để tránh double-padding

---

## 📊 Summary

| Category | Issues Fixed | Remaining |
|---|---|---|
| Critical | 2/4 (C-02, C-04) | C-01 refactor, C-03 JS guard |
| Medium | 5/8 | M-04 icons, M-08 security |
| Minor | 11/11 | ✅ Hoàn thành |
| **Total** | **18/23** | 5 còn lại (ngoài scope UI) |

**Estimated improvement:**
- Accessibility: 3/10 → 6/10
- Consistency: 4/10 → 7/10
- Performance: 4/10 → 5/10 (cần build step)
- Typography: 5/10 → 7/10
- Layout: 6/10 → 8/10
