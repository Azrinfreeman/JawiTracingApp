import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {ainFamilyReviewCandidates} from '../../src/content/reviewCandidates.js';
import letters from '../../src/content/letters.json' with {type:'json'};
import originals from '../fixtures/ain-family-originals.json' with {type:'json'};
import {mkdirSync} from 'node:fs';
const proposals=letters.filter(letter=>['ain','ghain','nga'].includes(letter.id)).map(candidate=>({candidate,original:originals.find(original=>original.id===candidate.id)})),root=process.env.JAWI_EVIDENCE_DIR||'output/verification/ain-family-approval/browser';
mkdirSync(root,{recursive:true});test.setTimeout(90000);
async function openCandidate(page,label,mode='play'){
  await page.goto('/');await dismissSplash(page);
  if(mode!=='play'){
    await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button',{name:'Kembali',exact:true}).click();
  }
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,label);
  await expect(page.locator('.reference-outline').first()).toBeVisible();await expect(page.locator('.preview-banner')).toHaveCount(0);
  await page.evaluate(()=>document.fonts.ready);await boardModels(page);
}
async function capture(page,name){
  await boardModels(page);
  const clear=await page.locator('.trace-board').evaluate(svg=>{
    const r=n=>n.getBoundingClientRect(),board=r(svg),controls=[...document.querySelectorAll('.stage-badge,.stage-menu-button')].map(r);
    const overlap=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
    const nodes=[...svg.querySelectorAll('.reference-outline,.trace-number-badge,.trace-number-label-backdrop')];
    return nodes.every(n=>{const b=r(n);return b.left>=board.left-1&&b.right<=board.right+1&&b.top>=board.top-1&&b.bottom<=board.bottom+1&&controls.every(c=>!overlap(b,c));});
  });expect(clear).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
}
for(const mode of ['play','guided','precision'])for(const {candidate}of proposals)test(`${candidate.id} ${mode}: head, lift, direct neck, bowl and every dot`,async({page,browserName})=>{
  await page.setViewportSize({width:mode==='play'?320:768,height:mode==='play'?600:1024});await instrument(page);await openCandidate(page,candidate.labelMs,mode);
  const fit=await page.locator('.trace-board').getAttribute('viewBox');await capture(page,`${browserName}-${candidate.id}-${mode}-start`);
  let model=await boardModels(page);
  if(mode==='play'){
    await draw(page,model.strokes[1]);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');
    await menuAction(page,'Cuba lagi');model=await boardModels(page);
    const split=Math.floor(model.strokes[0].length*.3);await draw(page,model.strokes[0].slice(0,split));
    await expect(page.locator('.outline-progress > g > path').first()).toBeHidden();
    await capture(page,`${browserName}-${candidate.id}-partial`);
    await draw(page,(await boardModels(page)).strokes[0].slice(split-1));
  }else await draw(page,model.strokes[0]);
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
  await expect(page.locator('.book-completed')).toHaveCount(0);await capture(page,`${browserName}-${candidate.id}-${mode}-bowl-start`);
  await draw(page,(await boardModels(page)).strokes[1]);
  if(candidate.geometry.dotTargets.length){
    await expect(page.locator('.book-completed')).toHaveCount(0);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');
    await tapDots(page);await expect(page.locator('.validated-dot.outline-dot')).toHaveCount(candidate.geometry.dotTargets.length);
  }
  await expect(page.locator('.book-completed')).toBeVisible();expect(await page.locator('.trace-board').getAttribute('viewBox')).toBe(fit);
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record).toMatchObject({preview:false,geometryStatus:'approved',letterId:candidate.id,contentVersion:4,mode});
});
for(const [width,height]of [[768,1024],[1920,1080]])test(`all three silhouettes and guides fit ${width}x${height}`,async({page,browserName})=>{
  test.setTimeout(120000);await page.setViewportSize({width,height});await instrument(page);
  for(const {candidate}of proposals){await openCandidate(page,candidate.labelMs);await capture(page,`${browserName}-${candidate.id}-${width}`);}
});
for(const {candidate}of proposals)test(`${candidate.id}: section and full examples preserve two-part progress`,async({page})=>{
  await instrument(page);await openCandidate(page,candidate.labelMs);
  const points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.25);await draw(page,points.slice(0,split));
  const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
  for(const action of ['Tunjuk bahagian ini','Tunjuk cara']){
    await menuAction(page,action);await expect(page.locator('.outline-demonstration').first()).toBeVisible();
    await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:25000});
    expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);await expect(page.locator('.book-completed')).toHaveCount(0);
  }
});
test('outlines match the actual catalogue font using one uniform transform',async({page,browserName})=>{
  test.skip(browserName==='webkit','Windows WebKit high-resolution canvas places dotted glyph marks differently from the Chromium authoring reference; layout and tracing are checked separately.');
  await page.setViewportSize({width:1280,height:900});await openCandidate(page,'Ain');
  const result=await page.evaluate(async proposals=>{
    await document.fonts.load('400 1200px "Noto Naskh Arabic"',proposals.map(p=>p.original.glyph).join(''));
    const rows=[],scores=[];document.body.innerHTML='';document.body.style.cssText='background:white;margin:0;padding:20px';
    for(const {original,candidate}of proposals){
      const font=document.createElement('canvas');font.width=font.height=2400;const f=font.getContext('2d');
      f.font='400 1200px "Noto Naskh Arabic"';f.direction='rtl';f.textAlign='center';f.fillText(original.glyph,1200,1800);
      const ink=f.getImageData(0,0,2400,2400).data;let x0=2400,y0=2400,x1=0,y1=0;
      for(let y=0;y<2400;y++)for(let x=0;x<2400;x++)if(ink[(y*2400+x)*4+3]>127){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
      const source=candidate.geometry.appearance.source,k=source.scale*source.fontSize/1200;
      const make=()=>{const c=document.createElement('canvas');c.width=c.height=1000;return c;};
      const reference=make(),r=reference.getContext('2d');r.setTransform(k,0,0,k,source.center[0]-(x0+x1+1)/2*k,source.center[1]-(y0+y1+1)/2*k);r.drawImage(font,0,0);
      const outline=make(),o=outline.getContext('2d'),appearance=candidate.geometry.appearance;
      o.fill(new Path2D(appearance.bodyContours.join(' ')),'evenodd');
      for(const part of appearance.parts.filter(part=>candidate.geometry.dotTargets.some(dot=>dot.id===part.id)))o.fill(new Path2D(part.contours.join(' ')),'evenodd');
      const old=make(),b=old.getContext('2d');b.lineCap=b.lineJoin='round';for(const stroke of original.geometry.strokes){b.lineWidth=stroke.displayWidth;b.stroke(new Path2D(stroke.path));}for(const dot of original.geometry.dotTargets){b.beginPath();b.arc(dot.x,dot.y,dot.visibleRadius,0,Math.PI*2);b.fill();}
      const a=r.getImageData(0,0,1000,1000).data,z=o.getImageData(0,0,1000,1000).data;let intersection=0,union=0;
      for(let i=3;i<a.length;i+=4){const ref=a[i]>127,actual=z[i]>127;if(ref||actual)union++;if(ref&&actual)intersection++;}
      scores.push({id:original.id,iou:intersection/union});
      const row=document.createElement('div');row.style.cssText='display:flex;gap:10px;height:280px';
      for(const [canvas,title]of [[reference,`${original.labelMs}: Isi kandungan`],[old,'Before'],[outline,'Corrected']]){const col=document.createElement('div');col.style.cssText='width:400px;text-align:center;font:18px sans-serif';col.append(title);canvas.style.cssText='display:block;width:260px;height:260px;margin:auto';col.append(canvas);row.append(col);}document.body.append(row);rows.push(row);
    }return scores;
  },proposals);
  await page.screenshot({path:`${root}/${browserName}-catalogue-before-corrected.png`,animations:'disabled'});
  console.log('Uniform catalogue silhouette IoU',JSON.stringify(result));
  for(const score of result)expect(score.iou,score.id).toBeGreaterThan(.985);
});

for(const [width,height]of [[320,600],[768,1024]])test(`Ain family review ${width}: approved revisions and no obsolete proposals`,async({page,browserName})=>{
  await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByRole('tab',{name:'Huruf',exact:true}).click();
  for(const {candidate}of proposals){
    const card=page.locator('.record-card').filter({has:page.getByRole('heading',{name:candidate.labelMs,exact:true})}),next=page.getByRole('button',{name:'Halaman kandungan seterusnya',exact:true});
    for(let i=0;i<40&&!(await card.isVisible())&&await next.isEnabled();i++)await next.click();await expect(card).toContainText('Diluluskan · 4');
  }
  await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('ain-outline');
  await expect(page.locator('.empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
  expect(ainFamilyReviewCandidates(letters)).toEqual([]);await page.screenshot({path:`${root}/${browserName}-approved-review-${width}.png`,animations:'disabled'});
  await page.getByLabel('Jenis semakan').selectOption('video');await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
});
