// Отбор клиентов для SMM из выгрузки Parser2GIS (CSV).
// Запуск: node leads.js выгрузка1.csv [выгрузка2.csv ...]
// Результат: leads.csv (открывается в Excel) — компании, отсортированные по шансу купить SMM.
const fs = require('fs');

// --- CSV (запятая, кавычки, переносы внутри кавычек) ---
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...data] = rows;
  return data.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] || '').trim()])));
}
// значения колонки вида «ВКонтакте», «ВКонтакте 1», «ВКонтакте 2»…
const vals = (o, name) => Object.keys(o).filter(k => k === name || k.startsWith(name + ' ')).map(k => o[k]).filter(Boolean);

// Ниши, где SMM в ВК реально приводит клиентов (чем выше вес — тем приоритетнее)
const NICHES = [
  [/салон красоты|парикмахер|маникюр|ногтев|бров|ресниц|косметолог|барбершоп|массаж|spa|спа/i, 3, 'красота'],
  [/фитнес|тренажер|йога|танц|растяжк|пилатес|бассейн|единоборств|спортивн/i, 3, 'спорт/танцы'],
  [/стоматолог|медицинский центр|клиника|косметология/i, 2, 'медицина/стоматология'],
  [/детск|развивающ|школа|курсы|репетитор|языков|творчеств/i, 2, 'дети/обучение'],
  [/кафе|ресторан|кофейн|пиццер|суши|доставка еды|кондитер|пекарн/i, 2, 'еда'],
  [/цвет|флорист|подарк|декор|фотостуди|фотограф|ивент|праздник/i, 2, 'цветы/праздники'],
  [/мебел|ремонт|окна|потолк|двер|кухни на заказ/i, 1, 'ремонт/мебель'],
  [/автосервис|шиномонтаж|автомой|детейлинг/i, 1, 'авто'],
];
const SKIP = /банкомат|сбербанк|почта россии|аптека|магнит|пятерочка|пятёрочка|ozon|wildberries|пункт выдачи|администрац|отделение|госуслуг|мфц/i;

function score(o) {
  const why = [];
  let s = 0;
  const text = `${o['Наименование'] || ''} ${o['Рубрики'] || ''}`;
  if (SKIP.test(text)) return null;
  const niche = NICHES.find(([re]) => re.test(text));
  if (niche) { s += niche[1]; why.push(niche[2]); }
  const vk = vals(o, 'ВКонтакте'), site = vals(o, 'Веб-сайт'), tg = vals(o, 'Telegram'), wa = vals(o, 'WhatsApp'), ph = vals(o, 'Телефон');
  if (vk.length) { s += 3; why.push('есть ВК — значит, соцсети им важны'); } else { s += 1; why.push('нет ВК — предложить создать с нуля'); }
  if (!site.length) { s += 1; why.push('нет сайта — ВК станет главной витриной'); }
  const rating = parseFloat((o['Рейтинг'] || '').replace(',', '.')) || 0;
  const reviews = parseInt(o['Количество отзывов'] || '0', 10) || 0;
  if (reviews >= 30) { s += 2; why.push(`${reviews} отзывов — бизнес живой, есть клиенты и деньги`); }
  else if (reviews >= 10) { s += 1; why.push(`${reviews} отзывов`); }
  if (rating >= 4.6) { s += 1; why.push(`рейтинг ${rating} — есть чем гордиться в контенте`); }
  if (rating && rating < 4.0) { s -= 1; why.push(`рейтинг ${rating} — сначала проблемы с сервисом`); }
  if (!ph.length && !wa.length && !tg.length && !vk.length) return null;   // не связаться
  return { s, why, vk, site, ph, wa, tg, rating, reviews, niche: niche ? niche[2] : '' };
}

const files = process.argv.slice(2);
if (!files.length) { console.log('Укажи файл: node leads.js выгрузка.csv'); process.exit(1); }
const seen = new Set(), out = [];
for (const f of files) for (const o of parseCSV(fs.readFileSync(f, 'utf8'))) {
  const key = (o['Наименование'] + '|' + (o['Адрес'] || '')).toLowerCase();
  if (seen.has(key)) continue; seen.add(key);
  const r = score(o); if (r) out.push({ o, ...r });
}
out.sort((a, b) => b.s - a.s || b.reviews - a.reviews);

const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
const head = ['Место', 'Балл', 'Ниша', 'Название', 'Адрес', 'ВКонтакте', 'Телефон', 'WhatsApp', 'Telegram', 'Сайт', 'Рейтинг', 'Отзывов', 'Почему', 'Проверить вручную (2 мин)', 'Статус', 'Дата контакта'];
const lines = [head.map(esc).join(';')];
out.forEach((r, i) => lines.push([i + 1, r.s, r.niche, r.o['Наименование'], r.o['Адрес'], r.vk.join(' '), r.ph.join(' '), r.wa.join(' '), r.tg.join(' '),
  r.site.join(' '), r.rating || '', r.reviews || '', r.why.join('; '),
  r.vk.length ? 'Когда последний пост? Сколько подписчиков? Есть обложка/меню/товары?' : 'Есть ли ВК под другим названием? Instagram?', '', ''].map(esc).join(';')));
fs.writeFileSync('leads.csv', '﻿' + lines.join('\r\n'));
console.log(`Компаний после фильтра: ${out.length}. Топ-5:`);
out.slice(0, 5).forEach((r, i) => console.log(`${i + 1}. [${r.s}] ${r.o['Наименование']} — ${r.why.join('; ')}`));
console.log('Сохранено в leads.csv');
