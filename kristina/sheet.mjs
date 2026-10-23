import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
const dir = path.dirname(fileURLToPath(import.meta.url)), o = process.env.OUT || '/tmp/sheet'; fs.mkdirSync(o, { recursive: true });
const browser = await pw.chromium.launch({ args: ['--font-render-hinting=none'] });
const Vs = (process.env.VS || '1,2,3,4,5').split(','), Ts = (process.env.TS || '1.8,4.5,7,10,13,16,20,24').split(',').map(Number);
for (const V of Vs) { const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(pathToFileURL(path.join(dir, 'nauchpop.html')).href + `?v=${V}&render=1`); await page.waitForFunction(() => window.READY === true); await page.waitForTimeout(300);
  for (const t of Ts) { await page.evaluate(t => window.seek(t), t); fs.writeFileSync(`${o}/v${V}_${t}.jpg`, await page.screenshot({ type: 'jpeg', quality: 80 })); } await page.close(); }
await browser.close();
