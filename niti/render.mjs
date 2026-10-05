import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const b = await chromium.launch();
const url = m => 'file://' + process.cwd() + '/design.html?m=' + m;
async function shot(m, w, h, out, extra='') {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(url(m) + extra); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: out }); await p.close();
}
await shot('cover', 1920, 768, 'cover-desktop-1920x768.png');
await shot('mobile', 1080, 1920, 'cover-mobile-1080x1920.png');
await shot('avatar', 800, 800, 'avatar-800.png');
if (process.argv[2] === 'video') {
  fs.mkdirSync('/tmp/frames', { recursive: true });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const N = 450;
  for (let i = 0; i < N; i++) {
    await p.goto(url('video') + '&t=' + (i / N)); if (i === 0) await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `/tmp/frames/f${String(i).padStart(4, '0')}.png` });
  }
}
await b.close();
