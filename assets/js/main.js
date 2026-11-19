import { route } from './router.js';
import { setSession } from './auth.js';
import { esc } from './utils/format.js';
import { initBackground } from './ui/background.js';
import { hideFab, syncFab } from './ui/fab.js';
import { openModal, closeModal } from './ui/modal.js';

document.addEventListener('click', (e) => {
  if (e.target.closest('#logoutBtn')) {
    hideFab();
    setSession(null);
    location.hash = '#/login';
    return;
  }
  const img = e.target.closest('.qimg');
  if (img) {
    const ov = openModal('<img class="lb-img" src="' + esc(img.src) + '">');
    ov.onclick = closeModal;
  }
});

window.addEventListener('hashchange', route);

initBackground();
syncFab();
route();