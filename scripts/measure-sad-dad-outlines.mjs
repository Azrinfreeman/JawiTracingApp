import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import outlines from '../src/content/sadDadOutlines.json' with {type:'json'};
import {rasterGlyphs,samplePath} from './lib/glyph-geometry.mjs';
const root='output/verification/sad-dad-outline';mkdirSync(root,{recursive:true});
const rasters=await rasterGlyphs(Object.values(outlines).map(c=>c.appearance.source.glyph),2400);
const data=Object.entries(outlines).map(([id,c])=>({id,a:c.appearance,routes:c.paths.map(p=>samplePath(p,2)),r:{w:rasters[c.appearance.source.glyph].w,h:rasters[c.appearance.source.glyph].h,mask:Buffer.from(rasters[c.appearance.source.glyph].mask).toString('base64')}}));
const browser=await chromium.launch();
try{
  const page=await browser.newPage({viewport:{width:900,height:750}});
  await page.setContent('<style>body{font:18px system-ui;background:#fffaf0;color:#214438}main{display:grid;grid-template-columns:1fr;gap:14px}article{padding:10px;background:white;border:1px solid #bacbb8;border-radius:14px}h2{margin:0;font-size:20px}.pair{display:flex;justify-content:space-around}canvas{width:380px;height:230px;object-fit:contain}p{margin:0;text-align:center}</style><h1>Isi kandungan → Sad / Dad 3</h1><main></main>');
  const results=await page.evaluate(data=>data.map(({id,a,r,routes})=>{
    const original=Uint8Array.from(atob(r.mask),c=>c.charCodeAt(0));
    const create=()=>{const c=document.createElement('canvas');c.width=r.w;c.height=r.h;return c;};
    const reference=create(),rc=reference.getContext('2d'),img=rc.createImageData(r.w,r.h);
    for(let i=0;i<original.length;i++)if(original[i]){img.data[i*4]=34;img.data[i*4+1]=70;img.data[i*4+2]=56;img.data[i*4+3]=255;}rc.putImageData(img,0,0);
    const render=paths=>{const c=create(),ctx=c.getContext('2d'),s=a.source.scale;ctx.setTransform(1/s,0,0,1/s,r.w/2-a.source.center[0]/s,r.h/2-a.source.center[1]/s);ctx.fillStyle='#117b5b';ctx.fill(new Path2D(paths.join(' ')),'evenodd');return c;};
    const model=render(a.parts.flatMap(p=>p.contours)),body=render(a.bodyContours),pieces=render(a.parts.filter(p=>p.segments).flatMap(p=>p.segments.flatMap(s=>s.contours)));
    const mask=c=>{const rgba=c.getContext('2d').getImageData(0,0,r.w,r.h).data;return Uint8Array.from({length:original.length},(_,i)=>rgba[i*4+3]>127?1:0);};
    const iou=(x,y)=>{let intersection=0,union=0;for(let i=0;i<x.length;i++){intersection+=x[i]&&y[i]?1:0;union+=x[i]||y[i]?1:0;}return intersection/union;};
    const article=document.createElement('article'),h=document.createElement('h2');h.textContent=id;article.append(h);
    const pair=document.createElement('div');pair.className='pair';for(const [c,label]of [[reference,'Isi kandungan'],[model,'Corrected tracing · revision 3']]){const box=document.createElement('div'),p=document.createElement('p');p.textContent=label;box.append(c,p);pair.append(box);}article.append(pair);document.querySelector('main').append(article);
    const outlinePath=new Path2D(a.bodyContours.join(' ')),probe=document.createElement('canvas').getContext('2d');const routePoints=routes.flat(),outside=routePoints.filter(p=>!probe.isPointInPath(outlinePath,p.x,p.y,'evenodd')).length;
    return {id,routeInsideInk:1-outside/routePoints.length,outlineInkOverlap:iou(original,mask(model)),revealPieceOverlap:iou(mask(body),mask(pieces)),revision:a.baseRevision+1,sourceSha256:a.source.sha256};
  }),data);
  await page.screenshot({path:`${root}/catalogue-outline-comparison.png`,fullPage:true});
  writeFileSync(`${root}/appearance-metrics.json`,JSON.stringify(results,null,2)+'\n');
  for(const r of results)console.log(`${r.id}: font overlap ${r.outlineInkOverlap.toFixed(4)}, reveal coverage ${r.revealPieceOverlap.toFixed(4)}`);
  if(results.some(r=>r.outlineInkOverlap<.99||r.revealPieceOverlap<.99||r.routeInsideInk!==1))process.exitCode=1;
}finally{await browser.close();}
