import { $ } from '../../utils/dom.js';
import { esc, fmtDate } from '../../utils/format.js';
import { api } from '../../api.js';
import { toast } from '../../ui/toast.js';
import { openModal, closeModal, confirmBox, promptBox } from '../../ui/modal.js';
import { copyText } from '../../utils/clipboard.js';
import { route } from '../../router.js';

export async function adminStudents() {
  const box = $('#adminContent');
  const data = await api('/api/students');
  const students = data.students;
  box.innerHTML =
    '<div class="toolbar"><h2 class="disp">دانش‌آموزان</h2></div>' +
    '<form class="card pad form-grid" id="addStu">' +
    '<div><label class="lbl">نام</label><input class="inp" id="s-name" required></div>' +
    '<div><label class="lbl">نام کاربری (انگلیسی)</label><input class="inp" id="s-user" dir="ltr" required placeholder="ali.m"></div>' +
    '<div><label class="lbl">رمز</label><input class="inp" id="s-pass" dir="ltr" required></div>' +
    '<div><button class="btn btn-primary">➕ ساخت</button></div>' +
    '</form>' +
    '<div class="card pad table-wrap"><table class="tbl"><tr><th>نام</th><th>نام کاربری</th><th>ساخته‌شده</th><th>عملیات</th></tr>' +
    (students.map((s) => '<tr><td>' + esc(s.name) + '</td><td dir="ltr">' + esc(s.username) + '</td><td>' + fmtDate(s.createdAt) + '</td>' +
      '<td><div class="row-actions">' +
      '<button class="btn btn-ghost btn-sm" data-pass="' + esc(s.username) + '" data-name="' + esc(s.name) + '">🔑 تغییر رمز</button>' +
      '<button class="btn btn-danger-o btn-sm" data-sdel="' + esc(s.username) + '">🗑 حذف</button>' +
      '</div></td></tr>').join('') || '<tr><td colspan="4" class="center" style="padding:26px">هنوز حسابی نساخته‌ای.</td></tr>') +
    '</table></div>';
  $('#addStu').onsubmit = async (ev) => {
    ev.preventDefault();
    const name = $('#s-name').value.trim(), user = $('#s-user').value.trim(), pass = $('#s-pass').value;
    try {
      await api('/api/student', { method: 'POST', body: JSON.stringify({ name, username: user, password: pass }) });
      toast('حساب ساخته شد ✓');
      const credsText = 'نام کاربری: ' + user + '\nرمز عبور: ' + pass + '\nآدرس سایت: ' + location.origin + location.pathname;
      const ov = openModal('<h3 class="disp">اطلاعات ورود ✅</h3><p>این را برای دانش‌آموز بفرست:</p>' +
        '<pre class="creds" dir="ltr">' + esc(credsText) + '</pre>' +
        '<div class="m-actions"><button class="btn btn-primary" id="cc">📋 کپی</button><button class="btn btn-ghost" id="cx">بستن</button></div>');
      ov.querySelector('#cc').onclick = () => copyText(credsText);
      ov.querySelector('#cx').onclick = closeModal;
      route();
    } catch (err) {
      toast(err.message, 'err');
    }
  };
  box.querySelectorAll('[data-pass]').forEach((b) => {
    b.onclick = () => promptBox('تغییر رمز «' + esc(b.dataset.name) + '»', 'رمز جدید', async (v) => {
      try {
        await api('/api/student/' + b.dataset.pass + '/password', { method: 'PUT', body: JSON.stringify({ password: v }) });
        toast('رمز تغییر کرد ✓');
        const credsText = 'نام کاربری: ' + b.dataset.pass + '\nرمز عبور: ' + v;
        const ov = openModal('<h3 class="disp">رمز جدید ✅</h3><pre class="creds" dir="ltr">' + esc(credsText) + '</pre>' +
          '<div class="m-actions"><button class="btn btn-primary" id="cc2">📋 کپی</button><button class="btn btn-ghost" id="cx2">بستن</button></div>');
        ov.querySelector('#cc2').onclick = () => copyText(credsText);
        ov.querySelector('#cx2').onclick = closeModal;
      } catch (err) {
        toast(err.message, 'err');
      }
    });
  });
  box.querySelectorAll('[data-sdel]').forEach((b) => {
    b.onclick = () => confirmBox('حذف حساب؟', async () => {
      try {
        await api('/api/student/' + b.dataset.sdel, { method: 'DELETE' });
        toast('حذف شد');
        route();
      } catch (err) {
        toast(err.message, 'err');
      }
    });
  });
}