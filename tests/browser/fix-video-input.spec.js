import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {openLesson,boardModels,tapDots,draw,menuAction} from './helpers/tracing.js';
import {dismissSplash} from './helpers/navigation.js';
for (const label of ['Sad','Dad']) for (const input of ['touch','pen']) {
  test(`${label}: native sparse ${input} follows the second-stroke hairpin`,async({page,browserName})=>{
    test.skip(browserName!=='chromium','CDP touch is Chromium-only');
    test.setTimeout(60000);
    await page.setViewportSize({width:768,height:1024});await openLesson(page,label,'play');
    for(const offset of [0,-4,4]) {
    if(offset) await menuAction(page,'Cuba lagi');
    await boardModels(page);
    const strokes=await page.locator('.reference-stroke').evaluateAll((paths,offset)=>paths.map(path=>{
      const length=path.getTotalLength(), matrix=path.getScreenCTM();
      const arcs=Array.from({length:Math.ceil(length/32)},(_,i)=>i*32);arcs.push(length);
      return arcs.map(s=>{
        const p=path.getPointAtLength(s),a=path.getPointAtLength(Math.max(0,s-3)),b=path.getPointAtLength(Math.min(length,s+3));
        const tangent=Math.hypot(b.x-a.x,b.y-a.y)||1;
        const q=new DOMPoint(p.x-(b.y-a.y)*offset/tangent,p.y+(b.x-a.x)*offset/tangent).matrixTransform(matrix);
        return {x:q.x,y:q.y};
      });
    }),offset);
    if(input==='touch') {
      const session=await page.context().newCDPSession(page);
      await session.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
      const send=(type,points)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({...p,id:1}))});
      for(const points of strokes) {
        await send('touchStart',[points[0]]);
        for(const p of points.slice(1))await send('touchMove',[p]);
        await send('touchEnd',[]);
      }
      await session.detach();
    } else {
      // Browser-delivered pen events use the same real-event spacing without device hardware.
      await page.locator('.trace-board').evaluate(async(svg,strokes)=>{
        svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
        const send=(type,p)=>svg.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:19,pointerType:'pen',clientX:p.x,clientY:p.y}));
        for(const points of strokes) {
          send('pointerdown',points[0]);
          for(const p of points.slice(1)) {send('pointermove',p);await new Promise(requestAnimationFrame);}
          send('pointerup',points.at(-1));await new Promise(requestAnimationFrame);
        }
      },strokes);
    }
    if(label==='Dad') {
      await expect(page.locator('.writing-cue')).toContainText('Tinggal 1 titik');await tapDots(page);
    }
    await expect(page.locator('.book-completed')).toBeVisible();
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1).metrics.pauseEpisodes)).toBe(0);
    }
  });
}

test('Duo section demonstration is visible while both lanes and their clock stay paused',async({page})=>{
  await page.setViewportSize({width:1280,height:800});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await dismissSplash(page);await page.clock.install();
  await page.getByRole('button',{name:'Duo 1v1',exact:true}).click();
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();
  await page.getByRole('button',{name:'Seterusnya',exact:true}).click();
  await page.getByRole('button',{name:'Uji dua sentuhan'}).click();
  await page.getByRole('button',{name:/Pratonton susun atur dewasa/}).click();
  for(const slot of [0,1])await page.locator(`.race-pane[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  await page.clock.fastForward(3100);
  const boards=page.locator('.trace-board'),points=(await boardModels(page,boards.nth(0))).strokes[0];
  await draw(page,points.slice(0,Math.floor(points.length*.25)));
  const before=await page.locator('.play-fill').first().getAttribute('data-measured-frontier');
  await page.getByRole('button',{name:'Menu permainan',exact:true}).click();
  const clock=await page.locator('.race-clock').textContent();
  await menuAction(page,(await page.getByRole('button',{name:/Tunjuk bahagian ini ·/}).first().textContent()).trim());
  await expect(page.getByRole('dialog',{name:'Rehat sekejap'})).toHaveCount(0);
  await expect(boards.nth(0)).toHaveAttribute('data-demo','section');
  await page.clock.runFor(800);
  await expect(page.locator('.demonstration-ink')).toHaveCount(1);
  await page.screenshot({path:'output/verification/fix-video-implementation/browser/duo-section-demo.png'});
  await page.clock.runFor(12000);
  await expect(page.getByRole('dialog',{name:'Rehat sekejap'})).toBeVisible();
  expect(await page.locator('.race-clock').textContent()).toBe(clock);
  expect(await page.locator('.play-fill').first().getAttribute('data-measured-frontier')).toBe(before);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')||'{"attempts":[]}').attempts.length)).toBe(0);
});
