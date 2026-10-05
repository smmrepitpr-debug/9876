import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:640,height:640}});
for(const v of ['1','2']){await p.goto('file://'+process.cwd()+'/ava.html?v='+v);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);await p.screenshot({path:`avatar-${v}.png`});}
await b.close();
