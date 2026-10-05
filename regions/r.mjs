import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:800}});
await p.goto('file://'+process.cwd()+'/r.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
await p.screenshot({path:'regiony.png',fullPage:true});await b.close();
