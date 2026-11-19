export function toast(msg, type = 'ok') {
  const box = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = 'toast-item' + (type === 'err' ? ' err' : '');
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = '.4s';
    setTimeout(() => el.remove(), 420);
  }, 2800);
}