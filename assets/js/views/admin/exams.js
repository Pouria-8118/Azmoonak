import { $ } from '../../utils/dom.js';
import { fa, esc, fmtDate, examLink } from '../../utils/format.js';
import { api } from '../../api.js';
import { toast } from '../../ui/toast.js';
import { confirmBox } from '../../ui/modal.js';
import { copyText } from '../../utils/clipboard.js';
import { statCard } from './shell.js';
import { route } from '../../router.js';

export async function adminExamsList() {
  const box = $('#adminContent');
  const [exData, resData, stuData] = await Promise.all([api('/api/exams'), api('/api/results'), api('/api/students')]);
  const stats = {};
  resData.results.filter((r) => r.status === 'done').forEach((r) => {
    const s = stats[r.examId] || (stats[r.examId] = { n: 0, sum: 0 });
    s.n++;
    s.sum += r.percent;
  });
  const finished = resData.results.filter((r) => r.status === 'done');
  let totalP = 0;
  finished.forEach((r) => { totalP += r.percent; });
  const exams = exData.exams;
  const studentMap = {};
  stuData.students.forEach((s) => { studentMap[s.id] = s; });
  box.innerHTML =
    '<div class="stats-row" style="margin-top:8px">' +
    statCard('آزمون‌ها', fa(exams.length)) +
    statCard('شرکت‌کننده‌ها', fa(finished.length)) +
    statCard('میانگین کل', finished.length ? fa(Math.round(totalP / finished.length)) + '٪' : '—') +
    '</div>' +
    '<div class="toolbar"><h2 class="disp">آزمون‌ها</h2><a href="#/admin/new" class="btn btn-primary">➕ ساخت آزمون جدید</a></div>' +
    (exams.length ? '' : '<div class="empty">هنوز آزمونی نساخته‌ای.</div>') +
    exams.map((e) => {
      const s = stats[e.id] || { n: 0, sum: 0 };
      const allowed = e.allowedStudents || [];
      const allowedNames = allowed.map((id) => studentMap[id] ? studentMap[id].name : id).slice(0, 3).join('، ');
      const accessText = allowed.length === 0 ? '🌐 همهٔ دانش‌آموزان' : '👥 ' + fa(allowed.length) + ' دانش‌آموز' + (allowedNames ? ' (' + esc(allowedNames) + (allowed.length > 3 ? '…' : '') + ')' : '');
      return '<div class="card exam-row fade-up">' +
        '<div class="ex-info"><h3>' + esc(e.title) + '</h3>' +
        '<div class="ex-meta">' + fa(e.questions.length) + ' سؤال · ' + fa(e.duration) + ' دقیقه · ' + fmtDate(e.createdAt) + (e.videoUrl ? ' · 🎬 ویدیو' : '') + '</div>' +
        '<div class="ex-meta">' + accessText + '</div>' +
        '<div class="ex-link"><code dir="ltr">' + esc(examLink(e.id)) + '</code></div></div>' +
        '<div class="ex-side">' +
        '<div class="ex-stats">' + (s.n ? fa(s.n) + ' شرکت‌کننده · میانگین ' + fa(Math.round(s.sum / s.n)) + '٪' : 'هنوز کسی شرکت نکرده') + '</div>' +
        '<label class="switch"><input type="checkbox" data-pub="' + esc(e.id) + '" ' + (e.published ? 'checked' : '') + '><span></span><em>' + (e.published ? 'فعال' : 'غیرفعال') + '</em></label>' +
        '<div class="row-actions">' +
        '<button class="btn btn-ghost btn-sm" data-copy="' + esc(examLink(e.id)) + '">📋 کپی لینک</button>' +
        '<a class="btn btn-ghost btn-sm" href="#/admin/edit/' + e.id + '">✏️ ویرایش</a>' +
        '<button class="btn btn-danger-o btn-sm" data-del="' + esc(e.id) + '">🗑 حذف</button>' +
        '</div></div></div>';
    }).join('');
  box.querySelectorAll('[data-copy]').forEach((b) => { b.onclick = () => copyText(b.dataset.copy); });
  box.querySelectorAll('[data-pub]').forEach((c) => {
    c.onchange = async () => {
      try {
        await api('/api/exam/' + c.dataset.pub + '/publish', { method: 'POST', body: JSON.stringify({ published: c.checked }) });
        toast(c.checked ? 'آزمون فعال شد ✓' : 'آزمون غیرفعال شد');
        route();
      } catch (err) {
        toast(err.message, 'err');
        route();
      }
    };
  });
  box.querySelectorAll('[data-del]').forEach((b) => {
    b.onclick = () => confirmBox('این آزمون حذف می‌شود.', async () => {
      try {
        await api('/api/exam/' + b.dataset.del, { method: 'DELETE' });
        toast('حذف شد');
        route();
      } catch (err) {
        toast(err.message, 'err');
      }
    });
  });
}