import { appEl, $ } from '../utils/dom.js';
import { fa, esc, fmtDate } from '../utils/format.js';
import { api } from '../api.js';
import { getSession } from '../auth.js';
import { studentTop } from '../components/topbar.js';
import { reviewOptionsHTML } from '../components/question.js';

export async function viewMistakes() {
  const session = getSession();
  if (!session || session.role !== 'student') { location.hash = '#/login'; return; }
  appEl.innerHTML = studentTop() + '<div class="wrap narrow"><div class="greet fade-up"><h2 class="disp">📚 مرور اشتباهات</h2><p>سؤالاتی که در آزمون‌ها غلط زدی یا بی‌پاسخ گذاشتی؛ برای تمرین دوباره.</p></div><div id="mistFilter" class="filter-tabs"></div><div id="mistList"><div class="loading">در حال بارگذاری…</div></div></div>';
  const [exData, resData] = await Promise.all([api('/api/exams'), api('/api/results')]);
  const exams = {};
  exData.exams.forEach((e) => { exams[e.id] = e; });
  const mistakes = [];
  resData.results.forEach((r) => {
    if (r.status !== 'done') return;
    const exam = exams[r.examId];
    if (!exam) return;
    exam.questions.forEach((q, i) => {
      const a = (r.answers || [])[i] || 0;
      if (a === q.correct) return;
      mistakes.push({ examId: r.examId, examTitle: r.examTitle, qi: i, q, a, finishedAt: r.finishedAt, percent: r.percent, status: a === 0 ? 'blank' : 'wrong' });
    });
  });
  mistakes.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
  const filterEl = $('#mistFilter');
  const nWrong = mistakes.filter((m) => m.status === 'wrong').length;
  const nBlank = mistakes.filter((m) => m.status === 'blank').length;
  filterEl.innerHTML = '<button class="filter-tab active" data-f="all">همه (' + fa(mistakes.length) + ')</button>' +
    '<button class="filter-tab" data-f="wrong">✘ غلط (' + fa(nWrong) + ')</button>' +
    '<button class="filter-tab" data-f="blank">⚪ بی‌پاسخ (' + fa(nBlank) + ')</button>';
  const render = (f) => {
    const list = $('#mistList');
    const rows = mistakes.filter((m) => f === 'all' || m.status === f);
    if (!rows.length) {
      list.innerHTML = '<div class="empty">🎉 هیچ سؤال اشتباه یا بی‌پاسخی نداری!</div>';
      return;
    }
    list.innerHTML = rows.map((m, i) => {
      const stChip = m.status === 'wrong' ? '<span class="chip r">✘ غلط</span>' : '<span class="chip y">⚪ بی‌پاسخ</span>';
      return '<div class="card pad mist-card ' + m.status + ' fade-up" style="animation-delay:' + Math.min(i * 50, 600) + 'ms">' +
        '<div class="mist-head"><div><b>' + esc(m.examTitle) + '</b> · سؤال ' + fa(m.qi + 1) +
        '<div class="mist-meta">' + fmtDate(m.finishedAt) + ' · درصد آزمون: ' + fa(m.percent) + '٪</div></div><div>' + stChip + '</div></div>' +
        '<img class="qimg" src="' + esc(m.q.img) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
        reviewOptionsHTML(m.q, m.a, 'انتخاب تو') +
        '</div>';
    }).join('');
  };
  filterEl.querySelectorAll('.filter-tab').forEach((b) => {
    b.onclick = () => {
      filterEl.querySelectorAll('.filter-tab').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      render(b.dataset.f);
    };
  });
  render('all');
}