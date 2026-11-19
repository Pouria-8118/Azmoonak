import { toast } from '../ui/toast.js';

export function copyText(t) {
  const legacy = () => {
    const ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('کپی شد ✓'); }
    catch { toast('کپی نشد', 'err'); }
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(() => toast('کپی شد ✓')).catch(legacy);
  } else {
    legacy();
  }
}