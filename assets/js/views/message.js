import { appEl } from '../utils/dom.js';
import { getSession } from '../auth.js';
import { studentTop } from '../components/topbar.js';

export function messagePage(txt) {
  const session = getSession();
  const top = (session && session.role === 'student') ? studentTop() : '';
  appEl.innerHTML = top + '<div class="wrap narrow"><div class="card pad center fade-up" style="margin-top:44px"><p class="big-msg">' + txt + '</p><a class="btn btn-primary" href="#/">صفحهٔ ورود</a></div></div>';
}