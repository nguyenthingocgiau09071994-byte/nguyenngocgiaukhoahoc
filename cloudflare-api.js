/**
 * Masterclass VN — Cloudflare API Layer
 * Thay thế hoàn toàn firebase-config.js
 *
 * API Base: https://api.nguyenngocgiau.com
 * (hoặc /api/ nếu cùng domain)
 */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────
  const API_BASE = (window.CF_API_BASE || '') + '/api';

  // ─── ADMIN EMAILS ─────────────────────────────────────────
  const ADMIN_EMAILS = [
    "admin@masterclass.vn",
    "nguyenngocgiau.com@gmail.com",
    "nguyenngocgiau.com@gmail.com",
    "nguyenngocgiau@gmail.com",
    "admin@nguyenngocgiau.com",
    "giaunne@gmail.com",
    "giau@nguyenngocgiau.com"
  ];
  const isAdminEmail = email => {
    const e = String(email || "").toLowerCase().trim();
    return ADMIN_EMAILS.includes(e) || e.includes("nguyenngocgiau") || e.includes("admin");
  };

  // ─── HELPERS ─────────────────────────────────────────────
  const safeJson = (value, fallback) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };
  const noop = () => {};

  // ─── AUTH TOKEN ──────────────────────────────────────────
  const TOKEN_KEY = 'academy_cf_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  function authHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  }

  async function cfFetch(path, method, body) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Server not available or returned HTML (e.g. local dev without Worker)
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      console.warn('Cloudflare API error:', err);
      return null;
    }
  }

  // ─── SESSION ─────────────────────────────────────────────
  function getSession() {
    return safeJson(localStorage.getItem('academy_session'), null);
  }

  function setSession(profile) {
    localStorage.setItem('academy_session', JSON.stringify(profile));
    window.sessionUser = profile;
    if (window.refreshAccount) window.refreshAccount();
    if (window.applyUserProgress) window.applyUserProgress();
  }

  // ─── UI Helpers (giữ nguyên từ firebase-config.js) ──────
  function notify(message) {
    if (window.toast) window.toast(message);
    else console.warn(message);
  }

  function lockAdminPage(message) {
    if (!document.body.classList.contains("adminPage")) return;
    document.body.dataset.adminLocked = "true";
    let lock = document.querySelector("#adminAuthLock");
    if (!lock) {
      lock = document.createElement("div");
      lock.id = "adminAuthLock";
      lock.style.cssText = "position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:rgba(3,35,40,.92);font-family:'Be Vietnam Pro',Arial,sans-serif;color:#fff;padding:24px;";
      lock.innerHTML = '<section style="width:min(460px,100%);background:#fff;color:#073e45;border-radius:18px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,.28);text-align:center"><b style="display:inline-grid;place-items:center;width:54px;height:54px;border-radius:16px;background:#075f68;color:#ffd95a;font-size:24px;margin-bottom:14px">!</b><h2 style="margin:0 0 10px;font-size:26px">Cần quyền quản trị</h2><p id="adminAuthLockText" style="margin:0 0 18px;line-height:1.55;color:#40686e"></p><a href="index.html" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:12px;background:#075f68;color:#fff;text-decoration:none;font-weight:800">Về trang học viên</a></section>';
      document.body.appendChild(lock);
    }
    const text = lock.querySelector("#adminAuthLockText");
    if (text) text.textContent = message || "Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.";
  }

  function unlockAdminPage() {
    document.body.dataset.adminLocked = "false";
    document.querySelector("#adminAuthLock")?.remove();
  }

  function triggerUIRender(type) {
    if (type === "content") {
      if (window.renderManaged) window.renderManaged();
      if (window.gatedContent) window.gatedContent();
      if (window.polishedContent) window.polishedContent();
      if (window.render) window.render(document.querySelector("#search")?.value || "");
    }
    if (type === "members" || type === "users" || type === "access") {
      const search = document.querySelector("#memberSearch");
      if (search) search.dispatchEvent(new Event("input"));
    }
  }

  // ─── LISTENERS ────────────────────────────────────────────
  let adminCollectionsLoaded = false;

  async function loadAdminCollections() {
    if (adminCollectionsLoaded) return;
    adminCollectionsLoaded = true;

    // Members
    const membersData = await cfFetch('/members', 'GET', null);
    if (membersData && Array.isArray(membersData)) {
      localStorage.setItem('academy_members', JSON.stringify(membersData));
      triggerUIRender("members");
    }

    // Users (admin only)
    const usersData = await cfFetch('/users', 'GET', null);
    if (usersData && typeof usersData === 'object') {
      const usersMap = {};
      usersData.forEach?.(u => { usersMap[u.email] = u; });
      if (Object.keys(usersMap).length > 0) {
        localStorage.setItem('academy_users', JSON.stringify(usersMap));
        triggerUIRender("users");
      }
    }

    // Access
    const session = getSession();
    if (session?.email) {
      const accessData = await cfFetch(`/access/${encodeURIComponent(session.email)}`, 'GET', null);
      if (accessData) {
        const access = safeJson(localStorage.getItem('academy_access') || '{}', {});
        access[session.email] = accessData.plan || 'starter';
        localStorage.setItem('academy_access', JSON.stringify(access));
        triggerUIRender("access");
      }
    }
  }

  async function ensureUserDocs(profile) {
    const email = profile.email;
    if (!email) return;

    // Ensure user exists
    await cfFetch(`/users/${encodeURIComponent(email)}`, 'PUT', {
      name: profile.name,
      phone: profile.phone || '',
    });

    // Ensure access record
    await cfFetch(`/access/${encodeURIComponent(email)}`, 'PUT', {
      plan: profile.role === 'admin' ? 'pro' : (profile.plan || 'starter'),
    });
  }

  // ─── AUTH STATE ──────────────────────────────────────────
  function checkAuthState() {
    const token = getToken();
    const session = getSession();

    if (!token && !session) {
      // Not logged in
      if (document.body.classList.contains("adminPage")) {
        lockAdminPage("Vui lòng đăng nhập bằng tài khoản quản trị trước khi mở trang quản trị.");
      }
      return;
    }

    if (token) {
      // Token exists, validate with /auth/me
      cfFetch('/auth/me', 'GET', null).then(data => {
        if (data && data.email) {
          const profile = {
            name: data.name || data.email.split('@')[0],
            email: data.email,
            phone: data.phone || '',
            role: isAdminEmail(data.email) ? 'admin' : (data.role || 'student'),
            plan: isAdminEmail(data.email) ? 'pro' : (data.plan || 'starter'),
          };
          setSession(profile);
          if (document.body.classList.contains("adminPage")) unlockAdminPage();
          loadAdminCollections();
        } else {
          // Token invalid
          setToken('');
          localStorage.removeItem('academy_session');
          window.sessionUser = null;
          if (document.body.classList.contains("adminPage")) {
            lockAdminPage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          }
        }
      });
    } else if (session) {
      // Local session only (offline mode)
      window.sessionUser = session;
      if (document.body.classList.contains("adminPage") && isAdminEmail(session.email)) {
        unlockAdminPage();
      }
    }
  }

  // ─── SYNC DATA ───────────────────────────────────────────
  async function syncData(key, value) {
    const email = window.sessionUser?.email?.toLowerCase();
    const isAdmin = isAdminEmail(email) || window.sessionUser?.role === 'admin';
    const data = key === 'masterclass-note' ? value : safeJson(value, null);
    if (key !== 'masterclass-note' && data === null) return;

    if (key === 'academy_session') {
      window.sessionUser = data;
      return;
    }

    // Progress
    if (key.startsWith('academy_progress_')) {
      const owner = key.replace('academy_progress_', '').toLowerCase();
      if (email && owner === email) {
        await cfFetch(`/progress/${encodeURIComponent(email)}`, 'PUT', { completed: data });
      }
      return;
    }

    // Favorites
    if (key === 'academy_favorites' && email) {
      await cfFetch(`/favorites/${encodeURIComponent(email)}`, 'PUT', { favorites: data });
      return;
    }

    // Notes
    if (key === 'masterclass-note' && email) {
      await cfFetch(`/notes/${encodeURIComponent(email)}`, 'PUT', { note: String(value || '') });
      return;
    }

    // QA
    if (key.startsWith('academy_qa_') && email) {
      const lessonId = key.replace('academy_qa_', '');
      const questions = (Array.isArray(data) ? data : []).map(q => {
        const safeQ = {
          id: q.id,
          name: q.name,
          avatar: q.avatar,
          text: q.text,
          date: q.date,
          likes: Number(q.likes || 0)
        };
        if (isAdmin) {
          safeQ.reply = q.reply || '';
          safeQ.replyDate = q.replyDate || '';
        }
        return safeQ;
      });
      await cfFetch(`/qa/${encodeURIComponent(lessonId)}`, 'PUT', { questions });
      return;
    }

    // Members
    if (key === 'academy_members') {
      (Array.isArray(data) ? data : []).forEach(member => {
        if (member.email && (isAdmin || member.email.toLowerCase() === email)) {
          // POST each new member
          cfFetch('/members', 'POST', {
            name: member.name,
            email: member.email,
            phone: member.phone,
            birth: member.birth || '',
            plan: member.plan || 'Starter',
            goal: member.goal || '',
            source: member.source || '',
          });
        }
      });
      return;
    }

    // Users
    if (key === 'academy_users' && isAdmin) {
      Object.keys(data || {}).forEach(userEmail => {
        cfFetch(`/users/${encodeURIComponent(userEmail.toLowerCase())}`, 'PUT', data[userEmail]);
      });
      return;
    }

    // Access (admin only)
    if (key === 'academy_access' && isAdmin) {
      Object.keys(data || {}).forEach(userEmail => {
        cfFetch(`/access/${encodeURIComponent(userEmail.toLowerCase())}`, 'PUT', { plan: data[userEmail] });
      });
      return;
    }

    // Content (admin only)
    if (key === 'academy_content' && isAdmin) {
      (Array.isArray(data) ? data : []).forEach(item => {
        if (item.id) {
          const itemId = String(item.id);
          // Check if exists
          cfFetch(`/content/${encodeURIComponent(itemId)}`, 'PUT', item);
        }
      });
    }
  }

  // ─── OVERRIDE localStorage.setItem ────────────────────────
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    originalSetItem(key, value);
    try { syncData(key, value); } catch (err) { console.error('Sync error:', err); }
  };

  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  localStorage.removeItem = function (key) {
    originalRemoveItem(key);
    if (key === 'academy_session') {
      window.sessionUser = null;
      setToken('');
      if (window.refreshAccount) window.refreshAccount();
    }
  };

  // ─── CONTENT LISTENING ───────────────────────────────────
  async function loadContent() {
    const data = await cfFetch('/content', 'GET', null);
    if (data && Array.isArray(data)) {
      localStorage.setItem('academy_content', JSON.stringify(data));
      triggerUIRender('content');
    }
  }

  // ─── RENDER QA ───────────────────────────────────────────
  window.renderQA = function (id) {
    cfFetch(`/qa/${encodeURIComponent(String(id))}`, 'GET', null).then(data => {
      if (data && Array.isArray(data.questions)) {
        localStorage.setItem('academy_qa_' + id, JSON.stringify(data.questions));
        if (window.renderProQA) window.renderProQA(id);
      }
    });
  };

  // ─── AUTH ACTIONS ─────────────────────────────────────────
  window.cfLogin = async function (email, password) {
    const data = await cfFetch('/auth/login', 'POST', { email, password });
    if (!data || data.error) {
      notify(data?.error || 'Đăng nhập thất bại');
      return false;
    }
    setToken(data.token);
    const profile = {
      name: data.name || email.split('@')[0],
      email: data.email,
      phone: '',
      role: isAdminEmail(data.email) ? 'admin' : (data.role || 'student'),
      plan: isAdminEmail(data.email) ? 'pro' : (data.plan || 'starter'),
      loginAt: Date.now()
    };
    setSession(profile);
    if (document.body.classList.contains("adminPage")) unlockAdminPage();
    loadAdminCollections();
    notify('✨ Đăng nhập thành công! Chào mừng ' + profile.name);
    return true;
  };

  window.cfRegister = async function (name, email, phone, password) {
    const data = await cfFetch('/auth/register', 'POST', { name, email, phone, password });
    if (!data || data.error) {
      notify(data?.error || 'Đăng ký thất bại');
      return false;
    }
    setToken(data.token);
    const profile = {
      name: data.name || email.split('@')[0],
      email: data.email,
      phone: phone || '',
      role: isAdminEmail(data.email) ? 'admin' : (data.role || 'student'),
      plan: isAdminEmail(data.email) ? 'pro' : (data.plan || 'starter'),
      createdAt: new Date().toLocaleDateString('vi-VN'),
      loginAt: Date.now()
    };
    setSession(profile);
    if (document.body.classList.contains("adminPage")) unlockAdminPage();
    notify('🎉 Đăng ký thành công! Chào mừng ' + profile.name);
    return true;
  };

  window.cfLogout = function () {
    localStorage.removeItem('academy_session');
    localStorage.removeItem('academy_cf_token');
    window.sessionUser = null;
    setToken('');
    if (window.refreshAccount) window.refreshAccount();
    notify('Đã đăng xuất');
  };

  // ─── BOOT ────────────────────────────────────────────────
  window.cloudflareEnabled = true;
  console.log('Cloudflare API connected');

  // Load content immediately
  loadContent();

  // Check auth state
  checkAuthState();

  // DOM-ready: attach CF auth handlers to existing forms
  document.addEventListener('DOMContentLoaded', () => {

    // Modal switcher
    document.addEventListener('click', e => {
      const openReg = e.target.closest("[data-open-register], #registerAccountBtn, #registerButton");
      if (openReg) {
        e.preventDefault();
        document.querySelectorAll(".loginModal, .registerModal").forEach(m => m.classList.remove("open"));
        document.querySelector("#registerModal")?.classList.add("open");
      }
      const backLog = e.target.closest("[data-back-login]");
      if (backLog) {
        e.preventDefault();
        document.querySelectorAll(".loginModal, .registerModal").forEach(m => m.classList.remove("open"));
        document.querySelector("#loginModal")?.classList.add("open");
      }
    });

    // Login form
    const loginForm = document.querySelector("#loginForm");
    if (loginForm) {
      const cloned = loginForm.cloneNode(true);
      loginForm.parentNode.replaceChild(cloned, loginForm);
      cloned.onsubmit = async event => {
        event.preventDefault();
        const email = (cloned.querySelector("#loginEmail")?.value || "").trim().toLowerCase();
        const password = cloned.querySelector("#loginPassword")?.value || "";

        if (!email) { notify("Vui lòng nhập địa chỉ email"); return; }

        // Optimistic local login
        const isKnownAdmin = isAdminEmail(email);
        const usersMap = safeJson(localStorage.getItem('academy_users') || '{}', {});
        const localUser = usersMap[email] || {};
        const profile = {
          name: localUser.name || email.split('@')[0],
          email, phone: localUser.phone || '',
          role: isKnownAdmin ? 'admin' : (localUser.role || 'student'),
          plan: isKnownAdmin ? 'pro' : (localUser.plan || 'starter'),
          loginAt: Date.now()
        };

        setSession(profile);
        usersMap[email] = profile;
        originalSetItem('academy_users', JSON.stringify(usersMap));
        document.querySelectorAll(".loginModal, .registerModal").forEach(m => m.classList.remove("open"));
        if (window.refreshAccount) window.refreshAccount();
        notify('✨ Đăng nhập thành công! Chào mừng ' + profile.name);
        if (profile.role === 'admin' && document.body.classList.contains("adminPage")) unlockAdminPage();

        // Background sync
        if (password) window.cfLogin(email, password);
      };
    }

    // Register form
    const registerForm = document.querySelector("#registerForm");
    if (registerForm) {
      const cloned = registerForm.cloneNode(true);
      registerForm.parentNode.replaceChild(cloned, registerForm);
      cloned.onsubmit = async event => {
        event.preventDefault();
        const name = (cloned.querySelector("#registerName")?.value || "").trim();
        const email = (cloned.querySelector("#registerEmail")?.value || "").trim().toLowerCase();
        const phone = (cloned.querySelector("#registerPhone")?.value || "").trim();
        const password = cloned.querySelector("#registerPassword")?.value || "";
        const confirm = cloned.querySelector("#registerConfirm")?.value || "";

        if (!email) { notify("Vui lòng nhập email"); return; }
        if (password !== confirm) { notify("Mật khẩu xác nhận chưa trùng khớp!"); return; }

        const isKnownAdmin = isAdminEmail(email);
        const profile = {
          name: name || email.split('@')[0],
          email, phone,
          role: isKnownAdmin ? 'admin' : 'student',
          plan: isKnownAdmin ? 'pro' : 'starter',
          createdAt: new Date().toLocaleDateString('vi-VN'),
          loginAt: Date.now()
        };

        // Optimistic
        const usersMap = safeJson(localStorage.getItem('academy_users') || '{}', {});
        usersMap[email] = profile;
        originalSetItem('academy_users', JSON.stringify(usersMap));
        const membersList = safeJson(localStorage.getItem('academy_members') || '[]', []);
        if (!membersList.some(m => m.email === email)) {
          membersList.push({ name: profile.name, email, phone, plan: profile.plan, status: 'active', createdAt: profile.createdAt });
          originalSetItem('academy_members', JSON.stringify(membersList));
        }
        setSession(profile);
        document.querySelectorAll(".loginModal, .registerModal").forEach(m => m.classList.remove("open"));
        if (window.refreshAccount) window.refreshAccount();
        notify('🎉 Đăng ký thành công! Chào mừng ' + profile.name);

        // Background sync
        window.cfRegister(name, email, phone, password);
      };
    }

    // Forgot password (simplified — no email in CF Workers without SMTP)
    const forgotForm = document.querySelector("#forgotForm");
    if (forgotForm) {
      const cloned = forgotForm.cloneNode(true);
      forgotForm.parentNode.replaceChild(cloned, forgotForm);
      cloned.onsubmit = event => {
        event.preventDefault();
        notify('Tính năng khôi phục mật khẩu đang được phát triển. Vui lòng liên hệ admin.');
      };
    }
  });

  // Expose syncData globally (matches original firebase-config.js)
  window.syncData = syncData;

})();
