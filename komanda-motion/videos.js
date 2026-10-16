/* Четыре сценария. Тексты — строго по брифу. */
const TOP = H * .2;           // зона заголовка над телефоном
const PHONE_Y = H * .6, PHONE_S = 1.55 * u;

/* ===================== РОЛИК 1 «Не просто CRM» ===================== */
const V1 = { name: 'ne-prosto-crm', shots: [
  { d: 2, mood: .25, hit: 0, draw(lt) {          // печатается текст
    const lines = ['ВАША CRM ЗНАЕТ,', 'СКОЛЬКО ЗАПЛАТИЛ', 'КЛИЕНТ'];
    const all = lines.join('\n'), n = Math.floor(lt * 30);
    let shown = all.slice(0, n).split('\n');
    const size = fit('СКОЛЬКО ЗАПЛАТИЛ', W * .86, 96 * u);
    ctx.font = F(size, 900);
    shown.forEach((s, i) => glow(s, CX - ctx.measureText(lines[i]).width / 2, CY - size * 1.15 + i * size * 1.15, size, { ga: .8, align: 'left' }));
    const li = shown.length - 1; ctx.font = F(size, 900);
    const lw = ctx.measureText(lines[li]).width, cw = ctx.measureText(shown[li]).width;
    if (Math.floor(lt * 3) % 2 === 0 || n < all.length) { ctx.fillStyle = C.neon; ctx.fillRect(CX - lw / 2 + cw + 8 * u, CY - size * 1.15 + li * size * 1.15 - size * .45, 10 * u, size * .9); }
  } },
  { d: 2, draw(lt) {
    rings(lt, CX, CY, 2, .3, 1.6, 800);
    title(['А КАК ОН', { t: 'ТРЕНИРУЕТСЯ?', c: C.neon }], CY, 130 * u, .05, lt, { rgb: 30 });
  } },
  { d: 3, draw(lt) {
    const fade = inv(1.0, 1.8, lt);
    ctx.save(); ctx.globalAlpha = 1 - .75 * fade; ctx.filter = `grayscale(${fade})`;
    const x = W * .08, y = H * .2, w = W * .84, rh = 92 * u;
    card(x, y, w, rh * 7 + 30 * u, { fill: 'rgba(255,255,255,.04)' });
    const hd = ['Клиент', 'Абонемент', 'Оплачено'];
    hd.forEach((h, i) => text(h, x + 36 * u + i * w * .34, y + 52 * u, 30 * u, { w: 700, color: C.mint }));
    const rows = [['Иванов А.', '12 занятий', '4 500 ₽'], ['Петрова М.', 'Безлимит', '6 900 ₽'], ['Сидоров К.', '8 занятий', '3 200 ₽'], ['Кузнецова Е.', 'Безлимит', '6 900 ₽'], ['Попов Д.', '12 занятий', '4 500 ₽'], ['Смирнова О.', '4 занятия', '1 800 ₽']];
    rows.forEach((r, ri) => {
      const p = inv(.05 + ri * .07, .35 + ri * .07, lt); ctx.save(); ctx.globalAlpha *= p;
      const ry = y + 52 * u + (ri + 1) * rh;
      ctx.strokeStyle = 'rgba(159,245,207,.12)'; ctx.lineWidth = u; ctx.beginPath(); ctx.moveTo(x + 24 * u, ry - rh / 2); ctx.lineTo(x + w - 24 * u, ry - rh / 2); ctx.stroke();
      r.forEach((c, i) => text(c, x + 36 * u + i * w * .34, ry, 32 * u, { w: 500 }));
      ctx.restore();
    });
    ctx.restore();
    title(['АБОНЕМЕНТЫ —', { t: 'ЭТО ПОЛДЕЛА', c: C.neon }], H * .8, 116 * u, 1.2, lt, { rgb: 26 });
  } },
  { d: 5, draw(lt) {
    const labels = ['ПРОГРЕСС', 'ОТЗЫВЫ', 'ТРЕНЕРЫ', 'ПРОГРАММЫ'];
    const idx = Math.min(3, Math.floor(Math.max(0, lt - .5) / 1.1));
    const tl = lt - .5 - idx * 1.1;
    if (lt > .5) title([{ t: labels[idx], c: C.neon }], TOP, 150 * u, 0, tl, { rgb: 24, stagger: 0 });
    const ap = eOut3(inv(0, .6, lt));
    phone(CX, PHONE_Y + (1 - ap) * 500 * u, PHONE_S, lt, (c) => {
      ui.header(c, 'Команда', 'Фитнес Плаза · Ухта');
      const boxes = [[16, 128, 328, 140], [16, 282, 328, 120], [16, 416, 328, 120], [16, 550, 328, 180]];
      boxes.forEach((b, i) => {
        const on = i === idx && lt > .5 ? eOut3(clamp(tl / .3)) : 0;
        c.save(); if (on) { c.translate(b[0] + b[2] / 2, b[1] + b[3] / 2); c.scale(1 + .04 * on, 1 + .04 * on); c.translate(-(b[0] + b[2] / 2), -(b[1] + b[3] / 2)); }
        c.globalAlpha = lt > .5 && i !== idx ? .45 : 1;
        ui.box(c, ...b, { glow: on });
        c.restore();
      });
      c.globalAlpha = 1;
      ui.t(c, 'Прогресс', 34, 152, 16, { w: 800 }); ui.t(c, '+12% за месяц', 330, 152, 13, { align: 'right', color: '#3DDC97', w: 700 });
      ui.spark(c, 34, 176, 292, 76, clamp(lt / 1.6));
      ui.t(c, 'Отзывы', 34, 306, 16, { w: 800 });
      ['😖', '😐', '🙂', '😀', '🤩'].forEach((e, i) => { c.font = `30px ${EMOJI}`; c.textAlign = 'center'; c.globalAlpha = i === 4 ? 1 : .45; c.fillText(e, 62 + i * 60, 360); }); c.globalAlpha = 1;
      ui.t(c, 'Тренеры', 34, 440, 16, { w: 800 });
      [0, 1, 2, 3].forEach(i => ui.avatar(c, 62 + i * 62, 494, 22, 150 + i * 25));
      ui.t(c, 'Программы', 34, 574, 16, { w: 800 });
      ['Сила · 8 недель', 'Похудение · 6 недель', 'Йога для спины'].forEach((s, i) => { ui.box(c, 34, 596 + i * 42, 292, 34, { r: 10, fill: 'rgba(61,220,151,.06)' }); ui.t(c, s, 48, 613 + i * 42, 13, { w: 600 }); });
    });
  } },
  { d: 4, draw(lt) {
    title(['РАБОТАЕМ ВМЕСТЕ', { t: 'С ВАШЕЙ CRM', c: C.neon }], TOP + 40 * u, 110 * u, .1, lt);
    const y = H * .58, x1 = W * .24, x2 = W * .76, s = 240 * u;
    iconTile('db', x1, y, s, lt, .4, 'Ваша CRM');
    const pL = inv(.4, .7, lt);
    if (pL > 0) { ctx.save(); ctx.translate(x2, y); ctx.scale(eBack(pL), eBack(pL)); logoMark(0, 0, s * .92); ctx.restore(); text('Команда', x2, y + s * .5 + 42 * u, 34 * u, { align: 'center', w: 700, color: C.mint, alpha: pL }); }
    const pl = eInOut(inv(.9, 1.6, lt));
    if (pl > 0) {
      const a = x1 + s / 2 + 16 * u, b = x2 - s / 2 - 16 * u;
      ctx.save(); ctx.strokeStyle = C.neon; ctx.lineWidth = 6 * u; ctx.shadowColor = C.neon; ctx.shadowBlur = 20 * u;
      ctx.setLineDash([18 * u, 12 * u]); ctx.lineDashOffset = -lt * 80 * u;
      ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(lerp(a, b, pl), y); ctx.stroke(); ctx.setLineDash([]);
      if (pl >= 1) for (let k = 0; k < 2; k++) { const q = ((lt * .8 + k * .5) % 1); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lerp(a, b, q), y, 9 * u, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    if (pl >= 1) { const pp = eBack(inv(1.6, 2.0, lt)); ctx.save(); ctx.translate(CX, y - 110 * u); ctx.scale(pp, pp); icon('check', 0, 0, 90 * u, { lw: 10 }); ctx.restore(); }
    sub('синхронизация клиентов и абонементов', H * .78, 38 * u, 1.9, lt);
  } },
  { d: 4, draw(lt) {
    // растущий график за текстом
    const p = eInOut(inv(.2, 3.2, lt));
    ctx.save(); ctx.globalAlpha = .55; ctx.strokeStyle = C.neon; ctx.lineWidth = 10 * u; ctx.shadowColor = C.neon; ctx.shadowBlur = 30 * u; ctx.lineJoin = 'round';
    const pts = [[.06, .82], [.25, .74], [.4, .77], [.58, .6], [.74, .52], [.94, .3]];
    ctx.beginPath(); const n = pts.length - 1, f = p * n;
    for (let i = 0; i <= Math.floor(f); i++) { const [x, y] = pts[i]; i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H); }
    if (f < n) { const i = Math.floor(f), q = f - i; ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], q) * W, lerp(pts[i][1], pts[i + 1][1], q) * H); }
    ctx.stroke(); ctx.restore();
    title(['КЛИЕНТ ВИДИТ', { t: 'РЕЗУЛЬТАТ —', c: C.neon }, 'И ОСТАЁТСЯ'], CY - 60 * u, 128 * u, .1, lt, { rgb: 26, stagger: .1 });
  } },
  { d: 4, final: true, draw(lt) { finale(lt, 'ПОКАЖЕМ ЗА 10 МИНУТ →'); } },
] };

/* ===================== РОЛИК 2 «Клиент записался сам» ===================== */
const V2 = { name: 'klient-zapisalsya-sam', shots: [
  { d: 2, mood: .4, draw(lt) {
    title(['КЛИЕНТ ХОЧЕТ', { t: 'ЗАПИСАТЬСЯ', c: C.neon }], TOP, 112 * u, .15, lt);
    phone(CX, PHONE_Y + 40 * u, PHONE_S, lt, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, '#0A2A1E'); g.addColorStop(1, '#020A07'); c.fillStyle = g; c.fillRect(0, 0, 360, 760);
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${.2 + hash(i) * .5})`; c.fillRect(hash(i * 3) * 360, hash(i * 7) * 380, 2, 2); }
      ui.t(c, 'пятница, 17 октября', 180, 150, 18, { align: 'center', w: 500, color: '#CFEFE2' });
      ui.t(c, '23:40', 180, 220, 96, { align: 'center', w: 300 });
      ui.box(c, 24, 560, 312, 80, { fill: 'rgba(255,255,255,.08)', r: 22 });
      ui.mini(c, 60, 600, 36); ui.t(c, 'Команда', 90, 588, 14, { w: 800 }); ui.t(c, 'Свободно: завтра 8:00 · Силовая', 90, 612, 12, { w: 500, color: '#CFEFE2' });
    }, { screen: '#020A07' });
  } },
  { d: 2, mood: .3, draw(lt) {
    const y = H * .58;
    iconTile('bed', CX, y, 300 * u, lt, .05);
    ['Z', 'z', 'z'].forEach((z, i) => {
      const a = (lt * .9 + i * .33) % 1;
      glow(z, CX + 110 * u + a * 120 * u, y - 150 * u - a * 220 * u, (70 - i * 14) * u, { alpha: Math.sin(a * Math.PI), color: C.mint, ga: .6 });
    });
    title(['А АДМИНИСТРАТОР', 'СПИТ'], TOP + 40 * u, 112 * u, .1, lt);
  } },
  { d: 4, draw(lt) {
    // зелёная волна
    const wp = inv(0, .7, lt);
    if (wp < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - wp; ctx.fillStyle = hexA(C.neon, .35);
      ctx.beginPath(); ctx.arc(CX, H + 100 * u, eOut3(wp) * H * 1.3, 0, 7); ctx.fill(); ctx.restore(); }
    title([{ t: 'ЗАПИСЬ 24/7', c: C.neon }], TOP, 150 * u, .2, lt, { rgb: 28 });
    const pick = inv(1.1, 1.4, lt), slot = inv(1.7, 2.0, lt), press = inv(2.4, 2.6, lt), done = inv(2.7, 3.1, lt);
    phone(CX, PHONE_Y + 40 * u, PHONE_S, lt, (c) => {
      ui.header(c, 'Запись', 'Фитнес Плаза · Ухта');
      ui.t(c, 'Выберите тренировку', 24, 140, 16, { w: 800 });
      ['Силовая · Андрей', 'Функционал · Мария', 'Йога · Ольга'].forEach((s, i) => {
        ui.box(c, 20, 160 + i * 66, 320, 56, { glow: i === 0 ? pick : 0, fill: i === 0 && pick ? 'rgba(61,220,151,.18)' : undefined });
        ui.t(c, s, 40, 188 + i * 66, 15, { w: 700 }); ui.t(c, '60 мин', 324, 188 + i * 66, 12, { align: 'right', color: '#9FF5CF' });
      });
      ui.t(c, 'Завтра, сб 18 октября', 24, 380, 16, { w: 800 });
      ['7:00', '8:00', '9:30', '11:00', '18:00', '19:30'].forEach((s, i) => {
        const x = 20 + (i % 3) * 108, y = 400 + Math.floor(i / 3) * 56, on = i === 1 ? slot : 0;
        c.save(); c.beginPath(); c.roundRect(x, y, 96, 44, 22); c.fillStyle = on ? '#3DDC97' : 'rgba(61,220,151,.08)'; c.fill();
        c.strokeStyle = 'rgba(61,220,151,.3)'; c.stroke(); c.restore();
        ui.t(c, s, x + 48, y + 23, 15, { align: 'center', w: 700, color: on ? '#02140D' : '#fff' });
      });
      c.save(); const bs = 1 - .06 * Math.sin(press * Math.PI); c.translate(180, 560); c.scale(bs, bs); ui.button(c, 'Записаться', -150, -26, 300, 52, press); c.restore();
      if (done > 0) {
        c.fillStyle = `rgba(2,20,13,${.85 * done})`; c.fillRect(0, 0, 360, 760);
        c.save(); c.translate(180, 330); c.scale(eBack(done), eBack(done));
        c.beginPath(); c.arc(0, 0, 70, 0, 7); c.fillStyle = '#3DDC97'; c.shadowColor = '#3DDC97'; c.shadowBlur = 40; c.fill();
        c.strokeStyle = '#02140D'; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-30, 2); c.lineTo(-8, 26); c.lineTo(34, -22); c.stroke(); c.restore();
        ui.t(c, 'Вы записаны!', 180, 440, 26, { align: 'center', w: 900, a: done }); ui.t(c, 'сб, 8:00 · Силовая', 180, 474, 15, { align: 'center', w: 500, color: '#9FF5CF', a: done });
      }
    });
  } },
  { d: 4, draw(lt) {
    title(['НАПОМИНАНИЕ', { t: 'ЗА ЧАС', c: C.neon }], TOP, 120 * u, .1, lt);
    const drop = eOut5(inv(.6, 1.1, lt));
    phone(CX, PHONE_Y + 40 * u, PHONE_S, lt, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, '#0E3A28'); g.addColorStop(1, '#03110B'); c.fillStyle = g; c.fillRect(0, 0, 360, 760);
      ui.t(c, 'суббота, 18 октября', 180, 150, 18, { align: 'center', w: 500, color: '#CFEFE2' });
      ui.t(c, '7:00', 180, 220, 96, { align: 'center', w: 300 });
      const y = lerp(-110, 300, drop);
      c.save(); c.shadowColor = '#3DDC97'; c.shadowBlur = 30 * drop; ui.box(c, 16, y, 328, 96, { fill: 'rgba(240,255,248,.14)', r: 24, glow: .4 * drop }); c.restore();
      ui.mini(c, 52, y + 34, 32); ui.t(c, 'Команда', 78, y + 28, 13, { w: 800, color: '#CFEFE2' }); ui.t(c, 'сейчас', 328, y + 28, 12, { align: 'right', color: '#9FF5CF' });
      ui.t(c, 'Тренировка через 1 час', 30, y + 66, 18, { w: 800 });
      c.font = `20px ${EMOJI}`; c.textAlign = 'left'; c.fillText('💪', 262, y + 68);
    }, { screen: '#03110B' });
    if (drop > .9) icon('bell', CX + 270 * u, PHONE_Y - 420 * u, 110 * u, { alpha: inv(1.1, 1.4, lt) });
  } },
  { d: 4, draw(lt) {
    title(['МЕНЬШЕ', { t: 'НЕЯВОК', c: C.neon }], TOP, 140 * u, .1, lt);
    const x0 = W * .1, y0 = H * .78, cw = W * .8, ch = H * .36;
    card(x0 - 30 * u, y0 - ch - 60 * u, cw + 60 * u, ch + 140 * u, { fill: 'rgba(11,93,58,.18)' });
    text('Неявки, %', x0, y0 - ch - 20 * u, 32 * u, { w: 700, color: C.mint });
    const vals = [28, 25, 19, 13, 8, 5], months = ['май', 'июн', 'июл', 'авг', 'сен', 'окт'];
    const bw = cw / vals.length * .58;
    vals.forEach((v, i) => {
      const p = eOut3(inv(.4 + i * .12, .9 + i * .12, lt));
      const h = (v / 30) * ch * .9 * p, x = x0 + (i + .5) * cw / vals.length - bw / 2;
      ctx.save(); ctx.fillStyle = i < 2 ? hexA(C.red, .75) : C.neon; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 20 * u;
      rrect(x, y0 - h, bw, h, 10 * u); ctx.fill(); ctx.restore();
      text(months[i], x + bw / 2, y0 + 36 * u, 28 * u, { align: 'center', color: C.mint, w: 500 });
      if (p > .9) text(v + '%', x + bw / 2, y0 - h - 26 * u, 30 * u, { align: 'center', w: 800 });
    });
    const ap = inv(1.6, 2.2, lt);
    if (ap > 0) { ctx.save(); ctx.globalAlpha = ap; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6 * u; ctx.setLineDash([16 * u, 10 * u]);
      ctx.beginPath(); ctx.moveTo(x0 + cw * .08, y0 - ch * .86); ctx.lineTo(x0 + lerp(.08, .92, eOut3(ap)) * cw, y0 - lerp(.86, .2, eOut3(ap)) * ch); ctx.stroke(); ctx.restore(); }
  } },
  { d: 4, draw(lt) {
    title(['ТРЕНЕР ВИДИТ ВСЁ', { t: 'В ОДНОМ МЕСТЕ', c: C.neon }], TOP, 104 * u, .1, lt);
    phone(CX, PHONE_Y + 40 * u, PHONE_S, lt, (c) => {
      ui.header(c, 'Неделя', 'Тренер · Андрей');
      const days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
      days.forEach((d, i) => ui.t(c, d, 60 + i * 44, 138, 13, { align: 'center', w: 700, color: '#9FF5CF' }));
      for (let h = 0; h < 12; h++) { ui.t(c, (8 + h) + ':00', 16, 170 + h * 46, 10, { color: 'rgba(255,255,255,.4)' }); c.fillStyle = 'rgba(61,220,151,.08)'; c.fillRect(38, 168 + h * 46, 314, 1); }
      const ev = [[0, 0, 1.2], [0, 9, 1], [1, 2, 1], [1, 10, 1], [2, 0, 1.2], [2, 5, 1], [3, 3, 1], [3, 10, 1], [4, 0, 1.2], [4, 9, 1.2], [5, 1, 2], [6, 2, 1]];
      ev.forEach(([d, h, len], i) => {
        const p = eOut3(inv(.3 + i * .08, .6 + i * .08, lt)); if (p <= 0) return;
        c.save(); c.globalAlpha = p; c.beginPath(); c.roundRect(42 + d * 44, 172 + h * 46, 38, len * 44 * p, 8);
        c.fillStyle = i % 3 === 0 ? '#3DDC97' : i % 3 === 1 ? '#1FA56B' : '#0B5D3A'; c.fill(); c.restore();
      });
    });
  } },
  { d: 4, final: true, draw(lt) { finale(lt, 'ПОДКЛЮЧИ СВОЮ СЕКЦИЮ →'); } },
] };

/* ===================== РОЛИК 3 «Своё приложение у клуба» ===================== */
const SKY = (() => { const r = rng(5); const a = []; let x = 0; while (x < 1) { const w = .03 + r() * .06; a.push({ x, w, h: .08 + r() * .3, club: r() < .25 }); x += w + .006; } return a; })();
function clubApp(c, scr, lt) {
  // брендированное приложение клуба
  c.fillStyle = '#061E14'; c.fillRect(0, 0, 360, 760);
  const g = c.createLinearGradient(0, 0, 360, 220); g.addColorStop(0, '#13805A'); g.addColorStop(1, '#0B5D3A'); c.fillStyle = g; c.fillRect(0, 0, 360, 200);
  ui.t(c, '9:41', 30, 26, 13, { w: 700 });
  c.save(); c.beginPath(); c.arc(60, 110, 34, 0, 7); c.fillStyle = '#02140D'; c.fill(); c.strokeStyle = '#3DDC97'; c.lineWidth = 3; c.stroke(); c.restore();
  ui.t(c, 'ЛОГО', 60, 111, 14, { align: 'center', w: 900, color: '#3DDC97' });
  ui.t(c, 'Ваш клуб', 108, 100, 26, { w: 900 }); ui.t(c, 'Привет, Анна! 👋', 108, 130, 14, { w: 500, color: '#CFEFE2' });
  if (scr === 0) {
    ui.t(c, 'Расписание на сегодня', 20, 236, 17, { w: 800 });
    [['08:00', 'Силовая', 'Андрей'], ['10:30', 'Пилатес', 'Мария'], ['18:00', 'Функционал', 'Олег'], ['19:30', 'Йога', 'Ольга'], ['20:30', 'Бокс', 'Игорь']].forEach((r, i) => {
      ui.box(c, 16, 258 + i * 74, 328, 62); ui.t(c, r[0], 34, 289 + i * 74, 17, { w: 900, color: '#3DDC97' }); ui.t(c, r[1], 106, 280 + i * 74, 16, { w: 800 }); ui.t(c, r[2], 106, 300 + i * 74, 12, { color: '#9FF5CF' });
    });
  } else if (scr === 1) {
    ui.box(c, 16, 226, 328, 470);
    ui.avatar(c, 180, 320, 64, 155);
    ui.t(c, 'Андрей Морозов', 180, 420, 22, { align: 'center', w: 900 }); ui.t(c, 'Силовой тренинг · 7 лет', 180, 448, 14, { align: 'center', color: '#9FF5CF' });
    ui.t(c, '★★★★★  4.9', 180, 490, 20, { align: 'center', w: 800, color: '#3DDC97' });
    ['КМС по пауэрлифтингу', 'Реабилитация спины', '320 тренировок в приложении'].forEach((s, i) => ui.t(c, '• ' + s, 44, 540 + i * 34, 14, { w: 500 }));
    ui.button(c, 'Записаться к тренеру', 40, 640, 280, 46);
  } else {
    ui.t(c, 'Как прошла тренировка?', 180, 270, 20, { align: 'center', w: 900 });
    ui.t(c, 'Силовая · Андрей · 08:00', 180, 300, 13, { align: 'center', color: '#9FF5CF' });
    const pk = inv(.5, .8, lt);
    ['😖', '😐', '🙂', '😀', '🤩'].forEach((e, i) => { const on = i === 4 ? pk : 0; c.save(); c.translate(48 + i * 66, 390); c.scale(1 + .45 * on, 1 + .45 * on); c.globalAlpha = i === 4 ? 1 : 1 - .6 * pk; c.font = `40px ${EMOJI}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 0, 0); c.restore(); });
    ui.box(c, 16, 470, 328, 120); ui.t(c, 'Комментарий тренеру', 34, 496, 13, { color: '#9FF5CF' }); ui.t(c, 'Огонь! Спина не болит 🔥', 34, 530, 16, { w: 600 });
    ui.button(c, 'Отправить', 40, 630, 280, 46);
  }
}
const V3 = { name: 'svoe-prilozhenie', shots: [
  { d: 2, draw(lt) {
    const base = H * .9, p = eOut3(inv(0, .8, lt));
    SKY.forEach((b, i) => {
      const h = b.h * H * .55 * p;
      ctx.save(); ctx.fillStyle = 'rgba(11,93,58,.55)'; ctx.strokeStyle = hexA(C.neon, .35); ctx.lineWidth = 2 * u;
      ctx.fillRect(b.x * W, base - h, b.w * W, h); ctx.strokeRect(b.x * W, base - h, b.w * W, h);
      for (let wy = base - h + 20 * u; wy < base - 10 * u; wy += 30 * u) for (let wx = b.x * W + 10 * u; wx < (b.x + b.w) * W - 10 * u; wx += 22 * u)
        if (hash(wx * 3 + wy) > .55) { ctx.fillStyle = hexA(C.mint, .35); ctx.fillRect(wx, wy, 8 * u, 12 * u); }
      if (b.club && p > .8) { ctx.globalAlpha = inv(.8, 1.2, lt); ui.mini(ctx, (b.x + b.w / 2) * W, base - h - 40 * u, 46 * u); }
      ctx.restore();
    });
    title(['У БОЛЬШИХ СЕТЕЙ —', { t: 'СВОЁ ПРИЛОЖЕНИЕ', c: C.neon }], H * .27, 100 * u, .15, lt);
  } },
  { d: 2, hit: 2.2, draw(lt) {
    const p = inv(0, .18, lt), s = lerp(2.4, 1, eOut5(p));
    ctx.save(); ctx.translate(CX, CY); ctx.scale(s, s); ctx.translate(-CX, -CY);
    glow('А У ВАС?', CX, CY, fit('А У ВАС?', W * .86, 200 * u), { split: (1 - p) * 40 * u + Math.abs(noise(lt * 20, 1)) * 6 * u, color: C.neon, ga: 1.4 });
    ctx.restore();
  } },
  { d: 5, draw(lt) {
    title(['ВАШ КЛУБ', { t: 'В ТЕЛЕФОНЕ КЛИЕНТА', c: C.neon }], TOP, 104 * u, .1, lt);
    const rot = (1 - eOut3(inv(0, 1.6, lt))) * Math.PI * 1.15 + Math.sin(lt * 1.4) * .18 * inv(1.6, 2.2, lt);
    const front = Math.cos(rot) > 0;
    rings(lt, CX, PHONE_Y, 3, .7, 2.4, 650);
    phone(CX, PHONE_Y + 30 * u, PHONE_S, lt, (c) => { if (front) clubApp(c, 0, lt); else { c.fillStyle = '#0C1712'; c.fillRect(0, 0, 360, 760); ui.mini(c, 180, 380, 110); } }, { rotY: rot });
  } },
  { d: 4, draw(lt) {
    title(['РАСПИСАНИЕ ·', 'ТРЕНЕРЫ ·', { t: 'ОТЗЫВЫ', c: C.neon }], TOP + 10 * u, 96 * u, .05, lt, { lh: 1.02 });
    const scr = Math.min(2, Math.floor(lt / 1.33)), sl = lt - scr * 1.33;
    const slide = 1 - eOut5(inv(0, .3, sl));
    phone(CX + slide * 300 * u * (scr ? 1 : 0), PHONE_Y + 60 * u, PHONE_S, lt, (c) => clubApp(c, scr, sl));
  } },
  { d: 4, draw(lt) {
    title(['УРОВЕНЬ ФЕДЕРАЛЬНЫХ', { t: 'СЕТЕЙ — В КОМИ', c: C.neon }], TOP, 96 * u, .1, lt);
    // стилизованный контур Республики Коми
    const shape = [[.18, .92], [.10, .80], [.16, .66], [.12, .54], [.24, .44], [.30, .30], [.44, .24], [.52, .12], [.66, .06], [.78, .10], [.84, .02], [.92, .12], [.86, .26], [.74, .34], [.66, .46], [.60, .60], [.52, .70], [.44, .80], [.32, .86], [.24, .98]];
    const mx = W * .08, my = H * .36, mw = W * .84, mh = H * .56;
    const p = eInOut(inv(.1, 1.0, lt));
    ctx.save(); ctx.beginPath(); shape.forEach(([x, y], i) => i ? ctx.lineTo(mx + x * mw, my + y * mh) : ctx.moveTo(mx + x * mw, my + y * mh)); ctx.closePath();
    ctx.fillStyle = hexA(C.deep, .45 * p); ctx.fill();
    ctx.setLineDash([3000 * u * p, 3000 * u]); ctx.strokeStyle = C.neon; ctx.lineWidth = 5 * u; ctx.shadowColor = C.neon; ctx.shadowBlur = 24 * u; ctx.stroke(); ctx.restore();
    const cities = [['Воркута', .86, .14], ['Ухта', .52, .50], ['Сосногорск', .44, .58], ['Сыктывкар', .22, .82]];
    cities.forEach(([n, x, y], i) => {
      const q = inv(1.0 + i * .45, 1.3 + i * .45, lt); if (q <= 0) return;
      const px = mx + x * mw, py = my + y * mh;
      rings(lt - (1.0 + i * .45), px, py, 2, .4, 1.4, 120);
      ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = C.neon; ctx.shadowBlur = 30 * u; ctx.beginPath(); ctx.arc(px, py, 14 * u * eBack(q), 0, 7); ctx.fill(); ctx.restore();
      const right = x < .6;
      text(n, px + (right ? 30 : -30) * u, py, 40 * u, { w: 800, align: right ? 'left' : 'right', alpha: q });
    });
  } },
  { d: 3, draw(lt) {
    const y = H * .6;
    ctx.save(); ctx.translate(CX, y); ctx.rotate(lt * 1.2); icon('gear', 0, 0, 340 * u, { lw: 5 }); ctx.restore();
    ctx.save(); ctx.translate(CX, y); ctx.rotate(-lt * 1.2); icon('gear', 0, 0, 150 * u, { lw: 8, alpha: .6 }); ctx.restore();
    title(['ВНЕДРЕНИЕ', { t: 'ДЕЛАЕМ САМИ', c: C.neon }], TOP + 40 * u, 130 * u, .05, lt);
  } },
  { d: 4, final: true, draw(lt) { finale(lt, 'ХОЧУ ТАК ЖЕ →'); } },
] };

/* ===================== РОЛИК 4 «Мы рядом, а не колл-центр» ===================== */
const SHARDS = (() => { const r = rng(9); const a = []; for (let i = 0; i < 14; i++) for (let j = 0; j < 8; j++) a.push({ i, j, vx: (r() - .5) * 2, vy: -r() * 1.5 - .3, rot: (r() - .5) * 6 }); return a; })();
function dullWindow(x, y, w, h, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = '#C9CDD2'; rrect(x, y, w, h, 14 * u); ctx.fill();
  ctx.fillStyle = '#A9AEB5'; ctx.fillRect(x, y, w, 64 * u);
  text('Уведомление', x + 30 * u, y + 32 * u, 28 * u, { w: 600, color: '#2F3338' });
  text('✕', x + w - 46 * u, y + 32 * u, 30 * u, { w: 500, color: '#2F3338' });
  ['Ваша заявка №48213 принята.', 'Ответ в течение', '3 рабочих дней'].forEach((s, i) => text(s, x + w / 2, y + 150 * u + i * 56 * u, 40 * u, { w: 500, color: '#2F3338', align: 'center' }));
  ctx.fillStyle = '#8D939B'; rrect(x + w / 2 - 110 * u, y + h - 100 * u, 220 * u, 64 * u, 8 * u); ctx.fill();
  text('ОК', x + w / 2, y + h - 68 * u, 30 * u, { w: 700, color: '#fff', align: 'center' });
  ctx.restore();
}
const WIN = { x: W * .08, y: H * .4, w: W * .84, h: H * .26 };
const V4 = { name: 'my-ryadom', shots: [
  { d: 3, mood: .05, hit: 0, bg() { ctx.fillStyle = 'rgba(60,64,70,.85)'; ctx.fillRect(0, 0, W, H); }, draw(lt) {
    const p = eOut3(inv(.1, .6, lt));
    ctx.save(); ctx.translate(0, (1 - p) * 60 * u); dullWindow(WIN.x, WIN.y, WIN.w, WIN.h, p); ctx.restore();
    // крутилка ожидания
    ctx.save(); ctx.translate(CX, WIN.y + WIN.h + 140 * u); ctx.rotate(lt * 5); ctx.strokeStyle = '#B5BAC1'; ctx.lineWidth = 8 * u; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 40 * u, 0, 4.4); ctx.stroke(); ctx.restore();
    const s = fit('ФЕДЕРАЛЬНАЯ CRM', W * .86, 110 * u);
    glow('ФЕДЕРАЛЬНАЯ CRM', CX, TOP + 40 * u, s, { color: '#D9DCE0', gl: '#000', ga: .2, alpha: inv(.3, .8, lt) });
  } },
  { d: 2, mood: .3, hit: 2, bg(lt) { ctx.fillStyle = `rgba(60,64,70,${.85 * (1 - inv(.5, 1.2, lt))})`; ctx.fillRect(0, 0, W, H); }, draw(lt) {
    const crack = inv(0, .45, lt), boom = inv(.45, 1.9, lt);
    if (boom <= 0) {
      dullWindow(WIN.x, WIN.y, WIN.w, WIN.h);
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4 * u; ctx.shadowColor = C.neon; ctx.shadowBlur = 16 * u;
      const cx0 = WIN.x + WIN.w * .55, cy0 = WIN.y + WIN.h * .45;
      for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283 + .3; let x = cx0, y = cy0; ctx.beginPath(); ctx.moveTo(x, y);
        const L = (180 + hash(k) * 300) * u * crack; for (let s = 1; s <= 4; s++) { x = cx0 + Math.cos(a + (hash(k * s) - .5) * .5) * L * s / 4; y = cy0 + Math.sin(a + (hash(k + s) - .5) * .5) * L * s / 4; ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.restore(); return;
    }
    const sw = WIN.w / 14, sh = WIN.h / 8;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    SHARDS.forEach(s => {
      const x = WIN.x + s.i * sw + s.vx * boom * 700 * u, y = WIN.y + s.j * sh + (s.vy * boom * 900 + boom * boom * 400) * u;
      const col = boom < .25 ? '#C9CDD2' : C.neon, sz = lerp(1, .25, boom);
      ctx.save(); ctx.translate(x + sw / 2, y + sh / 2); ctx.rotate(s.rot * boom); ctx.globalAlpha = 1 - boom;
      ctx.fillStyle = col; ctx.shadowColor = C.neon; ctx.shadowBlur = 20 * u; ctx.fillRect(-sw * sz / 2, -sh * sz / 2, sw * sz, sh * sz); ctx.restore();
    });
    ctx.restore();
    rings(lt - .45, CX, WIN.y + WIN.h / 2, 3, .2, 1.4, 800);
  } },
  { d: 4, draw(lt) {
    const y = H * .58, drop = eOut5(inv(.1, .55, lt));
    rings(lt - .5, CX, y + 70 * u, 4, .45, 1.8, 520);
    ctx.save(); ctx.globalAlpha = .4; ctx.strokeStyle = C.neon; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.ellipse(CX, y + 80 * u, 120 * u * drop, 30 * u * drop, 0, 0, 7); ctx.stroke(); ctx.restore();
    icon('pin', CX, lerp(y - 600 * u, y - 40 * u, drop), 260 * u, { lw: 7, glow: 1.5 });
    title([{ t: 'МЫ В УХТЕ', c: C.neon }], TOP + 30 * u, 160 * u, .4, lt, { rgb: 30 });
    sub('ул. Октябрьская, 21 — заезжайте на кофе', H * .8, 40 * u, 1.0, lt);
  } },
  { d: 4, draw(lt) {
    title(['ПРИЕДЕМ', { t: 'И НАСТРОИМ', c: C.neon }], TOP + 20 * u, 130 * u, .1, lt);
    const y = H * .6, xa = W * .14, xb = W * .82;
    ctx.save(); ctx.strokeStyle = hexA(C.neon, .4); ctx.lineWidth = 6 * u; ctx.setLineDash([26 * u, 18 * u]); ctx.lineDashOffset = lt * 60 * u;
    ctx.beginPath(); ctx.moveTo(xa, y + 50 * u); ctx.lineTo(xb, y + 50 * u); ctx.stroke(); ctx.restore();
    iconTile('club', xb, y - 10 * u, 200 * u, lt, .2, 'Ваш клуб');
    const p = eInOut(inv(.5, 2.5, lt)), bob = Math.sin(lt * 18) * 3 * u * (p < 1 ? 1 : 0);
    icon('car', lerp(xa, xb - 200 * u, p), y + 12 * u + bob, 180 * u, { lw: 7 });
    for (let k = 0; k < 4 && p < 1 && p > 0; k++) { ctx.save(); ctx.globalAlpha = .5 - k * .1; ctx.fillStyle = C.neon; ctx.fillRect(lerp(xa, xb - 200 * u, p) - 120 * u - k * 40 * u, y + (k % 2 ? 0 : 20) * u, 30 * u, 4 * u); ctx.restore(); }
    if (p >= 1) { const q = eBack(inv(2.5, 2.9, lt)); ctx.save(); ctx.translate(xb, y - 170 * u); ctx.scale(q, q); icon('check', 0, 0, 90 * u, { lw: 10 }); ctx.restore(); }
  } },
  { d: 4, draw(lt) {
    title(['ПЕРЕНЕСЁМ БАЗУ ·', { t: 'ОБУЧИМ АДМИНОВ', c: C.neon }], TOP + 20 * u, 96 * u, .1, lt);
    const y = H * .58, xs = [W * .2, W * .5, W * .8], names = ['db', 'gear', 'cap'], labels = ['Перенос базы', 'Настройка', 'Обучение'];
    xs.forEach((x, i) => {
      iconTile(names[i], x, y, 210 * u, lt, .4 + i * .5, labels[i]);
      if (i < 2) { const p = eOut3(inv(.7 + i * .5, 1.0 + i * .5, lt)); if (p > 0) { ctx.save(); ctx.strokeStyle = C.neon; ctx.lineWidth = 6 * u; ctx.shadowColor = C.neon; ctx.shadowBlur = 16 * u; ctx.lineCap = 'round';
        const a = x + 120 * u, b = lerp(a, xs[i + 1] - 120 * u, p); ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.lineTo(b - 16 * u, y - 14 * u); ctx.moveTo(b, y); ctx.lineTo(b - 16 * u, y + 14 * u); ctx.stroke(); ctx.restore(); } }
    });
  } },
  { d: 3, draw(lt) {
    title(['ПОДДЕРЖКА — ЛЮДИ,', { t: 'А НЕ БОТ', c: C.neon }], TOP + 20 * u, 100 * u, .05, lt);
    const x = W * .1, w = W * .8;
    const p1 = eOut3(inv(.2, .5, lt)), typing = lt > .6 && lt < 1.2, p2 = eOut3(inv(1.2, 1.5, lt)), p3 = inv(1.7, 2.0, lt);
    if (p1 > 0) { ctx.save(); ctx.globalAlpha = p1; ctx.translate(0, (1 - p1) * 30 * u);
      ctx.fillStyle = 'rgba(255,255,255,.1)'; rrect(x + w * .3, H * .44, w * .7, 130 * u, 34 * u); ctx.fill();
      text('Не получается добавить', x + w * .35, H * .44 + 44 * u, 34 * u, { w: 500 }); text('тренера 😕', x + w * .35, H * .44 + 90 * u, 34 * u, { w: 500 }); ctx.restore(); }
    if (typing) { for (let k = 0; k < 3; k++) { ctx.fillStyle = hexA(C.neon, .4 + .6 * Math.abs(Math.sin(lt * 8 + k))); ctx.beginPath(); ctx.arc(x + 60 * u + k * 34 * u, H * .58, 10 * u, 0, 7); ctx.fill(); } }
    if (p2 > 0) { ctx.save(); ctx.globalAlpha = p2; ctx.translate(0, (1 - p2) * 30 * u); ctx.shadowColor = C.neon; ctx.shadowBlur = 40 * u;
      ctx.fillStyle = C.neon; rrect(x, H * .555, w * .72, 120 * u, 34 * u); ctx.fill(); ctx.shadowBlur = 0;
      text('Сейчас решим', x + 40 * u, H * .555 + 62 * u, 46 * u, { w: 800, color: C.bg }); ctx.restore();
      emoji('👍', x + 40 * u + 360 * u, H * .555 + 60 * u, 50 * u, p2);
      ui.mini(ctx, x - 0 * u + 40 * u, H * .555 + 180 * u, 50 * u); text('Команда · поддержка', x + 80 * u, H * .555 + 180 * u, 30 * u, { w: 600, color: C.mint, alpha: p2 }); }
    if (p3 > 0) { ctx.save(); ctx.translate(x + w * .72 - 20 * u, H * .555 - 10 * u); ctx.scale(eBack(p3), eBack(p3));
      ctx.fillStyle = '#fff'; rrect(-150 * u, -30 * u, 300 * u, 60 * u, 30 * u); ctx.fill(); text('⏱ через 5 минут', 0, 2 * u, 30 * u, { w: 800, color: C.deep, align: 'center' }); ctx.restore(); }
  } },
  { d: 4, final: true, draw(lt) { finale(lt, 'ПОЗВОНИТЕ НАМ →'); } },
] };

const VIDEOS = { 1: V1, 2: V2, 3: V3, 4: V4 };
defineVideo(VIDEOS[+Q.get('v') || 1]);
window.VIDEO_NAME = VIDEO.name;
startPlayer();
