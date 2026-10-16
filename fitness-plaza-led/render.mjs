// Рендер index.html в MP4 покадрово.
// node render.mjs                  → out/plaza-3000x600.mp4
// node render.mjs 3600 600         → out/plaza-3600x600.mp4
// node render.mjs 3000 600 6.5     → один кадр PNG на 6.5 с (проверка)
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }

const dir = path.dirname(fileURLToPath(import.meta.url));
const W = +process.argv[2] || 3000, H = +process.argv[3] || 600;
const still = process.argv[4] !== undefined ? +process.argv[4] : null;
const CRF = process.env.CRF || 20;
const out = path.join(dir, 'out'); fs.mkdirSync(out, { recursive: true });

const browser = await pw.chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(dir, 'index.html')).href + `?w=${W}&h=${H}&render=1`);
await page.waitForFunction(() => window.READY === true);
// прогрев эмодзи-шрифта
await page.evaluate(() => { window.seek(8.5); });
await page.waitForTimeout(300);

const grab = async (t) => {
  const b64 = await page.evaluate((t) => { window.seek(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
  return Buffer.from(b64, 'base64');
};

if (still !== null) {
  const f = path.join(out, `still-${W}x${H}-${still}s.png`);
  fs.writeFileSync(f, await grab(still));
  console.log(f); await browser.close(); process.exit(0);
}

const { DURATION, FPS } = await page.evaluate(() => ({ DURATION: window.DURATION, FPS: window.FPS }));
const frames = Math.round(DURATION * FPS);
const file = path.join(out, `plaza-${W}x${H}.mp4`);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', file],
  { stdio: ['pipe', 'inherit', 'inherit'] });
for (let i = 0; i < frames; i++) {
  const buf = await grab(i / FPS);
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 30 === 0) process.stdout.write(`\r${i}/${frames}`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
console.log(`\nготово: ${file} (${frames} кадров, ${DURATION.toFixed(1)} с)`);
