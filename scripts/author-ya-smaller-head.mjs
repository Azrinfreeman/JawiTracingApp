// Offline head-only authoring; never imported by the app.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {samplePath} from './lib/glyph-geometry.mjs';
const root='output/verification/ya-smaller-head';mkdirSync(root,{recursive:true});
const read=p=>JSON.parse(readFileSync(p,'utf8')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const original=read('src/content/letters.json').find(l=>l.id==='ya');
if(original.contentVersion!==2||original.geometry.status!=='approved')throw Error('Expected approved Ya 2');
if(!process.argv.includes('--refresh')){
 copyFileSync('C:/Users/azrin/AppData/Local/Temp/codex-clipboard-57ec573a-d278-4d46-b9aa-09eb542ccdba.png','docs/references/ya-smaller-head-reference.png');
 copyFileSync('C:/Users/azrin/AppData/Local/Temp/codex-clipboard-94867586-f37f-4372-ba12-6eee83a7f2ff.png','docs/references/ya-current-tracing.png');
 writeFileSync(`${root}/before-catalogue.json`,readFileSync('src/content/letters.json'),{flag:'wx'});
 writeFileSync('tests/fixtures/ya-smaller-head-original.json',JSON.stringify(original,null,2)+'\n',{flag:'wx'});
 const inputs={};function walk(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${f.name}`;if(f.isDirectory())walk(p);else inputs[p]=hash(p);}}
 for(const dir of ['src','tests','scripts','public'])walk(dir);
 for(const p of ['package.json','package-lock.json','vite.config.js','playwright.config.js'])inputs[p]=hash(p);
 writeFileSync(`${root}/before-inputs.json`,JSON.stringify(inputs,null,2)+'\n',{flag:'wx'});
}
const commands=original.geometry.strokes[0].path.match(/[MC][^MC]+/g),oldHead=commands.slice(0,3).join(' ').trim(),bowl=commands.slice(3).join(' ').trim();
const factor=.72,junction={x:627.2,y:632.5},round=n=>+n.toFixed(4);
let axis=0;const head=oldHead.replace(/[-+]?(?:\d*\.)?\d+/g,value=>{const anchor=axis++%2?junction.y:junction.x;return round(anchor+(+value-anchor)*factor);});
const path=`${head} ${bowl}`,oldPoints=samplePath(original.geometry.strokes[0].path,.3),points=samplePath(path,2),headPoints=samplePath(head,.3);
const length=ps=>ps.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-ps[i].x,p.y-ps[i].y),0),routeLength=length(samplePath(path,.3)),headLength=length(headPoints);
const xs=oldPoints.map(p=>p.x),ys=oldPoints.map(p=>p.y),fitBounds={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
const correction={baseRevision:2,revision:3,factor,junction,oldHead,headPath:head,bowlPath:bowl,path,headLength,routeLength,fitBounds,sections:[[0,'Ikut lengkung kepala kecil ke kiri dan turun.'],[round(headLength/routeLength),'Teruskan lengkung mangkuk hingga hujung kiri.']],reference:{image:'docs/references/ya-smaller-head-reference.png',sha256:hash('docs/references/ya-smaller-head-reference.png'),method:'Head-only proportional adaptation; lower bowl and two dots preserved exactly.'}};
writeFileSync('src/content/yaSmallerHead.json',JSON.stringify(correction,null,2)+'\n');
writeFileSync('tests/fixtures/ya-smaller-head-route.json',JSON.stringify({path,points,headLength,length:routeLength},null,2)+'\n');
const draw=route=>`<svg viewBox="220 300 540 580"><path d="${route}" fill="none" stroke="currentColor" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>${original.geometry.dotTargets.map(d=>`<circle cx="${d.x}" cy="${d.y}" r="${d.visibleRadius}" fill="currentColor"/>`).join('')}</svg>`;
const html=`<style>body{margin:0;background:#fffdf4;color:#254d3d;font:21px sans-serif}main{display:flex;padding:20px;gap:16px}section{width:360px;text-align:center}h2{font-size:22px}svg{width:360px;height:430px}img{max-width:350px;height:430px;object-fit:contain}</style><main><section><h2>Your reference</h2><img src="data:image/png;base64,${readFileSync('docs/references/ya-smaller-head-reference.png').toString('base64')}"></section><section><h2>Current · Ya 2</h2>${draw(original.geometry.strokes[0].path)}</section><section><h2>Proposed · Ya 3</h2>${draw(path)}</section></main>`;
writeFileSync(`${root}/comparison.html`,html);
const browser=await chromium.launch();try{const page=await browser.newPage({viewport:{width:1160,height:525}});await page.setContent(html);await page.screenshot({path:`${root}/reference-comparison.png`});}finally{await browser.close();}
console.log(JSON.stringify({factor,headLength,routeLength,headFraction:headLength/routeLength,bowlPreserved:true}));
