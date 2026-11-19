import { fa, esc } from '../utils/format.js';

export function reviewOptionsHTML(q, answer, pickLabel) {
  return '<div class="opts">' + [1, 2, 3, 4].map((o) => {
    let cls = '', tag = '';
    if (o === q.correct) {
      cls = 'good';
      tag = '<span class="opt-tag t-ok">' + (answer === o ? pickLabel + ' ✓' : 'پاسخ صحیح') + '</span>';
    } else if (o === answer) {
      cls = 'bad';
      tag = '<span class="opt-tag t-bad">' + pickLabel + '</span>';
    }
    return '<div class="opt ro ' + cls + '"><span class="n">' + fa(o) + '</span><span>گزینهٔ ' + fa(o) + '</span>' + tag + '</div>';
  }).join('') + '</div>';
}

export function reviewQuestionHTML(q, i, answer, pickLabel) {
  const st = answer === 0 ? ['b', '⚪ بی‌پاسخ'] : answer === q.correct ? ['g', '✔ صحیح'] : ['r', '✘ غلط'];
  return '<div class="card pad q-card fade-up">' +
    '<div class="q-head"><span class="q-num">سؤال ' + fa(i + 1) + '</span><span class="chip ' + st[0] + '">' + st[1] + '</span></div>' +
    '<img class="qimg" src="' + esc(q.img) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
    reviewOptionsHTML(q, answer, pickLabel) +
    '</div>';
}