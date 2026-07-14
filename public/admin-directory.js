// Danh sách & chi tiết Học viên / Nhân viên — đọc/ghi qua API thật.
// Giai đoạn 1: "Nhân viên" hiện tạm lọc theo role=admin (chưa có role "staff" riêng trong DB);
// quyền hạn cụ thể được lưu ở cột users.permissions (JSON) thay vì đổi role.
(() => {
  const $ = s => document.querySelector(s);
  const PAGE_SIZE = 10;

  const PERMISSIONS = [
    { key: 'view_students', label: 'Xem danh sách học viên' },
    { key: 'edit_students', label: 'Thêm hoặc sửa học viên' },
    { key: 'grant_courses', label: 'Cấp quyền khóa học' },
    { key: 'grade_submissions', label: 'Chấm bài tập' },
    { key: 'view_payments', label: 'Xem thanh toán' },
    { key: 'manage_products', label: 'Quản lý sản phẩm' },
    { key: 'manage_staff', label: 'Quản lý nhân viên' },
    { key: 'admin_all', label: 'Quản trị toàn hệ thống' },
  ];

  const PLAN_LABELS = {
    starter: 'Chưa có khóa',
    '699k': 'Kinh doanh',
    '999k': 'Kinh doanh + Xây kênh',
    mentoring: 'Toàn bộ khóa học',
    pro: 'Toàn bộ khóa học',
  };
  function planLabel(plan) { return PLAN_LABELS[plan] || plan || 'Chưa có khóa'; }

  function formatDate(sqliteDate) {
    if (!sqliteDate) return '—';
    const datePart = String(sqliteDate).split(' ')[0];
    const [y, m, d] = datePart.split('-');
    if (!y || !m || !d) return sqliteDate;
    return `${d}/${m}/${y}`;
  }
  function formatDateTime(sqliteDate) {
    if (!sqliteDate) return '—';
    const [datePart, timePart] = String(sqliteDate).split(' ');
    return formatDate(datePart) + (timePart ? ' · ' + timePart.slice(0, 5) : '');
  }
  async function adminApiFetch(path, opts = {}) {
    const token = localStorage.getItem('academy_cf_token') || '';
    const res = await fetch((window.CF_API_BASE || '') + '/api' + path, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  // ============================================================
  // STATE
  // ============================================================
  let lastStudents = [];
  let lastStaff = [];
  let studentPage = 1;
  let staffPage = 1;
  let detailEmail = null;
  let detailKind = null; // 'student' | 'staff'
  let detailUser = null;
  let detailTab = 'overview';

  // ============================================================
  // ROW TEMPLATES
  // ============================================================
  function studentRowHtml(u) {
    return `<div class="memberRow">
      <span style="display:flex;align-items:center;gap:9px;">${renderUserAvatar(u)}<span><b>${escHtml(u.name || u.email)}</b><small>${escHtml(u.user_code || '—')}</small></span></span>
      <span><b>${escHtml(u.email)}</b><small>${escHtml(u.phone || 'Chưa cập nhật')}</small></span>
      <span><span class="coursePill">${escHtml(planLabel(u.plan))}</span></span>
      <span>${u.completed_lessons || 0} bài đã hoàn thành</span>
      <span>${renderStatusBadge(u.status)}</span>
      <span>${formatDate(u.created_at)}</span>
      <span><button type="button" data-view-user="${escHtml(u.email)}" data-kind="student">Xem</button></span>
    </div>`;
  }

  function staffRowHtml(u) {
    const workload = `${u.assigned_student_count || 0} HV · ${u.pending_grading_count || 0} bài chờ`;
    return `<div class="memberRow">
      <span style="display:flex;align-items:center;gap:9px;">${renderUserAvatar(u)}<span><b>${escHtml(u.name || u.email)}</b><small>${escHtml(u.user_code || '—')}</small></span></span>
      <span><b>${escHtml(u.email)}</b><small>${escHtml(u.phone || 'Chưa cập nhật')}</small></span>
      <span>Quản trị viên${u.department ? '<small>' + escHtml(u.department) + '</small>' : ''}</span>
      <span>${escHtml(workload)}</span>
      <span>${renderStatusBadge(u.status)}</span>
      <span>${formatDate(u.created_at)}</span>
      <span><button type="button" data-view-user="${escHtml(u.email)}" data-kind="staff">Xem</button></span>
    </div>`;
  }

  // ============================================================
  // STUDENT LIST
  // ============================================================
  async function renderStudentDirectory(term) {
    const list = $('#memberList');
    if (!list) return;
    list.innerHTML = renderLoadingSkeleton(5);
    const q = term ?? $('#memberSearch')?.value ?? '';
    const course = $('#studentCourseFilter')?.value || '';
    const status = $('#studentStatusFilter')?.value || '';
    const progress = $('#studentProgressFilter')?.value || '';
    const dateFrom = $('#studentDateFrom')?.value || '';
    const dateTo = $('#studentDateTo')?.value || '';
    const hasFilter = !!(q || course || status || progress || dateFrom || dateTo);

    try {
      const params = new URLSearchParams({ role: 'student', page: String(studentPage), pageSize: String(PAGE_SIZE) });
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (course) params.set('plan', course);
      if (progress) params.set('progress', progress);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const data = await adminApiFetch('/users?' + params.toString());
      lastStudents = data.items || [];

      $('#studentStatsRow').innerHTML = [
        renderStatCard({ icon: '👥', label: 'Tổng học viên', value: data.total, accent: '#0d7f74' }),
        renderStatCard({ icon: '✓', label: 'Đang hoạt động', value: data.activeCount, accent: '#16a34a' }),
        renderStatCard({ icon: '▶', label: 'Đang học', value: data.studyingCount, accent: '#e7b84f' }),
        renderStatCard({ icon: '◇', label: 'Chưa học', value: data.notStartedCount, accent: '#8b8f9a' }),
      ].join('');

      list.innerHTML = lastStudents.length
        ? lastStudents.map(studentRowHtml).join('')
        : renderEmptyState(hasFilter ? 'Không tìm thấy học viên phù hợp với bộ lọc.' : 'Chưa có học viên nào trong hệ thống.');

      const totalPages = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
      $('#studentPaginationSlot').innerHTML = renderPagination(studentPage, totalPages, 'data-student-page');
    } catch (err) {
      list.innerHTML = renderErrorState('Không tải được danh sách học viên (' + err.message + ').', 'data-retry-students');
      $('#studentStatsRow').innerHTML = '';
    }
  }

  // ============================================================
  // STAFF LIST
  // ============================================================
  async function renderStaffDirectory(term) {
    const list = $('#staffList');
    if (!list) return;
    list.innerHTML = renderLoadingSkeleton(4);
    const q = term ?? $('#staffSearch')?.value ?? '';
    const status = $('#staffStatusFilter')?.value || '';
    const department = $('#staffDepartmentFilter')?.value || '';
    const hasFilter = !!(q || status || department);

    try {
      const params = new URLSearchParams({ role: 'admin', page: String(staffPage), pageSize: String(PAGE_SIZE) });
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (department) params.set('department', department);
      const data = await adminApiFetch('/users?' + params.toString());
      lastStaff = data.items || [];

      $('#staffStatsRow').innerHTML = [
        renderStatCard({ icon: '👤', label: 'Tổng nhân viên', value: data.total, accent: '#0d7f74' }),
        renderStatCard({ icon: '✓', label: 'Đang hoạt động', value: data.activeCount, accent: '#16a34a' }),
        renderStatCard({ icon: '♙', label: 'Có học viên phụ trách', value: data.withStudentsCount, accent: '#7c3aed' }),
        renderStatCard({ icon: '✎', label: 'Bài chờ chấm', value: data.pendingTotal, accent: '#ef846f' }),
      ].join('');

      list.innerHTML = lastStaff.length
        ? lastStaff.map(staffRowHtml).join('')
        : renderEmptyState(hasFilter ? 'Không tìm thấy nhân viên phù hợp với bộ lọc.' : 'Chưa có tài khoản quản trị viên.');
      const totalPages = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
      $('#staffPaginationSlot').innerHTML = renderPagination(staffPage, totalPages, 'data-staff-page');
    } catch (err) {
      list.innerHTML = renderErrorState('Không tải được danh sách nhân viên (' + err.message + ').', 'data-retry-staff');
      $('#staffStatsRow').innerHTML = '';
    }
  }

  // ============================================================
  // DETAIL MODAL — shared shell + per-kind tabs
  // ============================================================
  const STUDENT_TABS = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'course', label: 'Khóa học' },
    { key: 'progress', label: 'Tiến độ' },
    { key: 'submissions', label: 'Bài tập' },
    { key: 'care', label: 'Chăm sóc' },
    { key: 'activity', label: 'Hoạt động' },
  ];
  const STAFF_TABS = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'assigned', label: 'Học viên phụ trách' },
    { key: 'work', label: 'Công việc' },
    { key: 'care', label: 'Lịch sử chăm sóc' },
    { key: 'permissions', label: 'Phân quyền' },
    { key: 'activity', label: 'Hoạt động' },
  ];

  function findUser(email, kind) {
    const src = kind === 'staff' ? lastStaff : lastStudents;
    return src.find(u => u.email === email);
  }

  async function openDetail(email, kind) {
    let user = findUser(email, kind);
    if (!user) {
      try {
        user = await adminApiFetch('/users/' + encodeURIComponent(email));
      } catch (err) {
        toast('Không tìm thấy tài khoản ' + email);
        return;
      }
    }
    detailEmail = email;
    detailKind = kind;
    detailUser = user;
    detailTab = 'overview';

    $('#directoryDetailKind').textContent = kind === 'staff' ? 'NHÂN VIÊN' : 'HỌC VIÊN';
    $('#directoryDetailName').textContent = user.name || user.email;
    $('#directoryDetailSub').textContent = user.email;
    $('#directoryAvatarWrap').innerHTML = renderUserAvatar(user, 56);

    const toggleBtn = $('#directoryToggleStatus');
    const isActive = user.status !== 'inactive';
    toggleBtn.textContent = isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
    toggleBtn.dataset.nextStatus = isActive ? 'inactive' : 'active';

    const tabs = kind === 'staff' ? STAFF_TABS : STUDENT_TABS;
    $('#directoryTabBar').innerHTML = renderDetailTabs(tabs, detailTab);
    await renderDetailTabContent();
    $('#directoryDetail').classList.add('open');
  }

  function closeDetail() {
    $('#directoryDetail')?.classList.remove('open');
  }

  async function switchDetailTab(key) {
    detailTab = key;
    const tabs = detailKind === 'staff' ? STAFF_TABS : STUDENT_TABS;
    $('#directoryTabBar').innerHTML = renderDetailTabs(tabs, detailTab);
    await renderDetailTabContent();
  }

  async function renderDetailTabContent() {
    const el = $('#directoryTabContent');
    el.innerHTML = renderLoadingSkeleton(3);
    try {
      el.innerHTML = detailKind === 'staff'
        ? await renderStaffTab(detailTab, detailUser)
        : await renderStudentTab(detailTab, detailUser);
    } catch (err) {
      el.innerHTML = renderErrorState('Không tải được nội dung (' + err.message + ').', '');
    }
  }

  // ---- Student tabs ----
  async function renderStudentTab(key, user) {
    if (key === 'overview') {
      return `
        <div class="acRow"><span>Mã học viên</span><b>${escHtml(user.user_code || '—')}</b></div>
        <div class="acRow"><span>Họ và tên</span><b>${escHtml(user.name || '—')}</b></div>
        <div class="acRow"><span>Số điện thoại</span><b>${escHtml(user.phone || 'Chưa cập nhật')}</b></div>
        <div class="acRow"><span>Trạng thái</span>${renderStatusBadge(user.status)}</div>
        <div class="acRow"><span>Lần đăng nhập gần nhất</span><b>${user.login_at ? new Date(user.login_at).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</b></div>
        <div class="acRow"><span>Ngày tham gia</span><b>${formatDate(user.created_at)}</b></div>
        <label>Họ và tên<input id="dOverviewName" value="${escHtml(user.name || '')}"></label>
        <label>Số điện thoại<input id="dOverviewPhone" value="${escHtml(user.phone || '')}"></label>
        <div class="acSaveRow"><button type="button" id="dOverviewSave">Lưu thay đổi</button></div>`;
    }
    if (key === 'course') {
      return `
        <label>Khóa học được cấp quyền<select id="dPlan">
          <option value="starter" ${user.plan === 'starter' ? 'selected' : ''}>Chưa có khóa</option>
          <option value="699k" ${user.plan === '699k' ? 'selected' : ''}>Kinh doanh</option>
          <option value="999k" ${user.plan === '999k' ? 'selected' : ''}>Kinh doanh + Xây kênh</option>
          <option value="mentoring" ${user.plan === 'mentoring' ? 'selected' : ''}>Toàn bộ khóa học</option>
        </select></label>
        <div class="acSaveRow"><button type="button" id="dPlanSave">Lưu khóa học</button></div>`;
    }
    if (key === 'progress') {
      return `<div class="acRow"><span>Số bài đã hoàn thành</span><b>${user.completed_lessons || 0}</b></div>
        <p style="color:#6b8082;font-size:11.5px;margin-top:10px;">Tỉ lệ phần trăm tổng khóa học chưa khả dụng — cần đồng bộ tổng số bài học thật từ nội dung khóa học (việc này nằm ngoài phạm vi hiện tại).</p>`;
    }
    if (key === 'submissions') {
      const rows = await adminApiFetch('/submissions?student=' + encodeURIComponent(user.email));
      if (!rows.length) return renderEmptyState('Học viên chưa nộp bài tập nào.');
      return rows.map(s => `<div class="acRow" style="align-items:flex-start;flex-direction:column;gap:6px;">
          <div style="display:flex;justify-content:space-between;width:100%;"><b>Bài: ${escHtml(s.lesson_id)}</b><span>${s.status === 'graded' ? '<i class="statusActive">Đã chấm</i>' : '<i class="statusInactive">Chờ chấm</i>'}</span></div>
          <small style="color:#6b8082;">${escHtml(s.content || '')}</small>
          ${s.status === 'graded' ? `<small>Điểm: <b>${escHtml(s.grade)}</b> — ${escHtml(s.feedback || '')}</small>` : `
          <div style="display:flex;gap:8px;width:100%;margin-top:4px;">
            <input type="text" placeholder="Điểm/nhận xét ngắn" data-grade-input="${s.id}" style="flex:1;padding:8px;border:1px solid #dceceb;border-radius:8px;">
            <button type="button" data-grade-submit="${s.id}" style="border:0;background:#105f68;color:#fff;border-radius:8px;padding:8px 12px;font-size:11px;">Chấm điểm</button>
          </div>`}
        </div>`).join('');
    }
    if (key === 'care') {
      const rows = await adminApiFetch('/care-notes?student=' + encodeURIComponent(user.email));
      const list = rows.length ? rows.map(n => `<div class="acTimelineItem"><i>${n.type === 'call' ? '☎' : n.type === 'chat' ? '✎' : '◇'}</i><div><b>${escHtml(n.staff_name || n.staff_email)}</b><small>${escHtml(n.content)}</small><small>${formatDateTime(n.created_at)}</small></div></div>`).join('') : renderEmptyState('Chưa có ghi chú chăm sóc.');
      return `${list}
        <label>Thêm ghi chú mới<textarea id="dCareText" rows="2" placeholder="Nội dung trao đổi/ghi chú..."></textarea></label>
        <div class="acSaveRow"><button type="button" id="dCareSave">Lưu ghi chú</button></div>`;
    }
    if (key === 'activity') {
      const items = [
        { icon: '★', label: 'Tham gia hệ thống', date: user.created_at },
        { icon: '⏱', label: 'Lần đăng nhập gần nhất', date: user.login_at ? new Date(user.login_at).toISOString() : null },
      ].filter(x => x.date);
      return items.map(x => `<div class="acTimelineItem"><i>${x.icon}</i><div><b>${escHtml(x.label)}</b><small>${formatDateTime(x.date)}</small></div></div>`).join('') || renderEmptyState('Chưa có hoạt động.');
    }
    return '';
  }

  // ---- Staff tabs ----
  async function renderStaffTab(key, user) {
    if (key === 'overview') {
      return `
        <div class="acRow"><span>Mã nhân viên</span><b>${escHtml(user.user_code || '—')}</b></div>
        <div class="acRow"><span>Họ và tên</span><b>${escHtml(user.name || '—')}</b></div>
        <div class="acRow"><span>Số điện thoại</span><b>${escHtml(user.phone || 'Chưa cập nhật')}</b></div>
        <div class="acRow"><span>Bộ phận</span><b>${escHtml(user.department || 'Chưa cập nhật')}</b></div>
        <div class="acRow"><span>Trạng thái</span>${renderStatusBadge(user.status)}</div>
        <div class="acRow"><span>Ngày tạo tài khoản</span><b>${formatDate(user.created_at)}</b></div>
        <label>Họ và tên<input id="dOverviewName" value="${escHtml(user.name || '')}"></label>
        <label>Số điện thoại<input id="dOverviewPhone" value="${escHtml(user.phone || '')}"></label>
        <label>Bộ phận<input id="dOverviewDepartment" value="${escHtml(user.department || '')}"></label>
        <div class="acSaveRow"><button type="button" id="dOverviewSave">Lưu thay đổi</button></div>`;
    }
    if (key === 'assigned') {
      const rows = await adminApiFetch('/assignments?staff=' + encodeURIComponent(user.email));
      const list = rows.length ? rows.map(a => `<div class="acRow"><span>${escHtml(a.student_name || a.student_email)}</span><button type="button" data-unassign="${a.id}" style="border:1px solid #f3c2c2;background:#fde8e8;color:#b42323;border-radius:8px;padding:6px 10px;font-size:10.5px;">Hủy gán</button></div>`).join('') : renderEmptyState('Chưa phụ trách học viên nào.');
      return `${list}
        <label>Gán học viên mới (nhập email)<input id="dAssignEmail" placeholder="hocvien@email.com"></label>
        <div class="acSaveRow"><button type="button" id="dAssignSave">Gán học viên</button></div>`;
    }
    if (key === 'work') {
      const rows = await adminApiFetch('/submissions?staff=' + encodeURIComponent(user.email) + '&status=pending');
      return rows.length ? rows.map(s => `<div class="acRow"><span>${escHtml(s.student_email)} — bài ${escHtml(s.lesson_id)}</span><i class="statusInactive">Chờ chấm</i></div>`).join('') : renderEmptyState('Không có bài chờ chấm.');
    }
    if (key === 'care') {
      const rows = await adminApiFetch('/assignments?staff=' + encodeURIComponent(user.email));
      if (!rows.length) return renderEmptyState('Chưa phụ trách học viên nào nên chưa có lịch sử chăm sóc.');
      const notesPerStudent = await Promise.all(rows.map(a => adminApiFetch('/care-notes?student=' + encodeURIComponent(a.student_email))));
      const flat = notesPerStudent.flat().filter(n => n.staff_email === user.email).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      return flat.length ? flat.map(n => `<div class="acTimelineItem"><i>${n.type === 'call' ? '☎' : n.type === 'chat' ? '✎' : '◇'}</i><div><b>${escHtml(n.student_email)}</b><small>${escHtml(n.content)}</small><small>${formatDateTime(n.created_at)}</small></div></div>`).join('') : renderEmptyState('Chưa có ghi chú chăm sóc nào.');
    }
    if (key === 'permissions') {
      let granted = [];
      try { granted = JSON.parse(user.permissions || '[]'); } catch {}
      const rows = renderPermissionMatrix(PERMISSIONS, granted);
      return `${rows}<div class="acSaveRow"><button type="button" id="dPermSave">Lưu phân quyền</button></div>`;
    }
    if (key === 'activity') {
      const items = [{ icon: '★', label: 'Tham gia hệ thống', date: user.created_at }, { icon: '⏱', label: 'Lần đăng nhập gần nhất', date: user.login_at ? new Date(user.login_at).toISOString() : null }].filter(x => x.date);
      return items.map(x => `<div class="acTimelineItem"><i>${x.icon}</i><div><b>${escHtml(x.label)}</b><small>${formatDateTime(x.date)}</small></div></div>`).join('') || renderEmptyState('Chưa có hoạt động.');
    }
    return '';
  }

  // ============================================================
  // EVENT WIRING
  // ============================================================
  document.addEventListener('click', async e => {
    const viewBtn = e.target.closest('[data-view-user]');
    if (viewBtn) return openDetail(viewBtn.dataset.viewUser, viewBtn.dataset.kind);

    if (e.target.closest('[data-close-directory]')) return closeDetail();

    const tabBtn = e.target.closest('[data-ac-tab]');
    if (tabBtn) return switchDetailTab(tabBtn.dataset.acTab);

    const studentPageBtn = e.target.closest('[data-student-page]');
    if (studentPageBtn && !studentPageBtn.disabled) { studentPage = Number(studentPageBtn.dataset.studentPage); return renderStudentDirectory(); }

    const staffPageBtn = e.target.closest('[data-staff-page]');
    if (staffPageBtn && !staffPageBtn.disabled) { staffPage = Number(staffPageBtn.dataset.staffPage); return renderStaffDirectory(); }

    if (e.target.closest('[data-retry-students]')) return renderStudentDirectory();
    if (e.target.closest('[data-retry-staff]')) return renderStaffDirectory();

    const toggleBtn = e.target.closest('#directoryToggleStatus');
    if (toggleBtn) {
      const ok = await confirmAction(toggleBtn.dataset.nextStatus === 'inactive' ? 'Khóa tài khoản này? Học viên/nhân viên sẽ không thể đăng nhập.' : 'Mở khóa tài khoản này?');
      if (!ok) return;
      return withBusy(toggleBtn, async () => {
        try {
          await adminApiFetch(`/users/${encodeURIComponent(detailEmail)}`, { method: 'PUT', body: { status: toggleBtn.dataset.nextStatus } });
          toast('Đã cập nhật trạng thái tài khoản');
          closeDetail();
          detailKind === 'staff' ? renderStaffDirectory() : renderStudentDirectory();
        } catch (err) { toast('Lỗi: ' + err.message); }
      });
    }

    const overviewSave = e.target.closest('#dOverviewSave');
    if (overviewSave) {
      return withBusy(overviewSave, async () => {
        try {
          const body = { name: $('#dOverviewName').value.trim(), phone: $('#dOverviewPhone').value.trim() };
          if (detailKind === 'staff') body.department = $('#dOverviewDepartment')?.value.trim() || '';
          await adminApiFetch(`/users/${encodeURIComponent(detailEmail)}`, { method: 'PUT', body });
          toast('Đã lưu thông tin');
          detailKind === 'staff' ? renderStaffDirectory() : renderStudentDirectory();
        } catch (err) { toast('Lỗi: ' + err.message); }
      });
    }

    const planSave = e.target.closest('#dPlanSave');
    if (planSave) {
      return withBusy(planSave, async () => {
        try {
          await adminApiFetch(`/access/${encodeURIComponent(detailEmail)}`, { method: 'PUT', body: { plan: $('#dPlan').value } });
          toast('Đã cập nhật khóa học');
          renderStudentDirectory();
        } catch (err) { toast('Lỗi: ' + err.message); }
      });
    }

    const careSave = e.target.closest('#dCareSave');
    if (careSave) {
      const content = $('#dCareText')?.value.trim();
      if (!content) { toast('Vui lòng nhập nội dung ghi chú'); return; }
      return withBusy(careSave, async () => {
        try {
          await adminApiFetch('/care-notes', { method: 'POST', body: { studentEmail: detailKind === 'staff' ? null : detailEmail, type: 'note', content } });
          toast('Đã lưu ghi chú');
          switchDetailTab('care');
        } catch (err) { toast('Lỗi: ' + err.message); }
      });
    }

    const gradeBtn = e.target.closest('[data-grade-submit]');
    if (gradeBtn) {
      const id = gradeBtn.dataset.gradeSubmit;
      const input = document.querySelector(`[data-grade-input="${id}"]`);
      const grade = input?.value.trim();
      if (!grade) { toast('Vui lòng nhập điểm/nhận xét'); return; }
      return withBusy(gradeBtn, async () => {
        try {
          await adminApiFetch(`/submissions/${id}`, { method: 'PUT', body: { grade, feedback: grade } });
          toast('Đã chấm bài');
          switchDetailTab('submissions');
        } catch (err) { toast('Lỗi: ' + err.message); }
      });
    }

    const assignSave = e.target.closest('#dAssignSave');
    if (assignSave) {
      const email = $('#dAssignEmail')?.value.trim().toLowerCase();
      if (!email) { toast('Vui lòng nhập email học viên'); return; }
      return withBusy(assignSave, async () => {
        try {
          await adminApiFetch('/assignments', { method: 'POST', body: { studentEmail: email, staffEmail: detailEmail } });
          toast('Đã gán học viên');
          switchDetailTab('assigned');
        } catch (err) { toast('Lỗi: ' + err.message); }
      });
    }

    const unassignBtn = e.target.closest('[data-unassign]');
    if (unassignBtn) {
      const ok = await confirmAction('Hủy gán học viên này khỏi nhân viên phụ trách?');
      if (!ok) return;
      return withBusy(unassignBtn, async () => {
        try {
          await adminApiFetch(`/assignments/${unassignBtn.dataset.unassign}`, { method: 'DELETE' });
          toast('Đã hủy gán');
          switchDetailTab('assigned');
        } catch (err) { toast('Lỗi: ' + err.message); }
      });
    }

    const permSave = e.target.closest('#dPermSave');
    if (permSave) {
      const checked = Array.from(document.querySelectorAll('[data-perm]:checked')).map(el => el.dataset.perm);
      return withBusy(permSave, async () => {
        try {
          await adminApiFetch(`/users/${encodeURIComponent(detailEmail)}/permissions`, { method: 'PUT', body: { permissions: checked } });
          toast('Đã lưu phân quyền');
          renderStaffDirectory();
        } catch (err) { toast('Lỗi: ' + err.message); }
      });
    }

    const addUserBtn = e.target.closest('[data-add-user]');
    if (addUserBtn) {
      const role = addUserBtn.dataset.addUser;
      $('#createUserForm').reset();
      $('#createUserRole').value = role;
      $('#createUserKind').textContent = role === 'admin' ? 'NHÂN VIÊN' : 'HỌC VIÊN';
      $('#createUserTitle').textContent = role === 'admin' ? 'Thêm nhân viên mới' : 'Thêm học viên mới';
      $('#createUserDepartmentField').style.display = role === 'admin' ? '' : 'none';
      $('#createUserModal').classList.add('open');
      return;
    }
    if (e.target.closest('[data-close-create-user]')) { $('#createUserModal')?.classList.remove('open'); return; }
  });

  document.addEventListener('submit', async e => {
    const form = e.target.closest('#createUserForm');
    if (!form) return;
    e.preventDefault();
    const role = $('#createUserRole').value;
    const submitBtn = form.querySelector('button[type="submit"], button.primary');
    return withBusy(submitBtn, async () => {
      try {
        const data = await adminApiFetch('/admin/create-user', {
          method: 'POST',
          body: {
            name: $('#createUserName').value.trim(),
            email: $('#createUserEmail').value.trim().toLowerCase(),
            phone: $('#createUserPhone').value.trim(),
            department: $('#createUserDepartment')?.value.trim() || '',
            role,
          },
        });
        $('#createUserModal').classList.remove('open');
        toast(`Đã tạo tài khoản. Mã: ${data.userCode} — mật khẩu tạm: ${data.tempPassword} (gửi riêng cho ${role === 'admin' ? 'nhân viên' : 'học viên'})`);
        role === 'admin' ? renderStaffDirectory() : renderStudentDirectory();
      } catch (err) {
        toast('Lỗi: ' + err.message);
      }
    });
  });

  function bindFilters() {
    const memberSearch = $('#memberSearch');
    if (memberSearch) memberSearch.oninput = e => { studentPage = 1; renderStudentDirectory(e.target.value); };
    const staffSearch = $('#staffSearch');
    if (staffSearch) staffSearch.oninput = e => { staffPage = 1; renderStaffDirectory(e.target.value); };
    ['#studentCourseFilter', '#studentStatusFilter', '#studentProgressFilter', '#studentDateFrom', '#studentDateTo'].forEach(sel => {
      const el = $(sel);
      if (el) el.onchange = () => { studentPage = 1; renderStudentDirectory(); };
    });
    const staffStatusFilter = $('#staffStatusFilter');
    if (staffStatusFilter) staffStatusFilter.onchange = () => { staffPage = 1; renderStaffDirectory(); };
    const staffDepartmentFilter = $('#staffDepartmentFilter');
    if (staffDepartmentFilter) staffDepartmentFilter.oninput = () => { staffPage = 1; renderStaffDirectory(); };
  }

  function openDetailFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const studentEmail = params.get('student');
    const staffEmail = params.get('staff');
    if (studentEmail) openDetail(studentEmail, 'student');
    else if (staffEmail) openDetail(staffEmail, 'staff');
  }

  window.renderStudentDirectory = renderStudentDirectory;
  window.renderStaffDirectory = renderStaffDirectory;

  setTimeout(() => {
    bindFilters();
    renderStudentDirectory();
    renderStaffDirectory();
    openDetailFromUrl();
  }, 300);
})();
