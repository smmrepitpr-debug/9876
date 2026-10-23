// V=1 node render.mjs            → out/komanda3d-1-….mp4 (1080×1920, 30 fps, H.264 + AAC)
// V=1 node render.mjs still 6.5  → PNG-кадр
import { createRequire } from 'module'; import { spawn, execFileSync } from 'child_process';
import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
const dir = path.dirname(fileURLToPath(import.meta.url)), out = path.join(dir, 'out'); fs.mkdirSync(out, { recursive: true });
const V = process.env.V || 1, FPS = +(process.env.FPS || 30);
const browser = await pw.chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(dir, 'index.html')).href + `?v=${V}&render=1`);
await page.waitForFunction(() => window.READY === true);
await page.waitForTimeout(400);
const shot = async t => { await page.evaluate(t => window.seek(t), t); return page.screenshot({ type: 'jpeg', quality: 92 }); };
if (process.argv[2] === 'still') {
  const t = +process.argv[3]; const f = path.join(out, `still-v${V}-${t}.jpg`); fs.writeFileSync(f, await shot(t)); console.log(f); await browser.close(); process.exit(0);
}
const { d, name, events } = await page.evaluate(() => ({ d: window.DURATION, name: window.VIDEO_NAME, events: window.EVENTS }));
const base = path.join(out, `kristina-${name}`);
fs.writeFileSync(base + '.events.json', JSON.stringify({ d, events }));
const n = Math.round(d * FPS);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-an', base + '.silent.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
for (let i = 0; i < n; i++) { const b = await shot(i / FPS); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 60 === 0) console.log(`${i}/${n}`); }
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
// звук: музыка + SFX по событиям (audio.py), затем сборка
execFileSync('python3', [path.join(dir, 'audio.py'), base + '.events.json', base + '.wav'], { stdio: 'inherit' });
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', base + '.silent.mp4', '-i', base + '.wav', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', base + '.mp4']);
fs.unlinkSync(base + '.silent.mp4'); console.log('готово:', base + '.mp4');
