import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {sinSyinReferenceReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter} from '../src/content/validateContent.js';
const root='output/verification/sin-syin-reference',hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const raw=readFileSync('src/content/letters.json','utf8'),letters=JSON.parse(raw);assert.equal(raw,readFileSync(`${root}/before-catalogue.json`,'utf8'));
const audio=JSON.parse(readFileSync(`${root}/before-audio-hashes.json`)),actual={};function walk(dir,out){for(const f of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${f.name}`;if(f.isDirectory())walk(p,out);else out[p]=hash(p);}}walk('public/audio',actual);assert.deepEqual(actual,audio);
const proposals=sinSyinReferenceReviewCandidates(letters),route=JSON.parse(readFileSync('tests/fixtures/sin-syin-reference-route.json'));assert.equal(proposals.length,2);for(const {candidate}of proposals){assert.equal(validateLetter(candidate).valid,true);assert.equal(validateLetter(candidate).ready,false);}
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1200,height:940}});let geometry;
try{
 geometry=await page.evaluate(({proposals,route})=>proposals.map(({candidate})=>{
  const part=candidate.geometry.appearance.parts[0],auth=candidate.geometry.appearance.authoring,canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1000;const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const outline=new Path2D(part.contours.join(' '));ctx.fill(outline);const body=ctx.getImageData(0,0,1000,1000).data;ctx.clearRect(0,0,1000,1000);ctx.fill(new Path2D(part.segments.flatMap(s=>s.contours).join(' ')),'evenodd');const reveal=ctx.getImageData(0,0,1000,1000).data;
  let bodyPixels=0,missingReveal=0;for(let i=0;i<1000000;i++)if(body[i*4+3]>200){bodyPixels++;if(reveal[i*4+3]<128)missingReveal++;}
  const outside=route.points.filter(p=>!ctx.isPointInPath(outline,p.x,p.y));
  return{id:candidate.id,routePoints:route.points.length,outsideRoutePoints:outside.length,outside,bodyPixels,missingReveal,missingRevealRatio:missingReveal/bodyPixels,tip:auth.visibleTailTip,referenceLevel:auth.referenceLevel};
 }),{proposals,route});
 for(const result of geometry){assert.ok(result.outsideRoutePoints<=3,JSON.stringify(result));assert.ok(result.missingRevealRatio<.015,JSON.stringify(result));assert.ok(Math.abs(result.tip.y-result.referenceLevel)<1);}
 const cell=(letter,label,x,y)=>`<g transform="translate(${x} ${y})"><rect width="560" height="390" rx="24" fill="white" stroke="#c8d5ca"/><text x="24" y="34" font-size="23" fill="#254737">${letter.labelMs} · ${label} · revision ${letter.contentVersion}</text><svg x="30" y="45" width="500" height="320" viewBox="140 75 730 740"><path d="M150 515H855" stroke="#9570af" stroke-width="2" stroke-dasharray="8 8"/>${letter.geometry.appearance?letter.geometry.appearance.parts.map(p=>`<path d="${p.contours.join(' ')}" fill="#157b62" fill-rule="evenodd"/>`).join(' '):`<path d="${letter.geometry.strokes[0].path}" fill="none" stroke="#607e95" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>${letter.geometry.dotTargets.map(d=>`<circle cx="${d.x}" cy="${d.y}" r="${d.visibleRadius}" fill="#607e95"/>`).join(' ')}`}</svg></g>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="940" style="font-family:Arial,sans-serif"><rect width="1200" height="940" fill="#f4f5eb"/><text x="28" y="36" font-size="28" fill="#254737">Sin and Syin — reference body and tail height</text><text x="28" y="69" font-size="17" fill="#52634e">Same scale · purple construction line = reference level · proposed visible tail tip meets this level</text>${proposals.map(({original,candidate},i)=>cell(original,'Before',24,100+i*405)+cell(candidate,'Proposed',616,100+i*405)).join('')}<text x="28" y="929" font-size="17" fill="#52634e">Adult review only. Student models, Syin dot targets and all recordings remain unchanged.</text></svg>`;
 writeFileSync(`${root}/comparison.svg`,svg);await page.setContent(`<style>body{margin:0}</style>${svg}`);await page.screenshot({path:`${root}/comparison.png`});
}finally{await browser.close();}
const inputs={};for(const dir of ['src','tests','public','scripts/lib'])walk(dir,inputs);for(const p of ['package.json','package-lock.json','vite.config.js','playwright.config.js','scripts/author-sin-syin-reference.mjs','scripts/verify-sin-syin-reference.mjs'])inputs[p]=hash(p);
const report={date:'2026-10-11',catalogueByteExact:true,audioFilesExact:Object.keys(audio).length,readyLessons:letters.filter(l=>validateLetter(l).ready).length,candidates:proposals.map(({candidate})=>({id:candidate.id,revision:candidate.contentVersion,status:candidate.geometry.status})),geometry,inputs};
writeFileSync(`${root}/integrity.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({catalogueByteExact:true,audioFilesExact:report.audioFilesExact,readyLessons:report.readyLessons,geometry}));
