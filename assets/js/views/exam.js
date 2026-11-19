import { appEl, $ } from '../utils/dom.js';
import { fa, esc, fmtTimer, calcPercent } from '../utils/format.js';
import { api } from '../api.js';
import { getSession } from '../auth.js';
import { studentTop } from '../components/topbar.js';
import { messagePage } from './message.js';
import { toast } from '../ui/toast.js';
import { openModal, closeModal } from '../ui/modal.js';

let timerTick = null;

export function stopExamTimer() {
  clearInterval(timerTick);
  timerTick = null;
  window.onbeforeunload = null;
}

export async function viewExam(id) {
  const session = getSession();
  if (!id) { location.hash = '#/student'; return; }
  if (!session) { location.hash = '#/login?next=' + encodeURIComponent('#/exam/' + id); return; }
  if (session.role !== 'student') { messagePage('برای شرکت در آزمون باید با حساب دانش‌آموز وارد شوی.'); return; }
  let exam;
  try {
    const data = await api('/api/exam/' + id);
    exam = data.exam;
  } catch (err) {
    messagePage(esc(err.message) || 'آزمون پیدا نشد.');
    return;
  }
  if (!exam.published) { messagePage('این آزمون هنوز فعال نشده.'); return; }
  let existing = null;
  try {
    const rData = await api('/api/result/' + id + '_' + session.id);
    existing = rData.result;
  } catch {}
  if (existing) {
    if (existing.status === 'done') { location.replace('#/result/' + existing.id); return; }
    if (existing.status === 'active') { runExam(exam, existing); return; }
  }
  appEl.innerHTML = studentTop() + '<div class="wrap narrow"><div class="card intro fade-up">' +
    '<span class="intro-tag">آزمون تستی</span>' +
    '<h2 class="disp">' + esc(exam.title) + '</h2>' +
    '<div class="intro-meta">' +
    '<div class="im"><b>' + fa(exam.questions.length) + '</b><span>سؤال</span></div>' +
    '<div class="im"><b>' + fa(exam.duration) + '</b><span>دقیقه</span></div>' +
    '</div>' +
    '<div style="background:var(--pen-soft);border:2px solid var(--pen);border-radius:12px;padding:14px 18px;margin:18px 0;font-weight:700;color:var(--pen);display:flex;align-items:center;gap:10px;font-size:14px;line-height:1.8">' +
    '<span style="font-size:22px">⚠️</span>' +
    '<span>این آزمون <b>نمرهٔ منفی</b> دارد. <b style="color:#b91c2e">هر ۳ پاسخ غلط، یک پاسخ صحیح را می‌سوزاند.</b> پس فقط به سؤالاتی که مطمئنی پاسخ بده!</span>' +
    '</div>' +
    '<ul class="rules">' +
    '<li>به محض زدن دکمهٔ شروع، زمان به جریان می‌افتد.</li>' +
    '<li>می‌توانی پاسخ‌هایت را تا قبل از ثبت تغییر دهی.</li>' +
    '<li>با پایان زمان، پاسخ‌های داده‌شده خودکار ثبت می‌شوند.</li>' +
    '</ul>' +
    '<button class="btn btn-primary big" id="startBtn">▶ شروع آزمون</button>' +
    '</div></div>';
  $('#startBtn').onclick = async () => {
    const btn = $('#startBtn');
    btn.disabled = true;
    btn.textContent = 'در حال آماده‌سازی…';
    try {
      const data = await api('/api/result/' + id + '/start', { method: 'POST' });
      runExam(exam, data.result);
    } catch (err) {
      toast(err.message, 'err');
      btn.disabled = false;
      btn.textContent = '▶ شروع آزمون';
    }
  };
}

function examHTML(exam, answers) {
  const session = getSession();
  const qs = exam.questions.map((q, i) =>
    '<section class="card q-card fade-up" data-q="' + i + '" style="animation-delay:' + Math.min(i * 70, 600) + 'ms">' +
    '<div class="q-head"><span class="q-num">سؤال ' + fa(i + 1) + '</span></div>' +
    '<img class="qimg" src="' + esc(q.img) + '" alt="سؤال ' + (i + 1) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
    '<div class="opts">' + [1, 2, 3, 4].map((o) =>
      '<button type="button" class="opt' + (answers[i] === o ? ' sel' : '') + '" data-o="' + o + '"><span class="n">' + fa(o) + '</span><span>گزینهٔ ' + fa(o) + '</span></button>'
    ).join('') + '</div>' +
    '</section>').join('');
  return '<div class="exambar">' +
    '<div class="tinfo"><b>' + esc(exam.title) + '</b><span>👤 ' + esc(session.name) + '</span></div>' +
    '<span class="spacer"></span>' +
    '<div class="tmr"><span class="lbl2">زمان باقی‌مانده</span><span class="timerbox" id="timer">--:--</span></div>' +
    '<div class="ans">پاسخ: <b id="answered"></b></div>' +
    '<button class="btn btn-pen" id="submitBtn">ثبت نهایی</button>' +
    '</div><div class="timebar"><i id="tfill" style="width:100%"></i></div>' +
    '<div class="wrap narrow">' +
    '<div class="exam-hint">💡 اگر صفحه را ببندی هم زمان در جریان می‌ماند.</div>' +
    qs +
    '<div class="center" style="margin:26px 0"><button class="btn btn-pen big" id="submitBtn2">ثبت نهایی آزمون ✔</button></div>' +
    '</div>';
}

function runExam(exam, state) {
  const answers = [...(state.answers || [])];
  while (answers.length < exam.questions.length) answers.push(0);
  const total = exam.questions.length;
  const deadline = state.startedAt + exam.duration * 60000;
  let saving = null, finished = false;
  appEl.innerHTML = examHTML(exam, answers);
  const timerEl = $('#timer'), fillEl = $('#tfill'), ansEl = $('#answered');

  function paint() {
    const done = answers.filter((a) => a > 0).length;
    ansEl.textContent = fa(done) + ' از ' + fa(total);
    const rem = Math.max(0, deadline - Date.now());
    timerEl.textContent = fmtTimer(rem / 1000);
    timerEl.classList.toggle('low', rem < 60000);
    fillEl.style.width = (rem / (exam.duration * 60000) * 100) + '%';
    if (rem <= 0 && !finished) {
      finished = true;
      toast('⏰ زمان تمام شد');
      finish();
    }
  }

  async function finish() {
    clearInterval(timerTick);
    window.onbeforeunload = null;
    let correct = 0;
    exam.questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const blank = answers.filter((a) => a === 0).length;
    const wrong = total - correct - blank;
    const percent = calcPercent(correct, wrong, total);
    try {
      await api('/api/result/' + state.id, { method: 'PUT', body: JSON.stringify({ status: 'done', answers, correct, wrong, blank, total, percent, finishedAt: Date.now() }) });
    } catch (e) {
      console.error(e);
    }
    location.hash = '#/result/' + state.id;
  }

  document.querySelectorAll('.q-card').forEach((card) => {
    const qi = +card.dataset.q;
    card.querySelectorAll('.opt').forEach((b) => {
      b.onclick = () => {
        if (finished) return;
        answers[qi] = +b.dataset.o;
        card.querySelectorAll('.opt').forEach((x) => x.classList.toggle('sel', x === b));
        paint();
        clearTimeout(saving);
        saving = setTimeout(() => api('/api/result/' + state.id, { method: 'PUT', body: JSON.stringify({ answers }) }).catch(() => {}), 600);
      };
    });
  });

  const doSubmit = () => {
    if (finished) return;
    const done = answers.filter((a) => a > 0).length;
    const ov = openModal('<h3 class="disp">ثبت نهایی آزمون</h3><p class="m-msg">به <b>' + fa(done) + '</b> سؤال از <b>' + fa(total) + '</b> پاسخ داده‌ای.<br>مطمئنی؟</p>' +
      '<div class="m-actions"><button class="btn btn-primary" id="fy">✔ ثبت</button><button class="btn btn-ghost" id="fn">ادامه</button></div>');
    ov.querySelector('#fy').onclick = () => { closeModal(); finished = true; finish(); };
    ov.querySelector('#fn').onclick = closeModal;
  };

  $('#submitBtn').onclick = doSubmit;
  $('#submitBtn2').onclick = doSubmit;
  window.onbeforeunload = (e) => { e.preventDefault(); return ''; };
  paint();
  timerTick = setInterval(paint, 250);
}