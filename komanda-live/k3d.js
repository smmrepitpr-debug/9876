/* «Команда» 3D — движок: DOM + CSS 3D, один управляемый таймлайн (seek(t) детерминирован). */
const Q = new URLSearchParams(location.search);
const FPS = 30;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const eOut3 = t => 1 - Math.pow(1 - t, 3), eOut5 = t => 1 - Math.pow(1 - t, 5), eIn3 = t => t * t * t;
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eIO2 = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const eBack = t => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const spring = t => t <= 0 ? 0 : 1 - Math.exp(-6 * t) * Math.cos(9 * t);   // упругая посадка
const $ = (s, r = document) => r.querySelector(s);
function el(tag, cls, parent, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
function T(e, s) { e.style.transform = s; }
const LOGO_SVG = (s = 40, col = '#fff') => `<svg width="${s}" height="${s}" viewBox="-75 -75 150 150" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"><circle cx="-15" cy="-22" r="20"/><path d="M-50 42 Q-48 6 -15 6 Q8 6 16 20"/><path d="M12 20 L28 34 L56 2"/></svg>`;

/* ---------- события для звука ---------- */
const EVENTS = []; window.EVENTS = EVENTS;
function sfx(t, type) { EVENTS.push({ t, type }); }

/* ---------- каркас ---------- */
let V = null;  // текущий ролик
function build(video) {
  V = video; window.DURATION = video.d; window.VIDEO_NAME = video.name;
  const bg = el('div', '', document.body); bg.id = 'bg';
  const floor = el('div', '', bg); floor.id = 'floor';
  const stage = el('div', '', document.body); stage.id = 'stage';
  const world = el('div', '', stage); world.id = 'world';
  // фоновые объёмные формы
  const forms = [
    ['sphere', 140, '--col:#BFF5DD', 120, 420, -900], ['pill', [90, 240], '--col:#CFC3FF', 900, 360, -1100],
    ['torus', 170, '--col:#FFE7A3;--th:34px', 860, 1420, -700], ['sphere', 90, '--col:#FFC9A8', 160, 1500, -500],
    ['sphere', 60, '--col:#BDE3FF', 980, 980, -300], ['pill', [70, 170], '--col:#3DDC97', 70, 900, -1300],
    ['torus', 110, '--col:#BFF5DD;--th:22px', 300, 220, -1500], ['sphere', 210, '--col:#3DDC97', 760, 120, -1800],
  ];
  V.forms = forms.map(([k, s, st, x, y, z], i) => {
    const e = el('div', 'p3 ' + k, world); e.style.cssText += st;
    const [w, h] = Array.isArray(s) ? s : [s, s]; e.style.width = w + 'px'; e.style.height = h + 'px';
    return { e, x, y, z, w, h, i };
  });
  // сцены
  V.scenes.forEach(s => { s.root = el('div', 'scene', world); s.setup(s.root); s.root.style.visibility = 'hidden'; });
  // HUD
  const hud = el('div', '', document.body); hud.id = 'hud';
  V.head = el('div', '', hud); V.head.id = 'head';
  V.sub = el('div', '', hud); V.sub.id = 'sub';
  const corner = el('div', '', hud, `<div class="logo" style="width:58px;height:58px;border-radius:15px">${LOGO_SVG(40)}</div>Команда`); corner.id = 'corner';
  V.corner = corner;
  V.cursorEl = el('div', '', hud, `<svg viewBox="0 0 40 40" width="84" height="84"><path d="M6 3 L6 33 L14 25.5 L19.5 37 L25 34.5 L19.5 23 L30 23 Z" fill="#fff" stroke="#02140D" stroke-width="2.4" stroke-linejoin="round"/></svg>`);
  V.cursorEl.id = 'cursor';
  V.ripple = el('div', 'ripple', hud);
  V.world = world; V.floor = floor;
  // заголовки
  V.heads = (V.headlines || []).map(h => ({ ...h, node: buildHead(h.lines) }));
  // события звука: склейки и клики
  V.scenes.forEach((s, i) => { if (i) sfx(s.a, 'whoosh'); });
  (V.cursor || []).forEach(k => { if (k.click) sfx(k.t, 'click'); });
  (V.sfx || []).forEach(([t, ty]) => sfx(t, ty));
  window.READY_BUILD = true;
}

/* ---------- кинетический заголовок ---------- */
// lines: [[ ['Слово', size, weight, key?], ... ], ...]
function buildHead(lines) {
  const box = el('div', '', V.head); box.style.position = 'absolute'; box.style.left = '0'; box.style.right = '0'; box.style.top = '0';
  box._words = [];
  lines.forEach(line => {
    const l = el('div', 'hl', box);
    line.forEach(([txt, size, wt, key], j) => {
      const m = el('span', 'mask', l); m.style.fontSize = size + 'px'; m.style.fontWeight = wt || 900;
      const w = el('span', 'w' + (key ? ' key' : ''), m, txt);
      if (j < line.length - 1) l.appendChild(document.createTextNode(' '));
      box._words.push(w);
    });
  });
  return box;
}
function fitHeads() {
  for (const h of V.heads) { h.node.style.display = 'block';
    h.node.querySelectorAll('.hl').forEach(l => { const w = l.scrollWidth; if (w > 960) { l.style.transform = `scale(${960 / w})`; l.style.transformOrigin = '50% 50%'; } });
    h.node.style.display = 'none'; }
}
function updateHeads(t) {
  for (const h of V.heads) {
    const vis = t >= h.a - .05 && t < h.b + .4;
    h.node.style.display = vis ? 'block' : 'none'; if (!vis) continue;
    const out = inv(h.b, h.b + .35, t);
    h.node._words.forEach((w, i) => {
      const p = inv(h.a + i * .085, h.a + i * .085 + .5, t);
      const y = (1 - eOut5(p)) * 115 - out * 120;
      const sc = lerp(1.25, 1, eOut3(p)), rot = (1 - eOut3(p)) * (i % 2 ? 6 : -6);
      T(w, `translateY(${y}%) scale(${sc}) rotate(${rot}deg)`);
      w.style.opacity = 1 - out;
    });
    // дыхание заголовка: лёгкий дрейф и смена ракурса
    const lt = t - h.a;
    T(h.node, `translateY(${(h.y || 0) + Math.sin(lt * 1.3) * 6}px) perspective(900px) rotateX(${Math.sin(lt * .9) * 4}deg) rotateY(${Math.sin(lt * .7) * 5}deg)`);
  }
}

/* ---------- субтитры ---------- */
function updateSubs(t) {
  const s = (V.subs || []).find(([a, b]) => t >= a && t < b);
  if (!s) { V.sub.innerHTML = ''; return; }
  if (V.sub._cur !== s) { V.sub.innerHTML = `<span>${s[2]}</span>`; V.sub._cur = s; }
  const p = eOut3(inv(s[0], s[0] + .18, t)), o = 1 - inv(s[1] - .12, s[1], t);
  V.sub.style.opacity = Math.min(p, o); T(V.sub, `translateY(${(1 - p) * 24}px)`);
}

/* ---------- курсор (экранный overlay; цель = реальная проекция элемента) ---------- */
function targetPos(k) {
  if (k.xy) return k.xy;
  const e = typeof k.sel === 'string' ? $(k.sel) : k.sel; if (!e) return [540, 1200];
  const r = e.getBoundingClientRect(); return [r.left + r.width * (k.fx ?? .5), r.top + r.height * (k.fy ?? .5)];
}
function updateCursor(t) {
  const K = V.cursor || []; let vis = false;
  let i = -1; for (let j = 0; j < K.length; j++) if (t >= K[j].t - (K[j].move || .8)) i = j;
  if (i < 0) { V.cursorEl.style.opacity = 0; V.ripple.style.opacity = 0; return; }
  const k1 = K[i], k0 = K[i - 1];
  const mv = k1.move || .8, p = eIO2(inv(k1.t - mv, k1.t - .12, t));
  let [x1, y1] = targetPos(k1), [x0, y0] = k0 && !k1.enter ? targetPos(k0) : [x1 + 260, y1 + 420];
  // небольшая дуга
  const arc = Math.sin(p * Math.PI) * 60;
  let x = lerp(x0, x1, p) + arc * .5, y = lerp(y0, y1, p) - arc;
  vis = !(k1.hide && t > k1.t + .3) && !(t > k1.t + .9 && !k1.stay);
  let sq = 1;
  if (k1.click) { const c = t - k1.t; sq = c >= 0 && c < .25 ? 1 - .18 * Math.sin(c / .25 * Math.PI) : 1;
    const rp = inv(k1.t, k1.t + .55, t); V.ripple.style.opacity = rp > 0 && rp < 1 ? 1 - rp : 0;
    const R = 30 + rp * 90; V.ripple.style.width = V.ripple.style.height = R * 2 + 'px'; T(V.ripple, `translate(${x1 - R}px, ${y1 - R}px)`); }
  else V.ripple.style.opacity = 0;
  const fadeIn = k1.enter ? inv(k1.t - mv, k1.t - mv + .25, t) : 1;
  V.cursorEl.style.opacity = vis ? fadeIn * (1 - inv(k1.t + .6, k1.t + .9, t)) : 0;
  // hotspot — кончик стрелки (6,3 из 40 → ~12,6 px при 84px)
  T(V.cursorEl, `translate(${x - 12}px, ${y - 6}px) scale(${sq})`);
}

/* ---------- камера и сцены ---------- */
function updateWorld(t) {
  const c = V.camera ? V.camera(t) : {};
  const rx = (c.rx ?? 0) + Math.sin(t * .45) * 2.5, ry = (c.ry ?? 0) + Math.sin(t * .31) * 4, z = c.z ?? 0, x = c.x ?? 0, y = c.y ?? 0;
  T(V.world, `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`);
  T(V.floor, `perspective(1700px) rotateX(78deg) translateY(${(t * 60) % 120}px)`);
  // формы фона: парение + глубина резкости по z
  V.forms.forEach(f => {
    const fy = Math.sin(t * .6 + f.i) * 26, fr = t * (8 + f.i * 3);
    T(f.e, `translate3d(${f.x - f.w / 2}px, ${f.y - f.h / 2 + fy}px, ${f.z}px) rotateZ(${fr}deg) rotateX(${Math.sin(t * .5 + f.i) * 20}deg)`);
    f.e.style.filter = `blur(${clamp(-f.z / 260 - .6, 0, 7)}px)`;
  });
  V.scenes.forEach(s => {
    const a = s.a, b = s.b, vis = t >= a - .45 && t < b + .45;
    s.root.style.visibility = vis ? 'visible' : 'hidden'; if (!vis) return;
    const en = eOut3(inv(a - .45, a + .35, t)), ex = eIn3(inv(b - .1, b + .45, t));
    const tz = -900 * (1 - en) + 700 * ex, rot = (1 - en) * -24 + ex * 28;
    T(s.root, `translate3d(${(1 - en) * 260 - ex * 320}px, ${(1 - en) * 120}px, ${tz}px) rotateY(${rot}deg)`);
    s.root.style.opacity = Math.min(en, 1 - ex);
    s.root.style.filter = (en < 1 || ex > 0) ? `blur(${(1 - en) * 10 + ex * 12}px)` : 'none';
    s.update && s.update(t - a, t);
  });
}
function seek(t) {
  t = clamp(t, 0, V.d - 1e-4);
  updateWorld(t); updateHeads(t); updateSubs(t); updateCursor(t);
  V.corner.style.opacity = V.final && t > V.final ? 1 - inv(V.final, V.final + .3, t) : 1;
}
window.seek = seek;

/* ---------- общие UI-блоки ---------- */
function phone(parent, x, y, z = 0) {
  const p = el('div', 'p3 c', parent); p.style.width = '540px'; p.style.height = '1080px';
  for (let i = 1; i <= 7; i++) { const e = el('div', 'edge', p); T(e, `translateZ(${-i * 3}px)`); e.style.width = '540px'; e.style.height = '1080px'; }
  const ph = el('div', 'phone', p); ph.style.position = 'relative';
  const sc = el('div', 'screen', ph); el('div', 'island', ph);
  el('div', 'sbar', sc, '<span>9:41</span>');
  p._xyz = [x, y, z]; p.screen = sc;
  return p;
}
function place(e, x, y, z = 0, extra = '') { T(e, `translate3d(${x}px, ${y}px, ${z}px) translate(-50%, -50%) ${extra}`); }
function appHead(sc, title, sub) { return el('div', 'apphead', sc, `<div class="logo">${LOGO_SVG(40)}</div><div><div class="t">${title}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`); }
function contactShadow(parent, w) { const s = el('div', 'shadow', parent); s.style.width = w + 'px'; s.style.height = w * .22 + 'px'; return s; }

/* ---------- финал (общий) ---------- */
function finaleScene(btnText, sub) {
  return { setup(r) {
      const tile = el('div', 'p3 c', r);
      for (let i = 1; i <= 9; i++) { const e = el('div', '', tile); e.style.cssText = `position:absolute;width:300px;height:300px;border-radius:74px;background:#0A4A2E;transform:translateZ(${-i * 4}px)`; }
      el('div', 'logo', tile, LOGO_SVG(200)).style.cssText = 'position:relative;width:300px;height:300px;border-radius:74px;box-shadow:0 40px 90px rgba(0,0,0,.5), inset 0 3px 3px rgba(255,255,255,.3)';
      r._tile = tile;
      r._word = el('div', 'p3 c', r, '<div style="font-weight:900;font-size:150px;color:#fff;text-shadow:0 0 50px rgba(61,220,151,.5)">Команда</div>');
      r._btn = el('div', 'p3 c', r, `<div class="btn finalbtn" style="font-size:44px;padding:34px 56px">${btnText} <span style="font-size:48px">→</span></div>`);
      r._sub = el('div', 'p3 c', r, `<div style="font-weight:600;font-size:40px;color:#CFEFE2;text-align:center;width:900px">${sub || ''}</div>`);
      r._sh = contactShadow(r, 380);
    }, update(lt) {
      const r = this.root, p = eOut3(inv(0, .9, lt));
      place(r._tile, 540, 640 - (1 - p) * 200 + Math.sin(lt * 1.6) * 10, 0, `rotateY(${(1 - p) * 200 + Math.sin(lt * 1.1) * 14}deg) rotateX(${8 + Math.sin(lt) * 5}deg) scale(${lerp(.6, 1, eBack(p))})`);
      place(r._sh, 540, 860, -40, 'rotateX(80deg)'); r._sh.style.opacity = p * .8;
      const pw = eOut3(inv(.4, 1.0, lt)); place(r._word, 540, 1000 + (1 - pw) * 80, 0, `scale(${lerp(.8, 1, pw)})`); r._word.style.opacity = pw;
      const ps = inv(.7, 1.1, lt); place(r._sub, 540, 1110, 0); r._sub.style.opacity = ps;
      const pb = eBack(inv(.9, 1.4, lt)), pressed = this.press != null ? (lt > this.press && lt < this.press + .25 ? .94 : 1) : 1;
      const pulse = 1 + .03 * Math.sin(lt * 6) * inv(1.4, 1.7, lt);
      place(r._btn, 540, 1290, 0, `scale(${pb * pulse * pressed})`);
    } };
}
