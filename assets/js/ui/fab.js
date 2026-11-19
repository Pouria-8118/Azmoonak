let fabEl = null;

export function showFab(onClick) {
  if (!fabEl) {
    fabEl = document.createElement('button');
    fabEl.id = 'qFab';
    fabEl.className = 'fab';
    fabEl.title = 'افزودن سؤال جدید';
    fabEl.textContent = '+';
    document.body.appendChild(fabEl);
  }
  fabEl.style.display = 'grid';
  fabEl.onclick = onClick;
}

export function hideFab() {
  if (fabEl) fabEl.style.display = 'none';
}

export function syncFab() {
  const h = location.hash || '#/';
  const isEditor = h.startsWith('#/admin/edit/') || h === '#/admin/new';
  if (isEditor) {
    if (fabEl) fabEl.style.display = 'grid';
  } else {
    hideFab();
  }
}