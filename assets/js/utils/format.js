export const fa = (n) => Number(n ?? 0).toLocaleString('fa-IR');

export const faStr = (s) => String(s).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const examLink = (id) => location.origin + location.pathname + '#/exam/' + id;

export function fmtTimer(sec) {
  sec = Math.max(0, Math.floor(sec));
  return faStr(String(Math.floor(sec / 60)).padStart(2, '0')) + ':' + faStr(String(sec % 60).padStart(2, '0'));
}

export function fmtDur(ms) {
  const s = Math.max(0, Math.round((ms || 0) / 1000));
  return faStr(String(Math.floor(s / 60)).padStart(2, '0')) + ':' + faStr(String(s % 60).padStart(2, '0'));
}

export function fmtDate(ts) {
  try { return new Date(ts).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return ''; }
}

export function calcPercent(correct, wrong, total) {
  if (!total) return 0;
  const raw = (100 * (3 * correct - wrong)) / (3 * total);
  return Math.max(-34, Math.min(100, Math.round(raw)));
}