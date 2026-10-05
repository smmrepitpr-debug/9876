import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:376,height:256},deviceScaleFactor:2});
for(const n of [1,2,3]){await p.goto('file://'+process.cwd()+'/menu.html?n='+n);await p.waitForTimeout(200);await p.screenshot({path:`menu-${n}.png`});}
await b.close();
