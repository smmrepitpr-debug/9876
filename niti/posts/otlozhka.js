// Ставит 14 постов из posts.json в отложку группы vk.com/pokupay_u_svoi (каждый день в 12:00 МСК).
// Запуск: положи рядом token.txt с ключом сообщества и выполни  node otlozhka.js
// Картинки (файлы ГГГГ-ММ-ДД.png) добавь к постам вручную: Управление → Отложенные записи.
const fs = require('fs');
const TOKEN = (process.env.VK_TOKEN || fs.readFileSync(__dirname + '/token.txt', 'utf8')).trim();
const SCREEN = 'pokupay_u_svoi', TIME = '12:00';
const posts = JSON.parse(fs.readFileSync(__dirname + '/posts.json', 'utf8'));

async function vk(method, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN, v: '5.199' });
  const r = await (await fetch('https://api.vk.com/method/' + method, { method: 'POST', body })).json();
  if (r.error) throw new Error(method + ': ' + r.error.error_msg);
  return r.response;
}

(async () => {
  const g = await vk('groups.getById', { group_id: SCREEN });
  const id = (g.groups || g)[0].id;
  console.log('Группа:', (g.groups || g)[0].name, id);
  for (const p of posts) {
    const ts = Math.floor(new Date(`${p.date}T${TIME}:00+03:00`).getTime() / 1000);
    try {
      const r = await vk('wall.post', { owner_id: -id, from_group: 1, message: p.text, publish_date: ts });
      console.log(p.date, '-> post_id', r.post_id);
    } catch (e) { console.log(p.date, 'ОШИБКА:', e.message); }
    await new Promise(r => setTimeout(r, 400));
  }
})();
