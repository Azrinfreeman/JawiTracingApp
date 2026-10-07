// Authoring only: the existing contour pipeline applied to Nun's catalogue font.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';
import {rasterGlyphs,components,samplePath} from './lib/glyph-geometry.mjs';
import {contours} from './lib/outline-contours.mjs';

const root='output/verification/nun-outline';mkdirSync(root,{recursive:true});
const raw=readFileSync('src/content/letters.json'),letters=JSON.parse(raw),letter=letters.find(letter=>letter.id==='nun');
const previous=JSON.parse(readFileSync('output/verification/nga-audio/inputs.json'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
strictEqual(sha(raw),previous.hashes['src/content/letters.json']);strictEqual(letter.contentVersion,2);
ok(!existsSync('src/content/nunOutline.json'),'Preserve existing proposals.');
writeFileSync(`${root}/before-catalogue.json`,raw,{flag:'wx'});
const font='@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2',fontSize=2400,piece=48;
const plan=JSON.parse(readFileSync('scripts/glyph-trace-plan.json')),spec=plan.letters.nun,k=(spec.k??plan.k)*600/fontSize;
const r=(await rasterGlyphs([letter.glyph],fontSize))[letter.glyph],rounded=n=>+n.toFixed(3);
const toModel=point=>({x:spec.cx+(point.x-r.w/2)*k,y:spec.cy+(point.y-r.h/2)*k});
const {label,list}=components(r),sorted=list.sort((a,b)=>b.area-a.area);strictEqual(sorted.length,2);
const parts=sorted.map((component,index)=>{
 const movement=index===0?letter.geometry.strokes[0]:letter.geometry.dotTargets[index-1];
 const mask=Uint8Array.from(label,value=>value===component.id?1:0),a=toModel({x:component.x0,y:component.y0}),b=toModel({x:component.x1+1,y:component.y1+1});
 const part={id:movement.id,contours:contours(r,mask,toModel),bounds:{x:rounded(a.x),y:rounded(a.y),width:rounded(b.x-a.x),height:rounded(b.y-a.y)}};
 if(index===0){
  const line=samplePath(movement.path,2),lengths=[0];for(let i=1;i<line.length;i++)lengths.push(lengths[i-1]+Math.hypot(line[i].x-line[i-1].x,line[i].y-line[i-1].y));
  const length=lengths.at(-1),count=Math.ceil(length/piece),buckets=Array.from({length:count},()=>new Uint8Array(mask.length));
  for(let pixel=0;pixel<mask.length;pixel++)if(mask[pixel]){
   const point=toModel({x:pixel%r.w+.5,y:Math.floor(pixel/r.w)+.5});let best=Infinity,arc=0;
   for(let i=1;i<line.length;i++){
    const a=line[i-1],b=line[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/d)):0;
    const distance=(point.x-a.x-t*dx)**2+(point.y-a.y-t*dy)**2;
    if(distance<best){best=distance;arc=lengths[i-1]+(lengths[i]-lengths[i-1])*t;}
   }
   buckets[Math.min(count-1,Math.floor(arc/piece))][pixel]=1;
  }
  part.segments=buckets.map((mask,index)=>({from:index*piece,to:Math.min(length,(index+1)*piece),contours:contours(r,mask,toModel)}));
 }
 return part;
});
const a=toModel({x:6,y:6}),b=toModel({x:r.w-6,y:r.h-6});
const appearance={baseRevision:2,kind:'catalogueOutline',source:{font,sha256:sha(readFileSync(`node_modules/${font}`)),glyph:letter.glyph,weight:400,method:'highResolutionInkContours',fontSize,scale:k,center:[spec.cx,spec.cy],maxContourError:k*1.25},
 bounds:{x:rounded(a.x),y:rounded(a.y),width:rounded(b.x-a.x),height:rounded(b.y-a.y)},parts};
writeFileSync('src/content/nunOutline.json',JSON.stringify({nun:appearance},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision:3,parts:parts.length,revealPieces:parts[0].segments.length,bounds:appearance.bounds}));
