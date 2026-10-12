// Authoring only: adapt the owner's reference silhouette and partition its reveal.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {contours} from './lib/outline-contours.mjs';

const root='output/verification/ta-za-photo-reference';mkdirSync(root,{recursive:true});
const letters=JSON.parse(readFileSync('src/content/letters.json','utf8')).filter(l=>['tho','za'].includes(l.id));
if(letters.length!==2||letters.some(l=>l.contentVersion!==6))throw Error('Expected approved Ta/Za revision 6');
const image='ta-za-photo-reference.png',reference=`docs/references/${image}`;
const sha256=createHash('sha256').update(readFileSync(reference)).digest('hex');
const scale=414.89486/80;
const mapPath=path=>{let axis=0;return path.replace(/[-+]?(?:\d*\.)?\d+/g,n=>{
 const value=+n;return +(axis++%2?194.4+(value-45)*scale:387.6+(value-109)*scale).toFixed(5);
});};
// Coordinates are manually adapted from the small photograph, not a font glyph.
const bodyPhoto='M 109 119 C 121 106 140 89 150 93 C 161 96 164 106 158 117 C 149 130 115 139 85 134 C 79 133 76 128 74 125 C 86 128 102 125 109 119 Z M 110 123 C 120 114 140 101 150 106 C 157 108 157 112 149 116 C 138 121 122 125 110 126 Z';
const pillarPhoto='M 109 45 L 113 51 L 110 57 L 110 119 L 111 123 L 108 126 L 106 125 L 108 119 L 108 57 L 106 52 Z';
const bodyRoute=mapPath('M 109 120 C 121 108 141 94 149 99 C 158 102 159 111 151 116 C 143 123 123 127 109 125 C 97 128 86 131 80 128 C 78 128 76 126 74 125');
const pillarRoute='M 387.6 194.4 L 387.6 609.29486';
const bodies=[mapPath(bodyPhoto),mapPath(pillarPhoto)];
const browser=await chromium.launch(),page=await browser.newPage();
const round=n=>+n.toFixed(5);
function bounds(paths){const values=paths.flatMap(p=>p.match(/[-+]?(?:\d*\.)?\d+/g).map(Number));
 const xs=values.filter((_,i)=>i%2===0),ys=values.filter((_,i)=>i%2===1),x=Math.min(...xs),y=Math.min(...ys);
 return{x,y,width:round(Math.max(...xs)-x),height:round(Math.max(...ys)-y)};
}
try{
 const raster=await page.evaluate(({bodies,routes})=>{
  const origin={x:180,y:170},step=.18,w=Math.ceil(520/step),h=Math.ceil(540/step);
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.scale(1/step,1/step);ctx.translate(-origin.x,-origin.y);
  const encode=()=>{const data=ctx.getImageData(0,0,w,h).data;let binary='';
   for(let from=0;from<w*h;from+=8192){const bytes=Uint8Array.from({length:Math.min(8192,w*h-from)},(_,i)=>data[(from+i)*4+3]>127?1:0);binary+=String.fromCharCode(...bytes);}
   return btoa(binary);
  };
  const masks=bodies.map(body=>{ctx.clearRect(origin.x,origin.y,520,540);ctx.fill(new Path2D(body),'evenodd');return encode();});
  // Paint separately to form a union rather than an even-odd overlap hole at the junction.
  ctx.clearRect(origin.x,origin.y,520,540);for(const body of bodies)ctx.fill(new Path2D(body),'evenodd');
  const union=encode();
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');document.body.append(svg);
  const references=routes.map(d=>{const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',d);svg.append(p);
   const length=p.getTotalLength(),count=Math.ceil(length/3);
   return{length,points:Array.from({length:count+1},(_,i)=>{const q=p.getPointAtLength(length*i/count);return{x:q.x,y:q.y};})};
  });svg.remove();return{origin,step,w,h,masks,union,references};
 },{bodies,routes:[bodyRoute,pillarRoute]});
 const {origin,step,w,h,references}=raster,toModel=p=>({x:round(origin.x+p.x*step),y:round(origin.y+p.y*step)});
 const decode=s=>Uint8Array.from(Buffer.from(s,'base64'));
 const bodyContours=contours({w,h},decode(raster.union),toModel);
 const parts=raster.masks.map((data,index)=>{
  const mask=decode(data),ref=references[index],count=Math.ceil(ref.length/48);
  const buckets=Array.from({length:count},()=>new Uint8Array(mask.length));
  for(let pixel=0;pixel<mask.length;pixel++)if(mask[pixel]){
   const p={x:origin.x+(pixel%w+.5)*step,y:origin.y+(Math.floor(pixel/w)+.5)*step};let best=Infinity,arc=0;
   for(let i=1;i<ref.points.length;i++){
    const a=ref.points[i-1],b=ref.points[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;
    const t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0,error=(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;
    if(error<best){best=error;arc=(i-1+t)*ref.length/(ref.points.length-1);}
   }
   buckets[Math.min(count-1,Math.floor(arc/48))][pixel]=1;
  }
  const ink=contours({w,h},mask,toModel),segments=[];
  for(const [i,bucket]of buckets.entries()){
   const paths=contours({w,h},bucket,toModel),to=Math.min(ref.length,(i+1)*48);
   if(paths.length)segments.push({from:segments.at(-1)?.to??0,to,contours:paths});else if(segments.length)segments.at(-1).to=to;
  }
  return{id:`stroke-${index+1}`,contours:ink,bounds:bounds(ink),segments};
 });
 const output={};
 for(const letter of letters){
  const dots=letter.geometry.dotTargets.map(dot=>({id:dot.id,
   contours:[Array.from({length:64},(_,i)=>{const a=i*Math.PI/32;return`${i?'L':'M'}${round(dot.x+Math.cos(a)*dot.visibleRadius)} ${round(dot.y+Math.sin(a)*dot.visibleRadius)}`;}).join(' ')+' Z'],
   bounds:{x:dot.x-dot.visibleRadius,y:dot.y-dot.visibleRadius,width:dot.visibleRadius*2,height:dot.visibleRadius*2}}));
  output[letter.id]={baseRevision:6,revision:9,headPath:bodyRoute,path:pillarRoute,appearance:{
   baseRevision:8,kind:'referenceOutline',
   source:{kind:'referencePhoto',image,sha256,glyph:letter.glyph,method:'authoredVectorAdaptation',reference:'docs/TA_ZA_PHOTO_REFERENCE_REVIEW.md',maxContourError:.48},
   authoring:{scale,photoOrigin:[109,45],modelOrigin:[387.6,194.4],bodyPhoto,pillarPhoto,
    note:'Compact lower loop and tapered silhouette adapted from the owner photo; pillar centerline remains vertical. Za dot target/actions retained.'},
   bounds:bounds([...bodyContours,...dots.flatMap(d=>d.contours)]),bodyContours,parts:[...structuredClone(parts),...dots]
  }};
 }
 writeFileSync('src/content/taZaStraightPillars.json',JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify({revision:9,routeLengths:references.map(r=>round(r.length)),segments:parts.map(p=>p.segments.length),bodyBounds:bounds(bodyContours),referenceSha256:sha256}));
}finally{await browser.close();}
