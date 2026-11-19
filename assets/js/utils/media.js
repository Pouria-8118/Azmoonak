import { esc } from './format.js';

export function fileToDataURL(file, maxW = 800) {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = rej;
    img.src = url;
  });
}

export function videoEmbed(url) {
  if (!url) return '';
  url = url.trim();
  const mAp = url.match(/aparat\.com\/v\/([A-Za-z0-9]+)/i);
  if (mAp) return '<div class="video-wrap"><iframe src="https://www.aparat.com/video/video/embed/videohash/' + mAp[1] + '/vt/frame" allowfullscreen></iframe></div>';
  const mYt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{6,})/i);
  if (mYt) return '<div class="video-wrap"><iframe src="https://www.youtube.com/embed/' + mYt[1] + '" allowfullscreen></iframe></div>';
  if (/\.(mp4|webm|m4v|mov)(\?|$)/i.test(url)) return '<video class="vid" src="' + esc(url) + '" controls></video>';
  return '<div class="video-wrap"><iframe src="' + esc(url) + '" allowfullscreen></iframe></div>';
}