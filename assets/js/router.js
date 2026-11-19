import { stopExamTimer, viewExam } from './views/exam.js';
import { syncFab } from './ui/fab.js';
import { renderLogin } from './views/login.js';
import { viewStudentHome } from './views/student-home.js';
import { viewMistakes } from './views/mistakes.js';
import { viewResult } from './views/result.js';
import { viewAdmin } from './views/admin/index.js';
import { adminViewResult } from './views/admin/result-detail.js';
import { messagePage } from './views/message.js';

export async function route() {
  stopExamTimer();
  syncFab();
  const raw = (location.hash || '#/').slice(2);
  const qi = raw.indexOf('?');
  const path = qi >= 0 ? raw.slice(0, qi) : raw;
  const query = new URLSearchParams(qi >= 0 ? raw.slice(qi + 1) : '');
  const seg = path.split('/').filter(Boolean);
  try {
    if (!seg.length || seg[0] === 'login') return renderLogin(query.get('next'));
    if (seg[0] === 'student') return await viewStudentHome();
    if (seg[0] === 'mistakes') return await viewMistakes();
    if (seg[0] === 'exam') return await viewExam(seg[1]);
    if (seg[0] === 'result') return await viewResult(seg[1]);
    if (seg[0] === 'admin') {
      if (seg[1] === 'result' && seg[2]) return await adminViewResult(seg[2]);
      return await viewAdmin(seg);
    }
    location.hash = '#/';
  } catch (err) {
    console.error(err);
    messagePage('خطایی پیش آمد. صفحه را رفرش کن.');
  }
}