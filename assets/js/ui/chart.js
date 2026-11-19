import { fa, esc, fmtDate } from '../utils/format.js';
import { toast } from './toast.js';

export function drawChart(finished, sel) {
  const host = document.querySelector(sel);
  if (!host) return;
  if (!finished.length) { host.innerHTML = ''; return; }
  const W = 680, H = 260, padL = 40, padR = 30, padT = 30, padB = 50;
  const n = finished.length;
  const best = Math.max(...finished.map((r) => r.percent));
  const worst = Math.min(...finished.map((r) => r.percent));
  const avg = Math.round(finished.reduce((s, r) => s + r.percent, 0) / n);
  const xStep = n === 1 ? (W - padL - padR) : (W - padL - padR) / (n - 1);
  const yMin = Math.min(0, worst);
  const yMax = 100;
  const yOf = (p) => padT + (1 - (p - yMin) / (yMax - yMin)) * (H - padT - padB);
  const pts = finished.map((r, i) => ({ x: padL + i * xStep, y: yOf(r.percent), r }));
  const pathD = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  const areaD = pathD + ' L ' + pts[pts.length - 1].x.toFixed(1) + ' ' + (H - padB) + ' L ' + pts[0].x.toFixed(1) + ' ' + (H - padB) + ' Z';

  let gridLines = '';
  const gridValues = yMin < 0 ? [-25, 0, 25, 50, 75, 100] : [0, 25, 50, 75, 100];
  gridValues.forEach((v) => {
    const y = yOf(v);
    const isZero = v === 0;
    const strokeW = isZero ? 1.5 : 1;
    const strokeColor = isZero ? '#8a8fa6' : '#ece8db';
    gridLines += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="' + strokeColor + '" stroke-width="' + strokeW + '"' + (isZero ? '' : ' stroke-dasharray="3 3"') + '/>';
    gridLines += '<text x="' + (padL - 8) + '" y="' + (y + 4) + '" font-family="Vazirmatn" font-size="10" fill="' + (v < 0 ? '#d92c45' : '#8a8fa6') + '" text-anchor="end" font-weight="' + (v < 0 ? '800' : '400') + '">' + fa(v) + '</text>';
  });

  const points = pts.map((p) => {
    const isBest = p.r.percent === best && n > 1;
    const isWorst = p.r.percent === worst && n > 1 && best !== worst;
    const cls = isBest ? 'chart-point best' : (isWorst ? 'chart-point worst' : 'chart-point');
    const valCls = isBest ? 'chart-val best' : (isWorst ? 'chart-val worst' : 'chart-val');
    return '<circle class="' + cls + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="5" data-ex="' + esc(p.r.examTitle) + '" data-pc="' + p.r.percent + '" data-dt="' + esc(fmtDate(p.r.finishedAt)) + '"/>' +
      '<text class="' + valCls + '" x="' + p.x.toFixed(1) + '" y="' + (p.y - 10).toFixed(1) + '">' + fa(p.r.percent) + '٪</text>';
  }).join('');

  const labels = pts.map((p, i) => {
    if (n > 6 && i % Math.ceil(n / 6) !== 0 && i !== n - 1) return '';
    return '<text class="chart-lbl" x="' + p.x.toFixed(1) + '" y="' + (H - padB + 16) + '">' + (i + 1) + '</text>';
  }).join('');

  host.innerHTML = '<div class="chart-wrap fade-up">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px">' +
    '<h3 class="disp" style="font-size:22px">📈 روند پیشرفت</h3>' +
    '<div style="font-size:13px;color:var(--ink-2);font-weight:700">میانگین: <b>' + fa(avg) + '٪</b> · بهترین: <b style="color:var(--ok)">' + fa(best) + '٪</b></div>' +
    '</div>' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' +
    gridLines +
    '<path class="chart-area" d="' + areaD + '"/>' +
    '<path class="chart-line" d="' + pathD + '"/>' +
    points +
    labels +
    '</svg>' +
    '<div class="chart-legend">' +
    '<span><i style="background:var(--ink)"></i>درصد آزمون</span>' +
    (n > 1 ? '<span><i style="background:var(--ok)"></i>بهترین</span><span><i style="background:var(--pen)"></i>نیاز به تلاش بیشتر</span>' : '') +
    '</div>' +
    '<p class="hint">برای دیدن جزئیات هر آزمون، روی نقاط کلیک کن.</p>' +
    '</div>';

  host.querySelectorAll('.chart-point').forEach((c) => {
    c.onclick = () => toast('📌 ' + c.dataset.ex + ' — ' + fa(+c.dataset.pc) + '٪ — ' + c.dataset.dt);
  });
}