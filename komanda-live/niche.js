/* «Команда» — 4 ролика под ниши (живые кадры Mixkit Free License + 3D UI). ?n=snow|tennis|dance|arm */
const LIVE = document.createElement('div'); LIVE.id = 'live'; LIVE.innerHTML = '<img class="full"><div class="shade"></div>';
const css = document.createElement('style'); css.textContent = `#live{position:absolute;inset:0;overflow:hidden;display:none}
#live .full{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#live .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,20,13,.6) 0%,rgba(2,20,13,0) 32%,rgba(2,20,13,0) 62%,rgba(2,20,13,.7) 100%)}
.coin{width:140px;height:140px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#FFE7A3 40%,#E0B640);display:grid;place-items:center;font-weight:900;font-size:76px;color:#6B4E00;box-shadow:0 20px 40px rgba(0,0,0,.45)}`;
document.head.appendChild(css);
const FR = (id, n) => `frames/${id}-n/${String(n).padStart(4, '0')}.jpg`;

const N = {
  snow: { name: 'snowboard-hochu-tak-zhe', cat: 1, sport: 'Сноуборд', who: 'Инструктор Максим', spec: 'сноуборд · с нуля и трюки', when: 'сб 11:00', photo: '39499', price: null,
    hero: [['7130', 2.2, .7], ['3373', 1.8, 1]], viewer: '21262', trainer: '39499',
    h: [[[['Вот', 110], ['это', 110]], [['полёт', 150, 900, 1]]], [[['Хочу', 130], ['так', 130]], [['же', 170, 900, 1]]], [[['Инструктор', 110, 900, 1]], [['уже', 84, 700], ['рядом', 84, 700]]],
      [[['Заявка', 100], ['ушла', 100]], [['за', 90, 700], ['секунду', 110, 900, 1]]], [[['Тренер', 110], ['видит', 110]], [['сразу', 140, 900, 1]]], [[['Начни', 120], ['этой', 120]], [['зимой', 150, 900, 1]]]],
    cta: 'Найди инструктора' },
  tennis: { name: 'tennis-davno-hotel', cat: 0, sport: 'Теннис', who: 'Тренер Дмитрий', spec: 'теннис · взрослые и дети', when: 'вс 10:00', photo: '45496', price: null,
    hero: [['873', 2.0, .6], ['880', 2.0, 1]], viewer: '24608', trainer: '45496',
    h: [[[['Идеальная', 110]], [['подача', 150, 900, 1]]], [[['Давно', 130], ['хотел?', 150, 900, 1]]], [[['Корт', 110], ['и', 110]], [['тренер', 150, 900, 1]]],
      [[['Записался', 110]], [['за', 90, 700], ['минуту', 120, 900, 1]]], [[['Тренер', 110], ['видит', 110]], [['сразу', 140, 900, 1]]], [[['Твоя', 130]], [['очередь', 150, 900, 1]]]],
    cta: 'Найди тренера' },
  dance: { name: 'bachata-tancuesh-doma', cat: 2, sport: 'Бачата', who: 'Алёна', spec: 'бачата · пары и соло', when: 'сб 19:00', photo: '303', price: '1 500 ₽',
    hero: [['47500', 2.0, .8], ['303', 2.0, .8]], viewer: '24606', trainer: '303',
    h: [[[['Танцуешь', 120]], [['дома?', 150, 900, 1]]], [[['Пора', 130], ['в', 130]], [['зал', 170, 900, 1]]], [[['Бачата.', 120, 900, 1]], [['Тренер', 84, 700], ['рядом', 84, 700]]],
      [[['Вы', 110], ['записаны', 110, 900, 1]]], [[['+1 500 ₽', 140, 900, 1]], [['тренеру', 100], ['сразу', 100]]], [[['Твой', 120], ['первый', 120]], [['танец', 150, 900, 1]]]],
    cta: 'Найди своего тренера' },
  arm: { name: 'armwrestling-kto-silnee', cat: 3, sport: 'Армрестлинг', who: 'Тренер Сергей', spec: 'армрестлинг · техника и сила', when: 'чт 19:00', photo: '52097', price: null,
    hero: [['52091', 2.0, .8], ['44414', 2.0, .9]], viewer: '24608', trainer: '52097',
    h: [[[['Кто', 140], ['сильнее?', 140, 900, 1]]], [[['Проверим', 130, 900, 1]], [['на', 90, 700], ['столе', 90, 700]]], [[['Армрестлинг', 110, 900, 1]], [['секция', 84, 700], ['открылась', 84, 700]]],
      [[['Техника,', 110, 900, 1]], [['а', 84, 700], ['не', 84, 700], ['только', 84, 700], ['сила', 84, 700]]], [[['Тренер', 110], ['видит', 110]], [['сразу', 140, 900, 1]]], [[['Стань', 130]], [['сильнее', 150, 900, 1]]]],
    cta: 'Записаться' },
  swim: { name: 'plavanie-leto-kruglyi-god', cat: 4, sport: 'Плавание', who: 'Тренер Ольга', spec: 'плавание · взрослые и дети', when: 'ср 20:00', photo: '33192', price: null,
    hero: [['33192', 2.0, .7], ['43088', 2.0, .8]], viewer: '24610', trainer: '33192',
    h: [[[['Вода', 130], ['—', 130]], [['свобода', 150, 900, 1]]], [[['Хочешь', 120], ['плавать', 120]], [['красиво?', 140, 900, 1]]], [[['Бассейн', 110], ['и', 110]], [['тренер', 150, 900, 1]]],
      [[['Записался', 110]], [['за', 90, 700], ['минуту', 120, 900, 1]]], [[['Тренер', 110], ['видит', 110]], [['сразу', 140, 900, 1]]], [[['Поплыли', 150, 900, 1]]]],
    cta: 'Найди тренера' },
  box: { name: 'boks-nachni-segodnya', cat: 5, sport: 'Бокс', who: 'Тренер Артём', spec: 'бокс · с нуля и спарринги', when: 'вт 19:30', photo: '40276', price: null,
    hero: [['40276', 2.0, .8], ['23929', 2.0, 1]], viewer: '21262', trainer: '4596',
    h: [[[['Удар.', 150, 900, 1]], [['Ещё', 110], ['удар', 110]]], [[['Хочу', 130], ['так', 130]], [['же', 170, 900, 1]]], [[['Бокс.', 120, 900, 1]], [['Тренер', 84, 700], ['рядом', 84, 700]]],
      [[['Заявка', 100], ['ушла', 100]], [['за', 90, 700], ['секунду', 110, 900, 1]]], [[['Тренер', 110], ['видит', 110]], [['сразу', 140, 900, 1]]], [[['Начни', 130]], [['сегодня', 150, 900, 1]]]],
    cta: 'Найди тренера' },
}[Q.get('n') || 'snow'];

// таймлайн 18 с: 0–4 герой-кадры, 4–6 зритель с телефоном, 6–12 приложение, 12–15 сторона тренера, 15–18 финал
const SEG = []; let acc = 0;
N.hero.forEach(([id, d, rate]) => { SEG.push({ a: acc, b: acc + d, id, rate }); acc += d; });
SEG.push({ a: 4, b: 6, id: N.viewer, rate: 1 }, { a: 12, b: 15, id: N.trainer, rate: 1 });
const pending = [];
function setImg(img, src) { if (img.getAttribute('src') !== src) { img.src = src; pending.push(img.decode().catch(() => {})); } }
function updateLive(t) {
  const s = SEG.find(x => t >= x.a && t < x.b); LIVE.style.display = s ? 'block' : 'none';
  V.forms.forEach(f => f.e.style.opacity = s ? 0 : 1); V.floor.style.opacity = s ? 0 : 1; if (!s) return;
  const lt = t - s.a, im = LIVE.querySelector('.full');
  setImg(im, FR(s.id, clamp(Math.floor(lt * 30 * s.rate) + 1, 1, 90)));
  im.style.transform = `scale(${1.05 + lt * .035})`;
}
const CATS = [['Теннис', '873'], ['Сноуборд', '7130'], ['Бачата', '303'], ['Армрестлинг', '52097'], ['Плавание', '33192'], ['Бокс', '40276']];
const V5 = { name: N.name, d: 18, final: 15,
  headlines: N.h.map((lines, i) => ({ a: [.15, 4.15, 6.4, 9.6, 12.2, 15.2][i], b: [3.9, 5.9, 9.4, 11.9, 14.9, 17.9][i], lines })),
  camera: t => ({ rx: 4, ry: Math.sin(t * .3) * 8 }),
  cursor: [{ t: 8.4, sel: '#cat' + N.cat, enter: true, move: .8 }, { t: 8.7, sel: '#cat' + N.cat, click: true, move: .2 },
    { t: 10.3, sel: '#bookbtn', click: true, move: .9 }, { t: 13.9, sel: '#okbtn', click: true, move: .8, enter: true },
    { t: 16.8, sel: '.finalbtn', click: true, move: 1.0, fx: .4, enter: true }, { t: 17.1, sel: '.finalbtn', hide: true, move: .1, fx: .4 }],
  sfx: [[.2, 'whoosh'], [10.9, 'chime'], [12.9, 'pop'], [13.2, 'chime']],
  scenes: [
    { a: 6.0, b: 12.0, setup(r) {
        const ph = phone(r); r._ph = ph; const sc = ph.screen;
        r._s1 = el('div', '', sc); appHead(r._s1, 'Команда', 'тренеры и секции рядом');
        const g = el('div', '', r._s1); g.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:6px 24px';
        r._cats = CATS.map(([n, id], i) => { const c = el('div', '', g, `<div style="height:200px;border-radius:24px;overflow:hidden;position:relative;background:linear-gradient(150deg,${['#CFC3FF', '#FFC9A8'][i % 2]},#0B5D3A)">
          ${id ? `<img src="${FR(id, 40)}" style="width:100%;height:100%;object-fit:cover">` : ''}<div style="position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:linear-gradient(transparent,rgba(0,0,0,.7));color:#fff;font-weight:900;font-size:28px">${n}</div></div>`); c.id = 'cat' + i; return c; });
        r._s2 = el('div', '', sc); r._s2.style.cssText = 'position:absolute;inset:84px 0 0 0;background:#F2F7F4';
        appHead(r._s2, N.sport, 'тренеры рядом');
        r._s2.innerHTML += `<div class="item" style="padding:0;overflow:hidden;margin-top:6px"><img src="${FR(N.photo, 60)}" style="width:100%;height:360px;object-fit:cover;object-position:50% 25%">
          <div style="padding:22px 26px"><div class="row" style="justify-content:space-between"><div><div style="font-weight:900;font-size:40px">${N.who}</div><div style="font-weight:500;font-size:22px;color:#6B8579">${N.spec}</div></div>
          ${N.price ? `<div style="text-align:right"><div style="font-weight:900;font-size:36px;color:#0B5D3A">${N.price}</div><div style="font-weight:500;font-size:20px;color:#6B8579">за занятие</div></div>` : ''}</div>
          <div class="row" style="margin-top:14px;gap:10px"><span class="chip on">${N.when}</span><span class="chip">рядом с вами</span></div>
          <div class="btn" id="bookbtn" style="margin-top:22px;width:100%;height:84px;font-size:34px">Записаться</div></div></div>`;
        r._done = el('div', '', sc); r._done.style.cssText = 'position:absolute;inset:0;background:rgba(2,20,13,.88);display:grid;place-items:center;text-align:center;color:#fff';
        r._done.innerHTML = `<div><div class="ck" style="width:200px;height:200px;margin:0 auto;border-radius:50%;background:#3DDC97;display:grid;place-items:center;box-shadow:0 0 80px rgba(61,220,151,.7)"><svg width="110" height="110" viewBox="0 0 30 30"><path d="M5 16 L12 23 L25 8" stroke="#02140D" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div style="font-weight:900;font-size:46px;margin-top:40px">Вы записаны!</div><div style="font-weight:600;font-size:28px;color:#9FF5CF;margin-top:10px">${N.sport} · ${N.when}</div></div>`;
        r._sh = contactShadow(r, 520);
      }, update(lt) {
        const r = this.root, p = eOut3(inv(0, .9, lt));
        place(r._ph, 540, 1180 + (1 - p) * 600, 0, `rotateY(${(1 - p) * -30 - 10 + lt * 3}deg) rotateX(${(1 - p) * 20 + 5}deg) scale(.8)`);
        place(r._sh, 540, 1630, -120, 'rotateX(80deg)');
        r._cats.forEach((c, i) => { const s = eBack(inv(.5 + i * .12, .9 + i * .12, lt)); T(c, `scale(${s})`); c.style.opacity = clamp(s);
          c.firstElementChild.style.boxShadow = i === N.cat && lt > 2.1 && lt < 2.8 ? '0 0 0 6px #3DDC97' : 'none'; });
        const s2 = eOut5(inv(2.75, 3.2, lt)); T(r._s2, `translateX(${(1 - s2) * 560}px)`);
        T($('#bookbtn'), `scale(${lt > 4.3 && lt < 4.5 ? .95 : 1})`);
        r._done.style.opacity = inv(4.5, 4.8, lt); r._done.querySelector('.ck').style.transform = `scale(${eBack(inv(4.6, 5.1, lt))})`;
      } },
    { a: 12.0, b: 15.0, setup(r) {
        r._n = el('div', 'p3 c card', r, `<div style="width:820px;padding:30px 34px"><div class="row" style="gap:18px"><div class="logo" style="width:84px;height:84px;border-radius:22px">${LOGO_SVG(56)}</div>
          <div style="flex:1"><div style="font-weight:600;font-size:24px;color:#6B8579">Команда · сейчас</div><div style="font-weight:900;font-size:42px">Новая заявка</div></div></div>
          <div style="margin-top:18px;font-weight:600;font-size:30px">${N.sport} · ${N.when} · 1 клиент</div>
          <div class="row" style="margin-top:22px;justify-content:space-between"><div style="font-weight:900;font-size:52px;color:#0B5D3A">${N.price ? '+' + N.price : 'Новый клиент'}</div><div class="btn" id="okbtn" style="padding:22px 38px;font-size:32px">Подтвердить</div></div>
          <div class="okd" style="margin-top:16px;font-weight:800;font-size:28px;color:#0B5D3A;opacity:0">✓ Занятие подтверждено</div></div>`);
        r._coins = (N.price ? [0, 1, 2] : []).map(() => el('div', 'p3 c', r, '<div class="coin">₽</div>'));
      }, update(lt) {
        const r = this.root, d = spring(inv(.4, 1.1, lt) * 1.1);
        place(r._n, 540, lerp(-300, 1340, clamp(d)), 120, `rotateX(${(1 - clamp(d)) * 30}deg) scale(.96)`); r._n.style.opacity = clamp(d * 3);
        r._coins.forEach((c, i) => { const q = eIO(inv(.1 + i * .15, 1.0 + i * .15, lt));
          place(c, lerp(140 + i * 380, 760, q), lerp(-200, 1420, q) - Math.sin(q * Math.PI) * 300, 300, `rotateY(${q * 720}deg) scale(${1 - q * .5})`); c.style.opacity = q < .95 ? 1 : 0; });
        r._n.querySelector('.okd').style.opacity = inv(1.95, 2.2, lt); T($('#okbtn'), `scale(${lt > 1.9 && lt < 2.1 ? .94 : 1})`);
      } },
    Object.assign({ a: 15.0, b: 18.5, press: 1.8 }, finaleScene(N.cta, 'Тренеры и секции рядом с тобой')),
  ] };
build(V5);
document.body.insertBefore(LIVE, document.getElementById('stage'));
const seekCore = window.seek;
window.seek = async t => { pending.length = 0; updateLive(t); seekCore(t); await Promise.all(pending); };
Promise.all([document.fonts.load('900 50px Rubik'), document.fonts.load('500 50px Rubik')]).then(async () => {
  fitHeads(); await window.seek(0); window.READY = true;
  if (!Q.get('render')) { const t0 = performance.now(); (async function loop() { await window.seek(((performance.now() - t0) / 1000) % V.d); requestAnimationFrame(loop); })(); }
});
