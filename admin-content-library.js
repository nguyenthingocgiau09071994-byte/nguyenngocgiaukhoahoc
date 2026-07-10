(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const placementLabel = {
    homepage: 'Trang chủ - Nội dung mới',
    featured: 'Nổi bật trang chủ',
    video: 'Thư viện video',
    curriculum: 'Chương trình học chi tiết'
  };

  const accessLabel = {
    public: 'Công khai',
    starter: 'Chưa cấp quyền',
    '699k': '699K - Khóa Kinh doanh',
    '999k': '999K - Khóa Phát triển bản thân',
    mentoring: 'Toàn bộ khóa học',
    none: 'Chưa cấp quyền',
    course699: '699K - Khóa Kinh doanh',
    course999: '999K - Khóa Phát triển bản thân',
    all: 'Toàn bộ khóa học'
  };

  const typeIcon = {
    'Bài viết': '✎',
    'Bài viết khoa học': '✎',
    Video: '▶',
    'Bài học': '▤',
    'Ghi chú học tập': '✦',
    'Thông báo': '!'
  };

  const defaults = [
    { id: 1, type: 'Bài viết', category: 'Kinh doanh', placement: 'homepage', accessPlan: 'public', status: 'published', title: '7 sai lầm người mới kinh doanh thường gặp', summary: 'Những vấn đề cần tránh để tiết kiệm thời gian và nguồn lực.', date: '01/07/2026', image: 'assets/slide-business.png', content: '<p>Những sai lầm phổ biến khi bắt đầu kinh doanh và cách tránh.</p>' },
    { id: 2, type: 'Video', category: 'Content & Video', placement: 'video', accessPlan: 'public', status: 'published', title: 'Cách xây nội dung bán hàng không gây khó chịu', summary: 'Bài giảng thực hành với ví dụ và công thức dễ áp dụng.', date: '30/06/2026', image: 'assets/slide-content.png', video: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', content: '<p>Video hướng dẫn cách xây nội dung bán hàng tự nhiên.</p>' },
    { id: 101, type: 'Bài viết khoa học', category: 'Kinh doanh', placement: 'featured', accessPlan: 'public', status: 'published', title: '5 bước xây dựng chiến lược kinh doanh bền vững', summary: 'Một chiến lược tốt bắt đầu từ việc lựa chọn đúng hướng đi.', date: '01/07/2026', image: 'assets/slide-business.png', content: '<p>Một chiến lược tốt bắt đầu từ việc lựa chọn đúng hướng đi.</p>' },
    { id: 102, type: 'Bài viết khoa học', category: 'Content & Video', placement: 'homepage', accessPlan: 'public', status: 'published', title: 'Xây thương hiệu cá nhân bằng video ngắn', summary: 'Video ngắn giúp khách hàng nhìn thấy năng lực, cá tính và quan điểm của bạn.', date: '30/06/2026', image: 'assets/slide-content.png', content: '<p>Video ngắn là cách nhanh nhất để khách hàng nhìn thấy năng lực và cá tính của bạn.</p>' },
    { id: 103, type: 'Bài viết khoa học', category: 'Phát triển bản thân', placement: 'featured', accessPlan: 'public', status: 'published', title: 'Làm chủ thời gian, nâng tầm hiệu suất', summary: 'Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng.', date: '29/06/2026', image: 'assets/slide-growth.png', content: '<p>Quản trị thời gian thực chất là quản trị sự tập trung và năng lượng.</p>' },
    { id: 104, type: 'Ghi chú học tập', category: 'Content & Video', placement: 'curriculum', accessPlan: 'starter', status: 'published', title: 'Công thức 3 giây đầu video', summary: 'Cách giữ chân người xem ngay trong 3 giây đầu tiên bằng câu hook thu hút.', date: '27/06/2026', image: 'assets/slide-content.png', content: '<p>3 giây đầu tiên quyết định khả năng giữ chân người xem.</p>' },
    { id: 105, type: 'Ghi chú học tập', category: 'Kinh doanh', placement: 'curriculum', accessPlan: '699k', status: 'published', title: 'Quy tắc định giá sản phẩm', summary: 'Phương pháp tính giá bán dựa trên giá trị cảm nhận thay vì chi phí thuần túy.', date: '26/06/2026', image: 'assets/slide-business.png', content: '<p>Đừng cạnh tranh bằng giá rẻ, hãy nâng cao giá trị lời chào hàng.</p>' },
    { id: 106, type: 'Ghi chú học tập', category: 'Phát triển bản thân', placement: 'curriculum', accessPlan: '999k', status: 'published', title: 'Quản lý năng lượng cá nhân', summary: 'Bí quyết duy trì năng lượng đỉnh cao trong suốt chuỗi ngày làm việc.', date: '24/06/2026', image: 'assets/slide-growth.png', content: '<p>Ngủ đủ, vận động nhẹ và nghỉ có chủ đích giúp giữ hiệu suất cao.</p>' }
  ];

  const toStoreAccess = (v) => v === 'course699' || v === 'pro' ? '699k' : v === 'course999' || v === 'vip' ? '999k' : v === 'all' ? 'mentoring' : v === 'none' ? 'starter' : v || 'public';
  const toUiAccess = (v) => v === '699k' ? 'course699' : v === '999k' ? 'course999' : v === 'mentoring' ? 'all' : v === 'starter' ? 'none' : v || 'public';

  function rows() {
    const list = JSON.parse(localStorage.getItem('academy_content') || '[]');
    let changed = false;
    defaults.forEach(def => {
      const found = list.find(x => String(x.id) === String(def.id) || x.title === def.title);
      if (!found) {
        list.push(def);
        changed = true;
      } else {
        ['type', 'category', 'placement', 'accessPlan', 'status'].forEach(key => {
          if (!found[key]) {
            found[key] = def[key];
            changed = true;
          }
        });
        if (String(found.id) === String(def.id)) {
          if (found.placement !== def.placement) {
            found.placement = def.placement;
            changed = true;
          }
          if (toStoreAccess(found.accessPlan) !== toStoreAccess(def.accessPlan)) {
            found.accessPlan = def.accessPlan;
            changed = true;
          }
        }
      }
    });
    if (changed) localStorage.setItem('academy_content', JSON.stringify(list));
    return list.map(x => ({
      ...x,
      type: x.type || 'Bài viết',
      category: x.category || 'Kinh doanh',
      placement: x.placement || 'homepage',
      accessPlan: toStoreAccess(x.accessPlan || 'public'),
      status: x.status || 'published'
    }));
  }

  function saveRows(list) {
    localStorage.setItem('academy_content', JSON.stringify(list.map(x => ({ ...x, accessPlan: toStoreAccess(x.accessPlan) }))));
    if (typeof contents !== 'undefined') contents = JSON.parse(localStorage.getItem('academy_content') || '[]');
  }

  function setupControls() {
    const title = $('.adminWorkspace .adminTitle');
    if (title && !$('#contentPlacementFilter')) {
      const tools = document.createElement('div');
      tools.className = 'contentAdminTools';
      tools.innerHTML = '<select id="contentPlacementFilter"><option value="">Tất cả vị trí</option><option value="homepage">Trang chủ - Nội dung mới</option><option value="featured">Nổi bật trang chủ</option><option value="video">Thư viện video</option><option value="curriculum">Chương trình học chi tiết</option></select><select id="contentCategoryFilter"><option value="">Tất cả danh mục</option></select>';
      title.appendChild(tools);
      $('#contentPlacementFilter').onchange = () => render();
      $('#contentCategoryFilter').onchange = () => render();
    }

    const placement = $('#editPlacement');
    const category = $('#editCategory');
    const access = $('#editAccess');
    const type = $('#editType');
    if (placement) placement.innerHTML = '<option value="homepage">Trang chủ - Nội dung mới</option><option value="featured">Nổi bật trang chủ</option><option value="video">Thư viện video</option><option value="curriculum">Chương trình học chi tiết</option>';
    if (category) category.innerHTML = '<option>Kinh doanh</option><option>Content & Video</option><option>Phát triển bản thân</option><option>Bài học</option><option>Thông báo</option>';
    if (access) access.innerHTML = '<option value="public">Công khai</option><option value="none">Chưa cấp quyền</option><option value="course699">699K - Khóa Kinh doanh</option><option value="course999">999K - Khóa Phát triển bản thân</option><option value="all">Toàn bộ khóa học</option>';
    if (type) type.innerHTML = '<option>Bài viết</option><option>Video</option><option>Bài học</option><option>Ghi chú học tập</option><option>Thông báo</option>';
  }

  function updateCategoryFilter(list) {
    const select = $('#contentCategoryFilter');
    if (!select) return;
    const current = select.value;
    const cats = [...new Set(list.map(x => x.category).filter(Boolean))].sort();
    select.innerHTML = '<option value="">Tất cả danh mục</option>' + cats.map(c => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
    select.value = cats.includes(current) ? current : '';
  }

  function render(term) {
    setupControls();
    const list = rows();
    updateCategoryFilter(list);
    const query = String(term ?? $('#adminSearch')?.value ?? '').toLowerCase();
    const selectedPlacement = $('#contentPlacementFilter')?.value || '';
    const selectedCategory = $('#contentCategoryFilter')?.value || '';
    const filtered = list.filter(x => {
      const haystack = [x.title, x.summary, x.category, x.type, placementLabel[x.placement]].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (!selectedPlacement || x.placement === selectedPlacement) && (!selectedCategory || x.category === selectedCategory);
    });

    const head = $('.adminTable .adminHead');
    if (head) head.innerHTML = '<span>Nội dung</span><span>Danh mục</span><span>Hiển thị ở đâu</span><span>Phân quyền</span><span>Trạng thái</span><span>Thao tác</span>';

    const target = $('#adminContentList');
    if (!target) return;
    target.innerHTML = filtered.length ? filtered.slice().reverse().map(item => {
      const icon = typeIcon[item.type] || '✎';
      return '<div class="adminRow adminContentRow unifiedContentRow"><span><b>' + esc(item.title) + '</b><small>' + esc((item.summary || '').slice(0, 130)) + '</small><small class="adminRoute">' + icon + ' ' + esc(item.type) + ' · Ngày đăng: ' + esc(item.date || '') + '</small></span><span><i>' + icon + '</i>' + esc(item.category) + '</span><span><strong class="placementPill">' + esc(placementLabel[item.placement] || item.placement) + '</strong></span><span>' + esc(accessLabel[item.accessPlan] || item.accessPlan) + '</span><span><em class="' + (item.status === 'draft' ? 'draft' : 'published') + '">' + (item.status === 'draft' ? 'Bản nháp' : 'Đã xuất bản') + '</em></span><span><button data-edit="' + item.id + '">Sửa</button><button class="danger" data-delete="' + item.id + '">Xóa</button></span></div>';
    }).join('') : '<div class="adminEmpty">Chưa có nội dung phù hợp với bộ lọc.</div>';

    if ($('#contentStat')) $('#contentStat').textContent = list.filter(x => x.status !== 'draft').length;
  }

  function openEditor(item) {
    setupControls();
    form.reset();
    $('#editId').value = item ? item.id : '';
    $('#editType').value = item ? item.type : 'Bài viết';
    $('#editStatus').value = item ? item.status || 'published' : 'published';
    $('#editCategory').value = item ? item.category || 'Kinh doanh' : 'Kinh doanh';
    $('#editPlacement').value = item ? item.placement || 'homepage' : 'homepage';
    $('#editAccess').value = item ? toUiAccess(item.accessPlan) : 'public';
    $('#editTitle').value = item ? item.title || '' : '';
    $('#editSummary').value = item ? item.summary || '' : '';
    $('#editContent').value = item ? item.content || '' : '';
    $('#editImage').value = item ? item.image || '' : '';
    $('#editVideo').value = item ? item.video || '' : '';
    $('#editImageData').value = item?.image?.startsWith('data:') ? item.image : '';
    const preview = $('#mediaPreview');
    if (preview) preview.innerHTML = item?.image ? '<img src="' + item.image + '">' : '<span>Xem trước ảnh/video sẽ hiển thị tại đây</span>';
    editor.classList.add('open');
  }

  function bind() {
    setupControls();
    $('#newContent').onclick = () => openEditor();
    $('#adminSearch').oninput = e => render(e.target.value);
    form.onsubmit = e => {
      e.preventDefault();
      const id = $('#editId').value || Date.now();
      const list = rows();
      const item = {
        id: Number(id),
        type: $('#editType').value,
        status: $('#editStatus').value,
        category: $('#editCategory').value,
        placement: $('#editPlacement').value,
        accessPlan: toStoreAccess($('#editAccess').value),
        title: $('#editTitle').value.trim(),
        summary: $('#editSummary').value.trim(),
        content: $('#editContent').value.trim(),
        image: $('#editImageData').value || $('#editImage').value.trim(),
        video: $('#editVideo').value.trim(),
        date: new Date().toLocaleDateString('vi-VN')
      };
      const index = list.findIndex(x => String(x.id) === String(id));
      if (index >= 0) list[index] = item;
      else list.push(item);
      saveRows(list);
      editor.classList.remove('open');
      render();
      toast('Đã lưu nội dung. Vị trí hiển thị: ' + (placementLabel[item.placement] || item.placement));
    };

    document.addEventListener('click', e => {
      const edit = e.target.closest('[data-edit]');
      const del = e.target.closest('[data-delete]');
      if (edit) {
        const item = rows().find(x => String(x.id) === edit.dataset.edit);
        if (item) {
          e.preventDefault();
          e.stopImmediatePropagation();
          openEditor(item);
        }
      }
      if (del) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (confirm('Xóa nội dung này khỏi thư viện quản trị?')) {
          saveRows(rows().filter(x => String(x.id) !== del.dataset.delete));
          render();
          toast('Đã xóa nội dung');
        }
      }
    }, true);

    render();
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-panel="content"]')) {
      setTimeout(render, 80);
      setTimeout(render, 320);
    }
  }, true);

  setTimeout(bind, 320);
  setTimeout(render, 900);
  setInterval(() => {
    if (document.body.dataset.adminPanel === 'content' && $('#adminContentList') && !$('#adminContentList .unifiedContentRow')) {
      render();
    }
  }, 1500);
})();
