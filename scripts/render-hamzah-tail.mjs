import {chromium} from '@playwright/test';
import {readFileSync} from 'node:fs';
const old=JSON.parse(readFileSync('tests/fixtures/hamzah-tail-original.json','utf8'));
const current=JSON.parse(readFileSync('src/content/letters.json','utf8')).find(l=>l.id==='hamzah');
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1120,height:650}});
 await page.setContent(`<style>body{margin:0;padding:24px;background:#fff5de;color:#253e34;font:18px Arial}main{display:flex;gap:24px}section{width:522px;background:#fffdf5;border:2px solid #7f9075;border-radius:20px;text-align:center}svg{width:500px;height:445px}h2{font-size:23px}p{margin:8px}</style><main>${[[old,'Before · Hamzah 4'],[current,'Straight tail · Hamzah 5']].map(([l,label])=>`<section><h2>${label}</h2><svg viewBox="370 355 290 250"><path d="${l.geometry.strokes[0].path}" fill="none" stroke="#607f98" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/><path d="${l.geometry.strokes[0].path}" fill="none" stroke="#b94e20" stroke-width="39" stroke-linecap="round" stroke-linejoin="round"/></svg><p>${l===old?'Bend at the lower join':'Straight diagonal to the left tail'}</p></section>`).join('')}</main>`);
 await page.screenshot({path:'output/verification/hamzah-ye/hamzah-tail-comparison.png'});
}finally{await browser.close();}
