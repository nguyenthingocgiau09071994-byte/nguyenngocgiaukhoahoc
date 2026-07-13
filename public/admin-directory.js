// Danh sách học viên & nhân viên — đọc/ghi trực tiếp qua API thật (không dùng localStorage)
// Giai đoạn 1: "Nhân viên" hiện tạm lọc theo role=admin (chưa có role "staff" riêng trong DB).
(() => {
  const $ = s => document.querySelector(s);

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function initials(name, email) {
    const src = (name || email || '?').trim();
    const parts = src.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
  }

  function formatDate(sqliteDate) {
    if (!sqliteDate) return '—';
    const datePart = String(sqliteDate).split(' ')[0];
    const [y, m, d] = datePart.split('-');
    if (!y || !m || !d) return sqliteDate;
    return `${d}/${m}/${y}`;
  }

  const PLAN_LABELS = {
    starter: 'Chưa có khóa',
    '699k': 'Kinh doanh',
    '999k': 'Kinh doanh + Xây kênh',
    mentoring: 'Toàn bộ khóa học',
    pro: 'Toàn bộ khóa học',
  };
  function planLabel(plan) {
    return PLAN_LABELS[plan] || plan || 'Chưa có khóa';
  }

  async function adminApiFetch(path, opts = {}) {
    const token = localStorage.getItem('academy_cf_token') || '';
    const res = await fetch((window.CF_API_BASE || '') + '/api' + path, {
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  function avatarCell(user) {
    const img = user.avatar
      ? `<img src="${esc(user.avatar)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
      : `<span style="width:34px;height:34px;border-radius:50%;background:#c8e6e2;color:#105f68;display:grid;place-items:center;font-size:11px;font-weight:800;flex-shrink:0;">${esc(initials(user.name, user.email))}</span>`;
    return `<span style="display:flex;align-items:center;gap:9px;"><span>${img}</span><span><b>${esc(user.name || user.email)}</b><small>${esc(user.user_code || '—')}</small></span></span>`;
  }

  function statusBadge(status) {
    const active = status !== 'inactive';
    return `<i class="${active ? 'statusActive' : 'statusInactive'}">${active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</i>`;
  }

  let lastStudents = [];
  let lastStaff = [];

  function progressTier(count) {
    return count > 0 ? 'some' : 'none';
  }

  function studentRowHtml(u) {
    return `<div class="memberRow">
      <span>${avatarCell(u)}</span>
      <span><b>${esc(u.email)}</b><small>${esc(u.phone || 'Chưa cập nhật')}</small></span>
      <span><span class="coursePill">${esc(planLabel(u.plan))}</span></span>
      <span>${u.completed_lessons || 0} bài đã hoàn thành</span>
      <span>${statusBadge(u.status)}</span>
      <span>${formatDate(u.created_at)}</span>
      <span><button type="button" data-view-user="${esc(u.email)}" data-kind="student">Xem</button></span>
    </div>`;
  }

  function staffRowHtml(u) {
    return `<div class="memberRow">
      <span>${avatarCell(u)}</span>
      <span><b>${esc(u.email)}</b><small>${esc(u.phone || 'Chưa cập nhật')}</small></span>
      <span>Quản trị viên</span>
      <span>—</span>
      <span>${statusBadge(u.status)}</span>
      <span>${formatDate(u.created_at)}</span>
      <span><button type="button" data-view-user="${esc(u.email)}" data-kind="staff">Xem</button></span>
    </div>`;
  }

  async function renderStudentDirectory(term) {
    const list = $('#memberList');
    if (!list) return;
    const q = term ?? $('#memberSearch')?.value ?? '';
    const course = $('#studentCourseFilter')?.value || '';
    const status = $('#studentStatusFilter')?.value || '';
    try {
      const params = new URLSearchParams({ role: 'student' });
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      const rows = await adminApiFetch('/users?' + params.toString());
      lastStudents = Array.isArray(rows) ? rows : [];
    } catch (err) {
      list.innerHTML = `<div class="adminEmpty">Không tải được danh sách học viên (${esc(err.message)}).</div>`;
      return;
    }
    const progress = $('#studentProgressFilter')?.value || '';
    const filtered = lastStudents.filter(u => {
      if (course && u.plan !== course) return false;
      if (progress && progressTier(u.completed_lessons) !== progress) return false;
      return true;
    });
    $('#totalMembers') && ($('#totalMembers').textContent = lastStudents.length);
    $('#proMembers') && ($('#proMembers').textContent = lastStudents.filter(u => u.plan && u.plan !== 'starter').length);
    const todayKey = new Date().toISOString().slice(0, 10);
    $('#newMembers') && ($('#newMembers').textContent = lastStudents.filter(u => (u.created_at || '').startsWith(todayKey)).length);
    list.innerHTML = filtered.length
      ? filtered.map(studentRowHtml).join('')
      : '<div class="adminEmpty">Chưa có học viên phù hợp.</div>';
  }

  async function renderStaffDirectory(term) {
    const list = $('#staffList');
    if (!list) return;
    const q = term ?? $('#staffSearch')?.value ?? '';
    try {
      const params = new URLSearchParams({ role: 'admin' });
      if (q) params.set('q', q);
      const rows = await adminApiFetch('/users?' + params.toString());
      lastStaff = Array.isArray(rows) ? rows : [];
    } catch (err) {
      list.innerHTML = `<div class="adminEmpty">Không tải được danh sách nhân viên (${esc(err.message)}).</div>`;
      return;
    }
    list.innerHTML = lastStaff.length
      ? lastStaff.map(staffRowHtml).join('')
      : '<div class="adminEmpty">Chưa có tài khoản quản trị viên.</div>';
  }

  function openDetail(email, kind) {
    const source = kind === 'staff' ? lastStaff : lastStudents;
    const user = source.find(u => u.email === email);
    if (!user) return;
    $('#directoryDetailKind').textContent = kind === 'staff' ? 'NHÂN VIÊN' : 'HỌC VIÊN';
    $('#directoryDetailName').textContent = user.name || user.email;
    $('#directoryName').value = user.name || '';
    $('#directoryPhone').value = user.phone || '';
    $('#directoryEmail').value = user.email;
    $('#directoryCode').value = user.user_code || '—';
    $('#directoryJoined').value = formatDate(user.created_at);
    $('#directoryCourseRow').style.display = kind === 'staff' ? 'none' : '';
    $('#directoryPlan').value = user.plan && PLAN_LABELS[user.plan] ? user.plan : 'starter';
    const toggleBtn = $('#directoryToggleStatus');
    const isActive = user.status !== 'inactive';
    toggleBtn.textContent = isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
    toggleBtn.dataset.email = user.email;
    toggleBtn.dataset.kind = kind;
    toggleBtn.dataset.nextStatus = isActive ? 'inactive' : 'active';
    $('#directoryDetailForm').dataset.email = user.email;
    $('#directoryDetailForm').dataset.kind = kind;
    $('#directoryDetail').classList.add('open');
  }

  function closeDetail() {
    $('#directoryDetail')?.classList.remove('open');
  }

  document.addEventListener('click', e => {
    const viewBtn = e.target.closest('[data-view-user]');
    if (viewBtn) openDetail(viewBtn.dataset.viewUser, viewBtn.dataset.kind);
    if (e.target.closest('[data-close-directory]')) closeDetail();
  });

  document.addEventListener('click', async e => {
    const toggleBtn = e.target.closest('#directoryToggleStatus');
    if (!toggleBtn) return;
    try {
      await adminApiFetch(`/users/${encodeURIComponent(toggleBtn.dataset.email)}`, {
        method: 'PUT',
        body: { status: toggleBtn.dataset.nextStatus },
      });
      if (typeof toast === 'function') toast('Đã cập nhật trạng thái tài khoản');
      closeDetail();
      if (toggleBtn.dataset.kind === 'staff') renderStaffDirectory(); else renderStudentDirectory();
    } catch (err) {
      if (typeof toast === 'function') toast('Lỗi: ' + err.message);
    }
  });

  document.addEventListener('submit', async e => {
    const form = e.target.closest('#directoryDetailForm');
    if (!form) return;
    e.preventDefault();
    const email = form.dataset.email;
    const kind = form.dataset.kind;
    try {
      await adminApiFetch(`/users/${encodeURIComponent(email)}`, {
        method: 'PUT',
        body: { name: $('#directoryName').value.trim(), phone: $('#directoryPhone').value.trim() },
      });
      if (kind !== 'staff') {
        await adminApiFetch(`/access/${encodeURIComponent(email)}`, {
          method: 'PUT',
          body: { plan: $('#directoryPlan').value },
        });
      }
      if (typeof toast === 'function') toast('Đã lưu thay đổi');
      closeDetail();
      if (kind === 'staff') renderStaffDirectory(); else renderStudentDirectory();
    } catch (err) {
      if (typeof toast === 'function') toast('Lỗi: ' + err.message);
    }
  });

  function bindFilters() {
    const memberSearch = $('#memberSearch');
    if (memberSearch) memberSearch.oninput = e => renderStudentDirectory(e.target.value);
    const staffSearch = $('#staffSearch');
    if (staffSearch) staffSearch.oninput = e => renderStaffDirectory(e.target.value);
    ['#studentCourseFilter', '#studentStatusFilter', '#studentProgressFilter'].forEach(sel => {
      const el = $(sel);
      if (el) el.onchange = () => renderStudentDirectory();
    });
  }

  window.renderStudentDirectory = renderStudentDirectory;
  window.renderStaffDirectory = renderStaffDirectory;

  setTimeout(() => {
    bindFilters();
    renderStudentDirectory();
  }, 300);
})();
