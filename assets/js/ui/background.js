export function initBackground() {
  const box = document.getElementById('bg-syms');
  if (!box) return;
  const glyphs = ['∑', 'π', '√', '∞', '∫', '≈', 'Δ', 'θ', '٪', '×', '÷', '≠', '∠', 'ƒ'];
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('span');
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.fontSize = (26 + Math.random() * 70) + 'px';
    s.style.animationDuration = (7 + Math.random() * 8) + 's';
    s.style.animationDelay = (-Math.random() * 8) + 's';
    box.appendChild(s);
  }
}