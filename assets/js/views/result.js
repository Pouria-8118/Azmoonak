import { appEl } from '../utils/dom.js';
import { api } from '../api.js';
import { getSession } from '../auth.js';
import { studentTop } from '../components/topbar.js';
import { messagePage } from './message.js';
import { reviewQuestionHTML } from '../components/question.js';
import { resultHeadHTML, videoSectionHTML, negativeNoteHTML, scrollResultTop, revealGauge } from '../components/result-card.js';

export async function viewResult(resId) {
  const session = getSession();
  if (!session || session.role !== 'student') { location.hash = '#/login'; return; }
  let r;
  try {
    const data = await api('/api/result/' + resId);
    r = data.result;
  } catch {
    messagePage('کارنامه پیدا نشد.');
    return;
  }
  if (r.studentId !== session.id) { messagePage('این کارنامه متعلق به تو نیست.'); return; }
  if (r.status !== 'done') { location.replace('#/exam/' + r.examId); return; }
  let exam = null;
  try {
    const d = await api('/api/exam/' + r.examId);
    exam = d.exam;
  } catch {}
  const msg = r.percent >= 85 ? 'عالی بود! آفرین 🎉' : r.percent >= 60 ? 'خوب بود 👍' : r.percent >= 35 ? 'جای کار دارد 💪' : r.percent >= 0 ? 'نگران نباش؛ با مرور اشتباهات بهتر می‌شوی 📚' : 'نگران نباش! نمرهٔ منفی طبیعی است؛ سؤال‌های شک‌دار را بی‌پاسخ بگذار 📚';
  const negNote = r.percent < 0 ? negativeNoteHTML('⚠️ <b>نمرهٔ منفی:</b> به دلیل تعداد پاسخ‌های غلط زیاد، نمرهٔ تو کمتر از صفر شده. در آزمون‌های بعدی، به سؤالاتی که مطمئن نیستی پاسخ نده.') : '';
  let html = studentTop() + '<div id="resultTop"></div><div class="wrap narrow">' + resultHeadHTML(r, msg, negNote);
  if (exam && exam.videoUrl) html += videoSectionHTML(exam);
  if (exam) {
    html += '<h2 class="disp sec-title">🗝 کلید و پاسخ‌نامه</h2>' + exam.questions.map((q, i) => reviewQuestionHTML(q, i, (r.answers || [])[i] || 0, 'انتخاب تو')).join('');
  } else {
    html += '<div class="card pad" style="margin-top:16px">آزمون حذف شده.</div>';
  }
  html += '<div class="center" style="margin:26px 0"><a class="btn btn-primary" href="#/student">بازگشت به خانه</a></div></div>';
  appEl.innerHTML = html;
  scrollResultTop();
  revealGauge(r.percent);
}