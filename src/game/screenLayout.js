export function gridCapacity(width, height, cardWidth = 150, cardHeight = 146, gap = 12) {
  const columns = Math.max(1, Math.min(8, Math.floor((width + gap) / (cardWidth + gap))));
  const rows = Math.max(1, Math.floor((height + gap) / (cardHeight + gap)));
  return { columns, rows, capacity: columns * rows };
}

export function fitTraceViewport(letter, references, width, height, copy = false) {
  if (copy || !width || !height || !Object.keys(references).length) return { x: 0, y: 0, width: 1000, height: 1000 };
  const points = Object.values(references).flatMap(reference => reference.vertices);
  const outline = letter.geometry.appearance?.bounds;
  if(outline)points.push({x:outline.x,y:outline.y},{x:outline.x+outline.width,y:outline.y+outline.height});
  for (const dot of letter.geometry.dotTargets) {
    const r = dot.visibleRadius;
    points.push({ x: dot.x - r, y: dot.y - r }, { x: dot.x + r, y: dot.y + r });
  }
  if (!points.length) return { x: 0, y: 0, width: 1000, height: 1000 };
  const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  // Fixed complete-letter clearance includes the widest assisted route and guide halos.
  // It never follows the live frontier, so writing and completion cannot move the letter.
  const margin = outline ? 148 : 112;
  let w = maxX - minX + margin * 2, h = maxY - minY + margin * 2;
  if (w / h < width / height) w = h * width / height;
  else h = w * height / width;
  // Keep the full letter and on-route number circles below a taller corner badge
  // only when their normal fit enters its sound-button area (e.g. Lam on phones).
  const scale=width/w, rightBadge=Math.min(260,width*.46+16);
  const nearBadge=points.some(point=>(point.x-(cx-w/2))*scale>width-rightBadge-36 &&
    (point.y-(cy-h/2))*scale<136+36);
  if(nearBadge){
    const top=Math.min(128,height*.32),usableHeight=height-top;
    if(w/h<width/usableHeight)w=h*width/usableHeight;
    else h=w*usableHeight/width;
    const fittedScale=width/w;
    return {x:cx-w/2,y:cy-h/2-top/fittedScale,width:w,height:height/fittedScale};
  }
  return { x: cx - w / 2, y: cy - h / 2, width: w, height: h };
}
