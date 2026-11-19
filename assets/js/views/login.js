import { appEl, $ } from '../utils/dom.js';
import { api } from '../api.js';
import { getSession, setSession } from '../auth.js';
import { toast } from '../ui/toast.js';

export function renderLogin(next) {
  const session = getSession();
  if (session) {
    location.replace(session.role === 'admin' ? '#/admin' : '#/student');
    return;
  }
  appEl.innerHTML =
    '<div class="login-page">' +
    '<div class="login-hero fade-up">' +
    '<div class="hero-logo"><span class="tick big">√</span><h1>آزمونک</h1></div>' +
    '<p class="tag">پلتفرم آزمون‌های خصوصی ریاضی</p>' +
    '<ul class="feats">' +
    '<li class="fade-up">⏱ تایمر دقیق، بالای صفحهٔ آزمون</li>' +
    '<li class="fade-up" style="animation-delay:.1s">🖼 سؤالات تصویری، چهار گزینه‌ای</li>' +
    '<li class="fade-up" style="animation-delay:.2s">📊 کارنامه و درصدِ آنی بعد از ثبت</li>' +
    '<li class="fade-up" style="animation-delay:.3s">🎬 پاسخ ویدئویی و کلید بعد از آزمون</li>' +
    '</ul>' +
    '</div>' +
    '<form class="card login-card fade-up" id="loginForm" style="animation-delay:.15s">' +
    '<h2 class="disp">ورود به آزمونک</h2>' +
    '<label class="lbl">نام کاربری</label><input class="inp" id="lu" dir="ltr" autocomplete="username" required>' +
    '<label class="lbl">رمز عبور</label><input class="inp" id="lp" dir="ltr" type="password" autocomplete="current-password" required>' +
    '<button class="btn btn-primary big full" id="loginBtn">ورود</button>' +
    '<p class="hint">حساب دانش‌آموزی فقط توسط مدیر ساخته می‌شود.</p>' +
    '</form>' +
    '</div>';
  $('#loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = $('#loginBtn'), u = $('#lu').value.trim(), p = $('#lp').value;
    if (!u || !p) return;
    btn.disabled = true;
    btn.textContent = 'در حال ورود…';
    try {
      const data = await api('/api/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
      setSession(data.user, data.token);
      location.hash = (next && next.startsWith('#')) ? next : (data.user.role === 'admin' ? '#/admin' : '#/student');
    } catch (err) {
      toast(err.message || 'خطا در ورود', 'err');
      btn.disabled = false;
      btn.textContent = 'ورود';
    }
  };
}