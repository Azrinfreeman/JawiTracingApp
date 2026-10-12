// Authoring only: vector adaptation of the owner's third photograph, not a font conversion.
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {contours} from './lib/outline-contours.mjs';
const root='output/verification/sin-syin-reference';mkdirSync(root,{recursive:true});
const raw=readFileSync('src/content/letters.json','utf8'),letters=JSON.parse(raw),originals=letters.filter(l=>['sin','syin'].includes(l.id));
if(originals[0].contentVersion!==2||originals[1].contentVersion!==3)throw Error('Expected Sin 2 / Syin 3');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const image='codex-clipboard-808388b5-ce4a-4999-8a2f-95b5e03ccf7b.png';
const sourceHash=hash(`C:/Users/azrin/AppData/Local/Temp/${image}`);
if(!process.argv.includes('--refresh')){
 writeFileSync(`${root}/before-catalogue.json`,raw,{flag:'wx'});
 writeFileSync('tests/fixtures/sin-syin-reference-originals.json',JSON.stringify(originals,null,2)+'\n',{flag:'wx'});
 const audio={};function walk(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${f.name}`;if(f.isDirectory())walk(p);else audio[p]=hash(p);}}walk('public/audio');
 writeFileSync(`${root}/before-audio-hashes.json`,JSON.stringify(audio,null,2)+'\n',{flag:'wx'});
}
// Control points traced from the photographed silhouette. Remove the photo's slight guide tilt.
const body='M 450 48 C 456 70 451 109 434 126 C 414 134 385 133 364 122 C 344 140 314 145 282 141 C 287 183 270 210 251 226 C 228 244 193 254 158 258 C 129 262 111 246 103 225 C 93 205 100 166 125 139 C 116 164 108 188 114 207 C 121 225 135 230 153 229 C 184 229 218 222 243 207 C 260 197 267 185 267 164 L 266 136 C 262 123 254 113 254 102 C 257 92 264 82 274 78 L 283 100 C 309 111 343 108 365 91 C 372 82 379 69 385 60 C 392 60 390 74 385 85 C 397 94 413 95 428 95 L 427 80 C 426 69 434 56 442 50 L 450 48 Z';
const route='M 443 59 C 449 82 445 111 431 115 C 416 123 387 112 378 99 C 377 90 379 78 383 69 C 376 94 358 115 336 123 C 316 130 289 127 276 116 C 269 110 269 97 271 88 C 280 111 283 166 270 193 C 253 227 213 241 174 243 C 144 247 121 243 113 222 C 100 199 109 166 124 141';
const transform={scale:1.82,deskew:.038,origin:[100,139],target:[185,515]};
const point=p=>({x:185+(p.x-100)*1.82,y:515+(p.y+.038*(p.x-124)-139)*1.82});
const mapPath=path=>{let axis=0,x;return path.replace(/[-+]?(?:\d*\.)?\d+/g,n=>{const value=Number(n);if(axis++%2===0){x=value;return +(185+(x-100)*1.82).toFixed(4);}return +(515+(value+.038*(x-124)-139)*1.82).toFixed(4);});};
const path=mapPath(route),bodyPath=mapPath(body),browser=await chromium.launch();const page=await browser.newPage();
const output={},round=n=>+n.toFixed(4);
try{
 const raster=await page.evaluate(({path,body})=>{
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),route=document.createElementNS(svg.namespaceURI,'path');route.setAttribute('d',path);svg.append(route);document.body.append(svg);
  const length=route.getTotalLength(),count=Math.ceil(length/2),points=Array.from({length:count+1},(_,i)=>{const p=route.getPointAtLength(length*i/count);return{x:p.x,y:p.y};});svg.remove();
  const scale=.25,w=2700,h=1700,origin={x:170,y:350},canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.scale(1/scale,1/scale);ctx.translate(-origin.x,-origin.y);ctx.fill(new Path2D(body));
  const data=ctx.getImageData(0,0,w,h).data,mask=Uint8Array.from({length:w*h},(_,i)=>data[i*4+3]>127?1:0);let binary='';for(let i=0;i<mask.length;i+=8192)binary+=String.fromCharCode(...mask.subarray(i,i+8192));
  return{w,h,origin,scale,length,points,data:btoa(binary)};
 },{path,body:bodyPath});
 const {w,h,origin,scale,length,points}=raster,mask=Uint8Array.from(Buffer.from(raster.data,'base64')),toModel=p=>({x:origin.x+p.x*scale,y:origin.y+p.y*scale});
 const count=Math.ceil(length/48),buckets=Array.from({length:count},()=>new Uint8Array(mask.length));
 for(let pixel=0;pixel<mask.length;pixel++)if(mask[pixel]){const p=toModel({x:pixel%w+.5,y:Math.floor(pixel/w)+.5});let best=Infinity,arc=0;
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0,dist=(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;if(dist<best){best=dist;arc=(i-1+t)*length/(points.length-1);}}
  buckets[Math.min(count-1,Math.floor(arc/48))][pixel]=1;
 }
 const ink=contours({w,h},mask,toModel),coords=ink.flatMap(p=>p.match(/[-+]?(?:\d*\.)?\d+/g).map(Number)),xs=coords.filter((_,i)=>i%2===0),ys=coords.filter((_,i)=>i%2===1),bounds={x:Math.min(...xs),y:Math.min(...ys),width:round(Math.max(...xs)-Math.min(...xs)),height:round(Math.max(...ys)-Math.min(...ys))};
 const segments=[];for(const [i,mask]of buckets.entries()){const paths=contours({w,h},mask,toModel),to=Math.min(length,(i+1)*48);if(paths.length)segments.push({from:segments.at(-1)?.to??0,to,contours:paths});else if(segments.length)segments.at(-1).to=to;}
 for(const letter of originals){
  const dots=letter.geometry.dotTargets.map(dot=>({id:dot.id,bounds:{x:dot.x-dot.visibleRadius,y:dot.y-dot.visibleRadius,width:dot.visibleRadius*2,height:dot.visibleRadius*2},contours:[Array.from({length:32},(_,i)=>{const a=i*Math.PI/16;return`${i?'L':'M'}${round(dot.x+Math.cos(a)*dot.visibleRadius)} ${round(dot.y+Math.sin(a)*dot.visibleRadius)}`;}).join(' ')+' Z']}));
  const all=[bounds,...dots.map(d=>d.bounds)],x=Math.min(...all.map(b=>b.x)),y=Math.min(...all.map(b=>b.y)),right=Math.max(...all.map(b=>b.x+b.width)),bottom=Math.max(...all.map(b=>b.y+b.height));
  output[letter.id]={baseRevision:letter.contentVersion,revision:letter.contentVersion+1,path,appearance:{baseRevision:letter.contentVersion,kind:'referenceOutline',source:{kind:'referencePhoto',image,sha256:sourceHash,glyph:letter.glyph,method:'authoredVectorAdaptation',reference:'docs/SIN_SYIN_REFERENCE_REVIEW.md',maxContourError:.3125},authoring:{transform,referenceLevel:515,visibleTailTip:point({x:125,y:139}),routeTail:points.at(-1),bodyPath,note:'Manual adaptation of picture 3, deskewed to a horizontal construction level. Original Syin dot targets/actions preserved.'},bounds:{x,y,width:round(right-x),height:round(bottom-y)},parts:[{id:'stroke-1',contours:ink,bounds,segments},...dots]}};
 }
 writeFileSync('tests/fixtures/sin-syin-reference-route.json',JSON.stringify({path,length,points},null,2)+'\n');
 console.log(JSON.stringify({pathLength:round(length),revealPieces:segments.length,bodyBounds:bounds,visibleTail:point({x:125,y:139}),routeTail:points.at(-1)}));
}finally{await browser.close();}
writeFileSync('src/content/sinSyinReferenceBodies.json',JSON.stringify(output,null,2)+'\n');
