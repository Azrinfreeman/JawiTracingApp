import {chromium} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {nyaTipReviewCandidates} from '../src/content/reviewCandidates.js';
const letters=JSON.parse(readFileSync('src/content/letters.json','utf8')),[{original,candidate}]=nyaTipReviewCandidates(letters);
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1120,height:710}});
 await page.setContent(`<style>body{margin:0;padding:24px;background:#fff5de;color:#253e34;font:18px Arial}main{display:flex;gap:24px}section{width:522px;background:#fffdf5;border:2px solid #7f9075;border-radius:20px;text-align:center}svg{width:490px;height:515px}h2{font-size:23px}p{margin:8px}</style><main>${[[original,'Original · Nya 3'],[candidate,'Shorter tip · Nya 4']].map(([l,label])=>`<section><h2>${label}</h2><svg viewBox="295 215 395 465"><path d="${l.geometry.strokes[0].path}" fill="none" stroke="#607f98" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/><path d="${l.geometry.strokes[0].path}" fill="none" stroke="#b94e20" stroke-width="37" stroke-linecap="round" stroke-linejoin="round"/>${l.geometry.dotTargets.map(d=>`<circle cx="${d.x}" cy="${d.y}" r="19" fill="#b94e20"/>`).join('')}</svg><p>${l===original?'Upper tip above your marked line':'Upper tip removed; bowl and three dots retained'}</p></section>`).join('')}</main>`);
 await page.screenshot({path:'output/verification/nya-tip/nya-tip-comparison.png'});
}finally{await browser.close();}
