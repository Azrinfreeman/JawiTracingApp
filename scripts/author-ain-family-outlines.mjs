// Authoring only. Visible ink is the catalogue font; movement order stays head, lift, bowl, dots.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {rasterGlyphs,components,samplePath} from './lib/glyph-geometry.mjs';
import {contours} from './lib/outline-contours.mjs';
const letters=JSON.parse(readFileSync('src/content/letters.json','utf8'));
const plan=JSON.parse(readFileSync('scripts/glyph-trace-plan.json','utf8'));
const ids=['ain','ghain','nga'],fontSize=2400,piece=48;
const font='@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2';
const sha256=createHash('sha256').update(readFileSync(`node_modules/${font}`)).digest('hex');
const rasters=await rasterGlyphs(ids.map(id=>letters.find(l=>l.id===id).glyph),fontSize);
const rounded=n=>+n.toFixed(3),output={};
for(const id of ids){
  const letter=letters.find(l=>l.id===id),r=rasters[letter.glyph],spec=plan.letters[id],k=(spec.k??plan.k)*600/fontSize;
  const toModel=p=>({x:spec.cx+(p.x-r.w/2)*k,y:spec.cy+(p.y-r.h/2)*k});
  const shift={ain:0,ghain:5.8,nga:-23.8}[id];
  // The original extra turn drops left too early. The actual neck starts at the
  // head's lower join, then descends directly along the font's sloping neck.
  const tail=`M 477.8 ${rounded(530+shift)} C 457 ${rounded(550+shift)} 435 ${rounded(570+shift)} 423.9 ${rounded(585.9+shift)} `+
    letter.geometry.strokes[1].path.slice(letter.geometry.strokes[1].path.indexOf('C 395.7'));
  const strokes=structuredClone(letter.geometry.strokes);strokes[1].path=tail;
  const routes=strokes.map(stroke=>{
    const points=samplePath(stroke.path,3),lengths=[0];
    for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
    return {points,lengths,length:lengths.at(-1)};
  });
  const {label,list}=components(r),body=list.reduce((a,b)=>a.area>b.area?a:b);
  const masks=strokes.map(()=>new Uint8Array(r.mask.length));
  const buckets=routes.map(route=>Array.from({length:Math.ceil(route.length/piece)},()=>new Uint8Array(r.mask.length)));
  for(let pixel=0;pixel<label.length;pixel++)if(label[pixel]===body.id){
    const p=toModel({x:pixel%r.w+.5,y:Math.floor(pixel/r.w)+.5});let best=Infinity,owner=0,arc=0;
    for(const [index,route]of routes.entries())for(let i=1;i<route.points.length;i++){
      const a=route.points[i-1],b=route.points[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;
      const t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;
      const dist=(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;
      if(dist<best){best=dist;owner=index;arc=route.lengths[i-1]+(route.lengths[i]-route.lengths[i-1])*t;}
    }
    masks[owner][pixel]=1;buckets[owner][Math.min(buckets[owner].length-1,Math.floor(arc/piece))][pixel]=1;
  }
  const bounds=mask=>{
    let x0=r.w,y0=r.h,x1=0,y1=0;
    for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%r.w,y=Math.floor(i/r.w);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
    const a=toModel({x:x0,y:y0}),b=toModel({x:x1+1,y:y1+1});
    return {x:rounded(a.x),y:rounded(a.y),width:rounded(b.x-a.x),height:rounded(b.y-a.y)};
  };
  const parts=strokes.map((stroke,index)=>{
    const segments=[];
    for(const [i,mask]of buckets[index].entries()){
      const paths=contours(r,mask,toModel),to=Math.min(routes[index].length,(i+1)*piece);
      if(paths.length)segments.push({from:segments.at(-1)?.to??0,to,contours:paths});
      else if(segments.length)segments.at(-1).to=to;
    }
    return {id:stroke.id,contours:contours(r,masks[index],toModel),bounds:bounds(masks[index]),segments};
  });
  const dots=list.filter(component=>component!==body);
  for(const dot of letter.geometry.dotTargets){
    const nearest=dots.reduce((a,b)=>{
      const distance=c=>{const p=toModel({x:c.cx,y:c.cy});return Math.hypot(p.x-dot.x,p.y-dot.y);};
      return distance(a)<distance(b)?a:b;
    });dots.splice(dots.indexOf(nearest),1);
    const mask=Uint8Array.from(label,v=>v===nearest.id?1:0);
    parts.push({id:dot.id,contours:contours(r,mask,toModel),bounds:bounds(mask)});
  }
  output[id]={baseRevision:letter.contentVersion,tailPath:tail,kind:'catalogueOutline',
    source:{font,sha256,glyph:letter.glyph,weight:400,method:'highResolutionInkContours',fontSize,scale:k,center:[spec.cx,spec.cy],maxContourError:k*1.25},
    bounds:bounds(r.mask),bodyContours:contours(r,Uint8Array.from(label,v=>v===body.id?1:0),toModel),parts};
  console.log(`${id}: exact catalogue silhouette, two stroke parts and ${letter.geometry.dotTargets.length} dots`);
}
writeFileSync('src/content/ainFamilyOutlines.json',JSON.stringify(output,null,2)+'\n');
