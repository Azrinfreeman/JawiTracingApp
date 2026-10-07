// Authoring-only contour extraction shared by catalogue-outline model builders.
const rounded=n=>+n.toFixed(3);
function simplify(points,epsilon=1.25) {
  if(points.length<3)return points;
  const a=points[0],b=points.at(-1),dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;
  let index=0,max=0;
  for(let i=1;i<points.length-1;i++){
    const p=points[i],t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;
    const dist=Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
    if(dist>max){max=dist;index=i;}
  }
  return max>epsilon?[...simplify(points.slice(0,index+1),epsilon).slice(0,-1),...simplify(points.slice(index),epsilon)]:[a,b];
}
export function contours(r,mask,toModel) {
  const edges=new Map(),stride=r.w+1;
  const edge=(x,y,xx,yy)=>{const key=y*stride+x;const list=edges.get(key)||[];list.push(yy*stride+xx);edges.set(key,list);};
  const at=(x,y)=>x>=0&&y>=0&&x<r.w&&y<r.h&&mask[y*r.w+x];
  for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)if(at(x,y)){
    if(!at(x,y-1))edge(x,y,x+1,y);if(!at(x+1,y))edge(x+1,y,x+1,y+1);
    if(!at(x,y+1))edge(x+1,y+1,x,y+1);if(!at(x-1,y))edge(x,y+1,x,y);
  }
  const result=[];
  while(edges.size){
    const start=edges.keys().next().value;let current=start;const points=[];
    do{points.push({x:current%stride,y:Math.floor(current/stride)});const list=edges.get(current);if(!list)throw Error('Open contour');current=list.pop();if(!list.length)edges.delete(points.at(-1).y*stride+points.at(-1).x);}while(current!==start);
    if(points.length<6)continue;
    // Split the ring before RDP so start=end doesn't discard its shape.
    const half=Math.floor(points.length/2);
    const reduced=[...simplify(points.slice(0,half+1)).slice(0,-1),...simplify([...points.slice(half),points[0]]).slice(0,-1)].map(toModel);
    result.push(reduced.map((p,i)=>`${i?'L':'M'}${rounded(p.x)} ${rounded(p.y)}`).join(' ')+' Z');
  }
  return result;
}
