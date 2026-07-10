-- ============================================================
-- Seed Data — Masterclass VN (Cloudflare D1)
-- Chạy sau khi schema.sql đã được apply
-- ============================================================

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM users;
DELETE FROM user_access;
DELETE FROM members;
DELETE FROM content;
DELETE FROM user_progress;
DELETE FROM user_favorites;
DELETE FROM user_notes;
DELETE FROM lesson_qa;

-- ─── ADMIN USERS ───────────────────────────────────────────
-- NOTE: password_hash cần được tạo từ /auth/register API
-- Hoặc chạy query UPDATE sau khi đăng ký thành công
-- UPDATE users SET role='admin', plan='pro' WHERE email IN ('admin@masterclass.vn', 'nguyenngocgiau.com@gmail.com');

-- ─── CONTENT: Bài viết mẫu ─────────────────────────────────
INSERT INTO content (item_id, type, category, placement, access_plan, status, title, summary, image, date, views, likes, content)
VALUES
('c101', 'Bài viết', 'KINH DOANH', 'homepage', 'public', 'published',
 '5 bước xây dựng chiến lược kinh doanh bền vững',
 'Một chiến lược tốt không bắt đầu bằng việc làm thật nhiều, mà bắt đầu từ việc lựa chọn đúng hướng đi.',
 'assets/slide-business.png',
 '01/07/2026',
 4200, 890,
 '<p>Một chiến lược tốt không bắt đầu bằng việc làm thật nhiều, mà bắt đầu từ việc lựa chọn đúng hướng đi.</p><h3>1. Xác định vấn đề cần giải quyết</h3><p>Hãy bắt đầu từ một nhu cầu có thật của khách hàng.</p><h3>2. Chọn đúng nhóm khách hàng</h3><p>Một thông điệp dành cho tất cả mọi người thường không thuyết phục được ai.</p><h3>3. Xây dựng lợi thế khác biệt</h3><p>Khác biệt có thể đến từ chuyên môn, trải nghiệm, tốc độ, dịch vụ.</p><h3>4. Thiết kế hệ thống bán hàng</h3><p>Tạo hành trình rõ ràng từ khi khách hàng biết đến bạn đến khi họ tin tưởng.</p><h3>5. Đo lường và cải tiến</h3><p>Theo dõi doanh thu, chi phí, tỷ lệ chuyển đổi mỗi tuần.</p>'),

('c102', 'Bài viết', 'CONTENT & VIDEO', 'homepage', 'public', 'published',
 'Xây thương hiệu cá nhân bằng video ngắn',
 'Video ngắn là cách nhanh nhất để khách hàng nhìn thấy năng lực, cá tính và quan điểm của bạn.',
 'assets/slide-content.png',
 '30/06/2026',
 5800, 1400,
 '<p>Video ngắn là cách nhanh nhất để khách hàng nhìn thấy năng lực, cá tính và quan điểm của bạn.</p><h3>Chọn ba trụ cột nội dung</h3><p>Một trụ cột về chuyên môn, một trụ cột về trải nghiệm thực tế và một trụ cột thể hiện góc nhìn cá nhân.</p><h3>Viết kịch bản đơn giản</h3><p>Mỗi video chỉ cần ba phần: câu mở đầu gây chú ý, một ý chính có giá trị và lời kêu gọi hành động rõ ràng.</p><h3>Ưu tiên sự đều đặn</h3><p>Đăng ba video tốt mỗi tuần hiệu quả hơn việc chờ đợi một video hoàn hảo.</p>'),

('c103', 'Bài viết', 'PHÁT TRIỂN BẢN THÂN', 'homepage', 'public', 'published',
 'Làm chủ thời gian, nâng tầm hiệu suất',
 'Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng.',
 'assets/slide-growth.png',
 '29/06/2026',
 3900, 760,
 '<p>Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng. Một ngày hiệu quả không cần quá nhiều đầu việc.</p><h3>Chọn ba ưu tiên mỗi ngày</h3><p>Trước khi bắt đầu, hãy viết ra ba kết quả quan trọng nhất.</p><h3>Làm việc theo khối tập trung</h3><p>Dành 60–90 phút không thông báo cho công việc cần tư duy sâu.</p><h3>Tạo khoảng nghỉ có chủ đích</h3><p>Nghỉ ngắn giữa các phiên làm việc giúp não bộ phục hồi.</p>'),

('c104', 'Video', 'VIDEO & SALE', 'video', 'starter', 'published',
 'Công thức 3 giây đầu video',
 'Cách giữ chân người xem ngay trong 3 giây đầu tiên bằng câu hook thu hút.',
 'assets/slide-content.png',
 '27/06/2026',
 2100, 510,
 '<p>3 giây đầu tiên quyết định 80% sự thành bại của một video ngắn.</p>'),

('c105', 'Video', 'KINH DOANH', 'featured', 'pro', 'published',
 'Quy tắc định giá sản phẩm',
 'Phương pháp tính giá bán dựa trên giá trị cảm nhận thay vì chi phí sản xuất thuần túy.',
 'assets/slide-business.png',
 '26/06/2026',
 1900, 430,
 '<p>Đừng cạnh tranh bằng giá rẻ. Hãy nâng cao giá trị lời chào hàng (offer).</p>'),

('c106', 'Video', 'PHÁT TRIỂN BẢN THÂN', 'video', 'mentoring', 'published',
 'Quản lý năng lượng cá nhân',
 'Bí quyết duy trì năng lượng đỉnh cao trong suốt chuỗi ngày làm việc và sáng tạo liên tục.',
 'assets/slide-growth.png',
 '24/06/2026',
 3100, 680,
 '<p>Ngủ đủ giấc, vận động nhẹ và thiền định 15 phút mỗi sáng là nền tảng cho hiệu suất làm việc vô địch.</p>');
