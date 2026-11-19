import { $ } from '../../utils/dom.js';
import { api } from '../../api.js';
import { toast } from '../../ui/toast.js';

export function adminSettings() {
  $('#adminContent').innerHTML = '<div class="card pad narrow-card fade-up">' +
    '<h2 class="disp" style="font-size:28px">تنظیمات</h2>' +
    '<p style="margin:10px 0">نام کاربری مدیر: <b dir="ltr">pouria</b></p>' +
    '<label class="lbl">رمز جدید مدیر</label><input class="inp" id="np" type="password" dir="ltr">' +
    '<button class="btn btn-primary" id="npb" style="margin-top:14px">💾 ذخیرهٔ رمز جدید</button>' +
    '<hr class="sep"><p class="hint">اگر رمز را فراموش کردی، در کد Worker مقدار ADMIN_PASS را موقتاً عوض کن.</p>' +
    '</div>';
  $('#npb').onclick = async () => {
    const v = $('#np').value;
    if (v.length < 5) return toast('رمز حداقل ۵ حرف', 'err');
    try {
      await api('/api/admin/password', { method: 'PUT', body: JSON.stringify({ password: v }) });
      toast('رمز تغییر کرد ✓');
      $('#np').value = '';
    } catch (err) {
      toast(err.message, 'err');
    }
  };
}