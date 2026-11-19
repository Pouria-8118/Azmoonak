import { $ } from '../../utils/dom.js';
import { fa, esc, fmtDate } from '../../utils/format.js';
import { api } from '../../api.js';
import { toast } from '../../ui/toast.js';
import { confirmBox } from '../../ui/modal.js';
import { statCard } from './shell.js';

export async function adminResults() {
  const box = $('#adminContent');
  const [exData, resData] = await Promise.all([api('/api/exams'), api('/api/results')]);
  const exams = {};
  exData.exams.forEach((e) => { exams[e.id] = e.title; });
  const all = resData.results.filter((r) => r.status === 'done');
  all.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
  box.innerHTML =
    '<div class="toolbar"><h2 class="disp">نتایج</h2>' +
    '<select class="inp sel-w" id="rFilter"><option value="">همه</option>' +
    Object.entries(exams).map(([id, t]) => '<option value="' + esc(id) + '">' + esc(t) + '</option>').join('') + '</select></div>' +
    '<div id="rBody"></div>';
  const render = (fid) => {
    const rows = all.filter((r) => !fid || r.examId === fid);
    const n = rows.length;
    const avg = n ? Math.round(rows.reduce((s, r) => s + r.percent, 0) / n) : 0;
    const best = n ? Math.max(...rows.map((r) => r.percent)) : 0;
    $('#rBody').innerHTML =
      '<div class="stats-row">' + statCard('شرکت‌کننده', fa(n)) + statCard('میانگین', n ? fa(avg) + '٪' : '—') + statCard('بهترین', n ? fa(best) + '٪' : '—') + '</div>' +
      '<div class="card pad table-wrap"><table class="tbl"><tr><th>تاریخ</th><th>دانش‌آموز</th><th>آزمون</th><th>درصد</th><th>صحیح</th><th>غلط</th><th>بی‌پاسخ</th><th></th></tr>' +
      (rows.map((r) => '<tr><td>' + fmtDate(r.finishedAt) + '</td><td>' + esc(r.studentName) + '</td><td>' + esc(r.examTitle || exams[r.examId] || '—') + '</td>' +
        '<td><span class="chip ' + (r.percent >= 80 ? 'g' : r.percent >= 50 ? 'y' : 'r') + '" style="' + (r.percent < 0 ? 'background:#fee;color:#7c1d1d;border:1px solid var(--pen)' : '') + '">' + fa(r.percent) + '٪' + (r.percent < 0 ? ' ⚠' : '') + '</span></td>' +
        '<td>' + fa(r.correct) + '</td><td>' + fa(r.wrong) + '</td><td>' + fa(r.blank) + '</td>' +
        '<td><div class="row-actions"><button class="btn btn-ghost btn-sm" data-det="' + esc(r.id) + '">جزئیات</button>' +
        '<button class="btn btn-danger-o btn-sm" data-rdel="' + esc(r.id) + '">حذف</button></div></td></tr>').join('') ||
        '<tr><td colspan="8" class="center" style="padding:26px">نتیجه‌ای ثبت نشده.</td></tr>') +
      '</table></div>';
    $('#rBody').querySelectorAll('[data-det]').forEach((b) => {
      b.onclick = () => { location.hash = '#/admin/result/' + b.dataset.det; };
    });
    $('#rBody').querySelectorAll('[data-rdel]').forEach((b) => {
      b.onclick = () => confirmBox('حذف نتیجه؟', async () => {
        try {
          await api('/api/result/' + b.dataset.rdel, { method: 'DELETE' });
          toast('حذف شد');
          render($('#rFilter').value);
        } catch (err) {
          toast(err.message, 'err');
        }
      });
    });
  };
  $('#rFilter').onchange = (e) => render(e.target.value);
  render('');
}