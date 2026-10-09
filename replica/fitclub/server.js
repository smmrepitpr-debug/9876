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
CREATE TABLE IF NOT EXISTS clubs(id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, address TEXT);
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
  kind TEXT NOT NULL CHECK(kind IN('membership','pack','single')), price INTEGER NOT NULL, days INTEGER, sessions INTEGER, freeze_days INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS memberships(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), product_id INTEGER NOT NULL REFERENCES products(id),
  club_id INTEGER NOT NULL, until TEXT, sessions_left INTEGER, freeze_left INTEGER DEFAULT 0, frozen_until TEXT, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transactions(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL, title TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), club_id INTEGER NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS news(id INTEGER PRIMARY KEY, club_id INTEGER NOT NULL REFERENCES clubs(id), title TEXT NOT NULL, body TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), text TEXT NOT NULL, read INTEGER DEFAULT 0, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notes(trainer_id INTEGER NOT NULL, client_id INTEGER NOT NULL, text TEXT NOT NULL, PRIMARY KEY(trainer_id,client_id));
`);

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
const notify = (uid, text) => run('INSERT INTO notifications(user_id,text,created) VALUES(?,?,?)', uid, text, now());
const fmt = iso => new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });

// ---------- seed ----------
if (!one('SELECT 1 x FROM clubs')) tx(() => {
  run("INSERT INTO clubs(name,city,address) VALUES('FitClub Центр','Москва','ул. Примерная, 1'),('FitClub Север','Москва','пр. Тестовый, 15'),('FitClub Нева','Санкт-Петербург','наб. Демо, 7')");
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
    run("INSERT INTO products(club_id,name,kind,price,days,sessions,freeze_days) VALUES(?,?,?,?,?,?,?)", club, 'Безлимит 1 месяц', 'membership', 6500, 30, null, 7);
    run("INSERT INTO products(club_id,name,kind,price,days,sessions,freeze_days) VALUES(?,?,?,?,?,?,?)", club, 'Безлимит 12 месяцев', 'membership', 45000, 365, null, 60);
    run("INSERT INTO products(club_id,name,kind,price,days,sessions,freeze_days) VALUES(?,?,?,?,?,?,?)", club, 'Пакет 10 персональных', 'pack', 25000, 90, 10, 0);
    run("INSERT INTO products(club_id,name,kind,price,days,sessions,freeze_days) VALUES(?,?,?,?,?,?,?)", club, 'Разовое посещение', 'single', 1200, 1, 1, 0);
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

R('GET', '/api/clubs', null, () => q('SELECT * FROM clubs ORDER BY city,name'));
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
R('GET', '/api/schedule', 'any', ({ u, query }) => {
  const club = +query.club || u.club_id; const from = new Date(query.date || Date.now()); from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from.getTime() + 864e5);
  return q('SELECT * FROM classes WHERE club_id=? AND start>=? AND start<? ORDER BY start', club, from.toISOString(), to.toISOString()).map(c => classView(c, u.id));
});
R('POST', '/api/classes/:id/book', 'client', ({ u, params }) => tx(() => {
  const c = one('SELECT * FROM classes WHERE id=?', +params.id); if (!c) throw new E(404, 'Занятие не найдено');
  if (new Date(c.start) < new Date()) throw new E(400, 'Занятие уже прошло');
  if (!activeMembership(u.id, c.club_id) && !packOf(u.id, c.club_id)) throw new E(402, 'Нет действующего абонемента в этом клубе');
  if (one("SELECT 1 x FROM bookings WHERE class_id=? AND user_id=? AND status<>'cancelled'", c.id, u.id)) throw new E(409, 'Вы уже записаны');
  const booked = one("SELECT COUNT(*) n FROM bookings WHERE class_id=? AND status='booked'", c.id).n;
  const status = booked >= c.cap ? 'waitlist' : 'booked';
  run('INSERT INTO bookings(class_id,user_id,status,created) VALUES(?,?,?,?)', c.id, u.id, status, now());
  notify(u.id, status === 'booked' ? `Вы записаны на «${c.name}» ${fmt(c.start)}` : `Вы в листе ожидания на «${c.name}» ${fmt(c.start)}`);
  return { status };
}));
R('POST', '/api/classes/:id/cancel', 'client', ({ u, params }) => tx(() => {
  const b = one("SELECT * FROM bookings WHERE class_id=? AND user_id=? AND status IN('booked','waitlist')", +params.id, u.id);
  if (!b) throw new E(404, 'Записи нет');
  const c = one('SELECT * FROM classes WHERE id=?', b.class_id);
  if (new Date(c.start) - Date.now() < 2 * 36e5 && b.status === 'booked') throw new E(400, 'Отмена возможна не позднее чем за 2 часа');
  run("UPDATE bookings SET status='cancelled' WHERE id=?", b.id); promoteWaitlist(c.id); return { ok: true };
}));
R('GET', '/api/trainers', 'any', ({ u, query }) => q('SELECT u.id,u.name,u.spec,u.price FROM users u JOIN trainer_clubs t ON t.trainer_id=u.id WHERE t.club_id=?', +query.club || u.club_id));
R('GET', '/api/trainers/:id/slots', 'any', ({ params, query }) => {
  const day = new Date(query.date || Date.now()); day.setUTCHours(0, 0, 0, 0);
  const res = [];
  for (let h = 4; h <= 18; h++) { const s = new Date(day.getTime() + h * 36e5); if (s > new Date() && slotFree(+params.id, s.toISOString())) res.push(s.toISOString()); }
  return res;
});
R('POST', '/api/personal', 'any', ({ u }, b) => tx(() => {
  // client books themself; trainer books a client
  const isTrainer = u.role === 'trainer';
  const trainer = isTrainer ? u.id : +b.trainer_id, client = isTrainer ? +b.client_id : u.id, club = +b.club_id || (isTrainer ? one('SELECT club_id FROM trainer_clubs WHERE trainer_id=?', u.id).club_id : u.club_id);
  if (!one("SELECT 1 x FROM users WHERE id=? AND role='client'", client)) throw new E(404, 'Клиент не найден');
  if (!canTrainAt(trainer, club)) throw new E(400, 'Тренер не работает в этом клубе');
  const start = new Date(b.start); if (isNaN(start) || start < new Date()) throw new E(400, 'Неверное время');
  if (!slotFree(trainer, start.toISOString())) throw new E(409, 'Это время занято');
  if (!packOf(client, club)) throw new E(402, 'Нет пакета персональных тренировок');
  const id = run("INSERT INTO personal(club_id,trainer_id,client_id,start,status) VALUES(?,?,?,?,'planned')", club, trainer, client, start.toISOString()).lastInsertRowid;
  const tn = one('SELECT name FROM users WHERE id=?', trainer).name;
  notify(client, `Персональная тренировка: ${tn}, ${fmt(start.toISOString())}`);
  if (!isTrainer) notify(trainer, `Новая запись: ${u.name}, ${fmt(start.toISOString())}`);
  return { id };
}));
R('POST', '/api/personal/:id/cancel', 'client', ({ u, params }) => tx(() => {
  const p = one("SELECT * FROM personal WHERE id=? AND client_id=? AND status='planned'", +params.id, u.id); if (!p) throw new E(404, 'Не найдено');
  run("UPDATE personal SET status='cancelled' WHERE id=?", p.id); notify(p.trainer_id, `${u.name} отменил(а) тренировку ${fmt(p.start)}`); return { ok: true };
}));
R('GET', '/api/products', 'client', ({ u }) => q('SELECT * FROM products WHERE club_id=? ORDER BY price', u.club_id));
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
R('GET', '/api/news', 'any', ({ u, query }) => q('SELECT * FROM news WHERE club_id=? ORDER BY id DESC', +query.club || u.club_id));
R('GET', '/api/notifications', 'any', ({ u }) => { const r = q('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50', u.id); run('UPDATE notifications SET read=1 WHERE user_id=?', u.id); return r; });

// --- trainer app ---
R('GET', '/api/trainer/day', 'trainer', ({ u, query }) => {
  const from = new Date(query.date || Date.now()); from.setUTCHours(0, 0, 0, 0); const to = new Date(from.getTime() + 864e5);
  const classes = q('SELECT c.*,cl.name club FROM classes c JOIN clubs cl ON cl.id=c.club_id WHERE trainer_id=? AND start>=? AND start<?', u.id, from.toISOString(), to.toISOString()).map(c => ({ ...classView(c), type: 'class' }));
  const pers = q("SELECT p.*,u.name client,cl.name club FROM personal p JOIN users u ON u.id=p.client_id JOIN clubs cl ON cl.id=p.club_id WHERE trainer_id=? AND start>=? AND start<? AND status<>'cancelled'", u.id, from.toISOString(), to.toISOString()).map(p => ({ ...p, type: 'personal' }));
  return [...classes, ...pers].sort((a, b) => a.start.localeCompare(b.start));
});
const myClass = (u, id) => { const c = one('SELECT * FROM classes WHERE id=? AND trainer_id=?', +id, u.id); if (!c) throw new E(404, 'Занятие не найдено'); return c; };
R('GET', '/api/trainer/classes/:id', 'trainer', ({ u, params }) => {
  const c = myClass(u, params.id);
  return { ...classView(c), people: q("SELECT b.id,b.status,b.guest,u.name,u.id user_id FROM bookings b LEFT JOIN users u ON u.id=b.user_id WHERE class_id=? AND b.status<>'cancelled' ORDER BY b.status='waitlist', b.id", c.id) };
});
R('POST', '/api/trainer/bookings/:id/mark', 'trainer', ({ u, params }, b) => tx(() => {
  const bk = one('SELECT * FROM bookings WHERE id=?', +params.id); if (!bk) throw new E(404, 'Нет записи'); const c = myClass(u, bk.class_id);
  if (!['attended', 'missed'].includes(b.status)) throw new E(400, 'Неверный статус');
  if (bk.status === 'waitlist') throw new E(400, 'Клиент в листе ожидания');
  const was = bk.status; run('UPDATE bookings SET status=? WHERE id=?', b.status, bk.id);
  if (bk.user_id && b.status === 'attended' && was !== 'attended') {
    run('INSERT INTO visits(user_id,club_id,at) VALUES(?,?,?)', bk.user_id, c.club_id, c.start);
    const single = one("SELECT m.id FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND m.club_id=? AND p.kind='single' AND m.sessions_left>0", bk.user_id, c.club_id);
    const unlimited = one("SELECT 1 x FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND m.club_id=? AND p.kind='membership' AND m.until>?", bk.user_id, c.club_id, now());
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
  const like = '%' + String(query.q || '') + '%';
  return q(`SELECT DISTINCT u.id,u.name,u.phone FROM users u WHERE u.role='client' AND u.club_id IN (SELECT club_id FROM trainer_clubs WHERE trainer_id=?) AND (u.name LIKE ? OR u.phone LIKE ?) ORDER BY u.name LIMIT 100`, u.id, like, like)
    .map(c => ({ ...c, left: one("SELECT COALESCE(SUM(sessions_left),0) n FROM memberships m JOIN products p ON p.id=m.product_id WHERE m.user_id=? AND p.kind='pack' AND m.until>?", c.id, now()).n,
      note: one('SELECT text FROM notes WHERE trainer_id=? AND client_id=?', u.id, c.id)?.text || '' }));
});
R('GET', '/api/trainer/clients/:id', 'trainer', ({ u, params }) => {
  const c = one("SELECT id,name,phone,club_id FROM users WHERE id=? AND role='client'", +params.id); if (!c) throw new E(404, 'Клиент не найден');
  return { ...c, left: packOf(c.id, c.club_id)?.sessions_left || 0, note: one('SELECT text FROM notes WHERE trainer_id=? AND client_id=?', u.id, c.id)?.text || '',
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
      if (!ctx.u) throw new E(401, 'Войдите заново');
      const role = ctx.u.role === 'admin' ? r.role : ctx.u.role;
      if (r.role !== 'any' && role !== r.role) throw new E(403, 'Нет доступа');
    }
    send(200, await r.fn(ctx, body));
  } catch (e) {
    if (!(e instanceof E)) console.error(e);
    send(e instanceof E ? e.code : e instanceof SyntaxError ? 400 : 500, { error: e instanceof E ? e.message : 'Ошибка сервера' });
  }
}).listen(PORT, () => console.log(`FitClub: http://localhost:${PORT}  (клиент: /  тренер: /#trainer)`));
