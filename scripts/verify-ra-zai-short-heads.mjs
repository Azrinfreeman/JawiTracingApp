import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {raZaiShortHeadReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter} from '../src/content/validateContent.js';
const root='output/verification/ra-zai-short-heads',hash=data=>createHash('sha256').update(data).digest('hex');
const raw=readFileSync('src/content/letters.json','utf8'),letters=JSON.parse(raw);
if(raw!==readFileSync(`${root}/before-catalogue.json`,'utf8'))throw Error('Active catalogue changed');
const audio=JSON.parse(readFileSync(`${root}/before-audio-hashes.json`));for(const [p,h]of Object.entries(audio))if(hash(readFileSync(p))!==h)throw Error(`Audio changed: ${p}`);
const proposals=raZaiShortHeadReviewCandidates(letters);if(proposals.length!==2)throw Error('Expected two candidates');
for(const {candidate}of proposals)if(!validateLetter(candidate).valid||validateLetter(candidate).ready)throw Error('Candidate readiness');
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1200,height:930},deviceScaleFactor:1});
let coverage;
try{
 coverage=await page.evaluate(proposals=>proposals.map(({original,candidate})=>{
  const old=original.geometry.appearance.parts[0],part=candidate.geometry.appearance.parts[0],plane=candidate.geometry.appearance.authoring.cutPlane;
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1000;const ctx=canvas.getContext('2d',{willReadFrequently:true});
  function raster(paths){ctx.clearRect(0,0,1000,1000);ctx.fill(new Path2D(paths.join(' ')),'evenodd');return ctx.getImageData(0,0,1000,1000).data;}
  const a=raster(old.contours),b=raster(part.contours),c=raster(part.segments.flatMap(s=>s.contours));let preserved=0,lowerDifference=0,upperInk=0,missingReveal=0,bodyPixels=0;
  for(let i=0;i<1000000;i++){const x=i%1000+.5,y=Math.floor(i/1000)+.5,d=y-plane.y-plane.slope*(x-plane.x),v=b[i*4+3];if(d>2&&(a[i*4+3]>127)!==(v>127))lowerDifference++;if(d>2&&v>200)preserved++;if(d< -1&&v>0)upperInk++;if(v>200){bodyPixels++;if(c[i*4+3]<128)missingReveal++;}}
  return{id:candidate.id,preserved,lowerDifference,upperInk,missingReveal,bodyPixels,missingRevealRatio:missingReveal/bodyPixels};
 }),proposals);
 for(const result of coverage)if(result.lowerDifference||result.upperInk||result.missingRevealRatio>.015)throw Error(JSON.stringify(result));
 const cell=(letter,label,x,y)=>`<g transform="translate(${x} ${y})"><rect width="560" height="390" rx="24" fill="#fff" stroke="#c8d5ca"/><text x="28" y="39" font-size="24" fill="#254737">${letter.labelMs} · ${label} · revision ${letter.contentVersion}</text><svg x="50" y="48" width="460" height="315" viewBox="340 210 370 590">${letter.geometry.appearance.parts.map(p=>`<path d="${p.contours.join(' ')}" fill="${label==='Before'?'#607e95':'#157b62'}" fill-rule="evenodd"/>`).join('')}</svg></g>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="930" style="font-family:Arial,sans-serif"><rect width="1200" height="930" fill="#f4f5eb"/><text x="32" y="40" font-size="28" fill="#254737">Ra and Zai — shorter tracing heads</text><text x="32" y="72" font-size="18" fill="#52634e">Proposed shapes for review · lower curves and Zai dot retained · same scale</text>${proposals.map(({original,candidate},i)=>cell(original,'Before',24,100+i*406)+cell(candidate,'Proposed',616,100+i*406)).join('')}<text x="32" y="925" font-size="16" fill="#52634e">Adult preview only. Current student models and recordings remain unchanged.</text></svg>`;
 writeFileSync(`${root}/comparison.svg`,svg);await page.setContent(`<style>body{margin:0}</style>${svg}`);await page.screenshot({path:`${root}/comparison.png`});
}finally{await browser.close();}
const inputs={};function walk(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${f.name}`;if(f.isDirectory())walk(p);else inputs[p]=hash(readFileSync(p));}}walk('src');
for(const p of ['package.json','package-lock.json','scripts/author-ra-zai-short-heads.mjs','scripts/verify-ra-zai-short-heads.mjs','tests/geometry/raZaiShortHeads.test.js','tests/browser/ra-zai-short-heads.spec.js','tests/fixtures/ra-zai-short-head-routes.json','tests/fixtures/ra-zai-short-head-originals.json'])inputs[p]=hash(readFileSync(p));
const report={date:'2026-10-11',catalogueUnchanged:true,approvedLessons:letters.filter(l=>validateLetter(l).ready).length,audioFilesUnchanged:Object.keys(audio).length,proposals:proposals.map(({candidate})=>({id:candidate.id,revision:candidate.contentVersion,status:candidate.geometry.status,path:candidate.geometry.strokes[0].path,cut:candidate.geometry.appearance.authoring.cutPlane})),coverage,inputs,build:readdirSync('dist/assets').filter(p=>p.endsWith('.js')||p.endsWith('.css'))};
writeFileSync(`${root}/integrity.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({catalogueUnchanged:true,audioFilesUnchanged:report.audioFilesUnchanged,approvedLessons:report.approvedLessons,coverage}));
