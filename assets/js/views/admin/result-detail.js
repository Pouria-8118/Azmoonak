import { appEl } from '../../utils/dom.js';
import { esc } from '../../utils/format.js';
import { api } from '../../api.js';
import { getSession } from '../../auth.js';
import { messagePage } from '../message.js';
import { adminResultTop } from '../../components/topbar.js';
import { reviewQuestionHTML } from '../../components/question.js';
import { resultHeadHTML, videoSectionHTML, negativeNoteHTML, scrollResultTop, revealGauge } from '../../components/result-card.js';

export async function adminViewResult(resId) {
  const session = getSession();
  if (!session || session.role !== 'admin') { location.hash = '#/login?next=%23%2Fadmin'; return; }
  let r;
  try {
    const data = await api('/api/result/' + resId);
    r = data.result;
  } catch {
    messagePage('کارنامه پیدا نشد.');
    return;
  }
  if (r.status !== 'done') { messagePage('این آزمون هنوز تمام نشده.'); return; }
  let exam = null;
  try {
    const d = await api('/api/exam/' + r.examId);
    exam = d.exam;
  } catch {}
  const msg = r.percent >= 85 ? 'عملکرد عالی 🎉' : r.percent >= 60 ? 'عملکرد خوب 👍' : r.percent >= 35 ? 'نیاز به تلاش بیشتر 💪' : r.percent >= 0 ? 'نیاز به مرور مباحث 📚' : 'نمرهٔ منفی به دلیل پاسخ‌های غلط زیاد';
  const negNote = r.percent < 0 ? negativeNoteHTML('⚠️ <b>نمرهٔ منفی:</b> به دلیل تعداد پاسخ‌های غلط زیاد، نمرهٔ این دانش‌آموز کمتر از صفر شده.') : '';
  let html = adminResultTop() + '<div id="resultTop"></div><div class="wrap narrow">' +
    '<div class="card pad" style="margin-top:18px;background:#eef5ff;border:1.5px solid var(--ink)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
    '<div><span style="font-size:12px;font-weight:700;color:var(--ink-2)">👤 کارنامهٔ دانش‌آموز:</span>' +
    '<h3 class="disp" style="font-size:24px">' + esc(r.studentName) + '</h3></div>' +
    '<a class="btn btn-ghost btn-sm" href="#/admin/results">← بازگشت به نتایج</a>' +
    '</div></div>' +
    resultHeadHTML(r, msg, negNote);
  if (exam && exam.videoUrl) html += videoSectionHTML(exam);
  if (exam) {
    html += '<h2 class="disp sec-title">🗝 کلید و پاسخ‌نامه</h2>' + exam.questions.map((q, i) => reviewQuestionHTML(q, i, (r.answers || [])[i] || 0, 'انتخاب دانش‌آموز')).join('');
  } else {
    html += '<div class="card pad" style="margin-top:16px">آزمون حذف شده؛ سؤالات در دسترس نیست.</div>';
  }
  html += '<div class="center" style="margin:26px 0"><a class="btn btn-primary" href="#/admin/results">بازگشت به نتایج</a></div></div>';
  appEl.innerHTML = html;
  scrollResultTop();
  revealGauge(r.percent);
}