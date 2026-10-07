import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction,showDotHelp} from './helpers/tracing.js';
import {mkdirSync} from 'node:fs';
const ids=['Dal','Zal','Ra','Zai'],root=process.env.JAWI_EVIDENCE_DIR||'output/verification/four-letter-outlines/browser';mkdirSync(root,{recursive:true});
async function openOutlineLesson(page,label,mode='play'){
  await page.goto('/');await dismissSplash(page);
  if(mode!=='play'){
    await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
    await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button',{name:'Kembali',exact:true}).click();
  }
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,label);
  await expect(page.locator('.preview-banner')).toHaveCount(0);
  await expect(page.locator('.reference-outline').first()).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole('button',{name:'Menu permainan',exact:true})).toBeEnabled();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function capture(page,name){await page.screenshot({path:`${root}/${name}.png`,animations:'disabled'});}
for(const mode of ['play','guided','precision'])for(const label of ids)test(`${label} ${mode}: outline, route, dot gate and saved approved revision`,async({page})=>{
  test.setTimeout(60000);await openOutlineLesson(page,label,mode);
  const fit=await page.locator('.trace-board').getAttribute('viewBox');let points=(await boardModels(page)).strokes[0];
  await page.mouse.click(points.at(-1).x,points.at(-1).y);await expect(page.locator('.book-completed')).toHaveCount(0);
  await menuAction(page,'Cuba lagi');points=(await boardModels(page)).strokes[0];
  if(mode==='play'){
    const split=Math.floor(points.length*.4);await draw(page,points.slice(0,split));
    await expect(page.locator('.outline-progress')).toBeVisible();
    await expect(page.locator('.outline-progress > g > path').first()).toBeHidden();
    await capture(page,`${label}-${mode}-partial`);points=(await boardModels(page)).strokes[0];await draw(page,points.slice(split-1));
  }else await draw(page,points);
  if(['Zal','Zai'].includes(label)){
    await expect(page.locator('.book-completed')).toHaveCount(0);
    await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id','dot-1');
    await tapDots(page);await expect(page.locator('.validated-dot.outline-dot')).toHaveCount(1);
  }
  await expect(page.locator('.book-completed')).toBeVisible();expect(await page.locator('.trace-board').getAttribute('viewBox')).toBe(fit);
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record).toMatchObject({preview:false,geometryStatus:'approved',audioStatus:'approved',letterId:label.toLowerCase(),contentVersion:['Dal','Ra'].includes(label)?3:4});
  await capture(page,`${label}-${mode}-complete`);
});
for(const [width,height]of [[320,600],[768,1024],[1024,768],[1920,1080]])test(`four outlines fit and badges stay beside the letter ${width}x${height}`,async({page})=>{
  test.setTimeout(120000);await page.setViewportSize({width,height});
  for(const label of ids){
    await openOutlineLesson(page,label);await capture(page,`${label}-start-${width}x${height}`);
    const result=await page.locator('.trace-board').evaluate(svg=>{
      const b=svg.getBoundingClientRect(),shapes=[...svg.querySelectorAll('.reference-outline')].map(n=>n.getBoundingClientRect());
      const badgeNodes=[...svg.querySelectorAll('.trace-number-badge')],badges=badgeNodes.map(n=>n.getBoundingClientRect());
      const ink=[...svg.querySelectorAll('.reference-outline')];
      const obscured=badgeNodes.some(badge=>{
        const x=badge.cx.baseVal.value,y=badge.cy.baseVal.value,r=badge.r.baseVal.value;
        for(let xx=x-r;xx<=x+r;xx+=2)for(let yy=y-r;yy<=y+r;yy+=2)
          if(Math.hypot(xx-x,yy-y)<=r&&ink.some(p=>p.isPointInFill(new DOMPoint(xx,yy))))return true;
        return false;
      });
      const labelObscured=[...svg.querySelectorAll('.trace-number-label-backdrop')].some(label=>{
        const box=label.getBBox();
        for(let x=box.x;x<=box.x+box.width;x+=2)for(let y=box.y;y<=box.y+box.height;y+=2)
          if(ink.some(p=>p.isPointInFill(new DOMPoint(x,y))))return true;
        return false;
      });
      const groups=[...svg.querySelectorAll('.trace-number-guide')].map(group=>[...group.querySelectorAll('.trace-number-badge,.trace-number-label-backdrop')].map(n=>n.getBoundingClientRect()));
      const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
      const markerOverlap=groups.some((group,i)=>groups.slice(i+1).some(other=>group.some(a=>other.some(b=>intersects(a,b)))));
      return {clipped:shapes.some(p=>p.left<b.left||p.right>b.right||p.top<b.top||p.bottom>b.bottom),
        badgeClipped:badges.some(p=>p.left<b.left||p.right>b.right||p.top<b.top||p.bottom>b.bottom),
        obscured,labelObscured,markerOverlap,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    expect(result).toEqual({clipped:false,badgeClipped:false,obscured:false,labelObscured:false,markerOverlap:false,overflow:false});
  }
});
for(const input of ['touch','pen'])for(const label of ids)test(`${label}: ${input} contact, cancellation, wrong start and fresh recovery`,async({page,browserName})=>{
  test.skip(input==='touch'&&browserName!=='chromium','Native emulated touch uses Chromium CDP.');
  await page.setViewportSize({width:768,height:1024});await openOutlineLesson(page,label);
  let points=(await boardModels(page)).strokes[0];
  // A wrong-start scribble cannot colour the letter or complete it.
  await page.mouse.move(points[0].x+200,points[0].y);await page.mouse.down();
  await page.mouse.move(points[0].x+220,points[0].y+20);await page.mouse.up();
  await expect(page.locator('.outline-progress')).toHaveCount(0);await expect(page.locator('.book-completed')).toHaveCount(0);
  await menuAction(page,'Cuba lagi');points=(await boardModels(page)).strokes[0];
  if(input==='touch'){
    const session=await page.context().newCDPSession(page);await session.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
    const send=(type,points)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({...p,id:1}))});
    await send('touchStart',[points[0]]);for(const p of points.slice(1,8))await send('touchMove',[p]);await send('touchCancel',[]);
    await expect(page.locator('.book-completed')).toHaveCount(0);await menuAction(page,'Cuba lagi');points=(await boardModels(page)).strokes[0];
    await send('touchStart',[points[0]]);for(const p of points.slice(1))await send('touchMove',[p]);await send('touchEnd',[]);
    await session.detach();
  }else{
    await page.locator('.trace-board').evaluate(async(svg,points)=>{
      svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
      const send=(type,p)=>svg.dispatchEvent(new PointerEvent(type,{pointerId:72,pointerType:'pen',button:0,buttons:type==='pointerup'?0:1,clientX:p.x,clientY:p.y,bubbles:true}));
      send('pointerdown',points[0]);for(const p of points.slice(1)){send('pointermove',p);await new Promise(requestAnimationFrame);}send('pointerup',points.at(-1));
    },points);
  }
  await tapDots(page);await expect(page.locator('.book-completed')).toBeVisible();
});
test('outline section and full demonstrations preserve earned progress; dot button uses the diamond',async({page})=>{
  test.setTimeout(60000);await openOutlineLesson(page,'Zai');const points=(await boardModels(page)).strokes[0],split=Math.floor(points.length*.25);
  await draw(page,points.slice(0,split));const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');
  for(const action of ['Tunjuk bahagian ini','Tunjuk cara']){
    await menuAction(page,action);await expect(page.locator('.outline-demonstration')).toBeVisible();await capture(page,`Zai-${action==='Tunjuk cara'?'full':'section'}-demo`);
    await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:20000});
    expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);await expect(page.locator('.book-completed')).toHaveCount(0);
  }
  await draw(page,(await boardModels(page)).strokes[0].slice(split-1));await showDotHelp(page);await page.getByRole('button',{name:'Tambah titik 1 daripada 1'}).click();
  await expect(page.locator('.validated-dot.outline-dot')).toHaveCount(1);await expect(page.locator('.book-completed')).toBeVisible();
});
test('lightweight outline tracing keeps controls bounded and copy ink remains freehand',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('taman-jawi.presentation.v1','light');window.outlineCounters={};window.__JAWI_TRACE_PERF__=key=>window.outlineCounters[key]=(window.outlineCounters[key]||0)+1;});
  await openOutlineLesson(page,'Dal');await page.evaluate(()=>{window.outlineCounters={};});
  const points=(await boardModels(page)).strokes[0];
  await page.locator('.trace-board').evaluate(async(svg,points)=>{
    svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
    const send=(type,p)=>svg.dispatchEvent(new PointerEvent(type,{pointerId:93,pointerType:'pen',buttons:type==='pointerup'?0:1,clientX:p.x,clientY:p.y,bubbles:true}));
    send('pointerdown',points[0]);for(const p of points.slice(1)){send('pointermove',p);await new Promise(requestAnimationFrame);}send('pointerup',points.at(-1));
  },points);
  await expect(page.locator('.book-completed')).toBeVisible();
  const counters=await page.evaluate(()=>window.outlineCounters);expect(counters.render||0).toBeLessThan(points.length/2);
  await page.getByRole('button',{name:'Sekarang, cuba salin sendiri',exact:true}).click();
  await expect(page.locator('.copy-board')).toBeVisible();await expect(page.locator('.reference-outline')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Simpan untuk guru'})).toBeEnabled();
  await page.locator('.copy-board').scrollIntoViewIfNeeded();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const freehand=await page.locator('.copy-board').evaluate(svg=>{
    const matrix=svg.getScreenCTM();return {scale:Math.hypot(matrix.a,matrix.b),points:[{x:300,y:400},{x:340,y:460},{x:440,y:410}].map(p=>{const q=new DOMPoint(p.x,p.y).matrixTransform(matrix);return {x:q.x,y:q.y};})};
  });
  await draw(page,freehand.points);await expect(page.locator('.pupil-ink')).toHaveCount(1);await page.getByRole('button',{name:'Simpan untuk guru'}).click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).copies.at(-1).ink[0]);
  // Browser mouse input may round each screen coordinate by one pixel before delivery.
  for(const [actual,expected]of [[saved[0],{x:300,y:400}],[saved.at(-1),{x:440,y:410}]])
    expect(Math.hypot(actual.x-expected.x,actual.y-expected.y)).toBeLessThanOrEqual(Math.SQRT2/freehand.scale+.15);
});
