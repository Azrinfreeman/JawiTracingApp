import { test,expect } from '@playwright/test';
import { dismissSplash, selectPractice } from './helpers/navigation.js';
import { openLesson, boardModels, openTeacher, showDotHelp } from './helpers/tracing.js';
for(const [width,height,density] of [[768,1024,2],[390,844,3]]) {
  test(`native emulated touch at ${width} CSS pixels and DPR ${density}`,async({browser})=>{
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:density,hasTouch:true,isMobile:true});
    const page=await context.newPage();const session=await context.newCDPSession(page);
    await page.goto('/');await dismissSplash(page);await openTeacher(page);
    await page.getByRole('button',{name:'Buka pratonton dewasa'}).click();await selectPractice(page,'guided');await page.getByRole('button',{name:'Ba',exact:true}).click();
    await page.locator('.trace-board').scrollIntoViewIfNeeded();
    const model=await page.locator('.trace-board').evaluate(svg=>{
      const matrix=svg.getScreenCTM(),p=svg.querySelector('.reference-stroke'),n=Math.ceil(p.getTotalLength()/6);
      const screen=point=>{const q=new DOMPoint(point.x,point.y).matrixTransform(matrix);return {x:q.x,y:q.y};};
      return {points:Array.from({length:n+1},(_,i)=>screen(p.getPointAtLength(p.getTotalLength()*i/n))),dot:screen({x:+svg.querySelector('.reference-dot').getAttribute('cx'),y:+svg.querySelector('.reference-dot').getAttribute('cy')})};
    });
    const wrong={x:model.points[0].x-80,y:model.points[0].y};
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...wrong,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...model.points[0],id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(page.locator('.pupil-ink')).toHaveCount(0);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...model.points[0],id:1}]});
    for(const p of model.points.slice(1)) await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...model.dot,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:model.dot.x+30,y:model.dot.y,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(page.locator('.validated-dot')).toHaveCount(0);
    await expect(page.locator('.pupil-ink-gesture')).toHaveCount(1);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...model.dot,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(page.getByRole('heading',{name:'Bagus, kamu sudah cuba!'})).toBeVisible();
    const attempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(attempt.pointerType).toBe('touch');expect(attempt.toleranceProfile).toBe('guided-touch-standard-v2');
    expect(attempt.metrics.wrongStartGestures).toBe(1);expect(attempt.metrics.rejectedDotGestures).toBe(1);
    await context.close();
  });
}

test('native emulated pen preserves pointer type and completes a strict stroke',async({page,context})=>{
  const session=await context.newCDPSession(page);
  await openLesson(page);const model=await boardModels(page),points=model.strokes[0];
  await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...points[0],pointerType:'pen'});
  await session.send('Input.dispatchMouseEvent',{type:'mousePressed',...points[0],button:'left',buttons:1,pointerType:'pen'});
  for(const p of points.slice(1))await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p,button:'left',buttons:1,pointerType:'pen'});
  await session.send('Input.dispatchMouseEvent',{type:'mouseReleased',...points.at(-1),button:'left',buttons:0,pointerType:'pen'});
  await expect(page.getByRole('heading',{name:'Bagus, kamu sudah cuba!'})).toBeVisible();
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(record.pointerType).toBe('pen');expect(record.toleranceProfile).toBe('guided-pen-mouse-standard-v2');
});

for(const [width,height,density] of [[768,1024,2],[390,844,3]]) {
  test(`play touch preserves colour after an excursion at ${width} CSS pixels and DPR ${density}`,async({browser})=>{
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:density,hasTouch:true,isMobile:true});
    const page=await context.newPage(),session=await context.newCDPSession(page);
    await openLesson(page,'Ba','play');const model=await boardModels(page),points=model.strokes[0],middle=35;
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...points[0],id:1}]});
    for(const p of points.slice(1,middle))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const saved=await page.locator('.play-fill').getAttribute('data-measured-frontier');
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:points[middle-1].x+model.scale*150,y:points[middle-1].y,id:1}]});
    await expect(page.locator('.board-tip')).toContainText('Sambung');expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(saved);
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...points[middle-1],id:1}]});
    for(const p of points.slice(middle))await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await showDotHelp(page);
    await page.getByRole('button',{name:'Tambah titik 1 daripada 1'}).tap();
    await expect(page.getByRole('heading',{name:'Kamu sudah ikut huruf Ba!'})).toBeVisible();
    const attempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(attempt.pointerType).toBe('touch');expect(attempt.toleranceProfile).toBe('play-touch-standard-v2');
    expect(attempt.metrics.pauseEpisodes).toBeGreaterThan(0);expect(attempt.metrics.equivalentDotActions).toBe(1);await context.close();
  });
}

test('native emulated pen completes assisted play with its own recorded input type',async({page,context})=>{
  await openLesson(page,'Alif','play');const session=await context.newCDPSession(page),points=(await boardModels(page)).strokes[0];
  await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...points[0],pointerType:'pen'});
  await session.send('Input.dispatchMouseEvent',{type:'mousePressed',...points[0],button:'left',buttons:1,pointerType:'pen'});
  for(const p of points.slice(1))await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p,button:'left',buttons:1,pointerType:'pen'});
  await session.send('Input.dispatchMouseEvent',{type:'mouseReleased',...points.at(-1),button:'left',buttons:0,pointerType:'pen'});
  await expect(page.getByRole('heading',{name:'Kamu sudah ikut huruf Alif!'})).toBeVisible();
  const attempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
  expect(attempt.pointerType).toBe('pen');expect(attempt.toleranceProfile).toBe('play-pen-mouse-standard-v2');
});
