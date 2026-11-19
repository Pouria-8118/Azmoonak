import { $ } from '../utils/dom.js';
import { fa, esc, fmtDur } from '../utils/format.js';
import { videoEmbed } from '../utils/media.js';

const CIRC = (2 * Math.PI * 62).toFixed(1);

export function percentColor(p) {
  return p >= 80 ? 'var(--ok)' : p >= 50 ? 'var(--amber)' : p >= 0 ? 'var(--pen)' : '#7c1d1d';
}

export function negativeNoteHTML(text) {
  return '<div style="background:#fee;border:1.5px solid var(--pen);border-radius:10px;padding:10px 14px;margin-top:12px;font-size:13px;color:#7c1d1d;line-height:1.9">' + text + '</div>';
}

export function resultHeadHTML(r, msg, negNote) {
  return '<div class="card pad result-head fade-up">' +
    '<div class="gauge"><svg width="170" height="170" viewBox="0 0 170 170">' +
    '<circle cx="85" cy="85" r="62" fill="none" stroke="#ece7d8" stroke-width="13"/>' +
    '<circle id="gval" cx="85" cy="85" r="62" fill="none" stroke="' + percentColor(r.percent) + '" stroke-width="13" stroke-linecap="round" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '" style="transition:stroke-dashoffset 1.3s"/>' +
    '</svg><div class="val">' + fa(r.percent) + '٪</div></div>' +
    '<div class="r-text"><span class="intro-tag">کارنامهٔ آزمون</span>' +
    '<h2 class="disp">' + esc(r.examTitle) + '</h2><p class="r-msg">' + msg + '</p>' +
    '<div class="r-stats"><span class="chip g">✔ صحیح ' + fa(r.correct) + '</span><span class="chip r">✘ غلط ' + fa(r.wrong) + '</span><span class="chip b">⚪ بی‌پاسخ ' + fa(r.blank) + '</span><span class="chip y">⏱ ' + fmtDur(r.finishedAt - r.startedAt) + '</span></div>' +
    negNote +
    '</div>' +
    '</div>';
}

export function videoSectionHTML(exam) {
  return '<div class="card pad fade-up"><h2 class="disp sec-title">🎬 پاسخ ویدئویی</h2>' + videoEmbed(exam.videoUrl) + '</div>';
}

export function scrollResultTop() {
  const topEl = document.getElementById('resultTop');
  if (topEl) topEl.scrollIntoView({ behavior: 'auto', block: 'start' });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

export function revealGauge(percent) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const g = $('#gval');
    if (g) g.style.strokeDashoffset = (CIRC * (1 - percent / 100)).toFixed(1);
  }));
}