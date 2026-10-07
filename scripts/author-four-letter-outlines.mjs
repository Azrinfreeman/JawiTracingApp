// Authoring only: trace the bundled font's high-resolution ink into static vector contours.
// No font conversion runs in the game. Re-run after a font/model change, then review the result.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {rasterGlyphs,components,samplePath} from './lib/glyph-geometry.mjs';
const ids=['dal','zal','ra','zai'], fontSize=2400, piece=48;
const font='@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2';
const sha256=createHash('sha256').update(readFileSync(`node_modules/${font}`)).digest('hex');
const letters=JSON.parse(readFileSync('src/content/letters.json','utf8'));
const plan=JSON.parse(readFileSync('scripts/glyph-trace-plan.json','utf8'));
const rasters=await rasterGlyphs(ids.map(id=>letters.find(l=>l.id===id).glyph),fontSize);
const rounded=n=>+n.toFixed(3);
import {contours} from './lib/outline-contours.mjs';
const output={};
for(const id of ids){
  const letter=letters.find(l=>l.id===id),r=rasters[letter.glyph],spec=plan.letters[id],k=(spec.k??plan.k)*600/fontSize;
  const toModel=p=>({x:spec.cx+(p.x-r.w/2)*k,y:spec.cy+(p.y-r.h/2)*k});
  const {label,list}=components(r),sorted=list.sort((a,b)=>b.area-a.area);
  const parts=sorted.map((component,index)=>{
    const movement=index===0?letter.geometry.strokes[0]:letter.geometry.dotTargets[index-1];
    const mask=Uint8Array.from(label,v=>v===component.id?1:0),a=toModel({x:component.x0,y:component.y0}),b=toModel({x:component.x1+1,y:component.y1+1});
    const part={id:movement.id,contours:contours(r,mask,toModel),bounds:{x:rounded(a.x),y:rounded(a.y),width:rounded(b.x-a.x),height:rounded(b.y-a.y)}};
    if(index===0){
      const line=samplePath(movement.path,2),lengths=[0];
      for(let i=1;i<line.length;i++)lengths.push(lengths[i-1]+Math.hypot(line[i].x-line[i-1].x,line[i].y-line[i-1].y));
      const length=lengths.at(-1),count=Math.ceil(length/piece),buckets=Array.from({length:count},()=>new Uint8Array(mask.length));
      for(let pixel=0;pixel<mask.length;pixel++)if(mask[pixel]){
        const p=toModel({x:pixel%r.w+.5,y:Math.floor(pixel/r.w)+.5});let best=Infinity,arc=0;
        for(let i=1;i<line.length;i++){
          const a=line[i-1],b=line[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;
          const dist=(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;
          if(dist<best){best=dist;arc=lengths[i-1]+(lengths[i]-lengths[i-1])*t;}
        }
        buckets[Math.min(count-1,Math.floor(arc/piece))][pixel]=1;
      }
      part.segments=buckets.map((mask,i)=>({from:i*piece,to:Math.min(length,(i+1)*piece),contours:contours(r,mask,toModel)}));
    }
    return part;
  });
  const a=toModel({x:6,y:6}),b=toModel({x:r.w-6,y:r.h-6});
  output[id]={baseRevision:letter.contentVersion,kind:'catalogueOutline',source:{font,sha256,glyph:letter.glyph,weight:400,method:'highResolutionInkContours',fontSize,scale:k,center:[spec.cx,spec.cy],maxContourError:k*1.25},
    bounds:{x:rounded(a.x),y:rounded(a.y),width:rounded(b.x-a.x),height:rounded(b.y-a.y)},parts};
  console.log(`${id}: ${parts.length} parts, ${parts[0].segments.length} reveal pieces`);
}
writeFileSync('src/content/fourLetterOutlines.json',JSON.stringify(output,null,2)+'\n');
