/* «Команда» — ролик «Клиент записался — тренеру летит заявка» (живые кадры Mixkit + 3D UI).
   Стоковые клипы: Mixkit, Free License (коммерческое использование, без атрибуции). */
const LIVE = document.createElement('div'); LIVE.id = 'live';
LIVE.innerHTML = `<img class="full"><div class="strips"><img><img><img><img></div>
  <div class="bar"><div class="b1">Куда записаться,</div><div class="b2">о чём даже не подумаешь</div></div><div class="shade"></div>`;
const css = document.createElement('style'); css.textContent = `
#live{position:absolute;inset:0;overflow:hidden;display:none}
#live .full{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#live .strips{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;background:#02140D;padding:10px}
#live .strips img{width:100%;height:100%;object-fit:cover;border-radius:22px}
#live .bar{position:absolute;left:30px;right:30px;bottom:150px;padding:34px 30px;background:#02140D;border-radius:26px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6)}
#live .b1{font-weight:900;font-size:96px;line-height:1;color:#3DDC97;text-transform:uppercase}
#live .b2{font-weight:900;font-size:62px;line-height:1.1;color:#fff;text-transform:uppercase;margin-top:10px}
#live .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,20,13,.55) 0%,rgba(2,20,13,0) 30%,rgba(2,20,13,0) 62%,rgba(2,20,13,.75) 100%)}
.coin{width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#FFE7A3 40%,#E0B640);display:grid;place-items:center;font-weight:900;font-size:80px;color:#6B4E00;box-shadow:0 20px 40px rgba(0,0,0,.45)}`;
document.head.appendChild(css);

const F = (id, n) => `frames/${id}/${String(n).padStart(4, '0')}.jpg`;
const thumb = (id, n = 30) => F(id, n);
// сегменты живого слоя
const LIVESEG = [
  { a: 0, b: 3.1, kind: 'strips', ids: ['7130-half', '873-half', '303-full', '40276-half'], n: [180, 180, 90, 180] },
  { a: 3.1, b: 5.4, kind: 'full', id: '24610-full', n: 90, rate: .9 },
  { a: 12.6, b: 17.2, kind: 'full', id: '1805-full', n: 150, rate: 1 },
  { a: 17.2, b: 18.7, kind: 'full', id: '303-full', n: 90, rate: .75 },
  { a: 18.7, b: 19.4, kind: 'full', id: '4637-full', n: 60, rate: 1 },
  { a: 19.4, b: 19.8, kind: 'full', id: '7130-full', n: 60, rate: 1 },
  { a: 19.8, b: 20.2, kind: 'full', id: '873-full', n: 60, rate: 1 },
  { a: 20.2, b: 20.6, kind: 'full', id: '40276-full', n: 60, rate: 1 },
  { a: 20.6, b: 21.0, kind: 'full', id: '4420-full', n: 60, rate: 1 },
];
const pending = [];
function setImg(img, src) { if (img.getAttribute('src') !== src) { img.src = src; pending.push(img.decode().catch(() => {})); } }
function updateLive(t) {
  const s = LIVESEG.find(x => t >= x.a && t < x.b);
  LIVE.style.display = s ? 'block' : 'none';
  V.forms.forEach(f => f.e.style.opacity = s ? 0 : 1); V.floor.style.opacity = s ? 0 : 1;
  if (!s) return;
  const lt = t - s.a, full = LIVE.querySelector('.full'), strips = LIVE.querySelector('.strips'), bar = LIVE.querySelector('.bar');
  full.style.display = s.kind === 'full' ? 'block' : 'none'; strips.style.display = s.kind === 'strips' ? 'grid' : 'none';
  bar.style.display = s.kind === 'strips' ? 'block' : 'none';
  if (s.kind === 'full') {
    setImg(full, F(s.id, clamp(Math.floor(lt * 30 * s.rate) + 1, 1, s.n)));
    const z = 1.04 + lt * .03; full.style.transform = `scale(${z})`;
  } else {
    [...strips.children].forEach((im, i) => {
      setImg(im, F(s.ids[i], clamp(Math.floor(lt * 30) + 1 + i * 15, 1, s.n[i])));
      const p = eOut5(inv(.05 + i * .18, .6 + i * .18, lt));
      im.style.transform = `translate(${(1 - p) * (i % 2 ? 1 : -1) * 600}px, ${(1 - p) * (i < 2 ? -1 : 1) * 300}px) scale(${1 + .06 * inv(0, 3, lt)})`;
      im.style.opacity = s.b - t < .3 ? clamp((s.b - t) / .3) : 1;
    });
    const pb = eBack(inv(.8, 1.3, lt)); bar.style.transform = `scale(${pb})`; bar.style.opacity = clamp(pb) * clamp((s.b - t) / .3);
    bar.querySelectorAll('div').forEach((d, i) => { const q = eOut3(inv(.9 + i * .25, 1.3 + i * .25, lt)); d.style.transform = `translateY(${(1 - q) * 40}px)`; d.style.opacity = q; });
  }
}

/* ---------- UI-сцены ---------- */
const CATS = [['Теннис', '873-half'], ['Сноуборд', '7130-half'], ['Бачата', '303-full'], ['Армрестлинг', null], ['Йога', '4420-half'], ['Бокс', '40276-half']];
function catGrid(sc) {
  const g = el('div', '', sc); g.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:6px 24px';
  return CATS.map(([n, id], i) => el('div', 'cat', g, `<div style="height:200px;border-radius:24px;overflow:hidden;position:relative;background:${id ? '#000' : 'linear-gradient(150deg,#FFC9A8,#E9805A)'};box-shadow:0 8px 20px rgba(0,0,0,.15)">
    ${id ? `<img src="${thumb(id)}" style="width:100%;height:100%;object-fit:cover">` : '<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:90px">💪</div>'}
    <div style="position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:linear-gradient(transparent,rgba(0,0,0,.7));color:#fff;font-weight:900;font-size:28px">${n}</div></div>`));
}
const VL = { name: 'klient-zapisalsya', d: 24, final: 21,
  headlines: [
    { a: 3.3, b: 5.3, lines: [[['20:00.', 120, 900, 1]], [['Хочется', 84, 700], ['чего-то', 84, 700], ['нового', 84, 700]]] },
    { a: 5.6, b: 7.9, lines: [[['Всё', 130], ['в', 130]], [['одном', 130], ['месте', 130, 900, 1]]] },
    { a: 8.1, b: 10.3, lines: [[['Бачата.', 120, 900, 1]], [['Тренер', 84, 700], ['рядом', 84, 700]]] },
    { a: 10.5, b: 12.5, lines: [[['Заявка', 100], ['отправлена', 100]], [['за', 90, 700], ['секунду', 110, 900, 1]]] },
    { a: 13.0, b: 17.0, lines: [[['У', 110], ['тренера', 110]], [['сразу', 140, 900, 1]]] },
    { a: 17.3, b: 20.9, lines: [[['Найди', 140], ['своё', 140, 900, 1]]] },
    { a: 21.2, b: 23.9, lines: [[['Найди', 110], ['своего', 110]], [['тренера', 130, 900, 1]]] },
  ],
  camera: t => ({ rx: 4, ry: Math.sin(t * .3) * 8 }),
  cursor: [
    { t: 8.0, sel: '#cat2', enter: true, move: .8 },
    { t: 8.3, sel: '#cat2', click: true, move: .2 },
    { t: 10.4, sel: '#bookbtn', click: true, move: .9 },
    { t: 15.0, sel: '#okbtn', click: true, move: .9, enter: true },
    { t: 22.6, sel: '.finalbtn', click: true, move: 1.0, fx: .4, enter: true },
    { t: 22.9, sel: '.finalbtn', hide: true, move: .1, fx: .4 },
  ],
  sfx: [[.3, 'whoosh'], [.5, 'pop'], [.7, 'pop'], [.9, 'pop'], [11.0, 'chime'], [13.6, 'pop'], [14.2, 'chime']],
  scenes: [
    { a: 5.4, b: 12.6, setup(r) {
        const ph = phone(r); r._ph = ph; const sc = ph.screen;
        r._s1 = el('div', '', sc); appHead(r._s1, 'Команда', 'каталог тренеров и секций');
        r._cats = catGrid(r._s1); r._cats.forEach((c, i) => c.id = 'cat' + i);
        // экран тренеров бачаты
        r._s2 = el('div', '', sc); r._s2.style.cssText = 'position:absolute;inset:84px 0 0 0;background:#F2F7F4';
        appHead(r._s2, 'Бачата', 'тренеры рядом');
        r._s2.innerHTML += `<div class="item" style="padding:0;overflow:hidden;margin-top:6px"><img src="${thumb('303-full', 50)}" style="width:100%;height:340px;object-fit:cover;object-position:40% 30%">
          <div style="padding:22px 26px"><div class="row" style="justify-content:space-between"><div><div style="font-weight:900;font-size:40px">Алёна</div><div style="font-weight:500;font-size:22px;color:#6B8579">бачата · пары и соло</div></div>
          <div style="text-align:right"><div style="font-weight:900;font-size:36px;color:#0B5D3A">1 500 ₽</div><div style="font-weight:500;font-size:20px;color:#6B8579">за занятие</div></div></div>
          <div class="row" style="margin-top:14px;gap:10px"><span class="chip on">★ 4.9</span><span class="chip">сб 19:00</span><span class="chip">вс 18:00</span></div>
          <div class="btn" id="bookbtn" style="margin-top:22px;width:100%;height:84px;font-size:34px">Записаться</div></div></div>
          <div class="item row"><div class="ava" style="width:70px;height:70px;--col:#CFC3FF"></div><div><div class="h">Ещё 3 тренера</div><div class="m">бачата · рядом с вами</div></div></div>`;
        r._done = el('div', '', sc); r._done.style.cssText = 'position:absolute;inset:0;background:rgba(2,20,13,.88);display:grid;place-items:center;text-align:center;color:#fff';
        r._done.innerHTML = `<div><div class="ck" style="width:200px;height:200px;margin:0 auto;border-radius:50%;background:#3DDC97;display:grid;place-items:center;box-shadow:0 0 80px rgba(61,220,151,.7)"><svg width="110" height="110" viewBox="0 0 30 30"><path d="M5 16 L12 23 L25 8" stroke="#02140D" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div style="font-weight:900;font-size:46px;margin-top:40px">Вы записаны!</div><div style="font-weight:600;font-size:28px;color:#9FF5CF;margin-top:10px">Бачата · Алёна · сб 19:00</div></div>`;
        r._sh = contactShadow(r, 520);
      }, update(lt) {
        const r = this.root, p = eOut3(inv(0, .9, lt));
        place(r._ph, 540, 1180 + (1 - p) * 600, 0, `rotateY(${(1 - p) * -30 - 10 + lt * 2.6}deg) rotateX(${(1 - p) * 20 + 5}deg) scale(.8)`);
        place(r._sh, 540, 1630, -120, 'rotateX(80deg)');
        r._cats.forEach((c, i) => { const s = eBack(inv(.5 + i * .12, .9 + i * .12, lt)); T(c, `scale(${s}) translateY(${-eIO(inv(1.2, 2.4, lt)) * 40}px)`); c.style.opacity = clamp(s);
          c.firstElementChild.style.boxShadow = i === 2 && lt > 2.3 && lt < 3.0 ? '0 0 0 6px #3DDC97' : '0 8px 20px rgba(0,0,0,.15)'; });
        const s2 = eOut5(inv(2.95, 3.4, lt)); T(r._s2, `translateX(${(1 - s2) * 560}px)`);
        const b = $('#bookbtn'); const pr = lt > 5.0 && lt < 5.2; T(b, `scale(${pr ? .95 : 1})`);
        const d = inv(5.2, 5.5, lt); r._done.style.opacity = d; r._done.querySelector('.ck').style.transform = `scale(${eBack(inv(5.3, 5.8, lt))})`;
      } },
    { a: 12.6, b: 17.2, setup(r) {
        r._n = el('div', 'p3 c card', r, `<div style="width:820px;padding:30px 34px"><div class="row" style="gap:18px"><div class="logo" style="width:84px;height:84px;border-radius:22px">${LOGO_SVG(56)}</div>
          <div style="flex:1"><div style="font-weight:600;font-size:24px;color:#6B8579">Команда · сейчас</div><div style="font-weight:900;font-size:42px">Новая заявка</div></div></div>
          <div style="margin-top:18px;font-weight:600;font-size:30px">Бачата · сб 19:00 · 1 клиент</div>
          <div class="row" style="margin-top:22px;justify-content:space-between"><div style="font-weight:900;font-size:56px;color:#0B5D3A">+1 500 ₽</div><div class="btn" id="okbtn" style="padding:22px 38px;font-size:32px">Подтвердить</div></div>
          <div class="okd" style="margin-top:16px;font-weight:800;font-size:28px;color:#0B5D3A;opacity:0">✓ Занятие подтверждено</div></div>`);
        r._coins = [0, 1, 2].map(() => el('div', 'p3 c', r, '<div class="coin">₽</div>'));
        r._money = el('div', 'p3 c', r, '<div style="font-weight:900;font-size:130px;color:#FFE7A3;text-shadow:0 0 40px rgba(255,231,163,.7),0 10px 30px rgba(0,0,0,.6)">+1 500 ₽</div>');
      }, update(lt) {
        const r = this.root, d = spring(inv(.9, 1.6, lt) * 1.1);
        place(r._n, 540, lerp(-300, 1340, clamp(d)) , 120, `rotateX(${(1 - clamp(d)) * 30}deg) scale(.96)`); r._n.style.opacity = clamp(d * 3);
        r._coins.forEach((c, i) => { const q = eIO(inv(.3 + i * .15, 1.3 + i * .15, lt));
          place(c, lerp(140 + i * 380, 760, q), lerp(-200, 1420, q) - Math.sin(q * Math.PI) * 300, 300, `rotateY(${q * 720}deg) scale(${1 - q * .5})`); c.style.opacity = q < .95 ? 1 : 0; });
        const m = eBack(inv(1.6, 2.0, lt)); place(r._money, 540, 1000 - inv(1.6, 3.5, lt) * 80, 260, `scale(${m})`); r._money.style.opacity = clamp(m) * (1 - inv(3.2, 3.6, lt));
        const ok = lt >= 2.4; r._n.querySelector('.okd').style.opacity = ok ? inv(2.4, 2.7, lt) : 0; T($('#okbtn'), `scale(${lt > 2.4 && lt < 2.6 ? .94 : 1})`);
      } },
    Object.assign({ a: 21.0, b: 24.5, press: 1.6 }, finaleScene('Найди своего тренера', 'Тренеры и секции рядом с тобой')),
  ] };
build(VL);
document.body.insertBefore(LIVE, document.getElementById('stage'));
const seekCore = window.seek;
window.seek = async t => { pending.length = 0; updateLive(t); seekCore(t); await Promise.all(pending); };
Promise.all([document.fonts.load('900 50px Rubik'), document.fonts.load('500 50px Rubik')]).then(async () => {
  fitHeads(); await window.seek(0); window.READY = true;
  if (!Q.get('render')) { const t0 = performance.now(); (async function loop() { await window.seek(((performance.now() - t0) / 1000) % V.d); requestAnimationFrame(loop); })(); }
});
