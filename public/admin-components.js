// Bộ component dùng chung cho các trang quản trị (Học viên, Nhân viên...)
// Vanilla JS thuần — mỗi hàm trả về 1 chuỗi HTML, dùng chung 1 kiểu để đồng bộ giao diện.

function escHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initialsOf(name, email) {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function renderUserAvatar(user, size) {
  size = size || 34;
  const img = user.avatar
    ? `<img src="${escHtml(user.avatar)}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
    : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:#c8e6e2;color:#105f68;display:grid;place-items:center;font-size:${Math.round(size * 0.32)}px;font-weight:800;flex-shrink:0;">${escHtml(initialsOf(user.name, user.email))}</span>`;
  return img;
}

function renderStatCard(opts) {
  const accent = opts.accent || '#105f68';
  return `<article class="acStatCard">
    <i class="acStatIcon" style="background:${accent}1a;color:${accent};">${opts.icon || '◆'}</i>
    <div><small>${escHtml(opts.label)}</small><b>${escHtml(opts.value)}</b></div>
  </article>`;
}

function renderStatusBadge(status) {
  const active = status !== 'inactive';
  return `<i class="${active ? 'statusActive' : 'statusInactive'}">${active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</i>`;
}

function renderProgressBar(percent) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return `<div class="acProgressBar"><i style="width:${p}%"></i></div>`;
}

function renderEmptyState(message) {
  return `<div class="acEmptyState"><span>◇</span><p>${escHtml(message)}</p></div>`;
}

function renderErrorState(message, retryAttr) {
  return `<div class="acErrorState"><span>⚠</span><p>${escHtml(message)}</p><button type="button" ${retryAttr || ''}>Thử lại</button></div>`;
}

function renderLoadingSkeleton(rows) {
  rows = rows || 4;
  let out = '<div class="acSkeletonWrap">';
  for (let i = 0; i < rows; i++) out += '<div class="acSkeletonRow"><i></i><i></i><i></i></div>';
  return out + '</div>';
}

function renderPagination(page, totalPages, dataAttrName) {
  if (totalPages <= 1) return '';
  const attr = dataAttrName || 'data-ac-page';
  let out = '<div class="acPagination">';
  out += `<button type="button" ${attr}="${page - 1}" ${page <= 1 ? 'disabled' : ''}>‹ Trước</button>`;
  out += `<span>Trang ${page} / ${totalPages}</span>`;
  out += `<button type="button" ${attr}="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>Sau ›</button>`;
  return out + '</div>';
}

function renderDetailTabs(tabs, activeKey) {
  return '<div class="acDetailTabs">' + tabs.map(t =>
    `<button type="button" class="${t.key === activeKey ? 'active' : ''}" data-ac-tab="${t.key}">${escHtml(t.label)}</button>`
  ).join('') + '</div>';
}

// Modal xác nhận trước thao tác quan trọng (khóa tài khoản, xóa...)
function confirmAction(message) {
  return new Promise(resolve => {
    let modal = document.querySelector('#acConfirmModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'acConfirmModal';
      modal.className = 'acConfirmModal';
      modal.innerHTML = '<div class="acConfirmShade"></div><div class="acConfirmCard"><p id="acConfirmText"></p><footer><button type="button" id="acConfirmCancel">Hủy</button><button type="button" id="acConfirmOk" class="danger">Xác nhận</button></footer></div>';
      document.body.appendChild(modal);
    }
    modal.querySelector('#acConfirmText').textContent = message;
    modal.classList.add('open');
    const cleanup = () => { modal.classList.remove('open'); };
    modal.querySelector('#acConfirmOk').onclick = () => { cleanup(); resolve(true); };
    modal.querySelector('#acConfirmCancel').onclick = () => { cleanup(); resolve(false); };
    modal.querySelector('.acConfirmShade').onclick = () => { cleanup(); resolve(false); };
  });
}

// Disable 1 nút trong lúc đang gửi dữ liệu, tự bật lại khi xong (kể cả khi lỗi).
async function withBusy(button, fn) {
  if (!button) return fn();
  const prevDisabled = button.disabled;
  button.disabled = true;
  try {
    return await fn();
  } finally {
    button.disabled = prevDisabled;
  }
}

function renderSearchInput(opts) {
  opts = opts || {};
  return `<input type="text" id="${opts.id}" placeholder="${escHtml(opts.placeholder || 'Tìm kiếm...')}">`;
}

// filters: [{ type:'select', id, placeholder, options:[{value,label}] } | { type:'text', id, placeholder } | { type:'date', id, placeholder }]
function renderFilterBar(filters) {
  return (filters || []).map(f => {
    if (f.type === 'select') {
      const opts = (f.options || []).map(o => `<option value="${escHtml(o.value)}">${escHtml(o.label)}</option>`).join('');
      return `<select id="${f.id}"><option value="">${escHtml(f.placeholder || 'Tất cả')}</option>${opts}</select>`;
    }
    if (f.type === 'date') {
      return `<input type="date" id="${f.id}" title="${escHtml(f.placeholder || '')}">`;
    }
    return `<input type="text" id="${f.id}" placeholder="${escHtml(f.placeholder || '')}">`;
  }).join('');
}

// Danh sách quyền dạng checkbox — permissions: [{key,label}], granted: string[]
function renderPermissionMatrix(permissions, granted) {
  granted = granted || [];
  return permissions.map(p =>
    `<label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-weight:400;"><input type="checkbox" data-perm="${p.key}" ${granted.includes(p.key) ? 'checked' : ''} style="width:auto;margin:0;"> ${escHtml(p.label)}</label>`
  ).join('');
}

// Tiêu đề trang chuẩn: nhãn nhỏ (eyebrow) + tiêu đề + khu vực thao tác (nút thêm, tìm kiếm...).
// Giữ đúng cấu trúc .adminTitle đang dùng trong admin.html để không đổi CSS/layout hiện có.
function renderPageHeader(opts) {
  opts = opts || {};
  return `<div class="adminTitle">
    <div><span>${escHtml(opts.eyebrow || '')}</span><h2>${escHtml(opts.title || '')}</h2>${opts.description ? `<p>${escHtml(opts.description)}</p>` : ''}</div>
    ${opts.actionsHtml || ''}
  </div>`;
}

// Bảng dữ liệu dùng chung: chỉ chuẩn hóa khung bảng (header + khu vực chứa hàng),
// vẫn dùng lại các hàm render hàng riêng của từng trang (studentRowHtml, staffRowHtml...)
// thay vì áp đặt 1 cấu trúc cột chung — tránh viết lại logic hàng đang chạy ổn.
function renderDataTable(opts) {
  opts = opts || {};
  const headCells = (opts.columns || []).map(c => `<span>${escHtml(c)}</span>`).join('');
  return `<div class="${opts.tableClass || 'memberTable'}">
    <div class="${opts.rowClass || 'memberRow'} ${opts.headClass || 'memberHead'}">${headCells}</div>
    <div id="${opts.bodyId}">${opts.bodyHtml || ''}</div>
  </div>`;
}
