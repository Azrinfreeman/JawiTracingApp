// Authoring only. Clips the approved vector contours, never the student catalogue.
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {contours} from './lib/outline-contours.mjs';
const root='output/verification/ra-zai-short-heads';mkdirSync(root,{recursive:true});
const raw=readFileSync('src/content/letters.json','utf8'),letters=JSON.parse(raw);
const originals=letters.filter(l=>['ra','zai'].includes(l.id));
if(originals[0].contentVersion!==3||originals[1].contentVersion!==4)throw Error('Expected approved Ra 3 / Zai 4');
if(!process.argv.includes('--refresh')){
 writeFileSync(`${root}/before-catalogue.json`,raw,{flag:'wx'});
 writeFileSync('tests/fixtures/ra-zai-short-head-originals.json',JSON.stringify(originals,null,2)+'\n',{flag:'wx'});
 const hashes={};function walk(dir){for(const file of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${file.name}`;if(file.isDirectory())walk(p);else hashes[p]=createHash('sha256').update(readFileSync(p)).digest('hex');}}walk('public/audio');
 writeFileSync(`${root}/before-audio-hashes.json`,JSON.stringify(hashes,null,2)+'\n',{flag:'wx'});
}
const round=n=>+n.toFixed(5),lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const parse=path=>{const nums=path.match(/[-+]?(?:\d*\.)?\d+/g).map(Number);return Array.from({length:nums.length/2},(_,i)=>({x:nums[i*2],y:nums[i*2+1]}));};
const bounds=paths=>{const p=paths.flatMap(parse),xs=p.map(p=>p.x),ys=p.map(p=>p.y);return{x:Math.min(...xs),y:Math.min(...ys),width:round(Math.max(...xs)-Math.min(...xs)),height:round(Math.max(...ys)-Math.min(...ys))};};
// The photo's rising cut band intersects the sloping head about 36% below its tip.
const planeFor=letter=>({x:600,y:518+(letter.id==='zai'?-12.65:0),slope:-.35});
const signed=(p,plane)=>p.y-plane.y-plane.slope*(p.x-plane.x);
function clip(path,plane){const points=parse(path),out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=signed(a,plane),db=signed(b,plane);if(da>=0)out.push(a);if((da<0)!==(db<0))out.push(lerp(a,b,da/(da-db)));}return out.map((p,i)=>`${i?'L':'M'}${round(p.x)} ${round(p.y)}`).join(' ')+' Z';}
function splitFirst(path,plane){
 const nums=path.match(/[-+]?(?:\d*\.)?\d+/g).map(Number),p=Array.from({length:4},(_,i)=>({x:nums[i*2],y:nums[i*2+1]}));
 const split=t=>{const a=lerp(p[0],p[1],t),b=lerp(p[1],p[2],t),c=lerp(p[2],p[3],t),d=lerp(a,b,t),e=lerp(b,c,t);return[lerp(d,e,t),e,c,p[3]];};
 let low=0,high=1;for(let i=0;i<60;i++){const mid=(low+high)/2;if(signed(split(mid)[0],plane)<0)low=mid;else high=mid;}
 const fraction=(low+high)/2,right=split(fraction),suffix=path.slice(path.indexOf(' C',path.indexOf(' C')+2));
 return{fraction,path:`M ${round(right[0].x)} ${round(right[0].y)} C ${right.slice(1).flatMap(p=>[round(p.x),round(p.y)]).join(' ')}${suffix}`};
}
const browser=await chromium.launch();const page=await browser.newPage();const output={},references={};
try{for(const letter of originals){
 const plane=planeFor(letter),trim=splitFirst(letter.geometry.strokes[0].path,plane),appearance=structuredClone(letter.geometry.appearance),part=appearance.parts[0];
 part.contours=part.contours.map(path=>clip(path,plane));part.bounds=bounds(part.contours);
 appearance.baseRevision=letter.contentVersion;appearance.bounds=bounds(appearance.parts.flatMap(p=>p.contours));
 appearance.authoring={kind:'shortenedHead',baseRevision:letter.contentVersion,reference:'docs/RA_ZAI_SHORTER_HEAD_IMPLEMENTATION.md',cutPlane:plane,retainedCurveFraction:trim.fraction,note:'Original font provenance retained; upper body contour clipped to the owner photo cut band. Lower contour and dot unchanged.'};
 const raster=await page.evaluate(({paths,path,bounds})=>{
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),route=document.createElementNS(ns,'path');route.setAttribute('d',path);svg.append(route);document.body.append(svg);
  const length=route.getTotalLength(),count=Math.ceil(length/2),points=Array.from({length:count+1},(_,i)=>{const p=route.getPointAtLength(length*i/count);return{x:p.x,y:p.y};});svg.remove();
  const scale=.25,w=Math.ceil(bounds.width/scale)+8,h=Math.ceil(bounds.height/scale)+8,origin={x:bounds.x-1,y:bounds.y-1};
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.scale(1/scale,1/scale);ctx.translate(-origin.x,-origin.y);ctx.fill(new Path2D(paths.join(' ')),'evenodd');
  const rgba=ctx.getImageData(0,0,w,h).data,mask=Uint8Array.from({length:w*h},(_,i)=>rgba[i*4+3]>127?1:0);let binary='';for(let i=0;i<mask.length;i+=8192)binary+=String.fromCharCode(...mask.subarray(i,i+8192));
  return{w,h,scale,origin,length,points,data:btoa(binary)};
 },{paths:part.contours,path:trim.path,bounds:part.bounds});
 const {w,h,scale,origin,length,points}=raster,mask=Uint8Array.from(Buffer.from(raster.data,'base64')),lengths=[0];
 for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
 const count=Math.ceil(length/48),buckets=Array.from({length:count},()=>new Uint8Array(mask.length));
 for(let pixel=0;pixel<mask.length;pixel++)if(mask[pixel]){const p={x:origin.x+(pixel%w+.5)*scale,y:origin.y+(Math.floor(pixel/w)+.5)*scale};let best=Infinity,arc=0;
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0,dist=(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;if(dist<best){best=dist;arc=(lengths[i-1]+t*(lengths[i]-lengths[i-1]))*length/lengths.at(-1);}}
  buckets[Math.min(count-1,Math.floor(arc/48))][pixel]=1;
 }
 part.segments=buckets.map((mask,i)=>({from:i*48,to:Math.min(length,(i+1)*48),contours:contours({w,h},mask,p=>({x:origin.x+p.x*scale,y:origin.y+p.y*scale}))}));
 if(part.segments.some(s=>!s.contours.length))throw Error('Empty reveal segment');
 output[letter.id]={baseRevision:letter.contentVersion,revision:letter.contentVersion+1,path:trim.path,appearance};
 references[letter.id]={length,points};
 console.log(`${letter.id}: start ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}; length ${length.toFixed(2)}; ${count} reveal pieces`);
}}finally{await browser.close();}
writeFileSync('src/content/raZaiShortHeads.json',JSON.stringify(output,null,2)+'\n');
writeFileSync('tests/fixtures/ra-zai-short-head-routes.json',JSON.stringify(references,null,2)+'\n');
