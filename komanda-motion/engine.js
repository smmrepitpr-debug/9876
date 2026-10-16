/* =========================================================
   «Команда» — движок вертикальных моушн-роликов 9:16.
   Всё считается от u = W / 1080. window.seek(t) рисует кадр.
   ========================================================= */
const Q = new URLSearchParams(location.search);
const W = +Q.get('w') || 1080, H = +Q.get('h') || 1920;
const u = W / 1080;
const FPS = 30;
const CX = W / 2, CY = H / 2;

const C = { bg: '#02140D', neon: '#3DDC97', deep: '#0B5D3A', white: '#FFFFFF', mint: '#9FF5CF', red: '#FF4D6D', grey: '#8A8F98' };
const EMOJI = '"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';

const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const fitView = () => { const k = Math.min(innerWidth / W, innerHeight / H); cv.style.width = W * k + 'px'; cv.style.height = H * k + 'px'; };
fitView(); addEventListener('resize', fitView);
const ctx = cv.getContext('2d');

/* ---------- математика ---------- */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const eOut3 = t => 1 - Math.pow(1 - t, 3);
const eOut5 = t => 1 - Math.pow(1 - t, 5);
const eIn3 = t => t * t * t;
const eInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eBack = t => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const noise = (t, seed) => { const i = Math.floor(t), f = t - i, s = f * f * (3 - 2 * f); return lerp(hash(i + seed * 57), hash(i + 1 + seed * 57), s) * 2 - 1; };
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
const F = (size, w = 900) => `${w} ${size}px "Rubik"`;

/* ---------- фон ---------- */
const PARTS = (() => { const r = rng(11); return Array.from({ length: 90 }, () => ({ x: r(), y: r(), s: .6 + r() * 2.2, v: .015 + r() * .04, ph: r() * 6.28 })); })();
function background(t, mood = 1) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const blobs = [[.2, .25, C.deep, .55, 0], [.85, .7, C.deep, .5, 3], [.5, .5, C.neon, .08, 6]];
  for (const [bx, by, col, a, s] of blobs) {
    const x = W * bx + noise(t * .3, s) * 120 * u, y = H * by + noise(t * .35, s + 4) * 160 * u, r = 760 * u;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(col, a * mood)); g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
  // тонкая сетка
  ctx.save(); ctx.lineWidth = 1 * u;
  const step = 90 * u, off = (t * 14 * u) % step;
  for (let x = -step + off; x < W + step; x += step) {
    ctx.strokeStyle = hexA(C.neon, .05 * mood); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = -step + off * 1.4; y < H + step; y += step) {
    ctx.strokeStyle = hexA(C.neon, .05 * mood); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
  // частицы
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const p of PARTS) {
    const y = ((p.y - t * p.v) % 1 + 1) % 1, x = p.x + Math.sin(t * .7 + p.ph) * .01;
    const tw = .35 + .65 * Math.pow(Math.abs(Math.sin(t * 1.8 + p.ph)), 3), r = p.s * u * 2.4;
    const g = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, r * 4);
    g.addColorStop(0, hexA('#FFFFFF', .8 * tw * mood)); g.addColorStop(.3, hexA(C.neon, .5 * tw * mood)); g.addColorStop(1, hexA(C.neon, 0));
    ctx.fillStyle = g; ctx.fillRect(x * W - r * 4, y * H - r * 4, r * 8, r * 8);
  }
  ctx.restore();
}
function vignette() {
  ctx.save(); ctx.translate(CX, CY); ctx.scale(1, H / W);
  const g = ctx.createRadialGradient(0, 0, W * .3, 0, 0, W * .78);
  g.addColorStop(0, 'rgba(2,20,13,0)'); g.addColorStop(1, 'rgba(1,10,6,.85)');
  ctx.fillStyle = g; ctx.fillRect(-W, -W, W * 2, W * 2); ctx.restore();
}
function rings(lt, x = CX, y = CY, count = 3, every = .5, life = 1.8, maxR = 700) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < count; k++) {
    const a = lt - k * every; if (a < 0 || a > life) continue;
    const p = a / life, r = 30 * u + eOut3(p) * maxR * u;
    ctx.lineWidth = (5 - 4 * p) * u; ctx.strokeStyle = hexA(C.neon, (1 - p) * .6);
    ctx.shadowColor = C.neon; ctx.shadowBlur = 20 * u;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  }
  ctx.restore();
}

/* ---------- текст ---------- */
function glow(str, x, y, size, o = {}) {
  const { w = 900, split = 0, color = C.white, gl = C.neon, alpha = 1, ga = 1, align = 'center' } = o;
  ctx.font = F(size, w); ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (split > .3 * u) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha * .85;
    ctx.fillStyle = '#FF3B6B'; ctx.fillText(str, x - split, y);
    ctx.fillStyle = '#28E7FF'; ctx.fillText(str, x + split, y);
    ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.shadowColor = gl; ctx.shadowBlur = 34 * u * ga; ctx.fillText(str, x, y);
  ctx.shadowBlur = 10 * u * ga; ctx.fillText(str, x, y);
  ctx.restore();
}
function fit(str, maxW, size, w = 900) { ctx.font = F(size, w); const m = ctx.measureText(str).width; return m > maxW ? size * maxW / m : size; }
// Блок строк: слова выезжают снизу из-под маски по одному, с RGB-расслоением.
// lines: ['СТРОКА', {t:'СТРОКА', c: цвет}]
function title(lines, cy, size, t0, lt, o = {}) {
  const { stagger = .07, dur = .45, rgb = 18, maxW = W * .86, lh = 1.1, w = 900, out = null } = o;
  const L = lines.map(l => typeof l === 'string' ? { t: l } : l);
  const sizes = L.map(l => fit(l.t, maxW, l.s ? l.s * u : size, w));
  const hs = sizes.map(s => s * lh); const tot = hs.reduce((a, b) => a + b, 0);
  let y = cy - tot / 2, k = 0;
  const outA = out ? 1 - inv(out, out + .25, lt) : 1;
  L.forEach((l, li) => {
    const s = sizes[li]; y += hs[li] / 2;
    ctx.font = F(s, w);
    const words = l.t.split(' '), sp = ctx.measureText(' ').width, ws = words.map(x => ctx.measureText(x).width);
    const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let x = CX - total / 2;
    words.forEach((wd, i) => {
      const p = inv(t0 + k * stagger, t0 + k * stagger + dur, lt); k++;
      if (p > 0) {
        const dy = (1 - eOut5(p)) * s * 1.05;
        ctx.save(); ctx.beginPath(); ctx.rect(x - s * .3, y - s * .66, ws[i] + s * .6, s * 1.3); ctx.clip();
        glow(wd, x + ws[i] / 2, y + dy, s, { w, split: (1 - eOut3(p)) * rgb * u, color: l.c || C.white, gl: l.c ? C.deep : C.neon, alpha: outA, ga: l.c ? .55 : 1 });
        ctx.restore();
      }
      x += ws[i] + sp;
    });
    y += hs[li] / 2;
  });
}
function sub(str, y, size, t0, lt, o = {}) {
  const p = inv(t0, t0 + .45, lt); if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = eOut3(p) * (o.alpha ?? 1);
  glow(str, CX, y + (1 - eOut3(p)) * 18 * u, fit(str, W * .86, size, o.w || 500), { w: o.w || 500, color: o.color || C.mint, ga: .5 });
  ctx.restore();
}

/* ---------- примитивы ---------- */
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function card(x, y, w, h, o = {}) {
  ctx.save();
  rrect(x, y, w, h, o.r ?? 22 * u);
  ctx.fillStyle = o.fill || 'rgba(11,93,58,.28)'; ctx.fill();
  ctx.lineWidth = (o.lw ?? 1.5) * u; ctx.strokeStyle = o.stroke || hexA(C.neon, .28);
  if (o.glow) { ctx.shadowColor = C.neon; ctx.shadowBlur = 30 * u * o.glow; ctx.strokeStyle = hexA(C.neon, .4 + .6 * o.glow); ctx.lineWidth = (1.5 + 2.5 * o.glow) * u; }
  ctx.stroke(); ctx.restore();
}
function text(str, x, y, size, o = {}) {
  ctx.save(); ctx.font = F(size, o.w || 600); ctx.fillStyle = o.color || C.white;
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.globalAlpha = o.alpha ?? 1;
  ctx.fillText(str, x, y); ctx.restore();
}
function emoji(e, x, y, size, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = `${size}px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(e, x, y + size * .05); ctx.restore();
}
// Пилюля-кнопка с призывом и стрелкой, пульсирует
function pill(label, y, t0, lt) {
  const p = inv(t0, t0 + .5, lt); if (p <= 0) return;
  const s = fit(label, W * .72, 50 * u);
  ctx.font = F(s, 900); const tw = ctx.measureText(label).width;
  const bw = tw + 110 * u, bh = s * 2.1, puls = 1 + .035 * Math.sin((lt - t0) * 6) * inv(t0 + .5, t0 + .8, lt);
  ctx.save(); ctx.translate(CX, y); ctx.scale(eBack(p) * puls, eBack(p) * puls);
  // ореол-пульс
  const ph = ((lt - t0) * 1.2) % 1;
  ctx.save(); ctx.globalAlpha = (1 - ph) * .5 * p; ctx.strokeStyle = C.neon; ctx.lineWidth = 4 * u;
  rrect(-bw / 2 - ph * 40 * u, -bh / 2 - ph * 40 * u, bw + ph * 80 * u, bh + ph * 80 * u, bh); ctx.stroke(); ctx.restore();
  ctx.shadowColor = C.neon; ctx.shadowBlur = 50 * u;
  rrect(-bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fillStyle = C.neon; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = F(s, 900); ctx.fillStyle = C.bg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const arrowShift = Math.sin((lt - t0) * 6) * 6 * u;
  ctx.fillText(label.replace(' →', ''), -s * .45, 2 * u);
  ctx.fillText('→', tw / 2 - s * .45 + arrowShift, 0);
  ctx.restore();
}

/* ---------- логотип «Команда» ---------- */
function logoMark(x, y, s, a = 1) {           // s — сторона плитки
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  ctx.shadowColor = C.neon; ctx.shadowBlur = 24 * u;
  rrect(-s / 2, -s / 2, s, s, s * .22);
  const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
  g.addColorStop(0, '#13805A'); g.addColorStop(1, C.deep);
  ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = s * .07; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const k = s / 150;
  ctx.beginPath(); ctx.arc(-15 * k, -22 * k, 20 * k, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-50 * k, 42 * k); ctx.quadraticCurveTo(-48 * k, 6 * k, -15 * k, 6 * k); ctx.quadraticCurveTo(8 * k, 6 * k, 16 * k, 20 * k); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12 * k, 20 * k); ctx.lineTo(28 * k, 34 * k); ctx.lineTo(56 * k, 2 * k); ctx.stroke();
  ctx.restore();
}
function cornerLogo(a = 1) {
  const s = 64 * u, y = 80 * u + s / 2, right = W - 60 * u;
  ctx.save(); ctx.globalAlpha = a; ctx.font = F(36 * u, 900); ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText('Команда').width;
  ctx.shadowColor = C.neon; ctx.shadowBlur = 14 * u; ctx.fillText('Команда', right, y + 2 * u); ctx.restore();
  logoMark(right - tw - 20 * u - s / 2, y, s, a);
}

/* ---------- линейные иконки (в коробке 100×100, центр 0,0) ---------- */
const ICON = {
  db(c) { c.beginPath(); c.ellipse(0, -30, 34, 12, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-34, -30); c.lineTo(-34, 30); c.ellipse(0, 30, 34, 12, 0, Math.PI, 0, true); c.lineTo(34, -30); c.stroke(); c.beginPath(); c.ellipse(0, 0, 34, 12, 0, 0, Math.PI); c.stroke(); },
  gear(c) { c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = i % 2 ? 30 : 40; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke(); c.beginPath(); c.arc(0, 0, 12, 0, 7); c.stroke(); },
  cap(c) { c.beginPath(); c.moveTo(-44, -8); c.lineTo(0, -28); c.lineTo(44, -8); c.lineTo(0, 12); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(-26, 2); c.lineTo(-26, 24); c.quadraticCurveTo(0, 38, 26, 24); c.lineTo(26, 2); c.stroke(); c.beginPath(); c.moveTo(44, -8); c.lineTo(44, 22); c.stroke(); },
  user(c) { c.beginPath(); c.arc(0, -16, 16, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-32, 36); c.quadraticCurveTo(-30, 6, 0, 6); c.quadraticCurveTo(30, 6, 32, 36); c.stroke(); },
  chart(c) { c.beginPath(); c.moveTo(-40, -40); c.lineTo(-40, 40); c.lineTo(42, 40); c.stroke(); c.beginPath(); c.moveTo(-28, 22); c.lineTo(-6, 0); c.lineTo(10, 10); c.lineTo(36, -24); c.stroke(); },
  star(c) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 16 : 38; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke(); },
  list(c) { for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(-30, i * 24, 4, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-16, i * 24); c.lineTo(38, i * 24); c.stroke(); } },
  whistle(c) { c.beginPath(); c.arc(-6, 10, 26, 0, 7); c.stroke(); c.beginPath(); c.moveTo(14, -6); c.lineTo(42, -22); c.lineTo(42, -6); c.lineTo(20, 4); c.stroke(); },
  pin(c) { c.beginPath(); c.moveTo(0, 44); c.bezierCurveTo(-46, -6, -30, -44, 0, -44); c.bezierCurveTo(30, -44, 46, -6, 0, 44); c.stroke(); c.beginPath(); c.arc(0, -12, 12, 0, 7); c.stroke(); },
  car(c) { c.beginPath(); c.moveTo(-44, 14); c.lineTo(-44, -2); c.lineTo(-30, -6); c.lineTo(-18, -24); c.lineTo(18, -24); c.lineTo(32, -6); c.lineTo(44, -2); c.lineTo(44, 14); c.closePath(); c.stroke(); c.beginPath(); c.arc(-24, 16, 9, 0, 7); c.stroke(); c.beginPath(); c.arc(24, 16, 9, 0, 7); c.stroke(); },
  club(c) { c.beginPath(); c.moveTo(-40, 40); c.lineTo(-40, -10); c.lineTo(0, -40); c.lineTo(40, -10); c.lineTo(40, 40); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(-18, 14); c.lineTo(18, 14); c.moveTo(-18, 6); c.lineTo(-18, 22); c.moveTo(18, 6); c.lineTo(18, 22); c.stroke(); },
  chat(c) { c.beginPath(); c.roundRect(-42, -32, 84, 54, 14); c.stroke(); c.beginPath(); c.moveTo(-20, 22); c.lineTo(-30, 40); c.lineTo(0, 22); c.stroke(); },
  bed(c) { c.beginPath(); c.moveTo(-44, 30); c.lineTo(-44, -20); c.moveTo(-44, 12); c.lineTo(44, 12); c.lineTo(44, 30); c.stroke(); c.beginPath(); c.arc(-26, -2, 9, 0, 7); c.stroke(); c.beginPath(); c.roundRect(-12, -8, 52, 18, 8); c.stroke(); },
  check(c) { c.beginPath(); c.moveTo(-30, 2); c.lineTo(-8, 24); c.lineTo(34, -22); c.stroke(); },
  calendar(c) { c.beginPath(); c.roundRect(-40, -32, 80, 72, 10); c.stroke(); c.beginPath(); c.moveTo(-40, -12); c.lineTo(40, -12); c.moveTo(-20, -42); c.lineTo(-20, -24); c.moveTo(20, -42); c.lineTo(20, -24); c.stroke(); },
  bell(c) { c.beginPath(); c.moveTo(-32, 22); c.lineTo(-24, 10); c.lineTo(-24, -10); c.quadraticCurveTo(-24, -34, 0, -34); c.quadraticCurveTo(24, -34, 24, -10); c.lineTo(24, 10); c.lineTo(32, 22); c.closePath(); c.stroke(); c.beginPath(); c.arc(0, 30, 8, 0, Math.PI); c.stroke(); },
};
function icon(name, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.globalAlpha = o.alpha ?? 1;
  ctx.strokeStyle = o.color || C.neon; ctx.lineWidth = (o.lw || 6); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = o.color || C.neon; ctx.shadowBlur = 18 * (o.glow ?? 1);
  ICON[name](ctx); ctx.restore();
}
function iconTile(name, x, y, s, lt, t0, label) {
  const p = inv(t0, t0 + .45, lt); if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(eBack(p), eBack(p)); ctx.translate(-x, -y);
  card(x - s / 2, y - s / 2, s, s, { r: s * .24, fill: 'rgba(11,93,58,.35)', glow: .5 });
  icon(name, x, y, s * .55);
  if (label) text(label, x, y + s * .5 + 42 * u, 34 * u, { align: 'center', w: 700, color: C.mint });
  ctx.restore();
}

/* ---------- смартфон ---------- */
// Экран 360×760 «точек». draw(c) рисует в локальных координатах экрана.
function phone(x, y, s, lt, draw, o = {}) {
  const PW = 360, PH = 760, k = s;
  ctx.save(); ctx.translate(x, y);
  if (o.rotY) { const c = Math.cos(o.rotY); ctx.transform(c, Math.sin(o.rotY) * .12, 0, 1, 0, 0); }
  ctx.scale(k, k);
  ctx.shadowColor = hexA(C.neon, .45); ctx.shadowBlur = 70;
  rrect(-PW / 2 - 12, -PH / 2 - 12, PW + 24, PH + 24, 58); ctx.fillStyle = '#0C1712'; ctx.fill();
  ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(159,245,207,.35)'; ctx.stroke();
  rrect(-PW / 2, -PH / 2, PW, PH, 46); ctx.save(); ctx.clip();
  ctx.fillStyle = o.screen || '#061E14'; ctx.fillRect(-PW / 2, -PH / 2, PW, PH);
  ctx.translate(-PW / 2, -PH / 2); draw(ctx, lt);
  ctx.restore();
  // «островок»
  rrect(-50, -PH / 2 + 12, 100, 26, 13); ctx.fillStyle = '#000'; ctx.fill();
  // блик стекла
  ctx.save(); rrect(-PW / 2, -PH / 2, PW, PH, 46); ctx.clip();
  const g = ctx.createLinearGradient(-PW / 2, -PH / 2, PW / 2, PH / 2);
  g.addColorStop(0, 'rgba(255,255,255,.07)'); g.addColorStop(.4, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-PW / 2, -PH / 2, PW, PH);
  ctx.restore();
  ctx.restore();
}
// элементы интерфейса (в координатах экрана, шрифты в «точках»)
const ui = {
  t(c, s, x, y, size, o = {}) { c.font = `${o.w || 600} ${size}px "Rubik"`; c.fillStyle = o.color || '#fff'; c.textAlign = o.align || 'left'; c.textBaseline = 'middle'; c.globalAlpha = o.a ?? 1; c.fillText(s, x, y); c.globalAlpha = 1; },
  header(c, title = 'Команда', sub = '') {
    c.fillStyle = 'rgba(11,93,58,.55)'; c.fillRect(0, 0, 360, 110);
    c.save(); c.translate(42, 76); c.scale(.24, .24); c.restore();
    ui.mini(c, 40, 78, 34); ui.t(c, title, 66, 72, 22, { w: 900 }); if (sub) ui.t(c, sub, 66, 94, 12, { w: 500, color: '#9FF5CF' });
    ui.t(c, '9:41', 30, 26, 13, { w: 700 });
  },
  mini(c, x, y, s) {
    c.save(); c.translate(x, y); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, s * .24); c.fillStyle = '#13805A'; c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = s * .08; c.lineCap = 'round'; const k = s / 150;
    c.beginPath(); c.arc(-15 * k, -22 * k, 20 * k, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(-50 * k, 42 * k); c.quadraticCurveTo(-48 * k, 6 * k, -15 * k, 6 * k); c.quadraticCurveTo(8 * k, 6 * k, 16 * k, 20 * k); c.stroke();
    c.beginPath(); c.moveTo(12 * k, 20 * k); c.lineTo(28 * k, 34 * k); c.lineTo(56 * k, 2 * k); c.stroke(); c.restore();
  },
  box(c, x, y, w, h, o = {}) {
    c.save(); c.beginPath(); c.roundRect(x, y, w, h, o.r ?? 16);
    c.fillStyle = o.fill || 'rgba(61,220,151,.08)'; c.fill();
    if (o.glow) { c.shadowColor = '#3DDC97'; c.shadowBlur = 26 * o.glow; c.strokeStyle = `rgba(61,220,151,${.3 + .7 * o.glow})`; c.lineWidth = 1.5 + 2.5 * o.glow; }
    else { c.strokeStyle = 'rgba(61,220,151,.22)'; c.lineWidth = 1.2; }
    c.stroke(); c.restore();
  },
  avatar(c, x, y, r, hue) { c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = `hsl(${hue},45%,38%)`; c.fill(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(x, y - r * .25, r * .32, 0, 7); c.fill(); c.beginPath(); c.arc(x, y + r * .75, r * .62, Math.PI, 0); c.fill(); c.restore(); },
  spark(c, x, y, w, h, p, pts = [.2, .35, .3, .55, .5, .75, .9]) {
    c.save(); c.strokeStyle = '#3DDC97'; c.lineWidth = 3; c.lineJoin = 'round'; c.shadowColor = '#3DDC97'; c.shadowBlur = 10;
    c.beginPath(); const n = Math.max(2, Math.ceil(pts.length * p));
    for (let i = 0; i < n; i++) { const px = x + w * i / (pts.length - 1), py = y + h - h * pts[i]; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); c.restore();
  },
  button(c, label, x, y, w, h, pressed = 0) { c.save(); c.beginPath(); c.roundRect(x, y, w, h, h / 2); c.fillStyle = '#3DDC97'; c.shadowColor = '#3DDC97'; c.shadowBlur = 18 + 20 * pressed; c.fill();
    ui.t(c, label, x + w / 2, y + h / 2 + 1, 17, { w: 800, color: '#02140D', align: 'center' }); c.restore(); },
};

/* ---------- переход: косые шторки ---------- */
function shutters(t, cuts) {
  for (const T of cuts) {
    const bands = [{ c: '#FFFFFF', w: .14, d: -.07 }, { c: C.neon, w: .32, d: -.035 }, { c: C.deep, w: 1.9, d: 0 }];
    for (const b of bands) {
      const p = inv(T - .22 + b.d, T + .22 + b.d, t); if (p <= 0 || p >= 1) continue;
      const bw = b.w * W, x = lerp(-bw - W * .6, W + W * .6, eInOut(p));
      ctx.save(); ctx.translate(x, 0); ctx.transform(1, 0, -.32, 1, 0, 0);
      ctx.shadowColor = b.c; ctx.shadowBlur = 40 * u; ctx.fillStyle = b.c; ctx.fillRect(0, -50, bw, H + 100);
      ctx.restore();
    }
  }
}

/* ---------- финальная сцена (общая) ---------- */
function finale(lt, cta) {
  rings(lt, CX, H * .40, 4, .45, 2.2, 900);
  const p = inv(.0, .6, lt);
  ctx.save(); const sc = eBack(p) * (1 + .03 * Math.sin(lt * 2));
  ctx.translate(CX, H * .40); ctx.scale(sc, sc); ctx.rotate((1 - eOut3(p)) * -.5); logoMark(0, 0, 300 * u, p); ctx.restore();
  title(['Команда'], H * .40 + 270 * u, 150 * u, .35, lt, { rgb: 26, w: 900 });
  sub('Приложение для тренеров и клубов Коми', H * .40 + 380 * u, 40 * u, .8, lt, { w: 500, color: '#E8FFF5' });
  pill(cta, H * .40 + 560 * u, 1.2, lt);
}

/* ---------- сборка ролика ---------- */
let VIDEO = null, STARTS = [], DURATION = 0;
function defineVideo(v) {
  VIDEO = v; let acc = 0; STARTS = v.shots.map(s => { const a = acc; acc += s.d; return a; });
  DURATION = acc; window.DURATION = acc; window.FPS = FPS;
}
function seek(t) {
  t = clamp(t, 0, DURATION - 1e-6);
  let si = 0; STARTS.forEach((s, i) => { if (t >= s) si = i; });
  const shot = VIDEO.shots[si], lt = t - STARTS[si];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  background(t, shot.mood ?? 1);
  if (shot.bg) shot.bg(lt, t);
  // камера: лёгкий удар + наезд
  const hit = Math.exp(-lt * 8) * (shot.hit ?? 1);
  const shx = noise(t * 36, 1) * 14 * u * hit, shy = noise(t * 40, 2) * 14 * u * hit;
  const z = 1 + .04 * eInOut(lt / shot.d) + .02 * hit;
  ctx.save(); ctx.translate(CX + shx, CY + shy); ctx.scale(z, z); ctx.translate(-CX, -CY);
  shot.draw(lt, t);
  ctx.restore();
  // вспышка на склейке
  if (lt < .1 && si > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hexA(C.neon, .16 * (1 - lt / .1)); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  vignette();
  if (!shot.final) cornerLogo(shot.logoA ?? 1);
  shutters(t, STARTS.slice(1));
}
window.seek = seek;

function startPlayer() {
  let playing = !Q.get('render'), T = 0, last = performance.now();
  addEventListener('keydown', e => {
    if (e.code === 'Space') playing = !playing;
    if (e.code === 'ArrowRight') { T += 1 / FPS; seek(T); }
    if (e.code === 'ArrowLeft') { T -= 1 / FPS; seek(T); }
  });
  Promise.all([document.fonts.load(F(50, 900)), document.fonts.load(F(50, 500)), document.fonts.load(F(50, 700))]).then(() => {
    window.READY = true;
    if (!playing) { seek(0); return; }
    (function loop(now) { if (playing) { T = (T + (now - last) / 1000) % DURATION; seek(T); } last = now; requestAnimationFrame(loop); })(performance.now());
  });
}
