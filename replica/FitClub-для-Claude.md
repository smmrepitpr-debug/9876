# FitClub — готовые функции фитнес-клуба для встраивания в своё приложение

> **Инструкция для Claude.** Это готовый рабочий код двух приложений фитнес-клуба
> (клиент — по образцу Mobifitness, тренер — по образцу «Тренер 1С:Фитнес клуб») с общим сервером.
> Задача: перенести нужные функции в МОЁ приложение. Сначала посмотри мой проект
> (язык, фреймворк, база, авторизация), затем:
> 1. Составь список функций ниже и спроси, какие из них переносить.
> 2. Перенеси модель данных (раздел «Таблицы») в мою базу — миграциями моего проекта.
> 3. Перенеси бизнес-правила (раздел «Правила») и API в мой бэкенд, в моём стиле кода.
> 4. Экраны сделай на моём UI-стеке; код ниже — эталон поведения, не копируй его стиль слепо.
> 5. Заглушки (оплата, SMS, push) оставь заглушками и скажи, что нужно подключить.
> Если у меня проекта ещё нет — код ниже запускается как есть: Node.js 22.5+, без зависимостей.

## Как запустить как есть
```
mkdir -p fitclub/public
# сохранить server.js и public/index.html из этого файла, затем:
cd fitclub && node server.js
```
- Клиент: http://localhost:3000/ — выбрать город и клуб; вход по телефону, код показывается на экране (тестовый режим).
- Тренер: http://localhost:3000/#trainer — демо 79990000001 / 1234.

## Функции — приложение клиента
- Первый запуск: выбор города → клуба (списком / на карте, расстояние от пользователя).
- Без входа: расписание, клубы, тренеры, новости, магазин, звонок в клуб, заявка «Стать членом клуба».
- Вход по номеру телефона + одноразовый код, обязательные согласия (правила/ПД, оферта).
- «Мой клуб»: баннер новостей, загруженность клуба (входы за 90 мин), кнопки, ближайшие тренировки.
- Расписание: неделя, фильтр по направлению, «Свободных мест X из Y», запись/отмена (не позже чем за 2 ч),
  лист ожидания с автозаписью при освобождении места; запись без абонемента помечается «не оплачено».
- Персональные тренировки: тренер → свободные слоты → запись; отмена.
- Магазин: разделы-аккордеоны (безлимитные, детские, лимитные, онлайн, персональные, разовые), поиск, покупка со счёта.
- Личный кабинет: счёт и пополнение, абонементы (срок, остаток, заморозка/разморозка), записи, клубная карта (QR),
  история посещений, операции, удаление аккаунта.
- Мои тренировки, Мои достижения, Персональный тренинг, Уведомления, Обратная связь, О приложении.
- Страница клуба: звезда «мой клуб», позвонить, маршрут, поделиться, описание, часы работы.

## Функции — приложение тренера
- Шапка с клубом и переключением клубов (тренер может работать в нескольких).
- Главная: занятия сегодня, ближайшие, последние уведомления.
- Занятия: день (‹ вчера | сегодня | завтра ›), календарь месяца с точками, поиск по занятиям и людям,
  метка «Не оплачено», кнопка «+» — новое персональное.
- Групповое: отметка «пришёл/нет», гость без записи; посещение списывает занятие лимитного абонемента.
- Персональное: проведено / неявка (списывают из пакета) / отменить / перенести.
- Клиенты: все / избранные, поиск от 3 символов или по № карты, карточка: заметка, пакет, история,
  запись, предложение пакета (клиенту приходит уведомление).
- Профиль: уведомления (запись клиента → уведомление тренеру со ссылкой на занятие), рабочее время по дням,
  список достижений, статистика и начисления (ставки в server.js), выход.

## Правила (бизнес-логика)
- Отмена групповой записи — не позже чем за 2 часа; освободилось место → первый из листа ожидания записывается и получает уведомление.
- Покрытие занятия: безлимит (sessions_left IS NULL) → ничего не списываем; лимитный/разовый → −1 при отметке «пришёл».
- Персональная: запись только при пакете с остатком; «проведено»/«неявка» → −1 из пакета; слот тренера занят, если пересекается
  с другой персональной (±1 ч) или его групповым занятием.
- Заморозка: дни вычитаются из лимита и добавляются к сроку; досрочная разморозка возвращает неиспользованные дни.
- Код входа: 4 цифры, живёт 5 мин, максимум 5 попыток. Номер сотрудника в клиентское приложение не пускается.
- Пароли — scrypt с солью; сессии — случайный токен в заголовке Authorization: Bearer.

## Что подключить перед запуском (сейчас заглушки)
- Оплата: /api/topup зачисляет без оплаты → ЮKassa/CloudPayments + webhook.
- SMS-код: при отсутствии SMS_PROVIDER код возвращается в ответе (test_code) → убрать, подключить SMS.ru и т.п.
- Вход через Telegram и «по звонку», push-уведомления, сканер QR на ресепшене, интеграция с 1С — не реализованы.

## API
```
GET /api/clubs  доступ: все
GET /api/clubs/:id  доступ: все
POST /api/auth/code  доступ: все
POST /api/auth/verify  доступ: все
POST /api/register  доступ: все
POST /api/login  доступ: все
POST /api/logout  доступ: any
GET /api/me  доступ: any
PATCH /api/me  доступ: any
DELETE /api/me  доступ: client
GET /api/home  доступ: client
GET /api/schedule  доступ: все (с входом — персонально)
POST /api/classes/:id/book  доступ: client
POST /api/classes/:id/cancel  доступ: client
GET /api/trainers  доступ: все (с входом — персонально)
GET /api/trainers/:id/slots  доступ: все (с входом — персонально)
POST /api/personal  доступ: any
POST /api/personal/:id/cancel  доступ: client
GET /api/products  доступ: все (с входом — персонально)
GET /api/my-trainings  доступ: client
GET /api/achievements  доступ: client
POST /api/feedback  доступ: client
POST /api/join  доступ: все
POST /api/products/:id/buy  доступ: client
POST /api/memberships/:id/freeze  доступ: client
POST /api/topup  доступ: client
GET /api/transactions  доступ: client
GET /api/visits  доступ: client
POST /api/checkin  доступ: client
GET /api/news  доступ: все (с входом — персонально)
GET /api/notifications  доступ: any
GET /api/trainer/day  доступ: trainer
GET /api/trainer/month  доступ: trainer
GET /api/trainer/home  доступ: trainer
GET /api/trainer/hours  доступ: trainer
PUT /api/trainer/hours  доступ: trainer
GET /api/trainer/achievements  доступ: trainer
POST /api/trainer/favorites/:id  доступ: trainer
GET /api/trainer/classes/:id  доступ: trainer
POST /api/trainer/bookings/:id/mark  доступ: trainer
POST /api/trainer/classes/:id/guest  доступ: trainer
GET /api/trainer/personal/:id  доступ: trainer
POST /api/trainer/personal/:id/status  доступ: trainer
POST /api/trainer/personal/:id/move  доступ: trainer
GET /api/trainer/clients  доступ: trainer
GET /api/trainer/clients/:id  доступ: trainer
PUT /api/trainer/clients/:id/note  доступ: trainer
POST /api/trainer/clients/:id/sell  доступ: trainer
GET /api/trainer/products  доступ: trainer
GET /api/trainer/stats  доступ: trainer
```

## Таблицы
```sql
CREATE TABLE IF NOT EXISTS clubs(id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, address TEXT, phone TEXT);
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, phone TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN('client','trainer','admin')), pass TEXT NOT NULL, balance INTEGER NOT NULL DEFAULT 0,
  spec TEXT, price INTEGER, club_id INTEGER REFERENCES clubs(id));
CREATE TABLE IF NOT EXISTS trainer_clubs(trainer_id INTEGER REFERENCES users(id), club_id INTEGER REFERENCES clubs(id), PRIMARY KEY(trainer_id,club_id));
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS classes(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), trainer_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL, room TEXT, start TEXT NOT NULL, minutes INTEGER NOT NULL DEFAULT 60, cap INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS classes_start ON classes(club_id,start);
CREATE TABLE IF NOT EXISTS bookings(id INTEGER PRIMARY KEY, class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id), guest TEXT,
  status TEXT NOT NULL CHECK(status IN('booked','waitlist','attended','missed','cancelled')), created TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_once ON bookings(class_id,user_id) WHERE status<>'cancelled' AND user_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS personal(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), trainer_id INTEGER NOT NULL REFERENCES users(id),
  client_id INTEGER NOT NULL REFERENCES users(id), start TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN('planned','done','missed','cancelled')));
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN('membership','pack','single')), category TEXT DEFAULT 'Абонементы', price INTEGER NOT NULL, days INTEGER, sessions INTEGER, freeze_days INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS memberships(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), product_id INTEGER NOT NULL REFERENCES products(id),
  club_id INTEGER NOT NULL, until TEXT, sessions_left INTEGER, freeze_left INTEGER DEFAULT 0, frozen_until TEXT, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transactions(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL, title TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), club_id INTEGER NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS news(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), title TEXT NOT NULL, body TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), text TEXT NOT NULL, read INTEGER DEFAULT 0, created TEXT NOT NULL, link_type TEXT, link_id INTEGER);
CREATE TABLE IF NOT EXISTS favorites(trainer_id INTEGER NOT NULL, client_id INTEGER NOT NULL, PRIMARY KEY(trainer_id,client_id));
CREATE TABLE IF NOT EXISTS work_hours(trainer_id INTEGER NOT NULL, weekday INTEGER NOT NULL, start TEXT, end TEXT, PRIMARY KEY(trainer_id,weekday));
CREATE TABLE IF NOT EXISTS login_codes(phone TEXT PRIMARY KEY, code TEXT NOT NULL, expires TEXT NOT NULL, tries INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS feedback(id INTEGER PRIMARY KEY, user_id INTEGER, club_id INTEGER, kind TEXT NOT NULL, name TEXT, phone TEXT, text TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notes(trainer_id INTEGER NOT NULL, client_id INTEGER NOT NULL, text TEXT NOT NULL, PRIMARY KEY(trainer_id,client_id));
```

## Код: server.js
```javascript
// FitClub: backend for the client app and the trainer app. Node >= 22.5, no dependencies.
// Run: node server.js   (PORT, DB_PATH env vars optional)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = +process.env.PORT || 3000;
const db = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, 'fitclub.db'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');

db.exec(`
CREATE TABLE IF NOT EXISTS clubs(id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, address TEXT, phone TEXT);
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, phone TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN('client','trainer','admin')), pass TEXT NOT NULL, balance INTEGER NOT NULL DEFAULT 0,
  spec TEXT, price INTEGER, club_id INTEGER REFERENCES clubs(id));
CREATE TABLE IF NOT EXISTS trainer_clubs(trainer_id INTEGER REFERENCES users(id), club_id INTEGER REFERENCES clubs(id), PRIMARY KEY(trainer_id,club_id));
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS classes(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), trainer_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL, room TEXT, start TEXT NOT NULL, minutes INTEGER NOT NULL DEFAULT 60, cap INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS classes_start ON classes(club_id,start);
CREATE TABLE IF NOT EXISTS bookings(id INTEGER PRIMARY KEY, class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id), guest TEXT,
  status TEXT NOT NULL CHECK(status IN('booked','waitlist','attended','missed','cancelled')), created TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_once ON bookings(class_id,user_id) WHERE status<>'cancelled' AND user_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS personal(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), trainer_id INTEGER NOT NULL REFERENCES users(id),
  client_id INTEGER NOT NULL REFERENCES users(id), start TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN('planned','done','missed','cancelled')));
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN('membership','pack','single')), category TEXT DEFAULT 'Абонементы', price INTEGER NOT NULL, days INTEGER, sessions INTEGER, freeze_days INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS memberships(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), product_id INTEGER NOT NULL REFERENCES products(id),
  club_id INTEGER NOT NULL, until TEXT, sessions_left INTEGER, freeze_left INTEGER DEFAULT 0, frozen_until TEXT, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transactions(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL, title TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), club_id INTEGER NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS news(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), title TEXT NOT NULL, body TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), text TEXT NOT NULL, read INTEGER DEFAULT 0, created TEXT NOT NULL, link_type TEXT, link_id INTEGER);
CREATE TABLE IF NOT EXISTS favorites(trainer_id INTEGER NOT NULL, client_id INTEGER NOT NULL, PRIMARY KEY(trainer_id,client_id));
CREATE TABLE IF NOT EXISTS work_hours(trainer_id INTEGER NOT NULL, weekday INTEGER NOT NULL, start TEXT, end TEXT, PRIMARY KEY(trainer_id,weekday));
CREATE TABLE IF NOT EXISTS login_codes(phone TEXT PRIMARY KEY, code TEXT NOT NULL, expires TEXT NOT NULL, tries INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS feedback(id INTEGER PRIMARY KEY, user_id INTEGER, club_id INTEGER, kind TEXT NOT NULL, name TEXT, phone TEXT, text TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notes(trainer_id INTEGER NOT NULL, client_id INTEGER NOT NULL, text TEXT NOT NULL, PRIMARY KEY(trainer_id,client_id));
`);

for (const m of ['ALTER TABLE clubs ADD COLUMN phone TEXT', 'ALTER TABLE clubs ADD COLUMN lat REAL', 'ALTER TABLE clubs ADD COLUMN lng REAL', 'ALTER TABLE clubs ADD COLUMN description TEXT', 'ALTER TABLE clubs ADD COLUMN hours TEXT', "ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'Абонементы'"]) { try { db.exec(m); } catch (e) { /* column exists */ } }

// ---------- helpers ----------
const now = () => new Date().toISOString();
const q = (sql, ...a) => db.prepare(sql).all(...a);
const one = (sql, ...a) => db.prepare(sql).get(...a);
const run = (sql, ...a) => db.prepare(sql).run(...a);
function tx(fn) { db.exec('BEGIN'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } }
function hash(p, salt = crypto.randomBytes(16).toString('hex')) { return salt + ':' + crypto.scryptSync(p, salt, 32).toString('hex'); }
function check(p, h) { const [s, k] = h.split(':'); const a = Buffer.from(k, 'hex'), b = crypto.scryptSync(p, s, 32); return crypto.timingSafeEqual(a, b); }
const normPhone = p => String(p || '').replace(/\D/g, '').replace(/^8/, '7');
class E extends Error { constructor(code, msg) { super(msg); this.code = code; } }
const notify = (uid, text, linkType = null, linkId = null) => run('INSERT INTO notifications(user_id,text,created,link_type,link_id) VALUES(?,?,?,?,?)', uid, text, now(), linkType, linkId);
const MSK = { timeZone: 'Europe/Moscow' };
const dayRange = c => { const s = new Date(c.start), e = new Date(s.getTime() + c.minutes * 6e4), t = d => d.toLocaleTimeString('ru-RU', { ...MSK, hour: '2-digit', minute: '2-digit' });
  return `${s.toLocaleDateString('ru-RU', { ...MSK, day: 'numeric', month: 'long' })}, ${t(s)}–${t(e)}`; };
const fmt = iso => new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });

// ---------- seed ----------
if (!one('SELECT 1 x FROM clubs')) tx(() => {
  run("INSERT INTO clubs(name,city,address,phone) VALUES('FitClub Центр','Москва','ул. Примерная, 1','+74950000001'),('FitClub Север','Москва','пр. Тестовый, 15','+74950000002'),('FitClub Нева','Санкт-Петербург','наб. Демо, 7','+78120000003')");
  const H = JSON.stringify(['16:00-22:00', '16:00-22:00', '16:00-22:00', '16:00-22:00', '16:00-22:00', '09:00-21:00', '09:00-21:00']);
  const D = 'Фитнес-клуб с групповыми программами, тренажёрным залом и персональными тренировками. Удобная запись через приложение.';
  for (const [id, lat, lng] of [[1, 55.7558, 37.6176], [2, 55.8, 37.6], [3, 59.93, 30.33]]) run('UPDATE clubs SET lat=?,lng=?,description=?,hours=? WHERE id=?', lat, lng, D, H, id);
  const u = (phone, name, role, extra = {}) => run('INSERT INTO users(phone,name,role,pass,balance,spec,price,club_id) VALUES(?,?,?,?,?,?,?,?)',
    phone, name, role, hash('1234'), extra.balance || 0, extra.spec || null, extra.price || null, extra.club || 1).lastInsertRowid;
  const t1 = u('79990000001', 'Игорь Волков', 'trainer', { spec: 'Силовой, функциональный', price: 3000 });
  const t2 = u('79990000002', 'Анна Смирнова', 'trainer', { spec: 'Пилатес, стретчинг', price: 2500 });
  const t3 = u('79990000003', 'Мария Ким', 'trainer', { spec: 'Йога, сайкл', price: 2200 });
  for (const [t, c] of [[t1, 1], [t1, 2], [t2, 1], [t3, 1], [t3, 2]]) run('INSERT INTO trainer_clubs VALUES(?,?)', t, c);
  const c1 = u('79000000000', 'Алексей Петров', 'client', { balance: 8000 });
  const others = ['Ольга Петрова', 'Дмитрий Орлов', 'Светлана Лис', 'Павел Ершов'].map((n, i) => u('7900000000' + (i + 1), n, 'client', { balance: 2000 }));
  u('79990000099', 'Администратор', 'admin');
  const kinds = [['Пилатес', t2, 'Зал 2', 12], ['Йога', t3, 'Зал 3', 15], ['Функциональный тренинг', t1, 'Зал 1', 10], ['Сайкл', t3, 'Сайкл-студия', 14], ['Стретчинг', t2, 'Зал 2', 12], ['Кроссфит', t1, 'Зал 1', 8]];
  const base = new Date(); base.setUTCHours(0, 0, 0, 0);
  let n = 0;
  for (let d = -3; d < 14; d++) for (const h of [5, 7, 9, 15, 16, 18]) for (const club of [1, 2]) {
    const k = kinds[(n++) % kinds.length]; const s = new Date(base); s.setUTCDate(s.getUTCDate() + d); s.setUTCHours(h, club === 1 ? 0 : 30);
    const cid = run('INSERT INTO classes(club_id,trainer_id,name,room,start,cap) VALUES(?,?,?,?,?,?)', club, k[1], k[0], k[2], s.toISOString(), k[3]).lastInsertRowid;
    others.slice(0, n % 5).forEach(o => run("INSERT INTO bookings(class_id,user_id,status,created) VALUES(?,?,?,?)", cid, o, d < 0 ? 'attended' : 'booked', now()));
  }
  for (const club of [1, 2, 3]) {
    // Catalogue grouped like the original shop: unlimited, kids, limited, online, personal, single visit.
    const P = (cat, name, kind, price, days, sessions, freeze) => run('INSERT INTO products(club_id,category,name,kind,price,days,sessions,freeze_days) VALUES(?,?,?,?,?,?,?,?)', club, cat, name, kind, price, days, sessions, freeze);
    P('Безлимитные абонементы', 'Безлимит 1 месяц', 'membership', 6500, 30, null, 7);
    P('Безлимитные абонементы', 'Безлимит 12 месяцев', 'membership', 45000, 365, null, 60);
    P('Персональные тренировки', 'Пакет 10 персональных', 'pack', 25000, 90, 10, 0);
    P('Разовое занятие', 'Разовое посещение', 'single', 1200, 1, 1, 0);
    P('Безлимитные абонементы', 'Безлимит 3 месяца', 'membership', 18500, 90, null, 14);
    P('Детские абонементы до 14 лет', 'Детский: 4 занятия в месяц', 'membership', 1500, 30, 4, 0);
    P('Детские абонементы до 14 лет', 'Детский: 8 занятий в месяц', 'membership', 2600, 30, 8, 0);
    P('Лимитные абонементы', '4 занятия в месяц', 'membership', 1800, 30, 4, 0);
    P('Лимитные абонементы', '12 занятий в месяц', 'membership', 3900, 30, 12, 0);
    P('Онлайн-клуб', 'Онлайн-курс «Здоровая спина»', 'membership', 2900, 30, null, 0);
    P('Персональные тренировки', 'Пакет 4 персональных', 'pack', 4400, 30, 4, 0);
    P('Персональные тренировки', 'Разовая персональная', 'pack', 1500, 30, 1, 0);
    P('Персональные тренировки', 'Сплит-тренировка (на двоих)', 'pack', 2000, 30, 1, 0);
    run('INSERT INTO news(club_id,title,body,created) VALUES(?,?,?,?)', club, 'Приведи друга — неделя в подарок', 'Обоим участникам продлеваем абонемент на 7 дней.', now());
  }
  run('INSERT INTO news(club_id,title,body,created) VALUES(1,?,?,?)', 'Бассейн закрыт на санобработку', 'В субботу с 08:00 до 14:00.', now());
  const until = new Date(Date.now() + 200 * 864e5).toISOString();
  run('INSERT INTO memberships(user_id,product_id,club_id,until,freeze_left,created) VALUES(?,2,1,?,60,?)', c1, until, now());
  for (const o of [c1, ...others]) run('INSERT INTO memberships(user_id,product_id,club_id,until,sessions_left,created) VALUES(?,3,1,?,?,?)', o, until, o === c1 ? 6 : (o % 4), now());
  for (let i = 1; i <= 3; i++) run('INSERT INTO visits(user_id,club_id,at) VALUES(?,1,?)', c1, new Date(Date.now() - i * 2.3 * 864e5).toISOString());
  const p = (t, c, hours, st) => run('INSERT INTO personal(club_id,trainer_id,client_id,start,status) VALUES(1,?,?,?,?)', t, c, new Date(base.getTime() + hours * 36e5).toISOString(), st);
  p(t1, others[0], 6, 'planned'); p(t1, others[1], 14, 'planned'); p(t1, others[2], 32, 'planned'); p(t1, others[1], -40, 'done');
  run('INSERT INTO notes VALUES(?,?,?)', t1, others[0], 'Колено — без прыжков');
  run('INSERT INTO favorites VALUES(?,?)', t1, others[0]);
  const lastCls = one('SELECT * FROM classes WHERE trainer_id=? AND start>? ORDER BY start LIMIT 1', t1, now());
  if (lastCls) notify(t1, `Новая запись на «${lastCls.name}»: ${dayRange(lastCls)}. Записано 1 из ${lastCls.cap}`, 'class', lastCls.id);
  for (let w = 0; w < 5; w++) run("INSERT INTO work_hours VALUES(?,?,'08:00','21:00')", t1, w);
});

// ---------- domain ----------
function packOf(uid, club) { return one("SELECT m.* FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND m.club_id=? AND p.kind='pack' AND m.sessions_left>0 AND m.until>? ORDER BY m.until LIMIT 1", uid, club, now()); }
function activeMembership(uid, club) { return one("SELECT m.* FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND m.club_id=? AND p.kind IN('membership','single') AND m.until>? AND (m.frozen_until IS NULL OR m.frozen_until<?) AND (m.sessions_left IS NULL OR m.sessions_left>0)", uid, club, now(), now()); }
function classView(c, uid) {
  const booked = one("SELECT COUNT(*) n FROM bookings WHERE class_id=? AND status IN('booked','attended','missed')", c.id).n;
  const mine = uid ? one("SELECT status FROM bookings WHERE class_id=? AND user_id=? AND status<>'cancelled'", c.id, uid) : null;
  const t = c.trainer_id ? one('SELECT name FROM users WHERE id=?', c.trainer_id) : null;
  return { ...c, booked, trainer: t?.name, my: mine?.status || null };
}
function promoteWaitlist(classId) {
  const c = one('SELECT * FROM classes WHERE id=?', classId);
  const booked = one("SELECT COUNT(*) n FROM bookings WHERE class_id=? AND status='booked'", classId).n;
  if (booked >= c.cap) return;
  const w = one("SELECT * FROM bookings WHERE class_id=? AND status='waitlist' ORDER BY id LIMIT 1", classId);
  if (w) { run("UPDATE bookings SET status='booked' WHERE id=?", w.id); notify(w.user_id, `Место освободилось: вы записаны на «${c.name}» ${fmt(c.start)}`); }
}
const canTrainAt = (tid, club) => !!one('SELECT 1 x FROM trainer_clubs WHERE trainer_id=? AND club_id=?', tid, club);
function slotFree(tid, start, exceptId = 0) {
  const t = new Date(start).getTime();
  return !q("SELECT start FROM personal WHERE trainer_id=? AND status IN('planned','done') AND id<>?", tid, exceptId).some(p => Math.abs(new Date(p.start) - t) < 36e5)
    && !q('SELECT start,minutes FROM classes WHERE trainer_id=?', tid).some(c => { const s = new Date(c.start).getTime(); return t < s + c.minutes * 6e4 && t + 36e5 > s; });
}

// ---------- routes ----------
const routes = [];
const R = (method, pattern, role, fn) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), role, fn });

// Current load: people who checked in during the last 90 minutes.
const clubLoad = id => one('SELECT COUNT(*) n FROM visits WHERE club_id=? AND at>?', id, new Date(Date.now() - 90 * 6e4).toISOString()).n;
R('GET', '/api/clubs', null, () => q('SELECT * FROM clubs ORDER BY city,name').map(c => ({ ...c, load: clubLoad(c.id) })));
R('GET', '/api/clubs/:id', null, ({ params }) => { const c = one('SELECT * FROM clubs WHERE id=?', +params.id); if (!c) throw new E(404, 'Клуб не найден'); return { ...c, load: clubLoad(c.id), hours: c.hours ? JSON.parse(c.hours) : [] }; });
// Client sign-in: phone + one-time code (as in the original: no password). Without an SMS provider the code is returned in the response (test mode).
R('POST', '/api/auth/code', null, (_, b) => {
  const phone = normPhone(b.phone); if (phone.length !== 11) throw new E(400, 'Неверный номер телефона');
  if (!b.consent_rules || !b.consent_offer) throw new E(400, 'Нужно согласие с правилами и офертой');
  const code = String(crypto.randomInt(1000, 10000));
  run('INSERT INTO login_codes VALUES(?,?,?,0) ON CONFLICT(phone) DO UPDATE SET code=excluded.code, expires=excluded.expires, tries=0', phone, code, new Date(Date.now() + 5 * 6e4).toISOString());
  if (process.env.SMS_PROVIDER) { /* send code via your SMS provider here */ return { sent: true }; }
  console.log(`Код входа для +${phone}: ${code}`); return { sent: true, test_code: code };
});
R('POST', '/api/auth/verify', null, (_, b) => tx(() => {
  const phone = normPhone(b.phone), row = one('SELECT * FROM login_codes WHERE phone=?', phone);
  if (!row || row.expires < now()) throw new E(400, 'Код устарел, запросите новый');
  if (row.tries >= 5) throw new E(429, 'Слишком много попыток, запросите новый код');
  if (String(b.code) !== row.code) { run('UPDATE login_codes SET tries=tries+1 WHERE phone=?', phone); throw new E(400, 'Неверный код'); }
  run('DELETE FROM login_codes WHERE phone=?', phone);
  let u = one('SELECT * FROM users WHERE phone=?', phone);
  if (u && u.role !== 'client') throw new E(403, 'Это номер сотрудника — войдите в приложение тренера');
  if (!u) { const id = run("INSERT INTO users(phone,name,role,pass,club_id) VALUES(?,?,'client',?,?)", phone, String(b.name || 'Клиент').trim().slice(0, 80) || 'Клиент', hash(crypto.randomBytes(12).toString('hex')), +b.club_id || 1).lastInsertRowid; u = { id }; }
  else if (+b.club_id) run('UPDATE users SET club_id=? WHERE id=?', +b.club_id, u.id);
  return login(u.id);
}));
R('POST', '/api/register', null, (_, b) => {
  const phone = normPhone(b.phone); if (phone.length !== 11) throw new E(400, 'Неверный номер телефона');
  if (!b.name || String(b.name).trim().length < 2) throw new E(400, 'Укажите имя');
  if (!b.password || String(b.password).length < 4) throw new E(400, 'Пароль от 4 символов');
  if (one('SELECT 1 x FROM users WHERE phone=?', phone)) throw new E(409, 'Номер уже зарегистрирован');
  const id = run("INSERT INTO users(phone,name,role,pass,club_id) VALUES(?,?,'client',?,?)", phone, String(b.name).trim().slice(0, 80), hash(String(b.password)), +b.club_id || 1).lastInsertRowid;
  return login(id);
});
R('POST', '/api/login', null, (_, b) => {
  const u = one('SELECT * FROM users WHERE phone=?', normPhone(b.phone));
  if (!u || !check(String(b.password || ''), u.pass)) throw new E(401, 'Неверный телефон или пароль');
  if (b.role && b.role !== u.role && !(b.role === 'trainer' && u.role === 'admin')) throw new E(403, b.role === 'trainer' ? 'Это не учётная запись тренера' : 'Войдите в приложение тренера');
  return login(u.id);
});
function login(id) { const token = crypto.randomBytes(24).toString('hex'); run('INSERT INTO sessions VALUES(?,?,?)', token, id, now()); return { token }; }
R('POST', '/api/logout', 'any', (ctx) => { run('DELETE FROM sessions WHERE token=?', ctx.token); return { ok: true }; });
R('GET', '/api/me', 'any', ({ u }) => {
  const { pass, ...me } = u;
  if (u.role === 'trainer') me.clubs = q('SELECT c.* FROM clubs c JOIN trainer_clubs t ON t.club_id=c.id WHERE t.trainer_id=?', u.id);
  else me.club = one('SELECT * FROM clubs WHERE id=?', u.club_id);
  me.unread = one('SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read=0', u.id).n;
  return me;
});
R('PATCH', '/api/me', 'any', ({ u }, b) => {
  if (b.club_id && one('SELECT 1 x FROM clubs WHERE id=?', +b.club_id)) run('UPDATE users SET club_id=? WHERE id=?', +b.club_id, u.id);
  if (b.name) run('UPDATE users SET name=? WHERE id=?', String(b.name).slice(0, 80), u.id);
  return { ok: true };
});
R('DELETE', '/api/me', 'client', ({ u }) => tx(() => {
  for (const t of ['sessions', 'notifications', 'visits', 'transactions', 'memberships']) run(`DELETE FROM ${t} WHERE user_id=?`, u.id);
  run('DELETE FROM bookings WHERE user_id=?', u.id); run('DELETE FROM personal WHERE client_id=?', u.id); run('DELETE FROM notes WHERE client_id=?', u.id);
  run('DELETE FROM users WHERE id=?', u.id); return { ok: true };
}));

// --- client app ---
R('GET', '/api/home', 'client', ({ u }) => ({
  balance: u.balance,
  memberships: q('SELECT m.*,p.name,p.kind FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND m.club_id=? ORDER BY m.until DESC', u.id, u.club_id),
  upcoming: [
    ...q("SELECT c.*,b.status my FROM bookings b JOIN classes c ON c.id=b.class_id WHERE b.user_id=? AND b.status IN('booked','waitlist') AND c.start>? ORDER BY c.start", u.id, now()).map(c => ({ ...classView(c, u.id), type: 'class' })),
    ...q("SELECT p.*,t.name trainer FROM personal p JOIN users t ON t.id=p.trainer_id WHERE p.client_id=? AND p.status='planned' AND p.start>? ORDER BY p.start", u.id, now()).map(p => ({ ...p, type: 'personal', name: 'Персональная тренировка' })),
  ].sort((a, b) => a.start.localeCompare(b.start)),
  visits: one('SELECT COUNT(*) n FROM visits WHERE user_id=?', u.id).n,
}));
R('GET', '/api/schedule', 'opt', ({ u, query }) => {
  const club = +query.club || u?.club_id || 1; const from = new Date(query.date || Date.now()); from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from.getTime() + 864e5);
  return q('SELECT * FROM classes WHERE club_id=? AND start>=? AND start<? ORDER BY start', club, from.toISOString(), to.toISOString()).map(c => classView(c, u?.id));
});
R('POST', '/api/classes/:id/book', 'client', ({ u, params }) => tx(() => {
  const c = one('SELECT * FROM classes WHERE id=?', +params.id); if (!c) throw new E(404, 'Занятие не найдено');
  if (new Date(c.start) < new Date()) throw new E(400, 'Занятие уже прошло');
  if (one("SELECT 1 x FROM bookings WHERE class_id=? AND user_id=? AND status<>'cancelled'", c.id, u.id)) throw new E(409, 'Вы уже записаны');
  const booked = one("SELECT COUNT(*) n FROM bookings WHERE class_id=? AND status='booked'", c.id).n;
  const status = booked >= c.cap ? 'waitlist' : 'booked';
  run('INSERT INTO bookings(class_id,user_id,status,created) VALUES(?,?,?,?)', c.id, u.id, status, now());
  const paid = !!(activeMembership(u.id, c.club_id) || packOf(u.id, c.club_id));
  notify(u.id, (status === 'booked' ? `Вы записаны на «${c.name}» ${fmt(c.start)}` : `Вы в листе ожидания на «${c.name}» ${fmt(c.start)}`) + (paid ? '' : '. Занятие не оплачено — купите абонемент'));
  if (c.trainer_id && status === 'booked') notify(c.trainer_id, `Новая запись на «${c.name}»: ${dayRange(c)}. Записано ${one("SELECT COUNT(*) n FROM bookings WHERE class_id=? AND status='booked'", c.id).n} из ${c.cap}`, 'class', c.id);
  return { status, paid };
}));
R('POST', '/api/classes/:id/cancel', 'client', ({ u, params }) => tx(() => {
  const b = one("SELECT * FROM bookings WHERE class_id=? AND user_id=? AND status IN('booked','waitlist')", +params.id, u.id);
  if (!b) throw new E(404, 'Записи нет');
  const c = one('SELECT * FROM classes WHERE id=?', b.class_id);
  if (new Date(c.start) - Date.now() < 2 * 36e5 && b.status === 'booked') throw new E(400, 'Отмена возможна не позднее чем за 2 часа');
  run("UPDATE bookings SET status='cancelled' WHERE id=?", b.id); promoteWaitlist(c.id); return { ok: true };
}));
R('GET', '/api/trainers', 'opt', ({ u, query }) => q('SELECT u.id,u.name,u.spec,u.price FROM users u JOIN trainer_clubs t ON t.trainer_id=u.id WHERE t.club_id=?', +query.club || u?.club_id || 1));
R('GET', '/api/trainers/:id/slots', 'opt', ({ params, query }) => {
  const day = new Date(query.date || Date.now()); day.setUTCHours(0, 0, 0, 0);
  const res = [];
  for (let h = 4; h <= 18; h++) { const s = new Date(day.getTime() + h * 36e5); if (s > new Date() && slotFree(+params.id, s.toISOString())) res.push(s.toISOString()); }
  return res;
});
R('POST', '/api/personal', 'any', ({ u }, b) => tx(() => {
  // client books themself; trainer books a client
  const isTrainer = u.role === 'trainer';
  const trainer = isTrainer ? u.id : +b.trainer_id, client = isTrainer ? +b.client_id : u.id, club = +b.club_id || (isTrainer ? one('SELECT club_id FROM trainer_clubs WHERE trainer_id=?', u.id).club_id : u.club_id);
  if (isTrainer && b.club_id && !canTrainAt(u.id, club)) throw new E(403, 'Вы не работаете в этом клубе');
  if (!one("SELECT 1 x FROM users WHERE id=? AND role='client'", client)) throw new E(404, 'Клиент не найден');
  if (!canTrainAt(trainer, club)) throw new E(400, 'Тренер не работает в этом клубе');
  const start = new Date(b.start); if (isNaN(start) || start < new Date()) throw new E(400, 'Неверное время');
  if (!slotFree(trainer, start.toISOString())) throw new E(409, 'Это время занято');
  if (!packOf(client, club)) throw new E(402, 'Нет пакета персональных тренировок');
  const id = run("INSERT INTO personal(club_id,trainer_id,client_id,start,status) VALUES(?,?,?,?,'planned')", club, trainer, client, start.toISOString()).lastInsertRowid;
  const tn = one('SELECT name FROM users WHERE id=?', trainer).name;
  notify(client, `Персональная тренировка: ${tn}, ${fmt(start.toISOString())}`);
  if (!isTrainer) notify(trainer, `Новая запись на персональную: ${u.name}, ${fmt(start.toISOString())}`, 'personal', id);
  return { id };
}));
R('POST', '/api/personal/:id/cancel', 'client', ({ u, params }) => tx(() => {
  const p = one("SELECT * FROM personal WHERE id=? AND client_id=? AND status='planned'", +params.id, u.id); if (!p) throw new E(404, 'Не найдено');
  run("UPDATE personal SET status='cancelled' WHERE id=?", p.id); notify(p.trainer_id, `${u.name} отменил(а) тренировку ${fmt(p.start)}`); return { ok: true };
}));
R('GET', '/api/products', 'opt', ({ u, query }) => q("SELECT * FROM products WHERE club_id=? AND name LIKE ? ORDER BY category, price", +query.club || u?.club_id || 1, '%' + String(query.q || '') + '%'));
R('GET', '/api/my-trainings', 'client', ({ u }) => [
  ...q("SELECT c.id,c.name,c.start,c.minutes,c.room,t.name trainer,b.status FROM bookings b JOIN classes c ON c.id=b.class_id LEFT JOIN users t ON t.id=c.trainer_id WHERE b.user_id=? AND b.status<>'cancelled' ORDER BY c.start DESC LIMIT 60", u.id).map(x => ({ ...x, type: 'class' })),
  ...q("SELECT p.id,'Персональная тренировка' name,p.start,60 minutes,t.name trainer,p.status FROM personal p JOIN users t ON t.id=p.trainer_id WHERE p.client_id=? AND p.status<>'cancelled' ORDER BY p.start DESC LIMIT 60", u.id).map(x => ({ ...x, type: 'personal' })),
].sort((a, b) => b.start.localeCompare(a.start)));
R('GET', '/api/achievements', 'client', ({ u }) => {
  const visits = one('SELECT COUNT(*) n FROM visits WHERE user_id=?', u.id).n;
  const groups = one("SELECT COUNT(*) n FROM bookings WHERE user_id=? AND status='attended'", u.id).n;
  const pt = one("SELECT COUNT(*) n FROM personal WHERE client_id=? AND status='done'", u.id).n;
  return [['Первый визит', visits, 1], ['10 визитов', visits, 10], ['50 визитов', visits, 50], ['Первое групповое', groups, 1], ['20 групповых', groups, 20], ['Первая персональная', pt, 1], ['10 персональных', pt, 10]]
    .map(([title, have, need]) => ({ title, have: Math.min(have, need), need, done: have >= need }));
});
R('POST', '/api/feedback', 'client', ({ u }, b) => {
  const text = String(b.text || '').trim(); if (text.length < 3) throw new E(400, 'Напишите сообщение');
  run('INSERT INTO feedback(user_id,club_id,kind,name,phone,text,created) VALUES(?,?,?,?,?,?,?)', u.id, u.club_id, 'feedback', u.name, u.phone, text.slice(0, 3000), now());
  for (const a of q("SELECT id FROM users WHERE role='admin'")) notify(a.id, `Обратная связь от ${u.name}: ${text.slice(0, 200)}`);
  return { ok: true };
});
R('POST', '/api/join', null, (_, b) => {
  // "Стать членом клуба": a lead for the club's sales desk; works without an account.
  const phone = normPhone(b.phone), name = String(b.name || '').trim(), club = +b.club_id;
  if (phone.length !== 11 || name.length < 2 || !one('SELECT 1 x FROM clubs WHERE id=?', club)) throw new E(400, 'Укажите имя, телефон и клуб');
  run('INSERT INTO feedback(club_id,kind,name,phone,text,created) VALUES(?,?,?,?,?,?)', club, 'lead', name.slice(0, 80), phone, String(b.text || 'Хочу стать членом клуба').slice(0, 1000), now());
  for (const a of q("SELECT id FROM users WHERE role='admin'")) notify(a.id, `Заявка на членство: ${name}, +${phone}`);
  return { ok: true };
});
R('POST', '/api/products/:id/buy', 'client', ({ u, params }) => tx(() => {
  const p = one('SELECT * FROM products WHERE id=? AND club_id=?', +params.id, u.club_id); if (!p) throw new E(404, 'Нет такого товара');
  const bal = one('SELECT balance FROM users WHERE id=?', u.id).balance; if (bal < p.price) throw new E(402, 'Недостаточно средств, пополните счёт');
  run('UPDATE users SET balance=balance-? WHERE id=?', p.price, u.id);
  run('INSERT INTO transactions(user_id,amount,title,created) VALUES(?,?,?,?)', u.id, -p.price, p.name, now());
  run('INSERT INTO memberships(user_id,product_id,club_id,until,sessions_left,freeze_left,created) VALUES(?,?,?,?,?,?,?)', u.id, p.id, p.club_id, new Date(Date.now() + p.days * 864e5).toISOString(), p.sessions, p.freeze_days, now());
  notify(u.id, `Покупка: ${p.name}`); return { ok: true };
}));
R('POST', '/api/memberships/:id/freeze', 'client', ({ u, params }, b) => tx(() => {
  const m = one('SELECT * FROM memberships WHERE id=? AND user_id=?', +params.id, u.id); if (!m) throw new E(404, 'Не найдено');
  if (m.frozen_until && m.frozen_until > now()) { // unfreeze: return unused days
    const unused = Math.floor((new Date(m.frozen_until) - Date.now()) / 864e5);
    run('UPDATE memberships SET frozen_until=NULL, freeze_left=freeze_left+?, until=? WHERE id=?', unused, new Date(new Date(m.until) - unused * 864e5).toISOString(), m.id);
    return { ok: true };
  }
  const days = Math.max(1, Math.min(+b.days || 7, 90)); if (days > m.freeze_left) throw new E(400, `Доступно дней заморозки: ${m.freeze_left}`);
  run('UPDATE memberships SET frozen_until=?, freeze_left=freeze_left-?, until=? WHERE id=?', new Date(Date.now() + days * 864e5).toISOString(), days, new Date(new Date(m.until).getTime() + days * 864e5).toISOString(), m.id);
  return { ok: true };
}));
R('POST', '/api/topup', 'client', ({ u }, b) => {
  const a = Math.floor(+b.amount); if (!(a > 0 && a <= 100000)) throw new E(400, 'Сумма от 1 до 100 000 ₽');
  // Test-mode top-up. Replace with a payment provider (ЮKassa/CloudPayments) webhook in production.
  tx(() => { run('UPDATE users SET balance=balance+? WHERE id=?', a, u.id); run('INSERT INTO transactions(user_id,amount,title,created) VALUES(?,?,?,?)', u.id, a, 'Пополнение счёта', now()); });
  return { ok: true };
});
R('GET', '/api/transactions', 'client', ({ u }) => q('SELECT * FROM transactions WHERE user_id=? ORDER BY id DESC LIMIT 50', u.id));
R('GET', '/api/visits', 'client', ({ u }) => q('SELECT v.*,c.name club FROM visits v JOIN clubs c ON c.id=v.club_id WHERE user_id=? ORDER BY at DESC LIMIT 50', u.id));
R('POST', '/api/checkin', 'client', ({ u }) => {
  // In production the reception scanner calls this with the client's QR token.
  if (!activeMembership(u.id, u.club_id) && !packOf(u.id, u.club_id)) throw new E(402, 'Нет действующего абонемента');
  run('INSERT INTO visits(user_id,club_id,at) VALUES(?,?,?)', u.id, u.club_id, now()); return { ok: true };
});
R('GET', '/api/news', 'opt', ({ u, query }) => q('SELECT * FROM news WHERE club_id=? ORDER BY id DESC', +query.club || u?.club_id || 1));
R('GET', '/api/notifications', 'any', ({ u }) => { const r = q('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50', u.id); run('UPDATE notifications SET read=1 WHERE user_id=?', u.id); return r; });

// --- trainer app ---
R('GET', '/api/trainer/day', 'trainer', ({ u, query }) => {
  const from = new Date(query.date || Date.now()); from.setUTCHours(0, 0, 0, 0); const to = new Date(from.getTime() + 864e5);
  const club = +query.club || 0, term = String(query.q || '').toLowerCase();
  const unpaid = c => q("SELECT user_id FROM bookings WHERE class_id=? AND status='booked' AND user_id IS NOT NULL", c.id).some(b => !activeMembership(b.user_id, c.club_id) && !packOf(b.user_id, c.club_id));
  const classes = q('SELECT c.*,cl.name club FROM classes c JOIN clubs cl ON cl.id=c.club_id WHERE trainer_id=? AND start>=? AND start<? AND (?=0 OR club_id=?)', u.id, from.toISOString(), to.toISOString(), club, club)
    .map(c => ({ ...classView(c), type: 'class', unpaid: unpaid(c),
      people: q("SELECT u.name FROM bookings b JOIN users u ON u.id=b.user_id WHERE class_id=? AND b.status<>'cancelled'", c.id).map(x => x.name) }));
  const pers = q("SELECT p.*,u.name client,cl.name club FROM personal p JOIN users u ON u.id=p.client_id JOIN clubs cl ON cl.id=p.club_id WHERE trainer_id=? AND start>=? AND start<? AND status<>'cancelled' AND (?=0 OR p.club_id=?)", u.id, from.toISOString(), to.toISOString(), club, club)
    .map(p => ({ ...p, type: 'personal', minutes: 60, unpaid: !packOf(p.client_id, p.club_id) && p.status === 'planned' }));
  return [...classes, ...pers].filter(i => !term || [i.name, i.client, ...(i.people || [])].some(x => x && x.toLowerCase().includes(term))).sort((a, b) => a.start.localeCompare(b.start));
});
R('GET', '/api/trainer/month', 'trainer', ({ u, query }) => {
  // Days of the month that have at least one class or personal session (for calendar dots).
  const y = +query.y, m = +query.m, from = new Date(Date.UTC(y, m, 1)).toISOString(), to = new Date(Date.UTC(y, m + 1, 1)).toISOString();
  const rows = [...q('SELECT start FROM classes WHERE trainer_id=? AND start>=? AND start<?', u.id, from, to), ...q("SELECT start FROM personal WHERE trainer_id=? AND status<>'cancelled' AND start>=? AND start<?", u.id, from, to)];
  return [...new Set(rows.map(r => new Date(r.start).toLocaleDateString('sv-SE', MSK)))];
});
R('GET', '/api/trainer/home', 'trainer', ({ u }) => {
  const from = new Date(); const to = new Date(from.getTime() + 864e5 * 7);
  const next = [...q('SELECT id,name,start,minutes,room FROM classes WHERE trainer_id=? AND start>=? AND start<? ORDER BY start LIMIT 3', u.id, from.toISOString(), to.toISOString()).map(c => ({ ...c, type: 'class' })),
    ...q("SELECT p.id,u.name,p.start FROM personal p JOIN users u ON u.id=p.client_id WHERE trainer_id=? AND status='planned' AND start>=? ORDER BY start LIMIT 3", u.id, from.toISOString()).map(p => ({ ...p, minutes: 60, type: 'personal' }))]
    .sort((a, b) => a.start.localeCompare(b.start)).slice(0, 3);
  const d0 = new Date(); d0.setUTCHours(0, 0, 0, 0); const d1 = new Date(d0.getTime() + 864e5);
  const today = one('SELECT COUNT(*) n FROM classes WHERE trainer_id=? AND start>=? AND start<?', u.id, d0.toISOString(), d1.toISOString()).n
    + one("SELECT COUNT(*) n FROM personal WHERE trainer_id=? AND status<>'cancelled' AND start>=? AND start<?", u.id, d0.toISOString(), d1.toISOString()).n;
  return { next, today, notifications: q('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 3', u.id) };
});
R('GET', '/api/trainer/hours', 'trainer', ({ u }) => q('SELECT weekday,start,end FROM work_hours WHERE trainer_id=? ORDER BY weekday', u.id));
R('PUT', '/api/trainer/hours', 'trainer', ({ u }, b) => tx(() => {
  run('DELETE FROM work_hours WHERE trainer_id=?', u.id);
  for (const h of (Array.isArray(b.hours) ? b.hours : [])) {
    if (!(h.weekday >= 0 && h.weekday <= 6) || !/^\d\d:\d\d$/.test(h.start) || !/^\d\d:\d\d$/.test(h.end) || h.start >= h.end) throw new E(400, 'Неверное время работы');
    run('INSERT INTO work_hours VALUES(?,?,?,?)', u.id, h.weekday, h.start, h.end);
  }
  return { ok: true };
}));
R('GET', '/api/trainer/achievements', 'trainer', ({ u }) => {
  const pt = one("SELECT COUNT(*) n FROM personal WHERE trainer_id=? AND status='done'", u.id).n;
  const visits = one("SELECT COUNT(*) n FROM bookings b JOIN classes c ON c.id=b.class_id WHERE c.trainer_id=? AND b.status='attended'", u.id).n;
  const clients = one("SELECT COUNT(DISTINCT client_id) n FROM personal WHERE trainer_id=? AND status='done'", u.id).n;
  return [['Первая персональная', pt, 1], ['10 персональных', pt, 10], ['100 персональных', pt, 100], ['50 гостей на группах', visits, 50], ['500 гостей на группах', visits, 500], ['5 постоянных клиентов', clients, 5]]
    .map(([title, have, need]) => ({ title, have: Math.min(have, need), need, done: have >= need }));
});
R('POST', '/api/trainer/favorites/:id', 'trainer', ({ u, params }) => {
  if (one('SELECT 1 x FROM favorites WHERE trainer_id=? AND client_id=?', u.id, +params.id)) { run('DELETE FROM favorites WHERE trainer_id=? AND client_id=?', u.id, +params.id); return { fav: false }; }
  run('INSERT INTO favorites VALUES(?,?)', u.id, +params.id); return { fav: true };
});
const myClass = (u, id) => { const c = one('SELECT * FROM classes WHERE id=? AND trainer_id=?', +id, u.id); if (!c) throw new E(404, 'Занятие не найдено'); return c; };
R('GET', '/api/trainer/classes/:id', 'trainer', ({ u, params }) => {
  const c = myClass(u, params.id);
  return { ...classView(c), people: q("SELECT b.id,b.status,b.guest,u.name,u.id user_id FROM bookings b LEFT JOIN users u ON u.id=b.user_id WHERE class_id=? AND b.status<>'cancelled' ORDER BY b.status='waitlist', b.id", c.id)
    .map(p => ({ ...p, paid: !p.user_id || !!(activeMembership(p.user_id, c.club_id) || packOf(p.user_id, c.club_id)) })) };
});
R('POST', '/api/trainer/bookings/:id/mark', 'trainer', ({ u, params }, b) => tx(() => {
  const bk = one('SELECT * FROM bookings WHERE id=?', +params.id); if (!bk) throw new E(404, 'Нет записи'); const c = myClass(u, bk.class_id);
  if (!['attended', 'missed'].includes(b.status)) throw new E(400, 'Неверный статус');
  if (bk.status === 'waitlist') throw new E(400, 'Клиент в листе ожидания');
  const was = bk.status; run('UPDATE bookings SET status=? WHERE id=?', b.status, bk.id);
  if (bk.user_id && b.status === 'attended' && was !== 'attended') {
    run('INSERT INTO visits(user_id,club_id,at) VALUES(?,?,?)', bk.user_id, c.club_id, c.start);
    const single = one("SELECT m.id FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND m.club_id=? AND p.kind IN('membership','single') AND m.sessions_left>0 AND m.until>? ORDER BY m.until", bk.user_id, c.club_id, now());
    const unlimited = one("SELECT 1 x FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND m.club_id=? AND p.kind='membership' AND m.sessions_left IS NULL AND m.until>?", bk.user_id, c.club_id, now());
    if (single && !unlimited) run('UPDATE memberships SET sessions_left=sessions_left-1 WHERE id=?', single.id);
  }
  return { ok: true };
}));
R('POST', '/api/trainer/classes/:id/guest', 'trainer', ({ u, params }, b) => {
  const c = myClass(u, params.id); const name = String(b.name || '').trim(); if (!name) throw new E(400, 'Имя гостя');
  run("INSERT INTO bookings(class_id,guest,status,created) VALUES(?,?,'attended',?)", c.id, name.slice(0, 80), now()); return { ok: true };
});
const myPersonal = (u, id) => { const p = one('SELECT * FROM personal WHERE id=? AND trainer_id=?', +id, u.id); if (!p) throw new E(404, 'Тренировка не найдена'); return p; };
R('GET', '/api/trainer/personal/:id', 'trainer', ({ u, params }) => {
  const p = myPersonal(u, params.id); const c = one('SELECT id,name,phone FROM users WHERE id=?', p.client_id);
  return { ...p, client: c, left: packOf(c.id, p.club_id)?.sessions_left || 0, note: one('SELECT text FROM notes WHERE trainer_id=? AND client_id=?', u.id, c.id)?.text || '' };
});
R('POST', '/api/trainer/personal/:id/status', 'trainer', ({ u, params }, b) => tx(() => {
  const p = myPersonal(u, params.id); if (p.status !== 'planned') throw new E(400, 'Тренировка уже закрыта');
  if (!['done', 'missed', 'cancelled'].includes(b.status)) throw new E(400, 'Неверный статус');
  if (b.status !== 'cancelled') {
    const pack = packOf(p.client_id, p.club_id); if (!pack) throw new E(402, 'У клиента закончился пакет');
    run('UPDATE memberships SET sessions_left=sessions_left-1 WHERE id=?', pack.id);
    if (b.status === 'done') run('INSERT INTO visits(user_id,club_id,at) VALUES(?,?,?)', p.client_id, p.club_id, p.start);
  }
  run('UPDATE personal SET status=? WHERE id=?', b.status, p.id);
  notify(p.client_id, { done: 'Тренировка проведена и списана из пакета', missed: 'Отмечена неявка, тренировка списана', cancelled: `Тренер отменил тренировку ${fmt(p.start)}` }[b.status]);
  return { ok: true };
}));
R('POST', '/api/trainer/personal/:id/move', 'trainer', ({ u, params }, b) => tx(() => {
  const p = myPersonal(u, params.id); if (p.status !== 'planned') throw new E(400, 'Тренировка уже закрыта');
  const s = new Date(b.start); if (isNaN(s) || s < new Date()) throw new E(400, 'Неверное время');
  if (!slotFree(u.id, s.toISOString(), p.id)) throw new E(409, 'Это время занято');
  run('UPDATE personal SET start=? WHERE id=?', s.toISOString(), p.id); notify(p.client_id, `Тренировка перенесена на ${fmt(s.toISOString())}`); return { ok: true };
}));
R('GET', '/api/trainer/clients', 'trainer', ({ u, query }) => {
  const term = String(query.q || '').trim(), fav = query.fav === '1';
  // Like the original, the full club base is not listed: search needs 3+ characters; favourites and own clients are shown without it.
  const card = /^\d{1,6}$/.test(term) ? +term : -1, like = '%' + term + '%';
  const rows = term.length >= 3 || card > 0
    ? q(`SELECT DISTINCT u.id,u.name,u.phone FROM users u WHERE u.role='client' AND u.club_id IN (SELECT club_id FROM trainer_clubs WHERE trainer_id=?) AND (u.name LIKE ? OR u.phone LIKE ? OR u.id=?) ORDER BY u.name LIMIT 100`, u.id, like, like, card)
    : q(`SELECT DISTINCT u.id,u.name,u.phone FROM users u WHERE u.id IN (SELECT client_id FROM favorites WHERE trainer_id=?) ${fav ? '' : 'OR u.id IN (SELECT client_id FROM personal WHERE trainer_id=?)'} ORDER BY u.name`, ...(fav ? [u.id] : [u.id, u.id]));
  return rows.filter(c => !fav || one('SELECT 1 x FROM favorites WHERE trainer_id=? AND client_id=?', u.id, c.id))
    .map(c => ({ ...c, fav: !!one('SELECT 1 x FROM favorites WHERE trainer_id=? AND client_id=?', u.id, c.id), left: one("SELECT COALESCE(SUM(sessions_left),0) n FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND p.kind='pack' AND m.until>?", c.id, now()).n,
      note: one('SELECT text FROM notes WHERE trainer_id=? AND client_id=?', u.id, c.id)?.text || '' }));
});
R('GET', '/api/trainer/clients/:id', 'trainer', ({ u, params }) => {
  const c = one("SELECT id,name,phone,club_id FROM users WHERE id=? AND role='client'", +params.id); if (!c) throw new E(404, 'Клиент не найден');
  return { ...c, fav: !!one('SELECT 1 x FROM favorites WHERE trainer_id=? AND client_id=?', u.id, c.id), card: String(c.id).padStart(6, '0'), left: packOf(c.id, c.club_id)?.sessions_left || 0, note: one('SELECT text FROM notes WHERE trainer_id=? AND client_id=?', u.id, c.id)?.text || '',
    history: q('SELECT * FROM personal WHERE trainer_id=? AND client_id=? ORDER BY start DESC LIMIT 30', u.id, c.id) };
});
R('PUT', '/api/trainer/clients/:id/note', 'trainer', ({ u, params }, b) => { run('INSERT INTO notes VALUES(?,?,?) ON CONFLICT DO UPDATE SET text=excluded.text', u.id, +params.id, String(b.text || '').slice(0, 2000)); return { ok: true }; });
R('POST', '/api/trainer/clients/:id/sell', 'trainer', ({ u, params }, b) => tx(() => {
  // Trainer issues an invoice; the client pays from their balance in the client app.
  const c = one("SELECT * FROM users WHERE id=? AND role='client'", +params.id); if (!c) throw new E(404, 'Клиент не найден');
  const p = one("SELECT * FROM products WHERE id=? AND kind='pack'", +b.product_id); if (!p) throw new E(404, 'Нет такого пакета');
  notify(c.id, `Тренер ${u.name} предлагает: ${p.name} за ${p.price} ₽. Оплатите в разделе «Магазин».`);
  return { ok: true };
}));
R('GET', '/api/trainer/products', 'trainer', ({ u }) => q("SELECT * FROM products WHERE kind='pack' AND club_id IN (SELECT club_id FROM trainer_clubs WHERE trainer_id=?)", u.id));
R('GET', '/api/trainer/stats', 'trainer', ({ u, query }) => {
  const days = Math.min(+query.days || 30, 365); const from = new Date(Date.now() - days * 864e5).toISOString();
  const done = one("SELECT COUNT(*) n FROM personal WHERE trainer_id=? AND status='done' AND start>=?", u.id, from).n;
  const missed = one("SELECT COUNT(*) n FROM personal WHERE trainer_id=? AND status='missed' AND start>=?", u.id, from).n;
  const groups = one("SELECT COUNT(*) n FROM classes WHERE trainer_id=? AND start>=? AND start<?", u.id, from, now()).n;
  const visitors = one("SELECT COUNT(*) n FROM bookings b JOIN classes c ON c.id=b.class_id WHERE c.trainer_id=? AND b.status='attended' AND c.start>=?", u.id, from).n;
  const lowPack = q(`SELECT u.id,u.name,m.sessions_left FROM memberships m JOIN users u ON u.id=m.user_id JOIN products p ON p.id=m.product_id
    WHERE p.kind='pack' AND m.sessions_left<=1 AND u.id IN (SELECT client_id FROM personal WHERE trainer_id=?)`, u.id);
  return { days, done, missed, groups, visitors, salary: done * 1200 + groups * 900, rates: { personal: 1200, group: 900 }, lowPack };
});

// ---------- http ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); };
  if (!url.pathname.startsWith('/api/')) {
    let f = path.normalize(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^(\.\.[/\\])+/, '');
    const file = path.join(__dirname, 'public', f);
    if (!file.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); return fs.createReadStream(file).pipe(res);
  }
  try {
    const r = routes.find(r => r.method === req.method && r.re.test(url.pathname)); if (!r) throw new E(404, 'Нет такого метода');
    let body = {};
    if (req.method !== 'GET') { let s = ''; for await (const ch of req) { s += ch; if (s.length > 1e5) throw new E(413, 'Слишком большой запрос'); } body = s ? JSON.parse(s) : {}; }
    const ctx = { params: url.pathname.match(r.re).groups || {}, query: Object.fromEntries(url.searchParams) };
    if (r.role) {
      ctx.token = (req.headers.authorization || '').replace(/^Bearer /, '');
      ctx.u = ctx.token && one('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?', ctx.token);
      if (!ctx.u && r.role !== 'opt') throw new E(401, 'Войдите заново');
      const role = ctx.u.role === 'admin' ? r.role : ctx.u.role;
      if (ctx.u && r.role !== 'any' && r.role !== 'opt' && role !== r.role) throw new E(403, 'Нет доступа');
    }
    send(200, await r.fn(ctx, body));
  } catch (e) {
    if (!(e instanceof E)) console.error(e);
    send(e instanceof E ? e.code : e instanceof SyntaxError ? 400 : 500, { error: e instanceof E ? e.message : 'Ошибка сервера' });
  }
}).listen(PORT, () => console.log(`FitClub: http://localhost:${PORT}  (клиент: /  тренер: /#trainer)`));
```

## Код: public/index.html (оба приложения)
```html
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#4f46e5">
<link rel="manifest" href="manifest.webmanifest">
<title>FitClub</title>
<style>
:root{--bg:#f2f3f7;--card:#fff;--text:#1b1d22;--muted:#6b7280;--line:#e5e7eb;--accent:#4f46e5;--ok:#16a34a;--warn:#d97706;--bad:#dc2626;--chip:#eceef3;--grad:linear-gradient(135deg,#4f46e5,#7c3aed)}
body:not(.trainer){--accent:#1b3f8f;--grad:linear-gradient(135deg,#1b3f8f,#2c5fc7);--orange:#e58a3c}
.appbar{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:16px;background:#14347d;color:#fff;padding:14px 16px}.appbar b{font-size:19px;font-weight:500}.appbar button{border:0;background:none;color:#fff;font-size:22px;cursor:pointer;display:flex}
.drawer{position:fixed;top:0;bottom:0;left:max(0px,calc(50% - 240px));width:min(300px,82vw);background:var(--card);z-index:7;display:flex;flex-direction:column;box-shadow:4px 0 16px #0003}
.dhead{background:var(--orange);color:#fff;padding:22px 16px;font-weight:600;border:0;text-align:left;font-size:15px;cursor:pointer}.drawer nav{flex:1;overflow:auto}.drawer nav button{display:block;width:100%;text-align:left;border:0;background:none;padding:13px 16px;font-size:15px;color:var(--text);cursor:pointer}.drawer nav button.on{background:var(--chip);font-weight:600}.drawer .dot{position:static}
.dexit{display:flex;gap:10px;align-items:center;border:0;border-top:1px solid var(--line);background:none;padding:14px 16px;text-align:left;color:var(--text);cursor:pointer}.dexit svg{color:var(--orange);flex:none}
.appbar b small{display:block;font-size:12px;opacity:.8;font-weight:400}.appbar a{text-decoration:none;font-size:20px}
.listrow{display:flex;justify-content:space-between;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:var(--card);padding:16px;font-size:16px;color:var(--text);cursor:pointer}
.clubrow{display:flex;gap:14px;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:var(--card);padding:14px;color:var(--text);cursor:pointer;font-size:15px}
.logo{width:48px;height:48px;border-radius:8px;color:#fff;display:grid;place-items:center;font-weight:700;font-size:20px;flex:none}.mytag{display:inline-block;margin-top:4px;border:1px solid #9bb5e6;color:#5d7fc4;font-size:11px;padding:1px 6px;border-radius:3px}
.tabs2{display:flex;background:#14347d;margin:-12px -16px 0}.tabs2 button{flex:1;border:0;background:none;color:#fffb;padding:12px;font-size:13px;letter-spacing:.5px;cursor:pointer;border-bottom:3px solid transparent}.tabs2 button.on{color:#fff;border-color:#fff}
.map{width:100%;height:340px;border:0;border-radius:12px;margin:12px 0 8px}
.banner{position:relative;border-radius:0;margin:-12px -16px 0;padding:18px 16px 16px;min-height:150px;color:#fff;background:linear-gradient(160deg,#1d2b55,#3d4f9a 60%,#b34fa0);display:flex;flex-direction:column;justify-content:flex-end;gap:4px;cursor:pointer}.bnext{position:absolute;right:10px;top:50%;border:0;background:#fff3;color:#fff;width:32px;height:32px;border-radius:50%;font-size:20px;cursor:pointer}
.loadrow{display:flex;align-items:center;justify-content:space-between;background:#1e56b8;color:#fff;margin:0 -16px;padding:10px 16px;font-size:13px;font-weight:600}.loadrow i{font-style:normal;width:76px;height:76px;border-radius:50%;background:#5f8fe0;display:grid;place-items:center;font-size:26px;font-weight:400;margin-right:40px}
.mainbtns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.mainbtns button{border:0;border-radius:6px;background:#2fa3e0;color:#fff;padding:12px;font-size:14px;cursor:pointer}.mainbtns button:first-child{grid-column:1/3}
.slot{display:flex;gap:12px;background:var(--card);border-left:4px solid;padding:12px 10px;margin:0 -16px;border-bottom:1px solid var(--line)}.slot .lt{width:58px;flex:none;color:var(--muted);font-size:13px}.slotact{display:flex;flex-direction:column;gap:6px;align-items:flex-end;justify-content:center}
.week{background:var(--card);margin:-12px -16px 8px;padding:8px 6px}.week .row{gap:2px}.wd{flex:1;border:0;background:none;color:var(--muted);font-size:15px;padding:6px 0;border-radius:8px;cursor:pointer;display:flex;flex-direction:column;align-items:center}.wd small{font-size:10px}.wd.on{background:#f0a23b;color:#fff;border:2px solid #c97d1c}
.star{width:52px;height:52px;border-radius:50%;border:0;background:#cfd8ea;color:#fff;font-size:24px;cursor:pointer}.star.on{background:#2fa3e0}
.acts3{display:flex;background:var(--card);border-radius:12px;margin-bottom:10px}.acts3>*{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 4px;border:0;background:none;color:var(--text);font-size:12px;text-decoration:none;cursor:pointer;font-size:20px}.acts3 span{font-size:12px}
.chk{display:flex;gap:10px;align-items:flex-start;color:var(--text);font-size:14px;margin:8px 0}.chk input{width:18px;height:18px;margin:2px 0 0;flex:none}
.acc{background:var(--card);border-radius:12px;overflow:hidden}.acch{display:flex;justify-content:space-between;align-items:center;width:100%;border:0;background:var(--chip);padding:14px 12px;font-size:15px;color:var(--text);cursor:pointer;border-bottom:1px solid var(--line)}
.acci{display:block;width:100%;text-align:left;border:0;background:var(--card);padding:12px 12px 12px 26px;border-bottom:1px solid var(--line);font-size:15px;color:var(--text);cursor:pointer}.acci span{display:block}.acci .mut{margin-top:2px}
.dot{background:var(--bad);color:#fff;font-size:10px;font-style:normal;border-radius:9px;padding:1px 5px}
body.trainer .bar button{font-size:26px;margin-right:16px}body.trainer .bar{background:var(--bg);border:0}
body.trainer{--accent:#1590d4;--grad:linear-gradient(135deg,#1590d4,#3b6fd8);--bg:#eef2f6}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) body.trainer{--bg:#0f1115}}
.clubbar{display:flex;align-items:center;gap:12px;padding:6px 0 14px}.clubav{width:54px;height:54px;border-radius:50%;background:#7c85d9;border:3px solid var(--accent);color:#fff;display:grid;place-items:center;font-size:20px;flex:none}
.clubsel{border:0;background:none;text-align:left;color:var(--text);padding:0;cursor:pointer;min-width:0}.clubsel span{display:block}.clubsel b{display:block;font-weight:500;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chev{color:var(--accent);display:inline-flex}.icbtn{border:0;background:none;color:var(--accent);cursor:pointer;position:relative;padding:4px;font-size:22px}.dot{position:absolute;top:-2px;right:-4px;background:var(--bad);color:#fff;font-size:10px;font-style:normal;border-radius:9px;padding:1px 5px}
.datenav{display:flex;align-items:center;margin-bottom:12px}.datenav button{border:0;background:none;color:var(--muted);font-size:15px;cursor:pointer}.datenav button:first-child,.datenav button:last-child{color:var(--accent)}.datenav .grow{text-align:center;color:var(--text)}.datenav .grow span{display:block}.datenav .grow b{font-size:20px;font-weight:500;display:inline-flex;gap:4px;align-items:center}
.search{display:flex;align-items:center;gap:10px;background:var(--card);border-radius:24px;padding:0 16px;margin-bottom:12px;color:var(--muted)}.search input{border:0;background:none;margin:0;padding:13px 0}
.lessons{background:var(--card);border-radius:18px;overflow:hidden}.lesson{display:flex;gap:16px;padding:14px 14px 14px 12px;border-left:4px solid var(--accent);background:var(--card);cursor:pointer;margin-bottom:1px}.lessons .lesson+.lesson{border-top:1px solid var(--line)}.lesson.personal{border-left-color:#2e9d4a}
.sec+.lesson,.lesson+.lesson:not(.lessons .lesson){border-radius:12px;margin-bottom:8px}
.lt{width:74px;flex:none;color:var(--muted);font-size:14px;line-height:1.35}.lt svg{color:var(--accent)}.lesson.personal .lt svg{color:#2e9d4a}
.badge{background:#e5484d;color:#fff;font-size:12px;border-radius:6px;padding:2px 6px;white-space:nowrap}
.fab{position:fixed;right:max(16px,calc(50% - 224px));bottom:84px;width:62px;height:62px;border-radius:50%;border:0;background:var(--accent);color:#fff;font-size:34px;box-shadow:0 4px 14px #0003;cursor:pointer}
.seg{display:flex;background:var(--card);border-radius:24px;margin-bottom:12px}.seg button{flex:1;border:0;background:none;padding:10px;border-radius:24px;font-size:16px;color:var(--text);cursor:pointer}.seg button.on{background:var(--accent);color:#fff}
.emptycard{background:var(--card);border-radius:18px;padding:22px;text-align:center;font-size:16px;margin-bottom:10px}
.bigav{width:56px;height:56px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;flex:none}
.menu{background:var(--card);border-radius:18px;overflow:hidden}.menu button{display:flex;align-items:center;gap:16px;width:100%;border:0;background:none;padding:18px 16px;font-size:17px;color:var(--text);cursor:pointer;position:relative;text-align:left}.menu button+button{border-top:1px solid var(--line)}.menu svg{color:var(--accent)}.menu .dot{position:static;margin-left:auto}
.sheet-bg{position:fixed;inset:0;background:#0007;z-index:5}.sheet{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:var(--card);border-radius:0 0 18px 18px;padding:16px;z-index:6}
.lnk{border:0;background:none;color:var(--text);font-size:13px;cursor:pointer}.cal{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;gap:4px;margin-top:12px}.cal span{color:var(--muted);font-size:13px;padding:6px 0}
.cd{border:0;background:none;font-size:17px;padding:8px 0 12px;border-radius:10px;color:var(--text);cursor:pointer;position:relative}.cd.out{color:var(--muted);opacity:.6}.cd.sel{background:var(--accent);color:#fff}.cd i{position:absolute;left:50%;bottom:3px;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:var(--accent)}.cd.sel i{background:#fff}
nav.tabs button svg{display:block;margin:0 auto 2px}nav.tabs button span{line-height:1}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f1115;--card:#1a1d23;--text:#eceff4;--muted:#9aa3b2;--line:#2a2f38;--chip:#232831}}
:root[data-theme="dark"]{--bg:#0f1115;--card:#1a1d23;--text:#eceff4;--muted:#9aa3b2;--line:#2a2f38;--chip:#232831}
*{box-sizing:border-box}html,body{height:100%}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
#app{max-width:480px;margin:0 auto;min-height:100%;display:flex;flex-direction:column}
.bar{position:sticky;top:0;z-index:2;padding:14px 16px 10px;background:var(--card);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px}
.bar b{font-size:17px;flex:1}.bar button{border:0;background:none;color:var(--accent);font-size:15px;cursor:pointer;padding:0}
main{flex:1;padding:12px 16px 90px}
nav.tabs{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;display:flex;background:var(--card);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom)}
nav.tabs button{flex:1;border:0;background:none;padding:8px 0 10px;font-size:11px;color:var(--muted);cursor:pointer}nav.tabs button span{display:block;font-size:20px}nav.tabs button.on{color:var(--accent)}
.card{background:var(--card);border-radius:14px;padding:12px;margin-bottom:10px;border:1px solid var(--line)}
.row{display:flex;align-items:center;gap:10px}.grow{flex:1;min-width:0}.mut{color:var(--muted);font-size:13px}
.btn{border:0;border-radius:10px;padding:10px 14px;background:var(--accent);color:#fff;font-weight:600;cursor:pointer;font-size:14px}
.btn.ghost{background:var(--chip);color:var(--text)}.btn.danger{background:var(--bad)}.btn.sm{padding:6px 10px;font-size:13px}.btn.full{width:100%}.btn:disabled{opacity:.5}
.chips{display:flex;gap:6px;overflow:auto;padding-bottom:8px}.chip{flex:none;border:0;border-radius:999px;padding:6px 12px;background:var(--chip);color:var(--text);cursor:pointer;font-size:13px}.chip.on{background:var(--accent);color:#fff}
.tag{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--chip);white-space:nowrap}.tag.ok{background:#16a34a22;color:var(--ok)}.tag.warn{background:#d9770622;color:var(--warn)}.tag.bad{background:#dc262622;color:var(--bad)}
.hero{border-radius:16px;padding:16px;color:#fff;background:var(--grad);margin-bottom:10px}
.av{width:40px;height:40px;border-radius:50%;background:var(--chip);display:grid;place-items:center;font-weight:700;flex:none}
.bar2{height:6px;background:var(--chip);border-radius:9px;overflow:hidden}.bar2 i{display:block;height:100%;background:var(--accent)}
input,textarea,select{width:100%;padding:11px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text);font:inherit;margin:4px 0 10px}
label{font-size:13px;color:var(--muted)}h3{margin:2px 0 8px;font-size:15px}.sec{margin:16px 0 8px;font-weight:700}
.stat{flex:1;text-align:center}.stat b{display:block;font-size:20px}
.toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#111;color:#fff;padding:9px 14px;border-radius:10px;font-size:13px;opacity:0;transition:.2s;pointer-events:none;max-width:90%;z-index:9}.toast.on{opacity:1}
.qr{width:200px;height:200px;margin:12px auto;display:block;background:#fff;padding:8px;border-radius:8px}
.login{padding:40px 20px}.login h1{margin:0 0 4px}.empty{text-align:center;color:var(--muted);padding:24px 0}
</style>
</head>
<body>
<div id="app"></div><div class="toast" id="toast"></div>
<script>
const MODE = location.hash.startsWith('#trainer') ? 'trainer' : 'client';
document.body.classList.toggle('trainer', MODE === 'trainer');
const KEY = 'fitclub-token-' + MODE;
let token = null; try { token = localStorage.getItem(KEY); } catch (e) {}
const st = { tab: null, stack: [], day: 0, me: null };
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tm = iso => new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
const dt = iso => new Date(iso).toLocaleDateString('ru', { day: 'numeric', month: 'short' });
const rub = n => (n || 0).toLocaleString('ru') + ' ₽';
const dayDate = off => { const d = new Date(); d.setDate(d.getDate() + off); return d; };
const dayParam = off => { const d = dayDate(off); return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString(); };
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2200); }
async function api(path, opts = {}) {
  const r = await fetch('/api' + path, { method: opts.method || (opts.body ? 'POST' : 'GET'), headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login') { logout(true); throw new Error(j.error); }
  if (!r.ok) throw new Error(j.error || 'Ошибка');
  return j;
}
async function act(fn, ok) { try { await fn(); if (ok) toast(ok); await render(); } catch (e) { toast(e.message); } }
function logout(silent) { if (!silent) api('/logout', { body: {} }).catch(() => {}); token = null; try { localStorage.removeItem(KEY); } catch (e) {} st.me = null; render(); }
const dayChips = () => `<div class="chips">${[...Array(14)].map((_, i) => { const d = dayDate(i); return `<button class="chip ${i === st.day ? 'on' : ''}" data-day="${i}">${i === 0 ? 'Сегодня' : d.toLocaleDateString('ru', { weekday: 'short', day: 'numeric' })}</button>`; }).join('')}</div>`;
const push = (screen, arg) => { st.stack.push({ screen, arg }); render(); };

// ---------------- login ----------------
async function loginScreen() {
  const clubs = MODE === 'client' ? await api('/clubs') : [];
  return `<div class="login"><h1>${MODE === 'trainer' ? 'FitClub Тренер' : 'FitClub'}</h1><p class="mut">${MODE === 'trainer' ? 'Вход для тренеров клуба' : 'Расписание, абонементы и запись в ваш клуб'}</p>
  <div class="card"><label>Телефон</label><input id="ph" inputmode="tel" placeholder="+7 900 000-00-00" value="${MODE === 'trainer' ? '79990000001' : '79000000000'}">
  <label>Пароль</label><input id="pw" type="password" value="1234">
  <div id="reg" hidden><label>Имя</label><input id="nm"><label>Клуб</label><select id="cl">${clubs.map(c => `<option value="${c.id}">${esc(c.city)} — ${esc(c.name)}</option>`).join('')}</select></div>
  <button class="btn full" data-act="login">Войти</button>
  ${MODE === 'client' ? '<button class="btn ghost full" style="margin-top:8px" data-act="regtoggle">Регистрация</button>' : ''}</div>
  <p class="mut">Демо: клиент 79000000000 / 1234, тренер 79990000001 / 1234.<br><a href="${MODE === 'trainer' ? '#' : '#trainer'}" onclick="setTimeout(()=>location.reload())">${MODE === 'trainer' ? 'Приложение клиента' : 'Приложение тренера'} →</a></p></div>`;
}

// ---------------- client ----------------
// Client navigation is a side drawer, as in the original (club name on top, sections below, exit at the bottom).
const C_MENU = [['main', 'Мой клуб'], ['sched', 'Расписание'], ['home', 'Личный кабинет'], ['shop', 'Магазин'], ['clubs', 'Клубы'], ['pt', 'Тренеры'], ['news', 'Новости'], ['call', 'Позвонить в клуб'], ['join', 'Стать членом клуба'],
  ['ach', 'Мои достижения'], ['trainings', 'Мои тренировки'], ['ptrain', 'Персональный тренинг'], ['notif', 'Уведомления'], ['feedback', 'Обратная связь'], ['about', 'О приложении']];
const C_TABS = [];
const C = {
  async home() {
    const h = await api('/home'), me = st.me;
    return ['Личный кабинет', `<div class="hero"><div style="opacity:.8">${esc(me.club?.name)}</div><b style="font-size:20px">${esc(me.name)}</b>
    <div class="row" style="margin-top:12px"><div class="stat"><b>${rub(h.balance)}</b>на счёте</div><div class="stat"><b>${h.memberships.filter(m => m.kind === 'pack').reduce((a, m) => a + (m.sessions_left || 0), 0)}</b>персональных</div><div class="stat"><b>${h.visits}</b>визитов</div></div></div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn ghost grow" data-go="shop">Магазин</button><button class="btn ghost grow" data-push="card">Клубная карта</button><button class="btn ghost grow" data-push="prof">Счёт и профиль</button></div>
    <div class="sec">Мои записи</div>${h.upcoming.map(u => `<div class="card row"><div class="grow"><b>${esc(u.name)}</b><div class="mut">${dt(u.start)} ${tm(u.start)} · ${esc(u.trainer || '')}${u.room ? ' · ' + esc(u.room) : ''}</div></div>
      ${u.type === 'class' ? (u.my === 'waitlist' ? '<span class="tag warn">ожидание</span>' : '<span class="tag ok">записан</span>') + `<button class="btn sm ghost" data-act="cancelClass" data-id="${u.id}">✕</button>` : `<button class="btn sm ghost" data-act="cancelPt" data-id="${u.id}">✕</button>`}</div>`).join('') || '<div class="empty">Записей нет — откройте расписание</div>'}
    <div class="sec">Абонементы и услуги</div>${h.memberships.map(m => { const frozen = m.frozen_until && new Date(m.frozen_until) > new Date(); const expired = new Date(m.until) < new Date();
      return `<div class="card"><div class="row"><b class="grow">${esc(m.name)}</b><span class="tag ${expired ? 'bad' : frozen ? 'warn' : 'ok'}">${expired ? 'истёк' : frozen ? 'заморожен' : 'активен'}</span></div>
      <div class="mut">до ${dt(m.until)}${m.sessions_left != null ? ' · осталось ' + m.sessions_left : ''}${m.freeze_left ? ' · заморозка: ' + m.freeze_left + ' дн.' : ''}${frozen ? ' · заморожен до ' + dt(m.frozen_until) : ''}</div>
      ${(m.freeze_left || frozen) && !expired ? `<button class="btn sm ghost" style="margin-top:8px" data-act="freeze" data-id="${m.id}">${frozen ? 'Разморозить' : 'Заморозить'}</button>` : ''}</div>`; }).join('') || '<div class="empty">Нет абонементов</div>'}`];
  },
  async sched() {
    const list = await api('/schedule?date=' + dayParam(st.day));
    const kinds = ['Все', ...new Set(list.map(c => c.name))]; const f = st.filter && kinds.includes(st.filter) ? st.filter : 'Все';
    return ['Расписание', dayChips() + `<div class="chips">${kinds.map(k => `<button class="chip ${k === f ? 'on' : ''}" data-filter="${esc(k)}">${esc(k)}</button>`).join('')}</div>` +
      (list.filter(c => f === 'Все' || c.name === f).map(c => { const past = new Date(c.start) < new Date(), full = c.booked >= c.cap;
        return `<div class="card"><div class="row"><b style="width:48px">${tm(c.start)}</b><div class="grow"><b>${esc(c.name)}</b><div class="mut">${esc(c.trainer)} · ${esc(c.room)} · ${c.minutes} мин</div></div></div>
        <div class="row" style="margin-top:8px"><div class="grow"><div class="bar2"><i style="width:${Math.min(100, c.booked / c.cap * 100)}%"></i></div><div class="mut">свободно ${Math.max(0, c.cap - c.booked)} из ${c.cap}</div></div>
        ${past ? '<span class="tag">прошло</span>' : c.my ? `<span class="tag ${c.my === 'waitlist' ? 'warn' : 'ok'}">${c.my === 'waitlist' ? 'ожидание' : 'записан'}</span><button class="btn sm ghost" data-act="cancelClass" data-id="${c.id}">Отменить</button>` : `<button class="btn sm" data-act="book" data-id="${c.id}">${full ? 'В ожидание' : 'Записаться'}</button>`}</div></div>`; }).join('') || '<div class="empty">Нет занятий в этот день</div>')];
  },
  async pt() {
    const ts = await api('/trainers');
    return ['Тренеры', ts.map(t => `<div class="card row" data-push="trainer" data-arg="${t.id}" style="cursor:pointer"><div class="av">${esc(t.name[0])}</div><div class="grow"><b>${esc(t.name)}</b><div class="mut">${esc(t.spec)} · ${rub(t.price)}</div></div>›</div>`).join('')];
  },
  async trainer(id) {
    const [ts, slots] = await Promise.all([api('/trainers?club=' + club().id), api(`/trainers/${id}/slots?date=` + dayParam(st.day))]); const t = ts.find(x => x.id == id);
    return [t.name, `<div class="card"><b>${esc(t.spec)}</b><div class="mut">Персональная тренировка 60 мин · ${rub(t.price)} (списывается из пакета)</div></div>` + dayChips() +
      `<div class="chips" style="flex-wrap:wrap">${slots.map(s => `<button class="chip" data-act="bookPt" data-t="${id}" data-s="${s}">${tm(s)}</button>`).join('') || '<span class="mut">Нет свободного времени</span>'}</div>`];
  },
  async card() {
    const v = await api('/visits'); const me = st.me;
    return ['Клубная карта', `<div class="card" style="text-align:center"><b>Покажите код на ресепшене</b>${qr('FC' + String(me.id).padStart(8, '0'))}<div class="mut">Карта № ${String(me.id).padStart(6, '0')} · ${esc(me.name)}</div>
    <button class="btn sm ghost" style="margin-top:8px" data-act="checkin">Отметить вход (тест)</button></div><div class="sec">История посещений</div>` +
      (v.map(x => `<div class="card row"><b class="grow">${dt(x.at)} ${tm(x.at)}</b><span class="mut">${esc(x.club)}</span></div>`).join('') || '<div class="empty">Посещений пока нет</div>')];
  },
  async prof() {
    const [clubs, tr] = await Promise.all([api('/clubs'), api('/transactions')]); const me = st.me;
    return ['Профиль', `<div class="card row"><div class="av">${esc(me.name[0])}</div><div class="grow"><b>${esc(me.name)}</b><div class="mut">+${me.phone}</div></div></div>
    <div class="card"><label>Мой клуб</label><select id="club">${clubs.map(c => `<option value="${c.id}" ${c.id === me.club_id ? 'selected' : ''}>${esc(c.city)} — ${esc(c.name)}</option>`).join('')}</select><button class="btn sm" data-act="setClub">Сменить клуб</button></div>
    <div class="card"><h3>Счёт: ${rub(me.balance)}</h3><label>Пополнить, ₽</label><input id="amt" type="number" min="1" value="5000"><button class="btn full" data-act="topup">Пополнить</button>
    <div class="mut" style="margin-top:6px">Тестовый режим: деньги зачисляются без оплаты. Для продакшена подключите эквайринг.</div></div>
    <div class="sec">Операции</div>${tr.map(t => `<div class="card row"><span class="grow">${esc(t.title)}<div class="mut">${dt(t.created)}</div></span><b style="color:${t.amount > 0 ? 'var(--ok)' : 'inherit'}">${t.amount > 0 ? '+' : ''}${rub(t.amount)}</b></div>`).join('') || '<div class="empty">Операций нет</div>'}
    <button class="btn ghost full" data-act="logout">Выйти</button><button class="btn ghost full" style="margin-top:8px;color:var(--bad)" data-act="delete">Удалить аккаунт</button>`];
  },
  async shop() {
    const ps = await api(`/products?club=${club().id}&q=` + encodeURIComponent(st.shopq || '')); const cats = [...new Set(ps.map(p => p.category))]; st.closed ||= {};
    return ['Магазин', (st.shopSearch ? `<div class="search">${ic.search}<input id="shopq" placeholder="Поиск услуги" value="${esc(st.shopq || '')}"></div>` : '') +
      (st.me ? `<div class="row mut" style="margin:0 0 8px">На счёте: <b style="color:var(--text)">${rub(st.me.balance)}</b></div>` : '') + `<div class="acc">` +
      cats.map(c => { const open = !st.closed[c]; return `<button class="acch" data-act="acc" data-c="${esc(c)}">${esc(c)}<span class="chev" style="transform:rotate(${open ? 180 : 0}deg)">${ic.chev}</span></button>` +
        (open ? ps.filter(p => p.category === c).map(p => `<button class="acci" data-push="product" data-arg="${p.id}"><span>${esc(p.name)}</span><span class="mut">${p.price.toLocaleString('ru', { minimumFractionDigits: 2 })} ₽</span></button>`).join('') : ''); }).join('') +
      '</div>' + (ps.length ? '' : '<div class="empty">Ничего не найдено</div>')];
  },
  async product(id) {
    const p = (await api('/products?club=' + club().id)).find(x => x.id == id);
    return [p.category, `<div class="card"><h3>${esc(p.name)}</h3><div class="mut">${p.sessions ? p.sessions + (p.kind === 'pack' ? ' персональных' : ' занятий') + ' · ' : 'Без ограничения посещений · '}действует ${p.days} дн.${p.freeze_days ? ' · заморозка до ' + p.freeze_days + ' дн.' : ''}</div>
      <div style="font-size:26px;font-weight:700;margin:12px 0">${rub(p.price)}</div>${st.me ? `<div class="mut">На счёте ${rub(st.me.balance)}</div>` : ''}</div><button class="btn full" data-act="buy" data-id="${p.id}">${st.me ? 'Купить' : 'Войти и купить'}</button>`];
  },
  async clubs() {
    const cs = await api('/clubs');
    return ['Клубы', cs.map(c => `<div class="card row"><div class="grow"><b>${esc(c.name)}</b><div class="mut">${esc(c.city)}, ${esc(c.address)}</div>${c.phone ? `<a class="mut" href="tel:${c.phone}">${c.phone}</a>` : ''}</div>${c.id === st.me.club_id ? '<span class="tag ok">мой клуб</span>' : `<button class="btn sm ghost" data-act="chooseClub" data-id="${c.id}">Выбрать</button>`}</div>`).join('')];
  },
  async call() {
    const c = st.me.club;
    return ['Позвонить в клуб', `<div class="card"><b>${esc(c.name)}</b><div class="mut">${esc(c.address)}</div><a class="btn full" style="display:block;text-align:center;margin-top:12px;text-decoration:none" href="tel:${c.phone}">Позвонить ${esc(c.phone || '')}</a></div>`];
  },
  async join() {
    const cs = await api('/clubs');
    return ['Стать членом клуба', `<div class="card"><p class="mut" style="margin-top:0">Оставьте контакты — менеджер клуба перезвонит и подберёт абонемент.</p><label>Имя</label><input id="jn" value="${esc(st.me.name)}"><label>Телефон</label><input id="jp" value="+${st.me.phone}">
      <label>Клуб</label><select id="jc">${cs.map(c => `<option value="${c.id}" ${c.id === st.me.club_id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><label>Комментарий</label><textarea id="jt" rows="2"></textarea><button class="btn full" data-act="join">Отправить заявку</button></div>`];
  },
  async ach() {
    const a = await api('/achievements');
    return ['Мои достижения', a.map(x => `<div class="card"><div class="row"><span style="font-size:22px">${x.done ? '🏆' : '🔒'}</span><b class="grow">${esc(x.title)}</b><span class="mut">${x.have}/${x.need}</span></div><div class="bar2" style="margin-top:8px"><i style="width:${x.have / x.need * 100}%"></i></div></div>`).join('')];
  },
  async trainings() {
    const t = await api('/my-trainings'), lbl = { booked: ['записан', 'ok'], waitlist: ['ожидание', 'warn'], attended: ['посетил', 'ok'], missed: ['пропуск', 'bad'], planned: ['запланирована', 'ok'], done: ['проведена', 'ok'] };
    return ['Мои тренировки', t.map(x => `<div class="card row"><div class="grow"><b>${esc(x.name)}</b><div class="mut">${dt(x.start)} ${tm(x.start)} · ${esc(x.trainer || '')}${x.room ? ' · ' + esc(x.room) : ''}</div></div><span class="tag ${lbl[x.status]?.[1] || ''}">${lbl[x.status]?.[0] || x.status}</span></div>`).join('') || '<div class="empty">Тренировок пока нет</div>'];
  },
  async ptrain() {
    const h = await api('/home'), left = h.memberships.filter(m => m.kind === 'pack').reduce((a, m) => a + (m.sessions_left || 0), 0), pts = h.upcoming.filter(u => u.type === 'personal');
    return ['Персональный тренинг', `<div class="card row"><span class="grow">Осталось персональных</span><b>${left}</b></div>${left ? '' : '<button class="btn full" data-go="shop" style="margin-bottom:10px">Купить пакет</button>'}
      <div class="sec">Записи</div>${pts.map(u => `<div class="card row"><div class="grow"><b>${dt(u.start)} ${tm(u.start)}</b><div class="mut">${esc(u.trainer)}</div></div><button class="btn sm ghost" data-act="cancelPt" data-id="${u.id}">Отменить</button></div>`).join('') || '<div class="empty">Нет записей</div>'}
      <button class="btn full" data-go="pt">Выбрать тренера и время</button>`];
  },
  async feedback() {
    return ['Обратная связь', `<div class="card"><label>Сообщение для клуба</label><textarea id="fb" rows="5" placeholder="Вопрос, пожелание или жалоба"></textarea><button class="btn full" data-act="feedback">Отправить</button></div>`];
  },
  async about() { return ['О приложении', `<div class="card"><b>FitClub</b><div class="mut">Версия 1.0</div><p>Расписание, запись на занятия, абонементы и личный кабинет вашего клуба.</p></div>`]; },
  async news() { const n = await api('/news'); return ['Новости', n.map(x => `<div class="card"><h3>${esc(x.title)}</h3><div>${esc(x.body)}</div><div class="mut">${dt(x.created)}</div></div>`).join('') || '<div class="empty">Новостей нет</div>']; },
  notif: async () => notifScreen(),
};
// ---- client: club choice, «Мой клуб», sign-in by code (screens follow the original's flow) ----
const CKEY = 'fitclub-club';
try { st.clubId = +localStorage.getItem(CKEY) || 0; } catch (e) { st.clubId = 0; }
{ const shared = +new URLSearchParams(location.search).get('club'); if (shared) { st.clubId = shared; st.stack.push({ screen: 'clubpage', arg: shared }); } }
const setClub = id => { st.clubId = +id; try { localStorage.setItem(CKEY, String(id)); } catch (e) {} };
const club = () => st.clubObj || {};
const AUTH_SCREENS = new Set(['home', 'card', 'prof', 'trainings', 'ach', 'ptrain', 'notif', 'feedback']);
const WDS = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
const tint = s => ['#2a9df4', '#f0a23b', '#2e9d4a', '#9b59b6', '#e5484d'][[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % 5];
const dist = c => { if (!st.geo || c.lat == null) return ''; const R = 6371e3, r = x => x * Math.PI / 180, dLa = r(c.lat - st.geo.lat), dLo = r(c.lng - st.geo.lng);
  const m = 2 * R * Math.asin(Math.sqrt(Math.sin(dLa / 2) ** 2 + Math.cos(r(st.geo.lat)) * Math.cos(r(c.lat)) * Math.sin(dLo / 2) ** 2)); return `~${m < 1000 ? Math.round(m / 10) * 10 + 'м' : (m / 1000).toFixed(1) + 'км'} от вас`; };
const classRow = c => { const past = new Date(c.start) < new Date(), free = Math.max(0, c.cap - c.booked);
  return `<div class="slot" style="border-left-color:${tint(c.name)}"><div class="lt"><b style="color:var(--text);font-size:15px">${tm(c.start)}</b><br>${c.minutes} мин</div>
  <div class="grow"><b style="font-size:16px">${free === 0 ? '<span style="color:var(--bad)">! </span>' : ''}${esc(c.name)}</b><div class="mut">${esc(c.room || '')}<br>${esc(c.trainer || '')}<br>Свободных мест ${free} из ${c.cap}</div></div>
  <div class="slotact">${past ? '<span class="tag">прошло</span>' : c.my ? `<span class="tag ${c.my === 'waitlist' ? 'warn' : 'ok'}">${c.my === 'waitlist' ? 'ожидание' : 'вы записаны'}</span><button class="btn sm ghost" data-act="cancelClass" data-id="${c.id}">Отменить</button>` : `<button class="btn sm" data-act="book" data-id="${c.id}">${free ? 'Записаться' : 'В ожидание'}</button>`}</div></div>`; };
Object.assign(C, {
  async onboard() {
    const cs = await api('/clubs'), cities = [...new Set(cs.map(c => c.city))];
    if (!st.city) return ['Выберите город', cities.map(c => `<button class="listrow" data-act="city" data-v="${esc(c)}">${esc(c)}<span class="mut">${cs.filter(x => x.city === c).length} клуб.</span></button>`).join('')];
    return [`Выберите клуб`, clubList(cs.filter(c => c.city === st.city), 'pick')];
  },
  async main() {
    const c = club(), [news, list] = await Promise.all([api('/news?club=' + c.id), api(`/schedule?club=${c.id}&date=` + dayParam(0))]);
    const n = news.length ? news[(st.ni || 0) % news.length] : null, next = list.filter(x => new Date(x.start) > new Date()).slice(0, 5);
    return [c.name, `${n ? `<div class="banner" data-push="newsItem" data-arg="${n.id}"><div class="mut" style="color:#fffc">${dt(n.created)}</div><b>${esc(n.title)}</b><div>${esc(n.body)}</div>${news.length > 1 ? `<button class="bnext" data-act="nextNews">›</button>` : ''}</div>` : ''}
      <div class="loadrow"><span>Текущая<br>загруженность<br>клуба</span><i>${c.load ?? 0}</i></div>
      <div class="mainbtns"><button data-go="ach">🏅 Мои достижения</button><button data-go="trainings">🏃 Мои тренировки</button><button data-go="shop">🛒 Магазин</button></div>
      <div class="row" style="margin:14px 0 8px"><b class="grow">Ближайшие тренировки:</b><button class="lnk" data-go="sched" style="font-size:14px">Все тренировки</button></div>
      ${next.map(classRow).join('') || '<div class="empty">Сегодня тренировок больше нет</div>'}`, 'Мой клуб'];
  },
  async sched() {
    const c = club(), list = await api(`/schedule?club=${c.id}&date=` + dayParam(st.day));
    const kinds = ['Все', ...new Set(list.map(x => x.name))], f = st.filter && kinds.includes(st.filter) ? st.filter : 'Все';
    const sel = dayDate(st.day), mon = (sel.getDay() + 6) % 7;
    const days = [...Array(7)].map((_, i) => st.day - mon + i);
    return [c.name, `<div class="week"><div class="mut" style="text-align:center">${sel.toLocaleDateString('ru', { month: 'long' })}</div><div class="row"><button class="lnk" data-day="${st.day - 7}">‹</button>${days.map(o => { const d = dayDate(o);
      return `<button class="wd ${o === st.day ? 'on' : ''}" data-day="${o}"><small>${WDS[d.getDay()]}</small>${d.getDate()}</button>`; }).join('')}<button class="lnk" data-day="${st.day + 7}">›</button></div></div>
      ${st.showFilter ? `<div class="chips">${kinds.map(k => `<button class="chip ${k === f ? 'on' : ''}" data-filter="${esc(k)}">${esc(k)}</button>`).join('')}</div>` : ''}
      ${list.filter(x => f === 'Все' || x.name === f).map(classRow).join('') || '<div class="empty">Нет занятий в этот день</div>'}`];
  },
  async clubs() {
    const cs = await api('/clubs');
    return ['Клубы', `<div class="tabs2"><button class="${st.map ? '' : 'on'}" data-act="mapMode" data-v="0">СПИСКОМ</button><button class="${st.map ? 'on' : ''}" data-act="mapMode" data-v="1">НА КАРТЕ</button></div>` +
      (st.map ? mapView(cs) : clubList(cs, 'open')), club().city];
  },
  async clubpage(id) {
    const c = await api('/clubs/' + id), mine = +id === st.clubId, wd = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return [c.name, `<div class="card row"><div class="grow"><b style="font-size:18px">${esc(c.name)}</b><div class="mut">${esc(c.city)}, ${esc(c.address)}</div></div><button class="star ${mine ? 'on' : ''}" data-act="chooseClub" data-id="${c.id}" title="Мой клуб">★</button></div>
      <div class="acts3"><a href="tel:${esc(c.phone || '')}">📞<span>Позвонить</span></a><a target="_blank" rel="noopener" href="https://www.openstreetmap.org/directions?to=${c.lat}%2C${c.lng}">🧭<span>Проложить маршрут</span></a><button data-act="share" data-id="${c.id}">🔗<span>Поделиться</span></button></div>
      <div class="loadrow"><span>Текущая<br>загруженность<br>клуба</span><i>${c.load}</i></div>
      <div class="card">${esc(c.description || '')}</div>
      ${c.hours.length ? `<div class="card row" style="align-items:flex-start"><span style="font-size:20px">🕘</span><div>${c.hours.map((h, i) => `${wd[i]} ${esc(h)}`).join('<br>')}</div></div>` : ''}
      <div class="menu"><button data-act="openSched" data-id="${c.id}">📋 Расписание</button><button data-act="openTrainers" data-id="${c.id}">🏋 Тренеры</button></div>`];
  },
  async news() { const n = await api('/news?club=' + club().id); return ['Новости', n.map(x => `<button class="listrow" data-push="newsItem" data-arg="${x.id}" style="display:block"><b>${esc(x.title)}</b><div class="mut" style="margin-top:6px">📅 ${new Date(x.created).toLocaleDateString('ru')}</div></button>`).join('') || '<div class="empty">Новостей нет</div>']; },
  async newsItem(id) { const x = (await api('/news?club=' + club().id)).find(n => n.id == id); return ['Новость', `<div class="card"><div class="mut">${new Date(x.created).toLocaleDateString('ru')}</div><h3>${esc(x.title)}</h3><div>${esc(x.body)}</div></div>`]; },
  async pt() {
    const ts = await api('/trainers?club=' + club().id);
    return ['Тренеры', ts.map(t => `<div class="card row" data-push="trainer" data-arg="${t.id}" style="cursor:pointer"><div class="av">${esc(t.name[0])}</div><div class="grow"><b>${esc(t.name)}</b><div class="mut">${esc(t.spec)} · ${rub(t.price)}</div></div>›</div>`).join('') || '<div class="empty">Тренеров нет</div>'];
  },
  async call() {
    const c = club();
    return ['Позвонить в клуб', `<div class="card"><b>${esc(c.name)}</b><div class="mut">${esc(c.address)}</div><a class="btn full" style="display:block;text-align:center;margin-top:12px;text-decoration:none" href="tel:${esc(c.phone || '')}">Позвонить ${esc(c.phone || '')}</a></div>`];
  },
  async join() {
    return ['Стать членом клуба', `<div class="card"><p class="mut" style="margin-top:0">Оставьте номер — менеджер клуба «${esc(club().name)}» перезвонит и подберёт абонемент.</p>
      <label>Имя</label><input id="jn" value="${esc(st.me?.name || '')}"><label>Номер телефона</label><input id="jp" inputmode="tel" value="${st.me ? '+' + st.me.phone : ''}" placeholder="+7">
      ${consents('j')}<button class="btn full" data-act="join">Отправить заявку</button></div>`];
  },
  async login() {
    return ['Вход', `<p style="text-align:center">Для доступа к разделу нужно войти.<br><span class="mut">Клуб: ${esc(club().name)}</span></p><div class="card">
      <label>Номер телефона</label><input id="lp" inputmode="tel" placeholder="+7 900 000-00-00" value="${esc(st.lphone || '')}">${st.codeSent ? `<label>Код из SMS</label><input id="lc" inputmode="numeric" maxlength="4" placeholder="1234">${st.testCode ? `<div class="mut">Тестовый режим, код: <b>${st.testCode}</b></div>` : ''}<button class="btn full" data-act="verify">Войти</button><button class="lnk" data-act="getCode" style="margin-top:8px">Отправить код ещё раз</button>`
      : `${consents('l')}<button class="btn full" data-act="getCode">Получить код</button>`}</div>
      <p class="mut" style="text-align:center">Вход через Telegram и по звонку подключаются к вашему боту и провайдеру звонков.</p>`];
  },
});
const consents = p => `<label class="chk"><input type="checkbox" id="${p}all" onchange="['${p}r','${p}o'].forEach(i=>document.getElementById(i).checked=this.checked)"> Выбрать все</label>
  <label class="chk"><input type="checkbox" id="${p}r"> Ознакомлен с правилами клуба, согласен на обработку персональных данных</label><label class="chk"><input type="checkbox" id="${p}o"> Ознакомлен с офертой</label>`;
const clubList = (cs, mode) => cs.map(c => `<button class="clubrow" data-act="${mode === 'pick' ? 'pickClubC' : 'openClub'}" data-id="${c.id}"><span class="logo" style="background:${tint(c.name)}">${esc(c.name[0])}</span><span class="grow"><b>${esc(c.name)}</b><br><span class="mut">${esc(c.address)}${dist(c) ? '<br>' + dist(c) : ''}</span>${c.id === st.clubId ? '<br><span class="mytag">☆ МОЙ КЛУБ</span>' : ''}</span></button>`).join('');
const mapView = cs => { const c = cs.find(x => x.id === (st.mapClub || st.clubId)) || cs[0], d = 0.01;
  return `<iframe class="map" title="Карта" src="https://www.openstreetmap.org/export/embed.html?bbox=${c.lng - d}%2C${c.lat - d}%2C${c.lng + d}%2C${c.lat + d}&layer=mapnik&marker=${c.lat}%2C${c.lng}"></iframe>
  <div class="chips">${cs.map(x => `<button class="chip ${x.id === c.id ? 'on' : ''}" data-act="mapClub" data-id="${x.id}">${esc(x.name)}</button>`).join('')}</div><button class="btn full" data-act="openClub" data-id="${c.id}">Открыть ${esc(c.name)}</button>`; };
async function notifScreen() { const n = await api('/notifications'); return ['Уведомления', n.map(x => `<div class="card"><div>${esc(x.text)}</div><div class="mut">${dt(x.created)} ${tm(x.created)}</div></div>`).join('') || '<div class="empty">Пусто</div>']; }

const ic = (() => { const sv = d => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`; return {
  home: sv('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>'), cal: sv('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>'),
  people: sv('<circle cx="12" cy="7" r="2.5"/><circle cx="6" cy="9" r="2"/><circle cx="18" cy="9" r="2"/><path d="M8 20v-4a4 4 0 018 0v4M3 19v-2a3 3 0 013-3M21 19v-2a3 3 0 00-3-3"/>'),
  user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>'), group: sv('<circle cx="12" cy="6" r="2.2"/><circle cx="6.5" cy="8" r="2"/><circle cx="17.5" cy="8" r="2"/><path d="M9 19v-5a3 3 0 016 0v5M4 18v-3a2.5 2.5 0 012.5-2.5M20 18v-3a2.5 2.5 0 00-2.5-2.5"/>'),
  chev: sv('<path d="M6 9l6 6 6-6"/>'), bell: sv('<path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15zM10 21h4"/>'), search: sv('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
  scan: sv('<path d="M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3M8 8v8M11 8v8M14 8v8M17 8v8"/>'), room: sv('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M12 6v12M3 10h3v4H3M21 10h-3v4h3"/>'),
  dots: sv('<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>'), logout: sv('<path d="M14 4H6v16h8M10 12h11M17 8l4 4-4 4"/>'),
  clock: sv('<rect x="3" y="5" width="13" height="13" rx="2"/><path d="M3 9h13M7 3v3M12 3v3"/><circle cx="17" cy="17" r="4"/><path d="M17 15.5V17l1 1"/>'), list: sv('<path d="M6 3h10l3 3v15H6zM9 9h7M9 13h7M9 17h4"/>'),
  info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'), chart: sv('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>') }; })();
// ---------------- trainer (layout follows the original's screens: club header, Главная/Занятия/Клиенты/Профиль) ----------------
const T_TABS = [['home', ic.home, 'Главная'], ['day', ic.cal, 'Занятия'], ['clients', ic.people, 'Клиенты'], ['prof', ic.user, 'Профиль']];
const RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const clubOf = () => { const cs = st.me.clubs; return cs.find(c => c.id === st.club) || cs[0]; };
function clubHeader(actions = '') {
  const c = clubOf();
  return `<div class="clubbar"><div class="clubav">${esc(c.name[0])}</div><button class="grow clubsel" data-act="pickClub"><span class="mut">Клуб</span><b>${esc(c.name)}, ${esc(c.address)}</b></button><span class="chev">${ic.chev}</span>${actions}</div>`;
}
const range = i => { const s = new Date(i.start), e = new Date(s.getTime() + (i.minutes || 60) * 6e4); return `${tm(s)} –<br>${tm(e)}<br>${i.minutes || 60} мин`; };
const T = {
  async home() {
    const h = await api('/trainer/home');
    return ['', clubHeader(`<button class="icbtn" data-push="notif">${ic.bell}${st.me.unread ? `<i class="dot">${st.me.unread}</i>` : ''}</button>`) +
      `<div class="hero"><div style="opacity:.85">Добрый день,</div><b style="font-size:20px">${esc(st.me.name)}</b><div style="margin-top:6px">Сегодня занятий: ${h.today}</div></div>
      <div class="sec">Ближайшие занятия</div>${h.next.map(i => `<div class="lesson ${i.type}" data-push="${i.type === 'class' ? 'cls' : 'pers'}" data-arg="${i.id}"><div class="lt">${ic.group}<div>${dt(i.start)}<br>${tm(i.start)}</div></div><div class="grow"><b>${esc(i.name)}</b><div class="mut">${i.type === 'class' ? 'Групповое' + (i.room ? ' · ' + esc(i.room) : '') : 'Персональное'}</div></div></div>`).join('') || '<div class="emptycard">Ближайших занятий нет</div>'}
      <div class="sec">Последние уведомления</div>${h.notifications.map(notifCard).join('') || '<div class="emptycard">Уведомлений нет</div>'}
      <button class="btn ghost full" data-push="stats">Статистика и начисления</button>`];
  },
  async day() {
    const d = dayDate(st.day), items = await api(`/trainer/day?date=${dayParam(st.day)}&club=${clubOf().id}&q=${encodeURIComponent(st.lq || '')}`);
    const p = dayDate(st.day - 1), n = dayDate(st.day + 1), lbl = x => `${String(x.getDate()).padStart(2, '0')} ${WD[x.getDay()]}`;
    return ['', clubHeader(`<button class="icbtn" data-act="toggleAll" title="Все клубы">${ic.room}</button>`) +
      `<div class="datenav"><button data-day="${st.day - 1}">‹ ${lbl(p)}</button><button class="grow" data-act="calendar"><span class="mut">${st.day === 0 ? 'Сегодня, ' : ''}${WD[d.getDay()]}</span><b>${String(d.getDate()).padStart(2, '0')} ${RU_MONTHS[d.getMonth()]} <span class="chev">${ic.chev}</span></b></button><button data-day="${st.day + 1}">${lbl(n)} ›</button></div>
      <div class="search">${ic.search}<input id="lq" placeholder="Поиск по занятиям и людям" value="${esc(st.lq || '')}"></div>
      <div class="lessons">${items.map(i => `<div class="lesson ${i.type}" data-push="${i.type === 'class' ? 'cls' : 'pers'}" data-arg="${i.id}"><div class="lt">${ic.group}<div>${range(i)}</div></div>
        <div class="grow"><div class="row"><b class="grow" style="font-size:17px">${esc(i.type === 'class' ? i.name : i.client)}</b>${i.unpaid ? '<span class="badge">Не оплачено</span>' : ''}${i.status === 'done' ? '<span class="tag ok">проведено</span>' : i.status === 'missed' ? '<span class="tag bad">неявка</span>' : ''}</div>
        <div class="mut">${esc(st.me.name)}<br>${i.type === 'class' ? 'Групповое' : 'Персональное'}${i.room ? '<br>' + esc(i.room) : ''}${i.type === 'class' ? `<br>Записано ${i.booked} из ${i.cap}` : ''}</div></div></div>`).join('') || '<div class="emptycard">Занятий нет</div>'}</div>
      <button class="fab" data-push="newpt" aria-label="Новое занятие">+</button>`];
  },
  async cls(id) {
    const c = await api('/trainer/classes/' + id);
    return [c.name, `<div class="card"><b>${dt(c.start)}, ${tm(c.start)} · ${c.minutes} мин · ${esc(c.room)}</b><div class="mut">Записано ${c.booked} из ${c.cap}</div></div><div class="sec">Отметка посещений</div>` +
      (c.people.map(p => `<div class="card row"><div class="av">${esc((p.name || p.guest)[0])}</div><div class="grow"><b>${esc(p.name || p.guest)}</b>${p.guest ? '<div class="mut">гость</div>' : ''}${p.status === 'waitlist' ? '<div class="mut">лист ожидания</div>' : ''}${p.paid ? '' : '<div><span class="badge">Не оплачено</span></div>'}</div>
        ${p.status === 'waitlist' ? '' : `<button class="btn sm ${p.status === 'attended' ? '' : 'ghost'}" data-act="mark" data-id="${p.id}" data-v="attended">Пришёл</button><button class="btn sm ${p.status === 'missed' ? 'danger' : 'ghost'}" data-act="mark" data-id="${p.id}" data-v="missed">Нет</button>`}</div>`).join('') || '<div class="emptycard">Никто не записан</div>') +
      `<div class="card"><label>Гость без записи</label><input id="guest" placeholder="Имя гостя"><button class="btn sm" data-act="guest" data-id="${c.id}">Добавить и отметить</button></div>`];
  },
  async pers(id) {
    const p = await api('/trainer/personal/' + id); const open = p.status === 'planned';
    return ['Персональное занятие', `<div class="card row" data-push="client" data-arg="${p.client.id}" style="cursor:pointer"><div class="av">${esc(p.client.name[0])}</div><div class="grow"><b>${esc(p.client.name)}</b><div class="mut">${dt(p.start)} ${tm(p.start)} · в пакете ${p.left}</div></div>›</div>
    ${p.left ? '' : '<div class="card"><span class="badge">Не оплачено</span> <span class="mut">у клиента нет пакета персональных</span></div>'}
    ${p.note ? `<div class="card">📝 ${esc(p.note)}</div>` : ''}
    ${open ? `<div class="row" style="gap:8px"><button class="btn grow" data-act="pstatus" data-id="${p.id}" data-v="done">Проведено</button><button class="btn ghost grow" data-act="pstatus" data-id="${p.id}" data-v="missed">Неявка</button><button class="btn ghost grow" data-act="pstatus" data-id="${p.id}" data-v="cancelled">Отменить</button></div>
    <div class="card" style="margin-top:10px"><label>Перенести на</label><input id="mv" type="datetime-local"><button class="btn sm" data-act="move" data-id="${p.id}">Перенести</button></div>
    <p class="mut">«Проведено» и «Неявка» списывают занятие из пакета клиента.</p>` : `<div class="card">Статус: <b>${{ done: 'проведено', missed: 'неявка', cancelled: 'отменено' }[p.status]}</b></div>`}`];
  },
  async newpt(clientId) {
    const list = clientId ? [] : await api('/trainer/clients?q=' + encodeURIComponent(st.nq || ''));
    const c = clientId ? await api('/trainer/clients/' + clientId) : null;
    return ['Новое персональное', c ? `<div class="card row"><div class="av">${esc(c.name[0])}</div><b class="grow">${esc(c.name)}</b><span class="tag">${c.left} в пакете</span></div>
      <div class="card"><label>Клуб</label><select id="pclub">${st.me.clubs.map(x => `<option value="${x.id}" ${x.id === clubOf().id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><label>Дата и время</label><input id="when" type="datetime-local"><button class="btn full" data-act="addPt" data-id="${c.id}">Записать</button></div>`
      : `<div class="search">${ic.search}<input id="nq" placeholder="Клиент: имя, телефон или № карты" value="${esc(st.nq || '')}"></div>` + list.map(x => clientRow(x, `data-act="pickClient" data-id="${x.id}"`)).join('')];
  },
  async clients() {
    const list = await api(`/trainer/clients?fav=${st.fav ? 1 : 0}&q=${encodeURIComponent(st.q || '')}`);
    return ['', clubHeader(`<button class="icbtn" data-act="scan" title="Номер карты">${ic.scan}</button>`) +
      `<div class="seg"><button class="${st.fav ? '' : 'on'}" data-act="fav" data-v="0">Все</button><button class="${st.fav ? 'on' : ''}" data-act="fav" data-v="1">Избранные</button></div>
      <div class="search">${ic.search}<input id="q" placeholder="Для поиска введите не менее 3 символов" value="${esc(st.q || '')}"></div>` +
      (list.map(x => clientRow(x, `data-push="client" data-arg="${x.id}"`)).join('') || `<div class="emptycard"><div style="font-size:30px">😐</div>Список клиентов пуст</div>`)];
  },
  async client(id) {
    const [c, prods] = await Promise.all([api('/trainer/clients/' + id), api('/trainer/products')]);
    return ['Клиент', `<div class="card row"><div class="av">${esc(c.name[0])}</div><div class="grow"><b>${esc(c.name)}</b><div class="mut">Карта № ${c.card} · <a href="tel:+${c.phone}">+${c.phone}</a></div></div><button class="icbtn" data-act="star" data-id="${c.id}" style="color:${c.fav ? '#f5a524' : 'var(--muted)'}">${c.fav ? '★' : '☆'}</button></div>
    <div class="card row"><span class="grow">Персональных в пакете</span><span class="tag ${c.left > 2 ? 'ok' : c.left ? 'warn' : 'bad'}">${c.left}</span></div>
    <div class="card"><label>Заметка (видите только вы)</label><textarea id="note" rows="3">${esc(c.note)}</textarea><button class="btn sm" data-act="note" data-id="${c.id}">Сохранить</button></div>
    <button class="btn full" data-push="newpt" data-arg="${c.id}">Записать на персональное</button>
    <div class="card" style="margin-top:10px"><h3>Предложить пакет</h3><select id="prod">${prods.map(p => `<option value="${p.id}">${esc(p.name)} — ${rub(p.price)}</option>`).join('')}</select><button class="btn sm" data-act="sell" data-id="${c.id}">Отправить клиенту</button></div>
    <div class="sec">История</div>${c.history.map(p => `<div class="card row" data-push="pers" data-arg="${p.id}" style="cursor:pointer"><span class="grow">${dt(p.start)} ${tm(p.start)}</span><span class="tag ${{ done: 'ok', missed: 'bad' }[p.status] || ''}">${{ planned: 'запланировано', done: 'проведено', missed: 'неявка', cancelled: 'отменено' }[p.status]}</span></div>`).join('') || '<div class="emptycard">Занятий ещё не было</div>'}`];
  },
  async prof() {
    const me = st.me;
    return ['', clubHeader(`<button class="icbtn" data-push="about">${ic.dots}</button>`) +
      `<div class="card row" style="padding:22px 16px"><div class="bigav">${ic.user}</div><div class="grow"><b style="font-size:20px">${esc(me.name)}</b><div class="mut" style="font-size:15px">Тренер</div></div><button class="icbtn" data-act="logout" title="Выйти">${ic.logout}</button></div>
      <div class="menu"><button data-push="notif">${ic.bell}Уведомления${me.unread ? `<i class="dot">${me.unread}</i>` : ''}</button><button data-push="hours">${ic.clock}Рабочее время</button><button data-push="ach">${ic.list}Список достижений</button><button data-push="stats">${ic.chart}Статистика</button><button data-push="about">${ic.info}О приложении</button></div>`];
  },
  async hours() {
    const h = await api('/trainer/hours'), by = Object.fromEntries(h.map(x => [x.weekday, x])), names = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return ['Рабочее время', names.map((n, i) => `<div class="card row"><label class="row grow" style="color:var(--text);font-size:15px"><input type="checkbox" id="w${i}" style="width:auto;margin:0" ${by[i] ? 'checked' : ''}> ${n}</label>
      <input id="s${i}" type="time" value="${by[i]?.start || '09:00'}" style="width:96px;margin:0"><input id="e${i}" type="time" value="${by[i]?.end || '21:00'}" style="width:96px;margin:0"></div>`).join('') + '<button class="btn full" data-act="saveHours">Сохранить</button>'];
  },
  async ach() {
    const a = await api('/trainer/achievements');
    return ['Список достижений', a.map(x => `<div class="card"><div class="row"><span style="font-size:22px">${x.done ? '🏆' : '🔒'}</span><b class="grow">${esc(x.title)}</b><span class="mut">${x.have}/${x.need}</span></div><div class="bar2" style="margin-top:8px"><i style="width:${x.have / x.need * 100}%"></i></div></div>`).join('')];
  },
  async about() { return ['О приложении', `<div class="card"><b>FitClub Тренер</b><div class="mut">Версия 1.0</div><p>Расписание тренера, отметка посещений, персональные занятия и клиенты клуба.</p></div>`]; },
  async stats() {
    const s = await api('/trainer/stats?days=' + (st.period || 30));
    return ['Статистика', `<div class="chips">${[7, 30, 90].map(d => `<button class="chip ${d === s.days ? 'on' : ''}" data-period="${d}">${d} дней</button>`).join('')}</div>
    <div class="card row"><div class="stat"><b>${s.done}</b>персональных</div><div class="stat"><b>${s.groups}</b>групповых</div><div class="stat"><b>${s.missed}</b>неявок</div></div>
    <div class="card row"><div class="stat"><b>${s.visitors}</b>посещений групп</div></div>
    <div class="card"><h3>Начислено</h3><b style="font-size:24px">${rub(s.salary)}</b><div class="mut">${rub(s.rates.personal)} за персональное · ${rub(s.rates.group)} за групповое</div></div>
    <div class="card"><h3>Пакет заканчивается</h3>${s.lowPack.map(c => `<div class="row" style="padding:4px 0" data-push="client" data-arg="${c.id}"><span class="grow">${esc(c.name)}</span><span class="tag ${c.sessions_left ? 'warn' : 'bad'}">${c.sessions_left}</span></div>`).join('') || '<span class="mut">Нет</span>'}</div>`];
  },
  notif: async () => { const n = await api('/notifications'); return ['Уведомления', n.map(notifCard).join('') || '<div class="emptycard">Уведомлений нет</div>']; },
};
const clientRow = (x, attrs) => `<div class="card row" ${attrs} style="cursor:pointer"><div class="av">${esc(x.name[0])}</div><div class="grow"><b>${esc(x.name)}</b><div class="mut">${esc(x.note || '+' + x.phone)}</div></div>${x.fav ? '<span style="color:#f5a524">★</span>' : ''}<span class="tag ${x.left > 2 ? 'ok' : x.left ? 'warn' : 'bad'}">${x.left}</span></div>`;
const notifCard = x => `<div class="card row" ${x.link_type ? `data-push="${x.link_type === 'class' ? 'cls' : 'pers'}" data-arg="${x.link_id}" style="cursor:pointer"` : ''}><div class="grow"><div style="font-size:16px">${esc(x.text)}</div><div class="mut">${new Date(x.created).toLocaleDateString('ru')}</div></div>${x.link_type ? '<span class="mut">›</span>' : ''}</div>`;
async function calendarSheet() {
  const base = dayDate(st.day); let y = st.calY ?? base.getFullYear(), m = st.calM ?? base.getMonth();
  const dots = new Set(await api(`/trainer/month?y=${y}&m=${m}`));
  const first = new Date(y, m, 1), start = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), today = new Date(); today.setHours(0, 0, 0, 0);
  const mn = i => new Date(y, m + i, 1).toLocaleDateString('ru', { month: 'long', year: 'numeric' });
  let cells = ''; for (let i = 0; i < 42; i++) { const d = new Date(y, m, i - start + 1), iso = d.toLocaleDateString('sv-SE'), off = Math.round((d - today) / 864e5);
    cells += `<button class="cd ${d.getMonth() !== m ? 'out' : ''} ${off === st.day ? 'sel' : ''}" data-act="calPick" data-off="${off}">${d.getDate()}${dots.has(iso) ? '<i></i>' : ''}</button>`; if (i >= 34 && i - start + 1 >= days) break; }
  return `<div class="sheet-bg" data-act="calClose"></div><div class="sheet"><div class="row"><button class="lnk" data-act="calMove" data-v="-1">‹ ${mn(-1)}</button><b class="grow" style="text-align:center;font-size:18px">${new Date(y, m, 1).toLocaleDateString('ru', { month: 'long' })}</b><button class="lnk" data-act="calMove" data-v="1">${mn(1)} ›</button></div>
    <div class="cal">${['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(w => `<span>${w}</span>`).join('')}${cells}</div></div>`;
}

// ---------------- QR (visual code from id; decoding needs a matching reception scanner) ----------------
function qr(text) {
  let h = 2166136261; const bits = []; for (let i = 0; i < 625; i++) { h ^= text.charCodeAt(i % text.length) + i; h = Math.imul(h, 16777619) >>> 0; bits.push(h & 1); }
  let r = ''; for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
    const f = (a, b) => x >= a && x < a + 7 && y >= b && y < b + 7, fin = f(0, 0) || f(18, 0) || f(0, 18);
    let on = bits[y * 25 + x]; if (fin) { const cx = x % 18, cy = y % 18; on = cx === 0 || cx === 6 || cy === 0 || cy === 6 || (cx > 1 && cx < 5 && cy > 1 && cy < 5); }
    if (on) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg class="qr" viewBox="0 0 25 25" shape-rendering="crispEdges">${r}</svg>`;
}

// ---------------- render ----------------
async function renderClient(app) {
  try {
    st.me = token ? await api('/me').catch(() => null) : null;
    if (st.me && !st.clubId) setClub(st.me.club_id);
    const top = st.stack[st.stack.length - 1];
    if (!st.clubId) { const [title, body] = await C.onboard(); app.innerHTML = `<div class="appbar">${st.city ? '<button data-act="city" data-v="">←</button>' : ''}<b class="grow">${esc(title)}</b></div><main>${body}</main>`; return; }
    st.clubObj = st.me?.club?.id === st.clubId ? { ...(await api('/clubs/' + st.clubId)) } : await api('/clubs/' + st.clubId).catch(() => { setClub(0); return null; });
    if (!st.clubObj) return renderClient(app);
    st.tab ||= 'main';
    const cur = top ? top.screen : st.tab, gated = AUTH_SCREENS.has(cur) && !st.me;
    const [title, body, sub] = gated ? await C.login() : top ? await C[top.screen](top.arg) : await C[st.tab]();
    const y = window.scrollY, same = app.dataset.view === cur;
    app.innerHTML = `<div class="appbar">${top ? '<button data-back>←</button>' : '<button data-act="drawer" aria-label="Меню">☰</button>'}<b class="grow">${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ''}</b>${cur === 'shop' ? `<button data-act="shopSearch">${ic.search}</button>` : ''}${cur === 'main' ? `<a href="tel:${esc(club().phone || '')}" style="color:#fff">📞</a>` : ''}${cur === 'sched' ? '<button data-act="toggleFilter" title="Фильтр">⏷</button>' : ''}${cur === 'clubs' ? '<button data-act="geo" title="Рядом со мной">📍</button>' : ''}</div><main>${body}</main>
      ${st.drawer ? `<div class="sheet-bg" data-act="drawer"></div><aside class="drawer"><button class="dhead" data-go="main">${esc(club().name)}</button><nav>${C_MENU.map(([k, l]) => `<button class="${k === st.tab ? 'on' : ''}" data-go="${k}">${l}${k === 'notif' && st.me?.unread ? ` <i class="dot">${st.me.unread}</i>` : ''}</button>`).join('')}</nav>
        <button class="dexit" data-act="exitClub"><span><b>Выйти из ${esc(club().name)}</b><br><span class="mut">После выхода нужно будет снова выбрать город, клуб и войти</span></span>${ic.logout}</button></aside>` : ''}`;
    app.dataset.view = cur; if (same) window.scrollTo(0, y); else window.scrollTo(0, 0);
    const sq = $('#shopq'); if (sq) sq.oninput = () => { st.shopq = sq.value; clearTimeout(sq._t); sq._t = setTimeout(async () => { await render(); const n = $('#shopq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300); };
  } catch (e) { app.innerHTML = `<div class="login"><p>${esc(e.message)}</p><button class="btn" onclick="location.reload()">Повторить</button></div>`; }
}
async function render() {
  const app = $('#app');
  if (MODE === 'client') return renderClient(app);
  if (!token) { app.innerHTML = await loginScreen(); return; }
  try {
    st.me = await api('/me');
    const S = MODE === 'trainer' ? T : C, tabs = MODE === 'trainer' ? T_TABS : C_TABS;
    st.tab ||= MODE === 'client' ? 'sched' : tabs[0][0];
    const top = st.stack[st.stack.length - 1];
    const [title, body] = top ? await S[top.screen](top.arg) : await S[st.tab]();
    const y = window.scrollY, same = app.dataset.view === (top ? top.screen + top.arg : st.tab);
    app.innerHTML = `${title || top ? `<div class="bar">${top ? `<button data-back>${MODE === 'trainer' ? '←' : '‹ Назад'}</button>` : ''}<b>${esc(title)}</b></div>` : ''}<main>${body}</main>${st.cal ? await calendarSheet() : ''}
      <nav class="tabs">${tabs.map(t => `<button class="${t[0] === st.tab && !top ? 'on' : ''}" data-tab="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</nav>`;
    app.dataset.view = top ? top.screen + top.arg : st.tab; if (same) window.scrollTo(0, y); else window.scrollTo(0, 0);
    for (const [id, key] of [['lq', 'lq'], ['nq', 'nq']]) { const el = $('#' + id); if (el) el.oninput = () => { st[key] = el.value; clearTimeout(el._t); el._t = setTimeout(async () => { await render(); const n = $('#' + id); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300); }; }
    const qi = $('#q'); if (qi) { qi.oninput = () => { st.q = qi.value; clearTimeout(qi._t); qi._t = setTimeout(async () => { await render(); const n = $('#q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); }; }
  } catch (e) { if (token) app.innerHTML = `<div class="login"><p>${esc(e.message)}</p><button class="btn" onclick="location.reload()">Повторить</button></div>`; }
}
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { st.tab = g.dataset.go; st.stack = []; st.drawer = false; return render(); }
  const t = e.target.closest('[data-tab],[data-back],[data-push],[data-day],[data-filter],[data-period],[data-act]'); if (!t) return; const d = t.dataset;
  if (d.tab) { st.tab = d.tab; st.stack = []; return render(); }
  if ('back' in d) { st.stack.pop(); return render(); }
  if (d.push) return push(d.push, d.arg);
  if (d.day) { st.day = +d.day; return render(); }
  if (d.filter) { st.filter = d.filter; return render(); }
  if (d.period) { st.period = +d.period; return render(); }
  const v = id => $('#' + id)?.value, id = d.id;
  const A = {
    async login() {
      const reg = !$('#reg').hidden; const r = await api(reg ? '/register' : '/login', { body: { phone: v('ph'), password: v('pw'), name: v('nm'), club_id: v('cl'), role: MODE } });
      token = r.token; try { localStorage.setItem(KEY, token); } catch (e) {} st.stack = []; st.tab = null;
    },
    regtoggle() { $('#reg').hidden = !$('#reg').hidden; t.textContent = $('#reg').hidden ? 'Регистрация' : 'У меня есть аккаунт'; $('[data-act=login]').textContent = $('#reg').hidden ? 'Войти' : 'Создать аккаунт'; return 'noop'; },
    book: async () => { if (!token) { st.stack.push({ screen: 'login' }); return; } const r = await api(`/classes/${id}/book`, { body: {} }); toast(r.status === 'booked' ? 'Вы записаны' : 'Вы в листе ожидания'); },
    cancelClass: async () => { if (!confirm('Отменить запись?')) return 'noop'; await api(`/classes/${id}/cancel`, { body: {} }); toast('Запись отменена'); },
    cancelPt: async () => { if (!confirm('Отменить тренировку?')) return 'noop'; await api(`/personal/${id}/cancel`, { body: {} }); toast('Тренировка отменена'); },
    bookPt: async () => { if (!token) { st.stack.push({ screen: 'login' }); return; } await api('/personal', { body: { trainer_id: d.t, start: d.s } }); toast('Вы записаны к тренеру'); st.stack = []; st.tab = 'home'; },
    freeze: async () => { const frozen = t.textContent === 'Разморозить'; let days = 7; if (!frozen) { days = prompt('На сколько дней заморозить?', '7'); if (!days) return 'noop'; } await api(`/memberships/${id}/freeze`, { body: { days: +days } }); toast(frozen ? 'Абонемент разморожен' : 'Абонемент заморожен'); },
    buy: async () => { if (!token) { st.stack.push({ screen: 'login' }); return; } await api(`/products/${id}/buy`, { body: {} }); toast('Оплачено'); if (st.stack.length) st.stack.pop(); },
    topup: async () => { await api('/topup', { body: { amount: +v('amt') } }); toast('Счёт пополнен'); },
    checkin: async () => { await api('/checkin', { body: {} }); toast('Добро пожаловать!'); },
    setClub: async () => { await api('/me', { method: 'PATCH', body: { club_id: +v('club') } }); toast('Клуб изменён'); },
    logout: () => { logout(); return 'noop'; },
    delete: async () => { if (!confirm('Удалить аккаунт и все данные без возможности восстановления?')) return 'noop'; await api('/me', { method: 'DELETE' }); logout(true); return 'noop'; },
    mark: async () => { await api(`/trainer/bookings/${id}/mark`, { body: { status: d.v } }); },
    guest: async () => { await api(`/trainer/classes/${id}/guest`, { body: { name: v('guest') } }); toast('Гость добавлен'); },
    pstatus: async () => { if (d.v === 'cancelled' && !confirm('Отменить тренировку?')) return 'noop'; await api(`/trainer/personal/${id}/status`, { body: { status: d.v } }); toast('Сохранено'); },
    move: async () => { if (!v('mv')) throw new Error('Выберите время'); await api(`/trainer/personal/${id}/move`, { body: { start: new Date(v('mv')).toISOString() } }); toast('Перенесено'); },
    note: async () => { await api(`/trainer/clients/${id}/note`, { method: 'PUT', body: { text: v('note') } }); toast('Заметка сохранена'); },
    addPt: async () => { if (!v('when')) throw new Error('Выберите время'); await api('/personal', { body: { client_id: +id, club_id: +(v('pclub') || 0) || undefined, start: new Date(v('when')).toISOString() } }); toast('Клиент записан'); st.stack.pop(); },
    drawer: () => { st.drawer = !st.drawer; },
    city: () => { st.city = d.v; },
    pickClubC: () => { setClub(id); st.city = null; st.tab = 'main'; },
    openClub: () => { st.stack.push({ screen: 'clubpage', arg: id }); },
    mapMode: () => { st.map = d.v === '1'; },
    mapClub: () => { st.mapClub = +id; },
    geo: () => { if (!navigator.geolocation) throw new Error('Геолокация недоступна'); navigator.geolocation.getCurrentPosition(p => { st.geo = { lat: p.coords.latitude, lng: p.coords.longitude }; render(); }, () => toast('Нет доступа к геолокации')); return 'noop'; },
    share: async () => { const url = location.origin + '/?club=' + id; if (navigator.share) await navigator.share({ title: club().name, url }).catch(() => {}); else { await navigator.clipboard?.writeText(url); toast('Ссылка скопирована'); } return 'noop'; },
    openSched: () => { setClub(id); st.tab = 'sched'; st.stack = []; },
    openTrainers: () => { setClub(id); st.tab = 'pt'; st.stack = []; },
    nextNews: () => { st.ni = (st.ni || 0) + 1; },
    toggleFilter: () => { st.showFilter = !st.showFilter; },
    exitClub: () => { if (token) api('/logout', { body: {} }).catch(() => {}); token = null; try { localStorage.removeItem(KEY); localStorage.removeItem(CKEY); } catch (e) {} st.clubId = 0; st.me = null; st.tab = 'main'; st.stack = []; st.drawer = false; },
    getCode: async () => { const ph = v('lp'); if (!st.codeSent && !($('#lr').checked && $('#lo').checked)) throw new Error('Отметьте согласие с правилами и офертой');
      const r = await api('/auth/code', { body: { phone: ph, consent_rules: true, consent_offer: true } }); st.lphone = ph; st.codeSent = true; st.testCode = r.test_code; toast('Код отправлен'); },
    verify: async () => { const r = await api('/auth/verify', { body: { phone: st.lphone, code: v('lc'), club_id: st.clubId } }); token = r.token; try { localStorage.setItem(KEY, token); } catch (e) {} st.codeSent = false; st.testCode = null; toast('Вы вошли'); },
    shopSearch: () => { st.shopSearch = !st.shopSearch; if (!st.shopSearch) st.shopq = ''; },
    acc: () => { st.closed[d.c] = !st.closed[d.c]; },
    chooseClub: async () => { if (token) await api('/me', { method: 'PATCH', body: { club_id: +id } }); setClub(id); toast('Это ваш клуб'); },
    join: async () => { if (!($('#jr').checked && $('#jo').checked)) throw new Error('Отметьте согласие с правилами и офертой'); await api('/join', { body: { name: v('jn'), phone: v('jp'), club_id: +v('jc'), text: v('jt') } }); toast('Заявка отправлена, вам перезвонят'); },
    feedback: async () => { await api('/feedback', { body: { text: v('fb') } }); toast('Спасибо! Сообщение отправлено'); $('#fb').value = ''; return 'noop'; },
    pickClub: () => { const cs = st.me.clubs; if (cs.length < 2) { toast('Вы работаете в одном клубе'); return 'noop'; } const i = cs.indexOf(clubOf()); st.club = cs[(i + 1) % cs.length].id; toast('Клуб: ' + clubOf().name); },
    toggleAll: () => { toast('Показаны занятия клуба ' + clubOf().name); return 'noop'; },
    calendar: () => { st.cal = true; st.calY = st.calM = undefined; },
    calClose: () => { st.cal = false; },
    calMove: () => { const b = dayDate(st.day); let y = st.calY ?? b.getFullYear(), m = (st.calM ?? b.getMonth()) + +d.v; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } st.calY = y; st.calM = m; },
    calPick: () => { st.day = +d.off; st.cal = false; },
    fav: () => { st.fav = d.v === '1'; },
    star: async () => { const r = await api(`/trainer/favorites/${id}`, { body: {} }); toast(r.fav ? 'Добавлен в избранные' : 'Убран из избранных'); },
    scan: () => { const n = prompt('Номер клубной карты'); if (!n) return 'noop'; st.q = n.replace(/\D/g, ''); },
    pickClient: () => { st.stack[st.stack.length - 1].arg = id; },
    saveHours: async () => { const hours = []; for (let i = 0; i < 7; i++) if ($('#w' + i).checked) hours.push({ weekday: i, start: v('s' + i), end: v('e' + i) }); await api('/trainer/hours', { method: 'PUT', body: { hours } }); toast('Рабочее время сохранено'); },
    sell: async () => { await api(`/trainer/clients/${id}/sell`, { body: { product_id: +v('prod') } }); toast('Предложение отправлено клиенту'); },
  };
  (async () => { t.disabled = true; try { const r = await A[d.act](); if (r !== 'noop') await render(); } catch (err) { toast(err.message); } finally { t.disabled = false; } })();
});
window.addEventListener('hashchange', () => location.reload());
render();
</script>
</body>
</html>
```

## Код: public/manifest.webmanifest
```json
{"name":"FitClub","short_name":"FitClub","start_url":"/","display":"standalone","background_color":"#f2f3f7","theme_color":"#4f46e5"}
```
