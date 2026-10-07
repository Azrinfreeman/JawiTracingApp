// Adult-only Sad/Dad proposals. Catalogue ink is authoritative; no student entry is edited.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {rasterGlyphs,components,splitGlyph,thin,nearestSet,routeOnSkeleton,smooth,fitPolyline,toPath,samplePath} from './lib/glyph-geometry.mjs';
import {contours} from './lib/outline-contours.mjs';
const root='output/verification/sad-dad-outline';mkdirSync(root,{recursive:true});
const raw=readFileSync('src/content/letters.json','utf8'),letters=JSON.parse(raw);
writeFileSync(`${root}/before-catalogue.json`,raw);
writeFileSync('tests/fixtures/sad-dad-originals.json',JSON.stringify(letters.filter(l=>['sad','dad'].includes(l.id)),null,2)+'\n');
const font='@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2',fontSize=2400,piece=48,k=.275;
const sha256=createHash('sha256').update(readFileSync(`node_modules/${font}`)).digest('hex');
const ids=['sad','dad'],low=await rasterGlyphs(ids.map(id=>letters.find(l=>l.id===id).glyph)),high=await rasterGlyphs(ids.map(id=>letters.find(l=>l.id===id).glyph),fontSize);
const output={},round=n=>+n.toFixed(3);
for(const id of ids){
 const letter=letters.find(l=>l.id===id),small=low[letter.glyph],r=high[letter.glyph],center=[500,id==='sad'?530:500];
 const skeleton=thin(small,splitGlyph(small).bodyMask),offset=id==='dad'?137:0;
 // In cropped 600px-font coordinates: head loop, then tooth and bowl, then Dad's dot.
 const vias=[[[300,182],[350,110],[420,50],[480,35],[550,60],[575,105],[565,135],[520,168],[420,193],[350,193],[300,182]],
 [[300,182],[265,182],[255,140],[262,95,'raw'],[255,140],[265,182],[270,240],[230,290],[130,345],[50,330],[20,280],[30,200,'raw']]];
 const toModel=p=>({x:center[0]+(p.x-r.w/2)*k,y:center[1]+(p.y-r.h/2)*k});
 // Account for the 6px crop padding at each rendering resolution.
 const lowModel=p=>toModel({x:6+(p.x-6)*4,y:6+(p.y-6)*4});
 const paths=vias.map((via,index)=>{
  let previous=null,route=[];
  for(const [x,y,raw]of via){
   if(raw){route.push({x,y:y+offset});previous=null;continue;}
   const a=nearestSet(small.w,small.h,skeleton,x,y+offset,25);if(!a)throw Error(`${id}: missing route anchor`);
   if(previous!==null){const leg=routeOnSkeleton(small.w,small.h,skeleton,previous,a.index);if(!leg)throw Error('Disconnected route');route.push(...leg.slice(1));}
   else route.push({x:a.index%small.w,y:Math.floor(a.index/small.w)});previous=a.index;
  }
  if(index===0)route[route.length-1]={...route[0]};
  return toPath(fitPolyline(smooth(route,5).map(lowModel),[],1.5));
 });
 const routes=paths.map(path=>{const points=samplePath(path,2),lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));return{points,lengths,length:lengths.at(-1)};});
 const {label,list}=components(r),body=list.reduce((a,b)=>a.area>b.area?a:b),masks=paths.map(()=>new Uint8Array(r.mask.length));
 const buckets=routes.map(route=>Array.from({length:Math.ceil(route.length/piece)},()=>new Uint8Array(r.mask.length)));
 for(let pixel=0;pixel<label.length;pixel++)if(label[pixel]===body.id){
  const p=toModel({x:pixel%r.w+.5,y:Math.floor(pixel/r.w)+.5});let best=Infinity,owner=0,arc=0;
  for(const [index,route]of routes.entries())for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;
   const dist=(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;if(dist<best){best=dist;owner=index;arc=route.lengths[i-1]+(route.lengths[i]-route.lengths[i-1])*t;}
  }
  masks[owner][pixel]=1;buckets[owner][Math.min(buckets[owner].length-1,Math.floor(arc/piece))][pixel]=1;
 }
 const bounds=mask=>{let x0=r.w,y0=r.h,x1=0,y1=0;for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%r.w,y=Math.floor(i/r.w);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}const a=toModel({x:x0,y:y0}),b=toModel({x:x1+1,y:y1+1});return{x:round(a.x),y:round(a.y),width:round(b.x-a.x),height:round(b.y-a.y)};};
 const parts=paths.map((path,index)=>{const segments=[];for(const [i,mask]of buckets[index].entries()){const ink=contours(r,mask,toModel),to=Math.min(routes[index].length,(i+1)*piece);if(ink.length)segments.push({from:segments.at(-1)?.to??0,to,contours:ink});else if(segments.length)segments.at(-1).to=to;}return{id:`stroke-${index+1}`,contours:contours(r,masks[index],toModel),bounds:bounds(masks[index]),segments};});
 const dots=list.filter(c=>c!==body).map((component,index)=>{const mask=Uint8Array.from(label,v=>v===component.id?1:0),p=toModel({x:component.cx,y:component.cy});parts.push({id:`dot-${index+1}`,contours:contours(r,mask,toModel),bounds:bounds(mask)});return{x:round(p.x),y:round(p.y)};});
 output[id]={baseRevision:letter.contentVersion,paths,dots,appearance:{baseRevision:letter.contentVersion,kind:'catalogueOutline',source:{font,sha256,glyph:letter.glyph,weight:400,method:'highResolutionInkContours',fontSize,scale:k,center,maxContourError:k*1.25},bounds:bounds(r.mask),bodyContours:contours(r,Uint8Array.from(label,v=>v===body.id?1:0),toModel),parts}};
 console.log(`${id}: two movements, ${dots.length} dots, catalogue outline`);
}
writeFileSync('src/content/sadDadOutlines.json',JSON.stringify(output,null,2)+'\n');
