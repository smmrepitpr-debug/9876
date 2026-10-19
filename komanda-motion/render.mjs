// Рендер index.html в MP4 покадрово.
// V=1 node render.mjs              → out/komanda-1-….mp4 (V = 1..4)
// V=2 node render.mjs 1080 1920 6  → один кадр PNG на 6 с (проверка)
// Если рядом есть music.mp3 (или beat.wav) — подмешается тихо фоном.
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }

const dir = path.dirname(fileURLToPath(import.meta.url));
const W = +process.argv[2] || 1080, H = +process.argv[3] || 1920;
const still = process.argv[4] !== undefined ? +process.argv[4] : null;
const CRF = process.env.CRF || 20;
const V = process.env.V || 1;
const out = path.join(dir, 'out'); fs.mkdirSync(out, { recursive: true });

const browser = await pw.chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(dir, process.env.PAGE || 'index.html')).href + `?w=${W}&h=${H}&v=${V}&render=1${process.env.DEMO ? '&demo=1' : ''}`);
await page.waitForFunction(() => window.READY === true);
// прогрев эмодзи-шрифта
await page.evaluate(() => { window.seek(9); });
await page.waitForTimeout(300);

const grab = async (t) => {
  const b64 = await page.evaluate((t) => { window.seek(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
  return Buffer.from(b64, 'base64');
};

if (still !== null) {
  const f = path.join(out, `still-v${V}-${still}s.png`);
  fs.writeFileSync(f, await grab(still));
  console.log(f); await browser.close(); process.exit(0);
}

const { DURATION, FPS } = await page.evaluate(() => ({ DURATION: window.DURATION, FPS: window.FPS }));
const frames = Math.round(DURATION * FPS);
const name = await page.evaluate(() => window.VIDEO_NAME);
const music = ['music.mp3', 'beat.wav'].map(f => path.join(dir, f)).find(f => fs.existsSync(f));
const file = path.join(out, `komanda-${V}-${name}-${W}x${H}.mp4`);
const tmp = music ? file.replace('.mp4', '.silent.mp4') : file;
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', tmp],
  { stdio: ['pipe', 'inherit', 'inherit'] });
for (let i = 0; i < frames; i++) {
  const buf = await grab(i / FPS);
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 30 === 0) process.stdout.write(`\r${i}/${frames}`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
if (music) {
  await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-stream_loop', '-1', '-i', music, '-filter:a', `volume=0.35,afade=t=out:st=${DURATION - 1.2}:d=1.2`,
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', file], { stdio: 'inherit' }).on('close', r));
  fs.unlinkSync(tmp);
}
console.log(`\nготово: ${file} (${frames} кадров, ${DURATION.toFixed(1)} с)`);
