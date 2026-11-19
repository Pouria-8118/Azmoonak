import { appEl, $ } from '../utils/dom.js';
import { fa, esc } from '../utils/format.js';
import { api } from '../api.js';
import { getSession } from '../auth.js';
import { studentTop } from '../components/topbar.js';
import { drawChart } from '../ui/chart.js';

export async function viewStudentHome() {
  const session = getSession();
  if (!session || session.role !== 'student') {
    location.hash = '#/login?next=%23%2Fstudent';
    return;
  }
  appEl.innerHTML = studentTop() + '<div class="wrap narrow"><div class="greet fade-up"><h2 class="disp">سلام، ' + esc(session.name) + ' 👋</h2><p>آزمون‌های تو اینجاست.</p></div><div id="chartArea"></div><div id="exlist"><div class="loading">در حال بارگذاری…</div></div></div>';
  const [exData, resData] = await Promise.all([api('/api/exams'), api('/api/results')]);
  const exams = exData.exams;
  const resMap = {};
  const finished = [];
  resData.results.forEach((r) => {
    resMap[r.examId] = r;
    if (r.status === 'done') finished.push(r);
  });
  finished.sort((a, b) => (a.finishedAt || 0) - (b.finishedAt || 0));
  drawChart(finished, '#chartArea');
  const list = $('#exlist');
  if (!exams.length) {
    list.innerHTML = '<div class="empty" style="margin-top:14px">هنوز آزمونی برایت ثبت نشده است. 📭</div>';
    return;
  }
  list.innerHTML = '<h2 class="disp sec-title">آزمون‌های من</h2>' + exams.map((e, i) => {
    const r = resMap[e.id];
    let chip, action;
    if (r && r.status === 'done') {
      chip = '<span class="chip ' + (r.percent >= 80 ? 'g' : r.percent >= 50 ? 'y' : 'r') + '">شرکت کرده — ' + fa(r.percent) + '٪</span>';
      action = '<a class="btn btn-ghost btn-sm" href="#/result/' + r.id + '">📄 کارنامه</a>';
    } else if (r && r.status === 'active') {
      chip = '<span class="chip y">در حال برگزاری…</span>';
      action = '<a class="btn btn-primary btn-sm" href="#/exam/' + e.id + '">▶ ادامه</a>';
    } else {
      chip = '<span class="chip b">آماده</span>';
      action = '<a class="btn btn-primary btn-sm" href="#/exam/' + e.id + '">📝 شرکت</a>';
    }
    return '<div class="card stu-row fade-up" style="animation-delay:' + (i * 70) + 'ms"><div><h3>' + esc(e.title) + '</h3><div class="ex-meta">' + fa(e.questions.length) + ' سؤال · ' + fa(e.duration) + ' دقیقه</div></div><div class="stu-side">' + chip + action + '</div></div>';
  }).join('');
}