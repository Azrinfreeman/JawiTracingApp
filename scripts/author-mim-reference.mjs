// Offline authoring: clean vector adaptation of the owner's Mim photograph.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {contours} from './lib/outline-contours.mjs';
const root='output/verification/mim-reference';mkdirSync(root,{recursive:true});
const read=p=>JSON.parse(readFileSync(p,'utf8')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const letters=read('src/content/letters.json'),original=letters.find(l=>l.id==='mim');
if(original.contentVersion!==5||original.geometry.status!=='approved')throw Error('Expected approved Mim 5');
const image='mim-photo-reference.png',reference=`docs/references/${image}`;
if(!process.argv.includes('--refresh')){
 copyFileSync('C:/Users/azrin/AppData/Local/Temp/codex-clipboard-e606d552-56e3-45f0-91dd-b90deec50a12.png',reference);
 copyFileSync('C:/Users/azrin/AppData/Local/Temp/codex-clipboard-406cb3fe-da64-4c49-bb33-3d9ef71fea88.png','docs/references/mim-current-tracing.png');
 writeFileSync(`${root}/before-catalogue.json`,readFileSync('src/content/letters.json'),{flag:'wx'});
 writeFileSync('tests/fixtures/mim-reference-original.json',JSON.stringify(original,null,2)+'\n',{flag:'wx'});
 const inputs={};function walk(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${f.name}`;if(f.isDirectory())walk(p);else inputs[p]=hash(p);}}
 for(const dir of ['src','tests','scripts','public'])walk(dir);
 for(const p of ['package.json','package-lock.json','vite.config.js','playwright.config.js'])inputs[p]=hash(p);
 writeFileSync(`${root}/before-inputs.json`,JSON.stringify(inputs,null,2)+'\n',{flag:'wx'});
}
const scale=4.4,round=n=>+n.toFixed(5),point=p=>({x:round(355+(p.x-16)*scale),y:round(375+(p.y-17)*scale)});
const mapPath=path=>{let axis=0;return path.replace(/[-+]?(?:\d*\.)?\d+/g,n=>round(axis++%2?375+(+n-17)*scale:355+(+n-16)*scale));};
// An open arch and flat return flow into one narrow pointed tail. No inner closed eye.
const bodyPhoto='M 29 35 C 35 24 40 17 49 17 C 61 16 71 31 76 41 L 76 57 C 60 57 34 56 23 62 C 15 69 20 79 24 92 C 29 103 32 113 30 122 C 26 113 22 98 19 87 C 16 76 14 68 18 60 C 24 48 41 45 61 44 C 58 37 53 29 48 30 C 42 30 39 38 37 40 L 29 35 Z';
const headPhoto='M 33 34 C 39 26 43 24 48 25 C 58 25 66 37 69 49 C 55 50 31 49 23 59';
const tailPhoto='C 15 65 17 78 22 92 C 26 105 29 115 30 122';
const path=mapPath(`${headPhoto} ${tailPhoto}`),bodyPath=mapPath(bodyPhoto);
const browser=await chromium.launch(),page=await browser.newPage();
try{
 const raster=await page.evaluate(({bodyPath,path,headPath})=>{
  const origin={x:345,y:365},step=.3,w=950,h=1600,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.scale(1/step,1/step);ctx.translate(-origin.x,-origin.y);ctx.fill(new Path2D(bodyPath));
  const data=ctx.getImageData(0,0,w,h).data,mask=Uint8Array.from({length:w*h},(_,i)=>data[i*4+3]>127?1:0);let binary='';for(let i=0;i<mask.length;i+=8192)binary+=String.fromCharCode(...mask.subarray(i,i+8192));
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');document.body.append(svg);
  const route=document.createElementNS(svg.namespaceURI,'path');route.setAttribute('d',path);svg.append(route);
  const ink=document.createElementNS(svg.namespaceURI,'path');ink.setAttribute('d',bodyPath);svg.append(ink);
  const length=route.getTotalLength(),count=Math.ceil(length/2),points=Array.from({length:count+1},(_,i)=>{const q=route.getPointAtLength(length*i/count);return{x:q.x,y:q.y};});
  const outside=points.filter((p,i)=>i>0&&i<points.length-1&&!ink.isPointInFill(new DOMPoint(p.x,p.y)));
  const head=document.createElementNS(svg.namespaceURI,'path');head.setAttribute('d',headPath);svg.append(head);const headLength=head.getTotalLength();svg.remove();
  return{w,h,origin,step,data:btoa(binary),points,length,headLength,outside};
 },{bodyPath,path,headPath:mapPath(headPhoto)});
 if(raster.outside.length)throw Error(`Route outside ink: ${JSON.stringify(raster.outside.slice(0,8))} (${raster.outside.length} samples)`);
 const {w,h,origin,step,length,points,headLength}=raster,mask=Uint8Array.from(Buffer.from(raster.data,'base64')),count=Math.ceil(length/48),buckets=Array.from({length:count},()=>new Uint8Array(mask.length));
 for(let pixel=0;pixel<mask.length;pixel++)if(mask[pixel]){
  const p={x:origin.x+(pixel%w+.5)*step,y:origin.y+(Math.floor(pixel/w)+.5)*step};let best=Infinity,arc=0;
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0,error=(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;if(error<best){best=error;arc=(i-1+t)*length/(points.length-1);}}
  buckets[Math.min(count-1,Math.floor(arc/48))][pixel]=1;
 }
 const toModel=p=>({x:round(origin.x+p.x*step),y:round(origin.y+p.y*step)}),ink=contours({w,h},mask,toModel),segments=[];
 for(const [i,bucket]of buckets.entries()){const paths=contours({w,h},bucket,toModel),to=Math.min(length,(i+1)*48);if(paths.length)segments.push({from:segments.at(-1)?.to??0,to,contours:paths});else if(segments.length)segments.at(-1).to=to;}
 const values=ink.flatMap(p=>p.match(/[-+]?(?:\d*\.)?\d+/g).map(Number)),xs=values.filter((_,i)=>i%2===0),ys=values.filter((_,i)=>i%2===1),bounds={x:Math.min(...xs),y:Math.min(...ys),width:round(Math.max(...xs)-Math.min(...xs)),height:round(Math.max(...ys)-Math.min(...ys))};
 const correction={baseRevision:5,revision:6,path,sections:[[0,'Ikut lengkung kepala dan kembali ke kiri.'],[round(headLength/length),'Teruskan ekor ke bawah hingga hujung tirus.']],appearance:{baseRevision:5,kind:'referenceOutline',source:{kind:'referencePhoto',image,sha256:hash(reference),glyph:original.glyph,method:'authoredVectorAdaptation',reference:'docs/MIM_REFERENCE_REVIEW.md',maxContourError:.45},authoring:{scale,photoOrigin:[16,17],modelOrigin:[355,375],bodyPhoto,bodyPath,headLength,routeLength:length,visibleTailTip:point({x:30,y:122}),routeTail:points.at(-1),note:'Open hooked head with a flatter return and a connected slender pointed tail; one continuous movement.'},bounds,parts:[{id:'stroke-1',bounds,contours:ink,segments}]}};
 // Leave extra room below the pointed tip for a detached finish badge above the stage cue.
 correction.fitBounds={...bounds,height:round(bounds.height+120)};
 writeFileSync('src/content/mimReferenceShape.json',JSON.stringify(correction,null,2)+'\n');
 writeFileSync('tests/fixtures/mim-reference-route.json',JSON.stringify({path,length,headLength,points},null,2)+'\n');
 // Same model scale for both illustrations; the reference retains its original proportions.
 const old=original.geometry.strokes[0],html=`<style>body{margin:0;background:#fffdf4;font:22px sans-serif;color:#254d3d}main{display:flex;gap:22px;padding:24px}section{width:350px;text-align:center}svg{width:350px;height:540px}img{height:440px;image-rendering:auto;margin-top:50px}h2{font-size:22px}</style><main><section><h2>Reference</h2><img src="data:image/png;base64,${readFileSync(reference).toString('base64')}"></section><section><h2>Current · Mim 5</h2><svg viewBox="320 330 350 540"><path d="${old.path}" fill="none" stroke="currentColor" stroke-width="${old.width}" stroke-linecap="round" stroke-linejoin="round"/></svg></section><section><h2>Proposed · Mim 6</h2><svg viewBox="320 330 350 540"><path d="${ink.join(' ')}" fill="currentColor"/></svg></section></main>`;
 writeFileSync(`${root}/comparison.html`,html);await page.setViewportSize({width:1160,height:640});await page.setContent(html);await page.screenshot({path:`${root}/reference-comparison.png`});
 console.log(JSON.stringify({length,headFraction:headLength/length,segments:segments.length,bounds,routeInsideInk:true}));
}finally{await browser.close();}
