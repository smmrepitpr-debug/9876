/* «Говорящая голова» в стиле рекламы «Алистер»: субтитры + выпрыгивающие вставки интерфейса.
   Рисуется ПРОЗРАЧНЫЙ слой поверх вашего видео (или демо-фон с ?demo=1).
   Тайминги — в CUES ниже (секунды). После съёмки поправьте их под реальную речь
   (или попросите Claude Code: «расшифруй моё видео whisper-ом и выставь тайминги в talking.js»). */

const DEMO = !!Q.get('demo');
const MOTION = !Q.get('overlay');   // по умолчанию — чистая моушн-графика без человека

// Текст сценария, разбитый на субтитры: [начало, конец, текст]
const SUBS = [
  [0.3, 2.4, 'За полгода работы с клубами Коми'],
  [2.4, 4.4, 'я не слышала ни одной задачи,'],
  [4.4, 6.6, 'на которую пришлось бы ответить: «невозможно».'],
  [6.8, 8.2, 'Давайте проверим.'],
  [8.6, 10.8, 'Хотите, чтобы клиенты записывались сами,'],
  [10.8, 12.4, 'даже ночью?'],
  [12.4, 13.6, 'Нет проблем.'],
  [14.0, 16.4, 'Напомнить о тренировке за час,'],
  [16.4, 18.0, 'чтобы не было неявок?'],
  [18.0, 19.0, 'Сделаем.'],
  [19.4, 21.8, 'Видеть, как работает каждый тренер'],
  [21.8, 23.6, 'и как его оценивают клиенты?'],
  [23.6, 24.6, 'Пожалуйста.'],
  [25.0, 27.4, 'Прогресс клиента — вес, замеры, фото'],
  [27.4, 28.8, 'прямо в приложении?'],
  [28.8, 29.8, 'Уже есть.'],
  [30.2, 32.6, 'Своё приложение с логотипом клуба,'],
  [32.6, 34.0, 'как у больших сетей?'],
  [34.0, 35.6, 'Считайте, уже сделано.'],
  [36.0, 38.2, 'Работаете в другой CRM?'],
  [38.2, 40.2, 'Подключимся к ней, ничего не ломая.'],
  [40.6, 42.6, 'И мы не колл-центр:'],
  [42.6, 45.0, 'мы в Ухте, приедем и всё настроим.'],
  [45.4, 47.4, 'Напишите «Команда» —'],
  [47.4, 49.6, 'покажу всё за 10 минут.'],
];
// Вставки: [начало, конец, тип]
const INSERTS = [
  [8.6, 13.6, 'booking'],
  [14.0, 19.0, 'push'],
  [19.4, 24.6, 'rating'],
  [25.0, 29.8, 'progress'],
  [30.2, 35.6, 'clubapp'],
  [36.0, 40.2, 'crm'],
  [40.6, 45.0, 'ukhta'],
  [45.4, 50.5, 'cta'],
];
const TOTAL = 50.5;
window.DURATION = TOTAL; window.FPS = FPS; window.VIDEO_NAME = 'govoryashaya-golova';

/* ---------- демо-фон вместо видео ---------- */
function demoBg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2B2A27'); g.addColorStop(1, '#141310');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // кресло и силуэт
  ctx.save(); ctx.translate(CX, H * .5 + Math.sin(t * 1.3) * 4 * u);
  ctx.fillStyle = '#1C1B19'; rrect(-300 * u, -520 * u, 600 * u, 1200 * u, 120 * u); ctx.fill();
  ctx.fillStyle = '#3A3530'; ctx.beginPath(); ctx.ellipse(0, -260 * u, 130 * u, 165 * u, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-330 * u, 700 * u); ctx.quadraticCurveTo(-320 * u, -20 * u, 0, -40 * u); ctx.quadraticCurveTo(320 * u, -20 * u, 330 * u, 700 * u); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.globalAlpha = .5; ctx.font = F(34 * u, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.fillText('здесь ваше видео (говорите в камеру)', CX, 240 * u); ctx.restore();
}

/* ---------- субтитры (как в референсе: тёмная плашка, светлый текст) ---------- */
function subtitles(t) {
  const s = SUBS.find(([a, b]) => t >= a && t < b); if (!s) return;
  const [a, b, str] = s, p = inv(a, a + .12, t);
  const size = 52 * u, y = H * .6;
  ctx.font = F(size, 800);
  // перенос на 2 строки
  const words = str.split(' '), lines = [''];
  for (const w of words) { const tryL = (lines[lines.length - 1] + ' ' + w).trim(); if (ctx.measureText(tryL).width > W * .8 && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = tryL; }
  const accent = /проблем|Сделаем|Пожалуйста|Уже есть|сделано|ничего не ломая|проверим/.test(str);
  lines.forEach((l, i) => {
    const ly = y + (i - (lines.length - 1) / 2) * size * 1.25 + (1 - eOut3(p)) * 14 * u;
    const w = ctx.measureText(l).width;
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = 'rgba(2,20,13,.62)'; rrect(CX - w / 2 - 22 * u, ly - size * .66, w + 44 * u, size * 1.3, 16 * u); ctx.fill();
    ctx.fillStyle = accent ? C.neon : '#F4F1DE'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (accent) { ctx.shadowColor = C.neon; ctx.shadowBlur = 18 * u; }
    ctx.fillText(l, CX, ly + 2 * u); ctx.restore();
  });
}

/* ---------- кинетический текст вместо субтитров ---------- */
function kinetic(t) {
  const s = SUBS.find(([a, b]) => t >= a && t < b); if (!s) return;
  const [a, b, str] = s, lt = t - a;
  const accent = /проблем|Сделаем|Пожалуйста|Уже есть|сделано|ничего не ломая|проверим/.test(str);
  const inIns = INSERTS.some(([x, y]) => t >= x && t < y);
  const words = str.toUpperCase().split(' ');
  // делим на строки по ~14 символов
  const lines = ['']; for (const w of words) { const tl = (lines[lines.length - 1] + ' ' + w).trim(); if (tl.length > 14 && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = tl; }
  const cy = inIns ? H * .34 : H * .47;
  const hit = Math.exp(-lt * 9);
  ctx.save(); ctx.translate(CX + noise(t * 40, 1) * 10 * u * hit, cy); const z = 1 + .03 * (lt / (b - a)); ctx.scale(z, z); ctx.translate(-CX, -cy);
  if (accent) rings(lt, CX, cy, 2, .25, 1.4, 600);
  title(lines.map(l => accent ? { t: l, c: C.neon } : l), cy, (accent ? 150 : 104) * u, 0, lt, { rgb: accent ? 30 : 16, stagger: .05, dur: .35 });
  ctx.restore();
}

/* ---------- вставки ---------- */
const PHONE_SMALL = .62 * u;
function popIn(lt, d) { return Math.min(eBack(inv(0, .35, lt)), 1 - eIn3(inv(d - .25, d, lt))); }
function three(lt, d, screens) {           // три телефона в ряд, как в референсе
  const k = popIn(lt, d); if (k <= 0) return;
  const y = H * .82;
  [-1, 0, 1].forEach((i, n) => {
    const kk = Math.min(k, eBack(inv(n * .08, n * .08 + .35, lt)));
    ctx.save(); ctx.translate(CX + i * 300 * u, y + (1 - kk) * 200 * u); ctx.scale(kk, kk);
    phone(0, 0, PHONE_SMALL, lt, (c) => screens[n](c, lt)); ctx.restore();
  });
}
function panel(lt, d, h, draw) {           // широкая карточка-«скрин»
  const k = popIn(lt, d); if (k <= 0) return;
  const w = W * .9, x = CX - w / 2, y = H * .72;
  ctx.save(); ctx.translate(CX, y + h / 2); ctx.scale(k, k); ctx.translate(-CX, -(y + h / 2));
  ctx.shadowColor = hexA(C.neon, .5); ctx.shadowBlur = 50 * u;
  rrect(x, y, w, h, 30 * u); ctx.fillStyle = '#061E14'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = hexA(C.neon, .5); ctx.lineWidth = 2 * u; ctx.stroke();
  ctx.save(); rrect(x, y, w, h, 30 * u); ctx.clip(); draw(x, y, w, h); ctx.restore();
  ctx.restore();
}
const scr = {
  booking(c, lt) { ui.header(c, 'Запись'); ['7:00', '8:00', '9:30', '19:00'].forEach((s, i) => { const on = i === 1 && lt > 1; c.save(); c.beginPath(); c.roundRect(24, 140 + i * 70, 312, 56, 28); c.fillStyle = on ? '#3DDC97' : 'rgba(61,220,151,.1)'; c.fill(); c.restore(); ui.t(c, s + '  ·  Силовая', 180, 169 + i * 70, 20, { align: 'center', w: 800, color: on ? '#02140D' : '#fff' }); }); ui.button(c, 'Записаться', 30, 460, 300, 56, lt > 2 ? 1 : 0); if (lt > 2.4) { c.fillStyle = 'rgba(2,20,13,.85)'; c.fillRect(0, 0, 360, 760); c.beginPath(); c.arc(180, 330, 70, 0, 7); c.fillStyle = '#3DDC97'; c.fill(); c.strokeStyle = '#02140D'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(150, 332); c.lineTo(172, 356); c.lineTo(214, 308); c.stroke(); ui.t(c, 'Вы записаны!', 180, 450, 28, { align: 'center', w: 900 }); } },
  night(c) { c.fillStyle = '#020A07'; c.fillRect(0, 0, 360, 760); ui.t(c, '23:40', 180, 240, 96, { align: 'center', w: 300 }); ui.t(c, 'клиент записался сам', 180, 320, 18, { align: 'center', color: '#9FF5CF' }); },
  admin(c) { c.fillStyle = '#061E14'; c.fillRect(0, 0, 360, 760); ui.t(c, 'Zzz', 180, 300, 80, { align: 'center', w: 900, color: '#9FF5CF' }); ui.t(c, 'админ спит —', 180, 400, 20, { align: 'center' }); ui.t(c, 'запись идёт', 180, 430, 20, { align: 'center', color: '#3DDC97', w: 800 }); },
  push(c, lt) { c.fillStyle = '#03110B'; c.fillRect(0, 0, 360, 760); ui.t(c, '7:00', 180, 220, 96, { align: 'center', w: 300 }); const y = lerp(-120, 300, eOut5(clamp(lt / .6))); ui.box(c, 16, y, 328, 100, { fill: 'rgba(240,255,248,.16)', r: 24, glow: .5 }); ui.mini(c, 52, y + 34, 32); ui.t(c, 'Команда', 78, y + 30, 15, { w: 800 }); ui.t(c, 'Тренировка через 1 час', 30, y + 70, 19, { w: 800 }); c.font = `22px ${EMOJI}`; c.fillText('💪', 300, y + 72); },
  rating(c, lt) { ui.header(c, 'Оценка'); ui.t(c, 'Как прошла тренировка?', 180, 170, 20, { align: 'center', w: 900 }); const pk = clamp((lt - .8) / .4); ['😖', '😐', '🙂', '😀', '🤩'].forEach((e, i) => { c.save(); c.translate(48 + i * 66, 260); const s = i === 4 ? 1 + .5 * pk : 1; c.scale(s, s); c.globalAlpha = i === 4 ? 1 : 1 - .6 * pk; c.font = `40px ${EMOJI}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 0, 0); c.restore(); }); ui.box(c, 20, 340, 320, 150); ui.avatar(c, 70, 415, 34, 150); ui.t(c, 'Андрей', 120, 400, 20, { w: 800 }); ui.t(c, '★ 4.9 · 128 оценок', 120, 430, 15, { color: '#3DDC97', w: 700 }); },
  trainers(c) { ui.header(c, 'Тренеры'); [['Андрей', '4.9'], ['Мария', '4.8'], ['Олег', '4.7'], ['Ольга', '4.9']].forEach(([n, r], i) => { ui.box(c, 16, 130 + i * 90, 328, 76); ui.avatar(c, 56, 168 + i * 90, 24, 140 + i * 30); ui.t(c, n, 94, 168 + i * 90, 18, { w: 800 }); ui.t(c, '★ ' + r, 326, 168 + i * 90, 17, { align: 'right', w: 800, color: '#3DDC97' }); }); },
};
const INSERT = {
  booking(lt, d) { three(lt, d, [scr.night, scr.booking, scr.admin]); },
  push(lt, d) { const k = popIn(lt, d); if (k <= 0) return; ctx.save(); ctx.translate(CX, H * .82 + (1 - k) * 300 * u); ctx.scale(k, k); phone(0, 0, .75 * u, lt, (c) => scr.push(c, lt)); ctx.restore(); },
  rating(lt, d) { three(lt, d, [scr.trainers, scr.rating, scr.trainers]); },
  progress(lt, d) { panel(lt, d, 420 * u, (x, y, w, h) => {
    text('Прогресс клиента · Анна', x + 40 * u, y + 56 * u, 36 * u, { w: 800 });
    const pts = [.2, .3, .28, .45, .5, .66, .82], p = clamp((lt - .3) / 1.6);
    ctx.save(); ctx.strokeStyle = C.neon; ctx.lineWidth = 7 * u; ctx.shadowColor = C.neon; ctx.shadowBlur = 16 * u; ctx.beginPath();
    pts.slice(0, Math.max(2, Math.ceil(pts.length * p))).forEach((v, i) => { const px = x + 60 * u + i * (w * .55 / 6), py = y + h - 60 * u - v * (h - 160 * u); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); ctx.restore();
    [['Вес', '−6,4 кг'], ['Талия', '−9 см'], ['Присед', '+25 кг']].forEach(([a, b], i) => { text(a, x + w * .68, y + 130 * u + i * 90 * u, 28 * u, { w: 500, color: C.mint }); text(b, x + w * .68, y + 168 * u + i * 90 * u, 40 * u, { w: 900, color: C.neon }); });
  }); },
  clubapp(lt, d) { const k = popIn(lt, d); if (k <= 0) return; ctx.save(); ctx.translate(CX, H * .82 + (1 - k) * 300 * u); ctx.scale(k, k); ctx.rotate(Math.sin(lt * 1.5) * .04); phone(0, 0, .75 * u, lt, (c) => clubApp(c, Math.min(2, Math.floor(lt / 1.6)), lt % 1.6)); ctx.restore(); },
  crm(lt, d) { panel(lt, d, 360 * u, (x, y, w, h) => {
    const cy = y + h / 2 - 20 * u, a = x + w * .22, b = x + w * .78;
    card(a - 90 * u, cy - 90 * u, 180 * u, 180 * u, { r: 40 * u }); icon('db', a, cy, 100 * u);
    logoMark(b, cy, 170 * u);
    const p = clamp((lt - .4) / .8); ctx.save(); ctx.strokeStyle = C.neon; ctx.lineWidth = 6 * u; ctx.setLineDash([16 * u, 10 * u]); ctx.lineDashOffset = -lt * 80 * u; ctx.beginPath(); ctx.moveTo(a + 100 * u, cy); ctx.lineTo(lerp(a + 100 * u, b - 100 * u, p), cy); ctx.stroke(); ctx.restore();
    text('Ваша CRM', a, cy + 130 * u, 30 * u, { align: 'center', color: C.mint }); text('Команда', b, cy + 130 * u, 30 * u, { align: 'center', color: C.mint });
  }); },
  ukhta(lt, d) { panel(lt, d, 360 * u, (x, y, w, h) => {
    icon('pin', x + 140 * u, y + h / 2, 170 * u, { lw: 7 }); rings(lt, x + 140 * u, y + h / 2 + 60 * u, 3, .5, 1.6, 160);
    text('Мы в Ухте', x + 270 * u, y + 120 * u, 60 * u, { w: 900 });
    text('приедем · настроим · обучим', x + 270 * u, y + 200 * u, 32 * u, { w: 600, color: C.neon });
    text('поддержка — люди, а не бот', x + 270 * u, y + 252 * u, 30 * u, { w: 500, color: C.mint });
  }); },
  cta(lt, d) { const k = inv(0, .35, lt); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; logoMark(CX, H * .78, 170 * u); ctx.restore();
    pill('ПОКАЖЕМ ЗА 10 МИНУТ →', H * .9, .3, lt); },
};

/* ---------- кадр ---------- */
function seekTalking(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.clearRect(0, 0, W, H);
  if (MOTION) { background(t); kinetic(t); }
  else { if (DEMO) demoBg(t); subtitles(t); }
  for (const [a, b, type] of INSERTS) if (t >= a && t < b) INSERT[type](t - a, b - a);
  if (MOTION) { vignette(); shutters(t, INSERTS.map(i => i[0])); }
  cornerLogo(.9);
}
window.seek = seekTalking;
DURATION = TOTAL; // для плеера
startPlayer();
