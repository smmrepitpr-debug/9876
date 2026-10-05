import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const a=JSON.parse(fs.readFileSync('posts.json'));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});await p.addInitScript(d=>{window.DATA=d},a);
for(let i=0;i<a.length;i++){await p.goto('file://'+process.cwd()+'/card.html?i='+i);await p.waitForFunction(()=>document.title==='done');
await p.screenshot({path:`${a[i].date}.png`});}
await b.close();
