import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const pw = require('/opt/node-tools/node_modules/playwright');
const b = await pw.chromium.launch();
for (const [m, w, h, f] of [['desk', 1920, 768, 'vk-oblozhka-1920x768.png'], ['mob', 1080, 1920, 'vk-oblozhka-mobile-1080x1920.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`file://${process.cwd()}/cover/cover.html?m=${m}`); await p.waitForFunction(() => window.READY); await p.waitForTimeout(500);
  await p.screenshot({ path: 'out/' + f }); console.log(f);
}
await b.close();
