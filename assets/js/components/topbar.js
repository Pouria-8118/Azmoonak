import { esc } from '../utils/format.js';
import { getSession } from '../auth.js';

export function studentTop() {
  const session = getSession();
  return '<header class="topbar"><div class="inner">' +
    '<a class="logo" href="#/student"><span class="tick">√</span> آزمونک</a>' +
    '<span class="spacer"></span>' +
    '<a class="tab" href="#/mistakes">📚 مرور اشتباهات</a>' +
    '<span class="who">👤 ' + esc(session ? session.name : '') + '</span>' +
    '<button class="btn btn-outline-inv btn-sm" id="logoutBtn">خروج</button>' +
    '</div></header>';
}

export function adminResultTop() {
  return '<header class="topbar"><div class="inner">' +
    '<span class="logo"><span class="tick">√</span> آزمونک · پنل مدیر</span>' +
    '<span class="spacer"></span>' +
    '<a class="tab" href="#/admin/results">📊 بازگشت به نتایج</a>' +
    '<a class="tab" href="#/admin">🏠 پنل اصلی</a>' +
    '</div></header>';
}