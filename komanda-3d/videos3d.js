/* 4 ролика «Команда» — сценарии по брифу. Данные в интерфейсе — демонстрационные. */

/* ---------- общие экраны ---------- */
function todayList(sc, items, id = '') {
  const list = el('div', '', sc);
  return items.map(([tm, h, m], i) => { const it = el('div', 'item row', list, `<div class="time">${tm}</div><div><div class="h">${h}</div><div class="m">${m}</div></div>`); if (id) it.id = id + i; return it; });
}
function word3d(parent, text, size, color = '#fff') {
  return el('div', 'p3 c', parent, `<div style="font-weight:900;font-size:${size}px;color:${color};white-space:nowrap;text-shadow:0 0 40px rgba(61,220,151,.35)">${text}</div>`);
}
function popIn(e, lt, a, b = a + .45) { const p = inv(a, b, lt); e.style.opacity = clamp(p * 3); return eBack(p); }

/* ==================== РОЛИК 1 «Тетрадь против приложения» (22 с) ==================== */
const V1 = { name: 'tetrad-protiv-prilozheniya', d: 22, final: 18,
  headlines: [
    { a: .15, b: 2.5, lines: [[['Тренер,', 92]], [['ты', 76, 700], ['ещё', 76, 700], ['записываешь', 76, 700]], [['клиентов', 76, 700], ['в', 76, 700], ['тетрадь?', 104, 900, 1]]] },
    { a: 4.0, b: 6.9, lines: [[['Всё', 130], ['в', 130]], [['одном', 130], ['месте', 130, 900, 1]]] },
    { a: 7.5, b: 12.7, lines: [[['Расписание', 112, 900, 1]], [['на', 84, 600], ['неделю', 84, 600]]] },
    { a: 13.3, b: 17.7, lines: [[['Журнал', 120, 900, 1], ['занятий', 120]], [['без', 84, 600], ['тетради', 84, 600]]] },
    { a: 18.2, b: 21.9, lines: [[['Для', 80, 600], ['тренеров', 80, 600], ['Коми', 80, 600]], [['бесплатно', 124, 900, 1]]] },
  ],
  subs: [[.4, 3.7, 'Тетрадь, чаты, заметки: клиенты теряются.'], [4.1, 7, 'В «Команде» всё в одном месте:'], [7.5, 12.6, 'расписание, клиенты и журнал.'],
    [13.4, 17.6, 'Для тренеров подключение бесплатное.'], [18.4, 21.7, 'Заявка по ссылке.']],
  camera: t => ({ rx: 6 - t * .2, ry: -10 + t * 1.1 }),
  cursor: [
    { t: 14.1, sel: '#v1row2', enter: true, move: .9 },
    { t: 14.5, sel: '#v1row2', click: true, move: .2 },
    { t: 15.9, sel: '#v1check', click: true, move: .7 },
    { t: 20.0, sel: '.finalbtn', click: true, move: 1.0, fx: .4 },
    { t: 20.3, sel: '.finalbtn', hide: true, move: .1, fx: .4 },
  ],
  sfx: [[1.6, 'pop'], [3.0, 'paper'], [8.0, 'pop'], [16.0, 'chime']],
  scenes: [
    { a: 0, b: 4.1, setup(r) {
        const nb = el('div', 'p3 c', r); r._nb = nb; nb.style.width = '600px'; nb.style.height = '760px';
        for (let i = 1; i <= 8; i++) el('div', '', nb).style.cssText = `position:absolute;width:600px;height:760px;border-radius:26px;background:#0B5D3A;transform:translateZ(${-i * 4}px)`;
        const page = (cls = '') => {
          const p = el('div', cls, nb, `<div style="font-weight:500;font-style:italic;font-size:38px;color:#2B3A55;line-height:76px;padding:64px 50px 0 90px">
            <div>Пн 9:00 — Аня</div><div style="position:relative">18:00 Петров<span class="strike" style="position:absolute;left:-6px;top:38px;height:5px;background:#E2455E;border-radius:3px"></span></div>
            <div>Ира — 19:30 ??</div><div>Маша долг 1500!</div><div style="transform:rotate(-4deg)">перенести Олега→ср</div><div>где номер Кати??</div></div>`);
          p.style.cssText = `position:absolute;width:600px;height:760px;border-radius:22px;background:#FFF9EC;box-shadow:0 30px 70px rgba(0,0,0,.45);
            background-image:repeating-linear-gradient(0deg, transparent 0 74px, #C9DAF2 74px 76px), linear-gradient(90deg, transparent 0 66px, #F3A0A8 66px 69px, transparent 69px);background-position:0 54px,0 0`;
          return p;
        };
        r._pages = [page(), page(), page()];
        r._sh = contactShadow(r, 620);
        r._bub = ['Можно перенести?', 'Я опоздаю на 10 мин', 'А завтра есть место?'].map(s => el('div', 'p3 c', r, `<div class="card" style="padding:22px 30px;font-weight:700;font-size:32px;border-radius:30px 30px 30px 8px;white-space:nowrap">${s}</div>`));
        r._note = el('div', 'p3 c', r, `<div style="width:240px;height:220px;background:#FFE58A;padding:26px;font-weight:600;font-style:italic;font-size:32px;color:#4A3B00;box-shadow:0 20px 40px rgba(0,0,0,.35)">позвонить Маше!!</div>`);
        r._word = word3d(r, 'Тетрадь, чаты, заметки', 92);
      }, update(lt) {
        const r = this.root, fly = inv(2.9, 4.1, lt);
        place(r._nb, 540, 1130 + Math.sin(lt * 1.3) * 8, 0, `rotateX(${24 - lt * 2}deg) rotateZ(${-8 + lt}deg) scale(.86)`);
        r._pages.forEach((p, i) => { const f = eIn3(clamp(fly * 1.4 - i * .2)); T(p, `translate3d(${f * (i - 1) * 500}px, ${-f * 700}px, ${f * 400 + i * 2}px) rotateY(${-f * 150}deg) rotateZ(${f * (i - 1) * 30}deg)`); p.style.opacity = 1 - f; });
        r._pages.forEach((p, i) => { const s = p.querySelector('.strike'); if (s) s.style.width = clamp((lt - 1.0) / .5) * 240 + 'px'; });
        place(r._sh, 540, 1560, -100, 'rotateX(80deg)'); r._sh.style.opacity = .8 - fly * .8;
        const bp = [[250, 760, 120], [820, 900, 220], [300, 1520, 260]];
        r._bub.forEach((b, i) => { const s = popIn(b, lt, .4 + i * .3); place(b, bp[i][0], bp[i][1] + Math.sin(lt * 2 + i) * 14, bp[i][2], `scale(${s}) rotateY(${Math.sin(lt + i) * 12}deg)`); b.style.opacity = Math.min(b.style.opacity, 1 - fly); });
        const ns = popIn(r._note, lt, 1.0); place(r._note, 860, 1420, 160, `rotate(${8 + Math.sin(lt * 1.7) * 3}deg) scale(${ns})`); r._note.style.opacity = Math.min(r._note.style.opacity, 1 - fly);
        const pw = eOut3(inv(1.5, 2.1, lt)); place(r._word, 540, 1480 + (1 - pw) * 60, 300, `scale(${lerp(.7, 1, pw)})`); r._word.style.opacity = pw * (1 - inv(2.6, 3.0, lt));
      } },
    { a: 4.1, b: 7.3, setup(r) {
        const ph = phone(r); r._ph = ph; const sc = ph.screen;
        appHead(sc, 'Сегодня', 'вт, 21 октября');
        r._items = todayList(sc, [['09:00', 'Анна С.', 'Персональная · зал 2'], ['12:30', 'Группа «Старт»', 'Функциональная · 8 чел.'], ['18:00', 'Олег П.', 'Силовая'], ['19:30', 'Ирина К.', 'Растяжка']]);
        r._sh = contactShadow(r, 520);
        r._fly = ['Можно перенести?', 'Я опоздаю на 10 мин', 'позвонить Маше!!'].map(s => el('div', 'p3 c', r, `<div class="card" style="padding:18px 26px;font-weight:700;font-size:28px;white-space:nowrap">${s}</div>`));
      }, update(lt) {
        const r = this.root, p = eOut3(inv(0, .9, lt));
        place(r._ph, 540, 1150 + (1 - p) * 600, 0, `rotateY(${(1 - p) * -40 + Math.sin(lt) * 8}deg) rotateX(${(1 - p) * 30 + 4}deg) scale(.8)`);
        place(r._sh, 540, 1600, -120, 'rotateX(80deg)');
        r._fly.forEach((f, i) => { const q = eIO(inv(.2 + i * .15, 1.1 + i * .15, lt)); const st = [[200, 700], [880, 820], [260, 1500]][i];
          place(f, lerp(st[0], 540, q), lerp(st[1], 1100, q), lerp(200, -50, q), `scale(${1 - q * .9})`); f.style.opacity = 1 - inv(.8, 1, q); });
        r._items.forEach((it, i) => { const s = eBack(inv(1.0 + i * .18, 1.5 + i * .18, lt)); it.style.opacity = clamp(s); T(it, `translateY(${(1 - s) * 40}px) scale(${.9 + .1 * s})`); });
      } },
    { a: 7.3, b: 13.1, setup(r) {
        const ph = phone(r); r._ph = ph; const sc = ph.screen;
        appHead(sc, 'Расписание', 'неделя 20–26 октября');
        const grid = el('div', '', sc); grid.style.cssText = 'position:relative;margin:4px 20px;height:820px';
        const days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
        days.forEach((d, i) => el('div', '', grid, d).style.cssText = `position:absolute;left:${i * 70 + 6}px;top:0;width:60px;text-align:center;font-weight:800;font-size:22px;color:#6B8579`);
        for (let h = 0; h < 7; h++) el('div', '', grid).style.cssText = `position:absolute;left:0;right:0;top:${50 + h * 110}px;height:2px;background:#E1ECE6`;
        const ev = [[0, 0, 1], [0, 4, 1], [1, 1, 1.4], [1, 5, 1], [2, 0, 1], [2, 3, 1], [3, 2, 1.4], [4, 0, 1], [4, 5, 1], [5, 1, 2], [6, 3, 1]];
        const cols = ['#3DDC97', '#9ADFC0', '#CFC3FF', '#FFC9A8', '#BDE3FF'];
        r._ev = ev.map(([d, h, len], i) => { const e = el('div', '', grid); e.style.cssText = `position:absolute;left:${d * 70 + 6}px;top:${62 + h * 110}px;width:60px;height:${len * 100}px;border-radius:14px;background:${cols[i % 5]};box-shadow:0 8px 16px rgba(0,0,0,.15)`; return e; });
        r._sh = contactShadow(r, 520);
      }, update(lt) {
        const r = this.root;
        place(r._ph, 540, 1150, 0, `rotateY(${-22 + lt * 6}deg) rotateX(${10 - lt}deg) scale(.8)`);
        place(r._sh, 540, 1600, -120, 'rotateX(80deg)');
        r._ev.forEach((e, i) => { const q = inv(.3 + i * .22, .8 + i * .22, lt), s = spring(q * 1.2);
          T(e, `translate3d(${(1 - s) * (i % 2 ? 300 : -300)}px, ${(1 - s) * -400}px, 0) rotate(${(1 - s) * 40}deg)`); e.style.opacity = clamp(q * 4); });
      } },
    { a: 13.1, b: 18.2, setup(r) {
        const ph = phone(r); r._ph = ph; const sc = ph.screen;
        appHead(sc, 'Сегодня', 'вт, 21 октября');
        r._items = todayList(sc, [['09:00', 'Анна С.', 'Персональная · зал 2'], ['12:30', 'Группа «Старт»', 'Функциональная'], ['18:00', 'Мария Л.', 'Силовая · абонемент 8/12'], ['19:30', 'Ирина К.', 'Растяжка']], 'v1row');
        const sheet = el('div', '', sc); r._sheet = sheet;
        sheet.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:650px;border-radius:44px 44px 0 0;background:#fff;box-shadow:0 -20px 50px rgba(0,0,0,.18);padding:34px 36px';
        sheet.innerHTML = `<div class="row"><div class="ava" style="width:110px;height:110px;--col:#FFC9A8"></div><div><div style="font-weight:900;font-size:40px">Мария Л.</div><div style="font-weight:500;font-size:24px;color:#6B8579">18:00 · Силовая</div></div></div>
          <div class="row" style="margin-top:34px;gap:14px"><span class="chip">Абонемент 8 из 12</span><span class="chip">Посещений <b class="cnt">24</b></span></div>
          <div class="row" style="margin-top:40px;padding:26px;border-radius:28px;background:#F2F7F4"><div style="flex:1"><div style="font-weight:800;font-size:30px">Отметка в журнале</div><div class="mk" style="font-weight:600;font-size:24px;color:#6B8579">не отмечено</div></div><div class="check" id="v1check"></div></div>
          <div class="toast" style="margin-top:30px;text-align:center;font-weight:800;font-size:28px;color:#0B5D3A;opacity:0">✓ Записано в журнал</div>`;
        r._sh = contactShadow(r, 520);
      }, update(lt) {
        const r = this.root;
        place(r._ph, 540, 1150, 0, `rotateY(${8 - lt * 3}deg) rotateX(6deg) scale(.8)`);
        place(r._sh, 540, 1600, -120, 'rotateX(80deg)');
        const hov = inv(.75, .95, lt) * (1 - inv(1.45, 1.6, lt));
        r._items[2].style.boxShadow = `0 6px 18px rgba(16,38,28,.08), 0 0 0 ${hov * 5}px #3DDC97`;
        T(r._items[2], `scale(${1 + hov * .03 - (lt > 1.4 && lt < 1.6 ? .02 : 0)})`);
        const op = eOut5(inv(1.45, 1.95, lt)); T(r._sheet, `translateY(${(1 - op) * 700}px)`);
        const done = lt >= 2.8; const c = $('#v1check');
        c.className = 'check' + (done ? ' on' : ''); c.innerHTML = done ? '<svg width="30" height="30" viewBox="0 0 30 30"><path d="M5 16 L12 23 L25 8" stroke="#02140D" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '';
        T(c, `scale(${done ? eBack(inv(2.8, 3.1, lt)) : 1})`);
        r._sheet.querySelector('.mk').textContent = done ? 'Пришла · 18:02' : 'не отмечено';
        r._sheet.querySelector('.mk').style.color = done ? '#0B5D3A' : '#6B8579';
        r._sheet.querySelector('.cnt').textContent = done ? '25' : '24';
        r._sheet.querySelector('.toast').style.opacity = inv(3.0, 3.3, lt);
      } },
    Object.assign({ a: 18.2, b: 22.5, press: 1.8 }, finaleScene('Заявка по ссылке', 'Для тренеров Коми — бесплатно')),
  ] };

/* ==================== РОЛИК 2 «Один день тренера» (26 с) ==================== */
function clock3d(parent) {
  const c = el('div', 'p3 c', parent);
  for (let i = 1; i <= 10; i++) el('div', '', c).style.cssText = `position:absolute;width:520px;height:520px;border-radius:50%;background:#C9EEDC;transform:translateZ(${-i * 4}px)`;
  const face = el('div', '', c); face.style.cssText = 'position:relative;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle at 35% 30%, #fff, #EAF7F0 60%, #CFE9DC);box-shadow:0 40px 90px rgba(0,0,0,.45), inset 0 -14px 30px rgba(0,0,0,.08)';
  for (let i = 0; i < 12; i++) { const tk = el('div', '', face); tk.style.cssText = `position:absolute;left:254px;top:24px;width:12px;height:${i % 3 ? 26 : 44}px;border-radius:6px;background:${i % 3 ? '#9DBFAE' : '#0B5D3A'};transform-origin:6px 236px;transform:rotate(${i * 30}deg)`; }
  c._h = el('div', '', face); c._h.style.cssText = 'position:absolute;left:252px;top:120px;width:16px;height:150px;border-radius:8px;background:#0B3B27;transform-origin:8px 140px';
  c._m = el('div', '', face); c._m.style.cssText = 'position:absolute;left:255px;top:66px;width:10px;height:204px;border-radius:5px;background:#3DDC97;transform-origin:5px 194px';
  el('div', '', face).style.cssText = 'position:absolute;left:240px;top:240px;width:40px;height:40px;border-radius:50%;background:#0B3B27';
  c.set = (hh, mm) => { T(c._h, `rotate(${(hh % 12) * 30 + mm * .5}deg)`); T(c._m, `rotate(${mm * 6}deg)`); };
  return c;
}
const V2 = { name: 'odin-den-trenera', d: 26, final: 21,
  headlines: [
    { a: .15, b: 2.9, lines: [[['Как', 84, 700], ['проходит', 84, 700]], [['день', 84, 700], ['тренера', 84, 700]], [['без', 112], ['хаоса?', 112, 900, 1]]] },
    { a: 3.3, b: 8.8, lines: [[['Сегодня', 96, 700]], [['три', 140, 900, 1], ['занятия', 140]]] },
    { a: 9.3, b: 14.8, lines: [[['Клиент', 124, 900, 1]], [['и', 84, 600], ['его', 84, 600], ['история', 84, 600]]] },
    { a: 15.3, b: 20.8, lines: [[['Вечером', 112, 900, 1]], [['видно,', 80, 600], ['как', 80, 600], ['прошло', 80, 600]]] },
    { a: 21.3, b: 25.9, lines: [[['Удобно', 96], ['тренеру,', 96, 900, 1]], [['понятно', 96], ['клиенту', 96, 900, 1]]] },
  ],
  subs: [[.4, 2.9, 'Утром открыл приложение:'], [3.3, 6.6, 'три занятия на экране.'], [9.4, 12.6, 'Днём провёл тренировку,'], [15.4, 18.8, 'клиентка отметила, как себя чувствует.'],
    [19, 20.9, 'Вечером всё на месте.'], [21.4, 25.6, '«Команда»: удобно тренеру, понятно клиенту.']],
  camera: t => ({ rx: 5, ry: Math.sin(t * .25) * 14 }),
  cursor: [
    { t: 4.9, sel: '#v2row0', enter: true, move: .8 },
    { t: 5.2, sel: '#v2row0', click: true, move: .2 },
    { t: 17.6, sel: '#v2mood3', enter: true, move: .9 },
    { t: 17.9, sel: '#v2mood3', click: true, move: .2 },
    { t: 23.6, sel: '.finalbtn', click: true, move: 1.0, fx: .4, enter: true },
    { t: 23.9, sel: '.finalbtn', hide: true, move: .1, fx: .4 },
  ],
  sfx: [[.6, 'tick'], [1.6, 'tick'], [10.2, 'pop'], [18.1, 'chime']],
  scenes: [
    { a: 0, b: 3.2, setup(r) { r._c = clock3d(r); r._sun = el('div', 'p3 sphere', r); r._sun.style.cssText += '--col:#FFE7A3;width:200px;height:200px'; r._w = word3d(r, 'Утро', 230); r._sh = contactShadow(r, 520); },
      update(lt) { const r = this.root, p = eOut3(inv(0, .8, lt));
        place(r._c, 540, 1150, 0, `rotateY(${-30 + lt * 14}deg) rotateX(${12}deg) scale(${lerp(.6, .9, eBack(p))})`); r._c.set(8, 52 + clamp(lt / 2) * 8);
        place(r._sun, 860, 760 - eOut3(inv(.2, 1.4, lt)) * 140, -200); place(r._w, 540, 1560, 200, `scale(${lerp(.6, 1, eOut3(inv(.6, 1.2, lt)))})`); r._w.style.opacity = inv(.6, 1, lt);
        place(r._sh, 540, 1500, -120, 'rotateX(80deg)'); } },
    { a: 3.2, b: 9.1, setup(r) { const ph = phone(r); r._ph = ph; appHead(ph.screen, 'Сегодня', 'вт, 21 октября');
        r._items = todayList(ph.screen, [['10:00', 'Анна С.', 'Персональная · зал 2'], ['13:00', 'Группа «Старт»', 'Функциональная · 8 чел.'], ['18:30', 'Олег П.', 'Силовая']], 'v2row');
        r._badge = el('div', 'p3 c', r, '<div style="width:170px;height:170px;border-radius:50%;background:#3DDC97;display:grid;place-items:center;font-weight:900;font-size:100px;color:#02140D;box-shadow:0 30px 60px rgba(61,220,151,.5)">3</div>');
        r._sh = contactShadow(r, 520); },
      update(lt) { const r = this.root, p = eOut3(inv(0, .9, lt));
        place(r._ph, 540, 1150 + (1 - p) * 500, 0, `rotateY(${-18 + lt * 4}deg) rotateX(6deg) scale(.8)`); place(r._sh, 540, 1600, -120, 'rotateX(80deg)');
        r._items.forEach((it, i) => { const s = eBack(inv(.6 + i * .3, 1.1 + i * .3, lt)); it.style.opacity = clamp(s); T(it, `translateX(${(1 - s) * 200}px)`); });
        const hl = inv(1.6, 1.8, lt) * (1 - inv(2.4, 2.8, lt)); r._items[0].style.boxShadow = `0 0 0 ${hl * 5}px #3DDC97`;
        const b = eBack(inv(1.8, 2.3, lt)); place(r._badge, 830, 760, 220, `scale(${b}) rotateY(${Math.sin(lt * 2) * 20}deg)`); r._badge.style.opacity = clamp(b); } },
    { a: 9.1, b: 15.1, setup(r) { const cd = el('div', 'p3 c card', r); r._cd = cd; cd.style.width = '780px'; cd.style.padding = '48px';
        cd.innerHTML = `<div class="row"><div class="ava" style="width:150px;height:150px;--col:#FFC9A8"></div><div><div style="font-weight:900;font-size:56px">Анна С.</div><div style="font-weight:500;font-size:28px;color:#6B8579">клиент с марта</div></div></div>
          <div class="row" style="margin-top:40px;gap:20px">${[['Занятий', 'n1', 0], ['Абонемент', 'n2', 0]].map(([a, c]) => `<div style="flex:1;padding:28px;border-radius:30px;background:#F2F7F4"><div style="font-weight:600;font-size:26px;color:#6B8579">${a}</div><div class="${c}" style="font-weight:900;font-size:64px;color:#0B5D3A">0</div></div>`).join('')}</div>
          <div style="margin-top:36px;font-weight:800;font-size:32px">История</div>
          ${[['18 окт', 'Силовая', 'пришла'], ['15 окт', 'Персональная', 'пришла'], ['11 окт', 'Функциональная', 'пришла']].map(([d, n, s]) => `<div class="row hist" style="margin-top:16px;padding:20px 24px;border-radius:24px;background:#F7FBF9"><div style="width:130px;font-weight:800;font-size:26px;color:#0B5D3A">${d}</div><div style="flex:1;font-weight:600;font-size:28px">${n}</div><div class="chip">✓ ${s}</div></div>`).join('')}`;
        r._sh = contactShadow(r, 700); },
      update(lt) { const r = this.root, p = eOut3(inv(0, .9, lt));
        place(r._cd, 540, 1130, 0, `rotateY(${(1 - p) * 50 + Math.sin(lt * .8) * 10}deg) rotateX(${8 + Math.sin(lt * .6) * 4}deg) scale(${lerp(.7, 1, p)})`); place(r._sh, 540, 1640, -150, 'rotateX(80deg)');
        r._cd.querySelector('.n1').textContent = Math.round(24 * eOut3(inv(.8, 2.2, lt)));
        r._cd.querySelector('.n2').textContent = Math.round(8 * eOut3(inv(1.0, 2.2, lt))) + ' / 12';
        r._cd.querySelectorAll('.hist').forEach((h, i) => { const s = eOut3(inv(1.6 + i * .3, 2.1 + i * .3, lt)); h.style.opacity = s; T(h, `translateY(${(1 - s) * 30}px)`); }); } },
    { a: 15.1, b: 21.1, setup(r) { r._c = clock3d(r); const ph = phone(r); r._ph = ph; appHead(ph.screen, 'Тренировка', 'Силовая · 18:30');
        el('div', '', ph.screen, `<div style="margin:60px 30px 0;font-weight:900;font-size:46px;text-align:center">Как вы сегодня?</div>
          <div class="row" style="justify-content:center;gap:12px;margin-top:50px">${['😫', '🙁', '😐', '🙂', '😄'].map((e, i) => `<div id="v2mood${i}" class="mood" style="width:84px;height:84px;border-radius:50%;display:grid;place-items:center;font-size:56px;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.08)">${e}</div>`).join('')}</div>
          <div class="sent" style="margin:70px 40px 0;padding:30px;border-radius:30px;background:#E3F1EA;text-align:center;font-weight:800;font-size:32px;color:#0B5D3A;opacity:0">Тренер увидит вашу отметку</div>`);
        r._note = el('div', 'p3 c card', r, `<div class="row" style="padding:24px 30px;gap:16px"><div class="ava" style="width:76px;height:76px;--col:#FFC9A8"></div><div><div style="font-weight:800;font-size:30px">Анна С. · 18:30</div><div style="font-weight:600;font-size:26px;color:#0B5D3A">🙂 хорошо</div></div></div>`);
        r._sh = contactShadow(r, 520); },
      update(lt) { const r = this.root;
        place(r._c, 300, 640, -350, `rotateY(${20 + lt * 6}deg) scale(.55)`); r._c.set(lerp(18, 19, clamp(lt / 5)), (lt * 12) % 60);
        place(r._ph, 600, 1170, 0, `rotateY(${-14 + lt * 2}deg) rotateX(5deg) scale(.78)`); place(r._sh, 600, 1610, -120, 'rotateX(80deg)');
        const sel = lt >= 2.8; document.querySelectorAll('.mood').forEach((m, i) => { m.style.opacity = sel && i !== 3 ? .35 : 1; T(m, `scale(${sel && i === 3 ? 1.25 : 1})`); m.style.boxShadow = sel && i === 3 ? '0 0 0 6px #3DDC97' : '0 6px 16px rgba(0,0,0,.08)'; });
        r._ph.screen.querySelector('.sent').style.opacity = inv(3.0, 3.3, lt);
        const n = eBack(inv(3.6, 4.1, lt)); place(r._note, 330, 1520, 260, `scale(${n}) rotateY(${12}deg)`); r._note.style.opacity = clamp(n); } },
    Object.assign({ a: 21.1, b: 26.5, press: 2.5 }, finaleScene('Подключиться', 'Ссылка в описании')),
  ] };

/* ==================== РОЛИК 3 «Клиент видит прогресс» (24 с) ==================== */
function figure(parent, col, h = 420) {
  const f = el('div', 'p3 c', parent, `<div style="position:relative;width:${h * .5}px;height:${h}px">
    <div class="sphere" style="--col:${col};position:absolute;left:${h * .1}px;top:0;width:${h * .3}px;height:${h * .3}px"></div>
    <div class="pill" style="--col:${col};position:absolute;left:0;top:${h * .33}px;width:${h * .5}px;height:${h * .67}px"></div></div>`);
  return f;
}
function medal(parent, col, title, sub) {
  const m = el('div', 'p3 c', parent);
  for (let i = 1; i <= 8; i++) el('div', '', m).style.cssText = `position:absolute;left:60px;width:220px;height:220px;border-radius:50%;background:color-mix(in srgb, ${col} 60%, #6B5200);transform:translateZ(${-i * 3}px)`;
  m.innerHTML += `<div style="position:relative;width:340px;text-align:center"><div style="margin:0 auto;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle at 35% 30%, #fff, ${col} 45%, color-mix(in srgb, ${col} 70%, #6B5200));box-shadow:0 30px 60px rgba(0,0,0,.45);display:grid;place-items:center;font-weight:900;font-size:80px;color:#5A4500">${sub}</div>
    <div class="card" style="margin-top:22px;padding:18px 20px;font-weight:800;font-size:30px;border-radius:24px">${title}</div></div>`;
  return m;
}
const V3 = { name: 'klient-vidit-progress', d: 24, final: 20.5,
  headlines: [
    { a: .15, b: 3.9, lines: [[['Почему', 84, 700], ['клиенты', 84, 700], ['уходят?', 84, 700]], [['Не', 92], ['видят', 92]], [['результата', 112, 900, 1]]] },
    { a: 4.4, b: 10.8, lines: [[['В', 84, 600], ['приложении', 84, 600], ['виден', 84, 600]], [['прогресс', 140, 900, 1]]] },
    { a: 11.3, b: 16.8, lines: [[['Награды', 130, 900, 1]], [['за', 88, 600], ['занятия', 88, 600]]] },
    { a: 17.2, b: 20.4, lines: [[['Клиент', 110], ['остаётся', 110]], [['с', 130], ['вами', 130, 900, 1]]] },
  ],
  subs: [[.4, 3.9, 'Клиенты уходят, когда не видят результата.'], [4.4, 10.2, 'В «Команде» клиент видит свой прогресс'], [11.4, 16, 'и получает награды за занятия.'], [17.4, 21, 'Так проще остаться с вами.']],
  camera: t => ({ rx: 6, ry: -12 + t * .9 }),
  cursor: [
    { t: 6.3, sel: '#v3tab1', enter: true, move: .8 },
    { t: 6.6, sel: '#v3tab1', click: true, move: .2 },
    { t: 22.3, sel: '.finalbtn', click: true, move: 1.0, fx: .4, enter: true },
    { t: 22.6, sel: '.finalbtn', hide: true, move: .1, fx: .4 },
  ],
  sfx: [[1.2, 'pop'], [12, 'chime'], [12.8, 'chime'], [13.6, 'chime']],
  scenes: [
    { a: 0, b: 4.2, setup(r) {
        const mir = el('div', 'p3 c', r); r._mir = mir; mir.style.width = '460px'; mir.style.height = '780px';
        for (let i = 1; i <= 8; i++) el('div', '', mir).style.cssText = `position:absolute;width:460px;height:780px;border-radius:230px 230px 40px 40px;background:#C9B98F;transform:translateZ(${-i * 4}px)`;
        el('div', '', mir).style.cssText = 'position:relative;width:460px;height:780px;border-radius:230px 230px 40px 40px;border:22px solid #EAD9A8;background:linear-gradient(160deg, #DDF3EA, #9CC9B6 70%, #7FB39E);box-shadow:0 40px 90px rgba(0,0,0,.5)';
        r._fig = figure(r, '#BDE3FF', 380); r._q = el('div', 'p3 c', r, '<div class="sphere" style="--col:#FFE7A3;width:190px;height:190px;display:grid;place-items:center;font-weight:900;font-size:130px;color:#6B5200">?</div>');
        r._sh = contactShadow(r, 560);
      }, update(lt) { const r = this.root;
        place(r._mir, 600, 1130, -120, `rotateY(${-20 + lt * 5}deg) rotateX(4deg) scale(.86)`);
        place(r._fig, 420, 1260, 150, `rotateY(${Math.sin(lt * 1.5) * 15}deg) translateY(${Math.sin(lt * 2.4) * 6}px)`);
        const q = eBack(inv(1.0, 1.5, lt)); place(r._q, 300, 900 + Math.sin(lt * 2) * 16, 260, `scale(${q}) rotateY(${lt * 40}deg)`); r._q.style.opacity = clamp(q);
        place(r._sh, 520, 1590, -100, 'rotateX(80deg)'); } },
    { a: 4.2, b: 11.1, setup(r) { const ph = phone(r); r._ph = ph; const sc = ph.screen; appHead(sc, 'Мой прогресс', 'Анна С.');
        el('div', 'row', sc, '<span class="chip" id="v3tab0">Неделя</span><span class="chip" id="v3tab1">Месяц</span><span class="chip" id="v3tab2">Год</span>').style.cssText = 'gap:12px;padding:0 30px';
        const ch = el('div', '', sc); ch.style.cssText = 'margin:26px 24px 0;padding:24px;border-radius:30px;background:#fff;box-shadow:0 6px 18px rgba(16,38,28,.08)';
        ch.innerHTML = `<div style="font-weight:800;font-size:28px">Тренировки</div><svg viewBox="0 0 440 260" width="440" height="260" style="margin-top:10px"><defs><linearGradient id="gf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3DDC97" stop-opacity=".45"/><stop offset="1" stop-color="#3DDC97" stop-opacity="0"/></linearGradient></defs>
          <path class="area" fill="url(#gf)"/><polyline class="ln" fill="none" stroke="#14A06A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        r._ch = ch;
        r._stats = el('div', 'row', sc, ['Тренировок|s1', 'Присед, кг|s2'].map(s => { const [a, c] = s.split('|'); return `<div style="flex:1;padding:24px;border-radius:28px;background:#fff;box-shadow:0 6px 18px rgba(16,38,28,.08)"><div style="font-weight:600;font-size:22px;color:#6B8579">${a}</div><div class="${c}" style="font-weight:900;font-size:56px;color:#0B5D3A">0</div></div>`; }).join(''));
        r._stats.style.cssText = 'gap:16px;margin:20px 24px 0';
        r._sh = contactShadow(r, 520); },
      update(lt) { const r = this.root, p = eOut3(inv(0, .9, lt));
        place(r._ph, 540, 1150 + (1 - p) * 400, 0, `rotateY(${14 - lt * 3}deg) rotateX(6deg) scale(.8)`); place(r._sh, 540, 1600, -120, 'rotateX(80deg)');
        const month = lt >= 2.4; ['#v3tab0', '#v3tab1'].forEach((s, i) => $(s).className = 'chip' + ((i === 1) === month ? ' on' : ''));
        const pts = month ? [.15, .22, .2, .35, .42, .5, .62, .7, .85] : [.3, .35, .32, .4, .42];
        const g = eOut3(inv(month ? 2.5 : .8, month ? 4.6 : 2.0, lt)), n = pts.length;
        const xy = pts.map((v, i) => [20 + i * 400 / (n - 1), 240 - v * 220 * g]);
        r._ch.querySelector('.ln').setAttribute('points', xy.map(a => a.join(',')).join(' '));
        r._ch.querySelector('.area').setAttribute('d', `M20,240 L${xy.map(a => a.join(',')).join(' L')} L420,240 Z`);
        r._ph.screen.querySelector('.s1').textContent = Math.round(lerp(8, 32, eOut3(inv(2.6, 4.8, lt))));
        r._ph.screen.querySelector('.s2').textContent = Math.round(lerp(60, 80, eOut3(inv(2.8, 5.0, lt))));
      } },
    { a: 11.1, b: 17.0, setup(r) { r._m = [medal(r, '#FFE7A3', '10 тренировок', '10'), medal(r, '#BFF5DD', 'Месяц без пропусков', '30'), medal(r, '#FFC9A8', 'Первая цель', '★')]; r._sh = contactShadow(r, 900); },
      update(lt) { const r = this.root; const xs = [230, 540, 850];
        r._m.forEach((m, i) => { const s = eBack(inv(.5 + i * .8, 1.1 + i * .8, lt)); place(m, xs[i], 1150 + (i === 1 ? -60 : 40) + Math.sin(lt * 2 + i) * 10, i === 1 ? 120 : 0, `scale(${s * .82}) rotateY(${(1 - clamp(s)) * 180 + Math.sin(lt * 1.2 + i) * 16}deg)`); m.style.opacity = clamp(s * 2); });
        place(r._sh, 540, 1560, -100, 'rotateX(80deg)'); } },
    { a: 17.0, b: 20.6, setup(r) { r._a = figure(r, '#3DDC97', 460); r._b = figure(r, '#FFC9A8', 400); r._hi = el('div', 'p3 c', r, '<div style="font-size:120px">🙌</div>'); r._sh = contactShadow(r, 700); },
      update(lt) { const r = this.root, p = eOut3(inv(0, .8, lt));
        place(r._a, 360 + (1 - p) * -200, 1230, 0, `rotateY(${20}deg) translateY(${Math.abs(Math.sin(lt * 4)) * -14}px)`); place(r._b, 720 + (1 - p) * 200, 1260, 0, `rotateY(-20deg) translateY(${Math.abs(Math.sin(lt * 4 + 1)) * -14}px)`);
        const h = eBack(inv(1.0, 1.4, lt)); place(r._hi, 540, 900, 150, `scale(${h})`); r._hi.style.opacity = clamp(h);
        place(r._sh, 540, 1620, -80, 'rotateX(80deg)'); } },
    Object.assign({ a: 20.6, b: 24.5, press: 1.7 }, finaleScene('Заявка по ссылке', 'Прогресс и награды — в приложении')),
  ] };

/* ==================== РОЛИК 4 «Для клуба и каталог тренеров» (25 с) ==================== */
function trainerCard(parent, name, spec, col, rating) {
  return el('div', 'p3 c card', parent, `<div style="width:520px;padding:34px">
    <div style="height:300px;border-radius:28px;background:linear-gradient(160deg, ${col}, color-mix(in srgb, ${col} 50%, #0B5D3A));display:grid;place-items:end center;overflow:hidden"><div class="ava" style="width:240px;height:260px;border-radius:120px 120px 0 0;--col:${col};margin-bottom:-10px"></div></div>
    <div style="margin-top:22px;font-weight:900;font-size:44px">${name}</div><div style="font-weight:500;font-size:26px;color:#6B8579">${spec}</div>
    <div class="row" style="margin-top:18px;gap:10px;flex-wrap:wrap"><span class="chip">🎓 Диплом</span><span class="chip">Сертификат</span><span class="chip on">★ ${rating}</span></div></div>`);
}
const V4 = { name: 'dlya-kluba-katalog', d: 25, final: 18,
  headlines: [
    { a: .15, b: 2.4, lines: [[['Хотите,', 80, 700], ['чтобы', 80, 700]], [['вас', 112], ['находили?', 112, 900, 1]]] },
    { a: 2.6, b: 4.2, lines: [[['Тренеры', 92, 700], ['и', 92, 700], ['клубы', 92, 700]], [['вашего', 92, 700], ['города', 92, 900, 1]]] },
    { a: 4.6, b: 10.8, lines: [[['Каталог', 140, 900, 1]], [['тренеров', 110]]] },
    { a: 11.4, b: 17.7, lines: [[['Приложение', 96], ['клубу', 96]], [['бесплатно', 130, 900, 1]]] },
    { a: 18.2, b: 21.6, lines: [[['Внедрение', 84, 700], ['и', 84, 700], ['сопровождение', 84, 700]], [['по', 110], ['желанию', 110, 900, 1]]] },
  ],
  subs: [[.4, 2.5, 'Хотите, чтобы вас находили?'], [2.7, 7.4, 'В «Команде» есть каталог тренеров и клубов вашего города.'], [11.5, 15.2, 'Приложение клубу бесплатно,'], [15.4, 17.8, 'внедрение по желанию.'], [19.6, 24.4, 'Заявка за минуту.']],
  camera: t => ({ rx: 4, ry: Math.sin(t * .3) * 10 }),
  cursor: [
    { t: 8.6, sel: '#v4next', enter: true, move: .8 },
    { t: 8.9, sel: '#v4next', click: true, move: .2 },
    { t: 22.0, sel: '.finalbtn', click: true, move: 1.0, fx: .4, enter: true },
    { t: 22.3, sel: '.finalbtn', hide: true, move: .1, fx: .4 },
  ],
  sfx: [[1.0, 'pop'], [1.4, 'pop'], [1.8, 'pop'], [2.2, 'pop'], [12.2, 'pop']],
  scenes: [
    { a: 0, b: 4.4, setup(r) {
        const map = el('div', 'p3 c', r); r._map = map;
        map.innerHTML = `<div style="width:1100px;height:1100px;border-radius:60px;background:#DDEFE5;box-shadow:0 60px 120px rgba(0,0,0,.5);position:relative;overflow:hidden">
          ${[[0, 300, 1100, 60], [0, 720, 1100, 46], [380, 0, 50, 1100], [760, 0, 60, 1100], [0, 520, 600, 30]].map(([x, y, w, h]) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:#fff"></div>`).join('')}
          <div style="position:absolute;left:470px;top:400px;width:240px;height:240px;border-radius:50%;background:#BFE8CF"></div>
          <div style="position:absolute;left:60px;top:860px;width:260px;height:160px;border-radius:40px;background:#BDE3FF"></div></div>`;
        r._pins = [[260, 230, 'Тренер'], [620, 470, 'Клуб'], [900, 820, 'Тренер'], [450, 880, 'Клуб']].map(([x, y, l], i) => {
          const p = el('div', 'p3 c', r, `<div style="text-align:center"><div class="card" style="display:inline-block;padding:10px 20px;font-weight:800;font-size:28px;border-radius:20px;margin-bottom:12px">${l}</div>
            <div class="sphere" style="--col:${i % 2 ? '#FFC9A8' : '#3DDC97'};width:90px;height:90px;margin:0 auto"></div><div style="width:0;height:0;margin:-14px auto 0;border-left:22px solid transparent;border-right:22px solid transparent;border-top:50px solid ${i % 2 ? '#E9A27C' : '#2BB57A'}"></div></div>`);
          p._x = x; p._y = y; return p; });
      }, update(lt) { const r = this.root;
        const tilt = 58 - lt * 2, rot = -10 + lt * 4;
        place(r._map, 540, 1180, -200, `rotateX(${tilt}deg) rotateZ(${rot}deg) scale(.9)`);
        r._pins.forEach((p, i) => { const d = spring(inv(1.0 + i * .4, 1.6 + i * .4, lt) * 1.1);
          // приблизительная проекция точки карты: держим метки над плоскостью
          const cx = 540 + (p._x - 550) * .9, cy = 1180 + (p._y - 550) * .9 * Math.cos(tilt * Math.PI / 180) - 60;
          place(p, cx, cy - (1 - d) * 300, 60, `scale(${clamp(d) * .9})`); p.style.opacity = clamp(d * 3); }); } },
    { a: 4.4, b: 11.2, setup(r) {
        r._cards = [['Андрей П.', 'Силовой тренинг · 7 лет', '#9ADFC0', '4.9'], ['Мария Л.', 'Функциональный тренинг', '#FFC9A8', '4.8'], ['Ольга К.', 'Йога и растяжка', '#CFC3FF', '4.9'], ['Игорь В.', 'Бокс', '#BDE3FF', '4.7']].map(a => trainerCard(r, ...a));
        r._next = el('div', 'p3 c', r, '<div class="btn" id="v4next" style="width:120px;height:120px;font-size:60px">→</div>');
      }, update(lt) { const r = this.root;
        const idx = lt < 4.5 ? eIO(inv(1.0, 1.8, lt)) + eIO(inv(2.4, 3.2, lt)) : 2 + eIO(inv(4.5, 5.2, lt));
        r._cards.forEach((c, i) => { const k = i - idx, a = k * 34;
          place(c, 540 + Math.sin(a * Math.PI / 180) * 520, 1120 + Math.abs(k) * 30, Math.cos(a * Math.PI / 180) * 300 - 300, `rotateY(${-a}deg) scale(.82)`);
          c.style.filter = `blur(${Math.min(8, Math.abs(k) * 4)}px)`; c.style.opacity = clamp(1.6 - Math.abs(k) * .5) * eOut3(inv(.1 + i * .1, .6 + i * .1, lt)); });
        place(r._next, 900, 1560, 200, `scale(${eBack(inv(3.6, 4.0, lt))})`); } },
    { a: 11.2, b: 18.0, setup(r) {
        const cd = el('div', 'p3 c card', r); r._cd = cd; cd.style.width = '820px'; cd.style.padding = '44px';
        cd.innerHTML = `<div class="row"><div class="logo" style="width:120px;height:120px;border-radius:30px;background:linear-gradient(145deg,#FFC9A8,#E9805A)"><span style="font-weight:900;font-size:50px;color:#fff">ВК</span></div>
          <div><div style="font-weight:900;font-size:54px">Ваш клуб</div><div style="font-weight:500;font-size:28px;color:#6B8579">в приложении «Команда»</div></div></div>
          <div style="margin-top:36px;font-weight:800;font-size:32px">Тренеры клуба</div>
          <div class="row tr" style="margin-top:18px;gap:18px">${['#9ADFC0', '#FFC9A8', '#CFC3FF', '#BDE3FF', '#FFE7A3'].map(c => `<div class="ava" style="width:110px;height:110px;--col:${c}"></div>`).join('')}</div>
          <div style="margin-top:36px;font-weight:800;font-size:32px">Расписание клуба</div>
          ${[['09:00', 'Функциональная', 'Мария Л.'], ['18:30', 'Силовая', 'Андрей П.'], ['20:00', 'Йога', 'Ольга К.']].map(([a, b, c]) => `<div class="row sl" style="margin-top:14px;padding:20px 24px;border-radius:24px;background:#F2F7F4"><div class="time">${a}</div><div style="flex:1;font-weight:700;font-size:28px">${b}</div><div style="font-weight:500;font-size:24px;color:#6B8579">${c}</div></div>`).join('')}`;
        r._sh = contactShadow(r, 760);
      }, update(lt) { const r = this.root, p = eOut3(inv(0, .9, lt));
        place(r._cd, 540, 1140, 0, `rotateY(${(1 - p) * -40 + Math.sin(lt * .7) * 9}deg) rotateX(${8 + Math.sin(lt * .5) * 3}deg) scale(${lerp(.7, .98, p)})`); place(r._sh, 540, 1660, -150, 'rotateX(80deg)');
        r._cd.querySelectorAll('.tr .ava').forEach((a, i) => { const s = eBack(inv(.8 + i * .15, 1.2 + i * .15, lt)); T(a, `scale(${s})`); });
        r._cd.querySelectorAll('.sl').forEach((a, i) => { const s = eOut3(inv(1.8 + i * .25, 2.3 + i * .25, lt)); a.style.opacity = s; T(a, `translateX(${(1 - s) * 80}px)`); }); } },
    Object.assign({ a: 18.0, b: 25.5, press: 4.0 }, finaleScene('Заявка за 1 минуту', 'Ссылка в описании')),
  ] };

const ALL = { 1: V1, 2: V2, 3: V3, 4: V4 };
build(ALL[+Q.get('v') || 1]);
Promise.all([document.fonts.load('900 50px Rubik'), document.fonts.load('500 50px Rubik'), document.fonts.load('italic 500 50px Rubik')]).then(() => {
  fitHeads(); seek(0); window.READY = true;
  if (!Q.get('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % V.d); requestAnimationFrame(loop); })(); }
});
