import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const root='output/verification/ha-direction',data=JSON.parse(readFileSync(`${root}/authoring.json`,'utf8'));
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1160,height:720},deviceScaleFactor:1});
 const metrics=await page.evaluate(({originalPath,path})=>{
  const masks=[originalPath,path].map(d=>{const canvas=document.createElement('canvas');canvas.width=2000;canvas.height=2000;const c=canvas.getContext('2d',{willReadFrequently:true});c.scale(2,2);c.strokeStyle='#000';c.lineWidth=50;c.lineCap='round';c.lineJoin='round';c.stroke(new Path2D(d));return c.getImageData(0,0,2000,2000).data;});
  let intersection=0,union=0,added=0,removed=0;for(let i=3;i<masks[0].length;i+=4){const a=masks[0][i]>127,b=masks[1][i]>127;if(a||b)union++;if(a&&b)intersection++;if(b&&!a)added++;if(a&&!b)removed++;}
  return {intersectionOverUnion:intersection/union,addedPixels:added,removedPixels:removed,scale:2,strokeWidth:50};
 },data);
 if(metrics.intersectionOverUnion<.999)throw Error(`Shape changed: ${JSON.stringify(metrics)}`);
 await page.setContent(`<style>body{margin:0;padding:24px;background:#fff5de;color:#253e34;font:18px Arial}main{display:flex;gap:26px}section{width:535px;background:#fffdf5;border:2px solid #7f9075;border-radius:20px;text-align:center}h2{font-size:23px}svg{width:500px;height:410px}.legend{text-align:left;margin:15px 35px;font-size:16px;line-height:1.6}p{margin:4px}small{color:#52684e}</style><main><section><h2>Current Ha · revision 3</h2><svg viewBox="285 370 430 345"><path d="${data.originalPath}" fill="none" stroke="#607f98" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/></svg><p>Inner stroke → left loop → outer loop → tail</p></section><section><h2>Revised Ha · revision 4</h2><svg id="new" viewBox="285 370 430 345"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fff"/></marker></defs><path d="${data.path}" fill="none" stroke="#607f98" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/>${data.phasePaths.map(d=>`<path class="phase" d="${d}" fill="none"/>`).join('')}</svg><div class="legend"><p>1. Top tip downward</p><p>2. Outer right loop, then left to the lower join</p><p>3. Left loop upward to the upper join</p><p>4. Inner stroke downward</p><p>5. Tail to the left</p><small>One continuous movement, following your photo.</small></div></section></main>`);
 await page.evaluate(()=>{
  const svg=document.getElementById('new'),ns='http://www.w3.org/2000/svg';
  [...svg.querySelectorAll('.phase')].forEach((path,i)=>{const length=path.getTotalLength(),s=length*[.44,.30,.56,.60,.63][i],a=path.getPointAtLength(Math.max(0,s-11)),b=path.getPointAtLength(Math.min(length,s+11)),p=path.getPointAtLength(s);const arrow=document.createElementNS(ns,'path');arrow.setAttribute('d',`M ${a.x} ${a.y} L ${b.x} ${b.y}`);arrow.setAttribute('stroke','#fff');arrow.setAttribute('stroke-width','3');arrow.setAttribute('marker-end','url(#arrow)');svg.append(arrow);const text=document.createElementNS(ns,'text');text.setAttribute('x',p.x-17);text.setAttribute('y',p.y-12);text.setAttribute('fill','#fff');text.setAttribute('font-size','18');text.setAttribute('font-weight','bold');text.textContent=i+1;svg.append(text);});
 });
 await page.screenshot({path:`${root}/ha-order-comparison.png`});
 writeFileSync(`${root}/shape-metrics.json`,JSON.stringify(metrics,null,2)+'\n');
 console.log(JSON.stringify(metrics));
}finally{await browser.close();}
