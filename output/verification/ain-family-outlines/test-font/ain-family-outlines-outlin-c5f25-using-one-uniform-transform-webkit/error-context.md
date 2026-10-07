# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ain-family-outlines.spec.js >> outlines match the actual catalogue font using one uniform transform
- Location: tests\browser\ain-family-outlines.spec.js:67:1

# Error details

```
Error: ghain

expect(received).toBeGreaterThan(expected)

Expected: > 0.985
Received:   0.06683824085988949
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]: "Ain: Isi kandungan"
    - generic [ref=e5]: Before
    - generic [ref=e7]: Corrected
  - generic [ref=e9]:
    - generic [ref=e10]: "Ghain: Isi kandungan"
    - generic [ref=e12]: Before
    - generic [ref=e14]: Corrected
  - generic [ref=e16]:
    - generic [ref=e17]: "Nga: Isi kandungan"
    - generic [ref=e19]: Before
    - generic [ref=e21]: Corrected
```

# Test source

```ts
  1  | import {expect} from '@playwright/test';
  2  | import {test} from './helpers/localTest.js';
  3  | import {dismissSplash} from './helpers/navigation.js';
  4  | import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
  5  | import {instrument} from './helpers/audio.js';
  6  | import {ainFamilyReviewCandidates} from '../../src/content/reviewCandidates.js';
  7  | import letters from '../../src/content/letters.json' with {type:'json'};
  8  | import {mkdirSync} from 'node:fs';
  9  | const proposals=ainFamilyReviewCandidates(letters),root=process.env.JAWI_EVIDENCE_DIR||'output/verification/ain-family-outlines/browser';
  10 | mkdirSync(root,{recursive:true});test.setTimeout(90000);
  11 | async function openCandidate(page,label,mode='play'){
  12 |   await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
  13 |   await page.getByLabel('Jenis latihan').selectOption(mode);await page.getByRole('tab',{name:'Huruf',exact:true}).click();
  14 |   await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();await page.getByLabel('Jenis semakan').selectOption('ain-outline');
  15 |   const button=page.getByRole('button',{name:`Semak ${label} cadangan`,exact:true});
  16 |   for(let i=0;i<3&&!(await button.isVisible());i++)await page.getByRole('button',{name:'Halaman rekod seterusnya',exact:true}).click();
  17 |   await button.click();await expect(page.locator('.reference-outline').first()).toBeVisible();
  18 |   await expect(page.locator('.preview-banner')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await boardModels(page);
  19 | }
  20 | async function capture(page,name){
  21 |   await boardModels(page);
  22 |   const clear=await page.locator('.trace-board').evaluate(svg=>{
  23 |     const r=n=>n.getBoundingClientRect(),board=r(svg),controls=[...document.querySelectorAll('.stage-badge,.stage-menu-button')].map(r);
  24 |     const overlap=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
  25 |     const nodes=[...svg.querySelectorAll('.reference-outline,.trace-number-badge,.trace-number-label-backdrop')];
  26 |     return nodes.every(n=>{const b=r(n);return b.left>=board.left-1&&b.right<=board.right+1&&b.top>=board.top-1&&b.bottom<=board.bottom+1&&controls.every(c=>!overlap(b,c));});
  27 |   });expect(clear).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  28 |   await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});
  29 | }
  30 | for(const mode of ['play','guided','precision'])for(const {candidate}of proposals)test(`${candidate.id} ${mode}: head, lift, direct neck, bowl and every dot`,async({page,browserName})=>{
  31 |   await page.setViewportSize({width:mode==='play'?320:768,height:mode==='play'?600:1024});await instrument(page);await openCandidate(page,candidate.labelMs,mode);
  32 |   const fit=await page.locator('.trace-board').getAttribute('viewBox');await capture(page,`${browserName}-${candidate.id}-${mode}-start`);
  33 |   let model=await boardModels(page);
  34 |   if(mode==='play'){
  35 |     await draw(page,model.strokes[1]);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-1');
  36 |     await menuAction(page,'Cuba lagi');model=await boardModels(page);
  37 |     const split=Math.floor(model.strokes[0].length*.3);await draw(page,model.strokes[0].slice(0,split));
  38 |     await expect(page.locator('.outline-progress > g > path').first()).toBeHidden();
  39 |     await capture(page,`${browserName}-${candidate.id}-partial`);
  40 |     await draw(page,(await boardModels(page)).strokes[0].slice(split-1));
  41 |   }else await draw(page,model.strokes[0]);
  42 |   await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','stroke-2');
  43 |   await expect(page.locator('.book-completed')).toHaveCount(0);await capture(page,`${browserName}-${candidate.id}-${mode}-bowl-start`);
  44 |   await draw(page,(await boardModels(page)).strokes[1]);
  45 |   if(candidate.geometry.dotTargets.length){
  46 |     await expect(page.locator('.book-completed')).toHaveCount(0);await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');
  47 |     await tapDots(page);await expect(page.locator('.validated-dot.outline-dot')).toHaveCount(candidate.geometry.dotTargets.length);
  48 |   }
  49 |   await expect(page.locator('.book-completed')).toBeVisible();expect(await page.locator('.trace-board').getAttribute('viewBox')).toBe(fit);
  50 |   const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  51 |   expect(record).toMatchObject({preview:true,geometryStatus:'pendingReview',letterId:candidate.id,contentVersion:4});
  52 | });
  53 | for(const [width,height]of [[768,1024],[1920,1080]])test(`all three silhouettes and guides fit ${width}x${height}`,async({page,browserName})=>{
  54 |   test.setTimeout(120000);await page.setViewportSize({width,height});await instrument(page);
  55 |   for(const {candidate}of proposals){await openCandidate(page,candidate.labelMs);await capture(page,`${browserName}-${candidate.id}-${width}`);}
  56 | });
  57 | for(const {candidate}of proposals)test(`${candidate.id}: section and full examples preserve two-part progress`,async({page})=>{
  58 |   await instrument(page);await openCandidate(page,candidate.labelMs);
  59 |   const points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.25);await draw(page,points.slice(0,split));
  60 |   const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
  61 |   for(const action of ['Tunjuk bahagian ini','Tunjuk cara']){
  62 |     await menuAction(page,action);await expect(page.locator('.outline-demonstration').first()).toBeVisible();
  63 |     await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:25000});
  64 |     expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);await expect(page.locator('.book-completed')).toHaveCount(0);
  65 |   }
  66 | });
  67 | test('outlines match the actual catalogue font using one uniform transform',async({page,browserName})=>{
  68 |   await page.setViewportSize({width:1280,height:900});await openCandidate(page,'Ain');
  69 |   const result=await page.evaluate(async proposals=>{
  70 |     await document.fonts.load('400 1200px "Noto Naskh Arabic"',proposals.map(p=>p.original.glyph).join(''));
  71 |     const rows=[],scores=[];document.body.innerHTML='';document.body.style.cssText='background:white;margin:0;padding:20px';
  72 |     for(const {original,candidate}of proposals){
  73 |       const font=document.createElement('canvas');font.width=font.height=2400;const f=font.getContext('2d');
  74 |       f.font='400 1200px "Noto Naskh Arabic"';f.direction='rtl';f.textAlign='center';f.fillText(original.glyph,1200,1800);
  75 |       const ink=f.getImageData(0,0,2400,2400).data;let x0=2400,y0=2400,x1=0,y1=0;
  76 |       for(let y=0;y<2400;y++)for(let x=0;x<2400;x++)if(ink[(y*2400+x)*4+3]>127){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  77 |       const source=candidate.geometry.appearance.source,k=source.scale*source.fontSize/1200;
  78 |       const make=()=>{const c=document.createElement('canvas');c.width=c.height=1000;return c;};
  79 |       const reference=make(),r=reference.getContext('2d');r.setTransform(k,0,0,k,source.center[0]-(x0+x1+1)/2*k,source.center[1]-(y0+y1+1)/2*k);r.drawImage(font,0,0);
  80 |       const outline=make(),o=outline.getContext('2d'),appearance=candidate.geometry.appearance;
  81 |       o.fill(new Path2D(appearance.bodyContours.join(' ')),'evenodd');
  82 |       for(const part of appearance.parts.filter(part=>candidate.geometry.dotTargets.some(dot=>dot.id===part.id)))o.fill(new Path2D(part.contours.join(' ')),'evenodd');
  83 |       const old=make(),b=old.getContext('2d');b.lineCap=b.lineJoin='round';for(const stroke of original.geometry.strokes){b.lineWidth=stroke.displayWidth;b.stroke(new Path2D(stroke.path));}for(const dot of original.geometry.dotTargets){b.beginPath();b.arc(dot.x,dot.y,dot.visibleRadius,0,Math.PI*2);b.fill();}
  84 |       const a=r.getImageData(0,0,1000,1000).data,z=o.getImageData(0,0,1000,1000).data;let intersection=0,union=0;
  85 |       for(let i=3;i<a.length;i+=4){const ref=a[i]>127,actual=z[i]>127;if(ref||actual)union++;if(ref&&actual)intersection++;}
  86 |       scores.push({id:original.id,iou:intersection/union});
  87 |       const row=document.createElement('div');row.style.cssText='display:flex;gap:10px;height:280px';
  88 |       for(const [canvas,title]of [[reference,`${original.labelMs}: Isi kandungan`],[old,'Before'],[outline,'Corrected']]){const col=document.createElement('div');col.style.cssText='width:400px;text-align:center;font:18px sans-serif';col.append(title);canvas.style.cssText='display:block;width:260px;height:260px;margin:auto';col.append(canvas);row.append(col);}document.body.append(row);rows.push(row);
  89 |     }return scores;
  90 |   },proposals);
  91 |   await page.screenshot({path:`${root}/${browserName}-catalogue-before-corrected.png`,animations:'disabled'});
  92 |   console.log('Uniform catalogue silhouette IoU',JSON.stringify(result));
> 93 |   for(const score of result)expect(score.iou,score.id).toBeGreaterThan(.985);
     |                                                        ^ Error: ghain
  94 | });
  95 | 
```