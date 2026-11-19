import { $ } from '../../utils/dom.js';
import { fa, esc, examLink } from '../../utils/format.js';
import { api } from '../../api.js';
import { toast } from '../../ui/toast.js';
import { copyText } from '../../utils/clipboard.js';
import { fileToDataURL } from '../../utils/media.js';
import { showFab } from '../../ui/fab.js';

let draft = null;
let editingId = null;
let allStudents = [];

export async function adminEditor(id) {
  editingId = id || null;
  try {
    const d = await api('/api/students');
    allStudents = d.students;
  } catch {
    allStudents = [];
  }
  if (id) {
    try {
      const d = await api('/api/exam/' + id);
      const e = d.exam;
      draft = {
        title: e.title,
        duration: e.duration,
        videoUrl: e.videoUrl || '',
        published: !!e.published,
        questions: e.questions.map((q) => ({ img: q.img, correct: q.correct })),
        allowedStudents: e.allowedStudents || []
      };
    } catch {
      toast('آزمون پیدا نشد', 'err');
      location.hash = '#/admin';
      return;
    }
  } else {
    draft = { title: '', duration: 30, videoUrl: '', published: true, questions: [], allowedStudents: [] };
  }
  drawEditor();
}

function drawEditor() {
  const stuPick = allStudents.length ? allStudents.map((s) => {
    const checked = draft.allowedStudents.includes(s.id);
    return '<label class="stu-pick-row"><input type="checkbox" value="' + esc(s.id) + '" ' + (checked ? 'checked' : '') + '><span>' + esc(s.name) + '</span><em dir="ltr">' + esc(s.username) + '</em></label>';
  }).join('') : '<p class="hint" style="text-align:center;padding:12px">هنوز دانش‌آموزی نساخته‌ای.</p>';
  $('#adminContent').innerHTML =
    '<div class="card pad fade-up"><h2 class="disp" style="font-size:28px">' + (editingId ? 'ویرایش آزمون' : 'ساخت آزمون جدید') + '</h2>' +
    '<div class="form-grid3">' +
    '<div class="span2"><label class="lbl">عنوان آزمون</label><input id="e-title" class="inp" value="' + esc(draft.title) + '" placeholder="مثلاً: آزمون ریاضی نهم"></div>' +
    '<div><label class="lbl">مدت (دقیقه)</label><input id="e-duration" type="number" min="1" class="inp" value="' + draft.duration + '"></div>' +
    '<div class="span2"><label class="lbl">لینک پاسخ ویدئویی (اختیاری)</label><input id="e-video" dir="ltr" class="inp" value="' + esc(draft.videoUrl) + '" placeholder="https://www.aparat.com/v/xxxxx">' +
    '<p class="hint">لینک آپارات یا یوتیوب.</p></div>' +
    '<div><label class="lbl">وضعیت</label><label class="switch"><input type="checkbox" id="e-pub" ' + (draft.published ? 'checked' : '') + '><span></span><em>فعال</em></label></div>' +
    '<div class="span2"><label class="lbl">دسترسی دانش‌آموزان 🔐</label>' +
    '<div class="stu-pick" id="stuPick">' + stuPick + '</div>' +
    '<p class="hint">اگر هیچ‌کس را انتخاب نکنی، <b>همهٔ دانش‌آموزان</b> دسترسی دارند. در غیر این صورت فقط دانش‌آموزان انتخاب‌شده آزمون را می‌بینند.</p></div>' +
    '</div></div>' +
    '<div class="toolbar"><h2 class="disp">سؤال‌ها</h2></div>' +
    '<div id="qlist"></div>' +
    '<div class="card pad save-bar fade-up">' +
    '<button class="btn btn-primary big" id="saveExam">' + (editingId ? '💾 ذخیرهٔ تغییرات' : '💾 ساخت آزمون') + '</button>' +
    '<div id="linkBox"></div>' +
    '</div>';
  showFab(() => {
    draft.questions.push({ img: '', correct: 1 });
    drawQList();
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  });
  $('#saveExam').onclick = saveExam;
  if (editingId) showLink();
  drawQList();
}

function qItemHTML(q, i) {
  const prev = q.img ? '<img class="qprev-img" src="' + esc(q.img) + '" onerror="this.style.display=\'none\'">' : '<span class="qprev-empty">تصویر سؤال اینجا نمایش داده می‌شود 📷</span>';
  return '<div class="card q-item fade-up" data-i="' + i + '">' +
    '<div class="qi-head"><span class="q-badge">سؤال ' + fa(i + 1) + '</span><div class="qi-tools">' +
    '<button class="icon-btn" ' + (i === 0 ? 'disabled' : '') + ' data-act="up">↑</button> ' +
    '<button class="icon-btn" ' + (i === draft.questions.length - 1 ? 'disabled' : '') + ' data-act="down">↓</button> ' +
    '<button class="icon-btn danger" data-act="del">✕</button>' +
    '</div></div>' +
    '<div class="qi-body">' +
    '<div class="qi-img"><div class="qprev">' + prev + '</div>' +
    '<input type="file" class="qfile" accept="image/*" hidden>' +
    '<button class="btn btn-ghost btn-sm" data-act="pick">📤 آپلود تصویر</button>' +
    '<input class="inp qurl" dir="ltr" placeholder="…یا لینک تصویر" value="' + esc(q.img) + '"></div>' +
    '<div class="qi-corr"><p class="lbl" style="margin-top:0">پاسخ صحیح:</p><div class="corr-opts">' +
    [1, 2, 3, 4].map((o) => '<label class="corr ' + (q.correct === o ? 'on' : '') + '"><input type="radio" name="corr' + i + '" value="' + o + '" ' + (q.correct === o ? 'checked' : '') + '><span>' + fa(o) + '</span></label>').join('') +
    '</div><p class="hint">مقادیر گزینه‌ها داخل عکس است.</p></div>' +
    '</div></div>';
}

function drawQList() {
  const box = $('#qlist');
  if (!draft.questions.length) {
    box.innerHTML = '<div class="empty" style="margin-bottom:14px">هنوز سؤالی اضافه نکرده‌ای.<br>از دکمهٔ قرمز پایین صفحه استفاده کن +</div>';
    return;
  }
  box.innerHTML = draft.questions.map((q, i) => qItemHTML(q, i)).join('');
  box.querySelectorAll('.q-item').forEach((el) => {
    const i = +el.dataset.i, q = draft.questions[i];
    el.querySelector('[data-act="pick"]').onclick = () => el.querySelector('.qfile').click();
    el.querySelector('.qfile').onchange = async (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      el.querySelector('.qprev').innerHTML = '<span class="qprev-empty">⏳ در حال پردازش…</span>';
      try {
        q.img = await fileToDataURL(f);
        toast('تصویر سؤال ' + fa(i + 1) + ' آماده شد ✓');
      } catch {
        toast('خطا در پردازش', 'err');
      }
      drawQList();
    };
    const urlIn = el.querySelector('.qurl');
    urlIn.oninput = () => {
      q.img = urlIn.value.trim();
      el.querySelector('.qprev').innerHTML = q.img ? '<img class="qprev-img" src="' + esc(q.img) + '" onerror="this.style.display=\'none\'">' : '<span class="qprev-empty">تصویر سؤال اینجا 📷</span>';
    };
    el.querySelectorAll('input[name="corr' + i + '"]').forEach((r) => {
      r.onchange = () => {
        q.correct = +r.value;
        el.querySelectorAll('.corr').forEach((c) => c.classList.toggle('on', c.querySelector('input').checked));
      };
    });
    el.querySelectorAll('[data-act]').forEach((b) => {
      const act = b.dataset.act;
      const swap = (j) => {
        const t = draft.questions[i];
        draft.questions[i] = draft.questions[j];
        draft.questions[j] = t;
        drawQList();
      };
      if (act === 'up') b.onclick = () => { if (i > 0) swap(i - 1); };
      if (act === 'down') b.onclick = () => { if (i < draft.questions.length - 1) swap(i + 1); };
      if (act === 'del') b.onclick = () => { draft.questions.splice(i, 1); drawQList(); };
    });
  });
}

async function saveExam() {
  draft.title = $('#e-title').value.trim();
  draft.duration = +$('#e-duration').value || 0;
  draft.videoUrl = $('#e-video').value.trim();
  draft.published = $('#e-pub').checked;
  const checked = [];
  document.querySelectorAll('#stuPick input[type=checkbox]:checked').forEach((cb) => checked.push(cb.value));
  draft.allowedStudents = checked;
  if (!draft.title) return toast('عنوان آزمون را بنویس', 'err');
  if (!draft.duration) return toast('مدت را مشخص کن', 'err');
  if (!draft.questions.length) return toast('حداقل یک سؤال', 'err');
  for (let i = 0; i < draft.questions.length; i++) {
    if (!draft.questions[i].img) return toast('تصویر سؤال ' + fa(i + 1) + ' خالی است', 'err');
    if (!draft.questions[i].correct) return toast('پاسخ صحیح سؤال ' + fa(i + 1), 'err');
  }
  const btn = $('#saveExam');
  btn.disabled = true;
  btn.textContent = 'در حال ذخیره…';
  try {
    const body = { id: editingId, ...draft };
    const data = await api('/api/exam', { method: 'POST', body: JSON.stringify(body) });
    editingId = data.id;
    btn.textContent = '💾 ذخیرهٔ تغییرات';
    toast('آزمون ذخیره شد ✓');
    showLink();
  } catch (err) {
    toast('خطا: ' + err.message, 'err');
    btn.textContent = editingId ? '💾 ذخیرهٔ تغییرات' : '💾 ساخت آزمون';
  }
  btn.disabled = false;
}

function showLink() {
  const lb = $('#linkBox');
  lb.innerHTML = '<span>🔗 لینک آزمون:</span><code dir="ltr">' + esc(examLink(editingId)) + '</code><button class="btn btn-ghost btn-sm" id="copyLink">📋 کپی</button>';
  $('#copyLink').onclick = () => copyText(examLink(editingId));
}