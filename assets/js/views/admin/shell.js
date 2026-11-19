import { appEl } from '../../utils/dom.js';

const TABS = [
  ['exams', '📝 آزمون‌ها'],
  ['new', '➕ ساخت آزمون'],
  ['students', '👥 دانش‌آموزان'],
  ['results', '📊 نتایج'],
  ['settings', '⚙️ تنظیمات']
];

export function adminShell(active, fn) {
  appEl.innerHTML =
    '<header class="topbar"><div class="inner">' +
    '<span class="logo"><span class="tick">√</span> آزمونک</span>' +
    '<nav class="tabs">' + TABS.map((t) => '<a class="tab ' + (active === t[0] ? 'active' : '') + '" href="#/admin/' + t[0] + '">' + t[1] + '</a>').join('') + '</nav>' +
    '<span class="spacer"></span>' +
    '<button class="btn btn-outline-inv btn-sm" id="logoutBtn">خروج</button>' +
    '</div></header>' +
    '<div class="wrap" id="adminContent"><div class="loading">در حال بارگذاری…</div></div>';
  return fn();
}

export const statCard = (label, value) => '<div class="stat fade-up"><b>' + value + '</b><span>' + label + '</span></div>';