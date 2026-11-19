export function openModal(html) {
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = '<div class="modal">' + html + '</div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', (e) => { if (e.target === ov) closeModal(); });
  return ov;
}

export function closeModal() {
  document.querySelectorAll('.overlay').forEach((o) => o.remove());
}

export function confirmBox(msg, onYes, yes = 'بله، مطمئنم') {
  const ov = openModal('<p class="m-msg">' + msg + '</p><div class="m-actions"><button class="btn btn-danger" id="my">' + yes + '</button><button class="btn btn-ghost" id="mn">انصراف</button></div>');
  ov.querySelector('#my').onclick = () => { closeModal(); onYes(); };
  ov.querySelector('#mn').onclick = closeModal;
}

export function promptBox(title, label, onOk) {
  const ov = openModal('<h3 class="disp">' + title + '</h3><label class="lbl">' + label + '</label><input class="inp" id="pv"><div class="m-actions"><button class="btn btn-primary" id="po">تأیید</button><button class="btn btn-ghost" id="pc">انصراف</button></div>');
  const inp = ov.querySelector('#pv');
  inp.focus();
  const go = () => {
    const v = inp.value.trim();
    if (!v) return;
    closeModal();
    onOk(v);
  };
  ov.querySelector('#po').onclick = go;
  inp.onkeydown = (e) => { if (e.key === 'Enter') go(); };
  ov.querySelector('#pc').onclick = closeModal;
}