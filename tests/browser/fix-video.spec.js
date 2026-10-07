import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {mkdirSync} from 'node:fs';
import letters from '../../src/content/letters.json' with {type:'json'};
import {openLesson,boardModels,draw,menuAction,tapDots} from './helpers/tracing.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
const evidence=process.env.JAWI_EVIDENCE_DIR||'output/verification/fix-video-implementation/browser';mkdirSync(evidence,{recursive:true});
test.setTimeout(180000);
async function capture(page,name) {
  if(name.startsWith('ta-'))expect(await page.evaluate(()=>{
    const boxes=selector=>[...document.querySelectorAll(selector)].map(node=>node.getBoundingClientRect());
    return boxes('.trace-number-label-backdrop').some(a=>boxes('.reference-dot').some(b=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom));
  })).toBe(false);
  await page.screenshot({path:`${evidence}/${name}.png`,animations:'disabled'});
}

for(const [width,height] of [[320,740],[768,1024],[1920,1080],[3840,2160]]) {
  test(`Ta marbutah badges, route and dot cues ${width}x${height}`,async({page})=>{
    await page.setViewportSize({width,height});await openLesson(page,'Ta marbutah','play');
    await expect(page.locator('.writing-cue')).toContainText('Mula di 1');
    await expect(page.locator('.trace-number-guide[data-number="3"]')).toHaveCount(0);
    const boxes=await page.locator('.trace-number-badge').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y,r:b.right,b:b.bottom};}));
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)expect(boxes[i].x<boxes[j].r&&boxes[j].x<boxes[i].r&&boxes[i].y<boxes[j].b&&boxes[j].y<boxes[i].b).toBe(false);
    await capture(page,`ta-start-${width}`);
    let points=(await boardModels(page)).strokes[0];
    const middle=Math.floor(points.length*.4), nearEnd=Math.floor(points.length*.9);
    await draw(page,points.slice(0,middle));await capture(page,`ta-mid-${width}`);
    points=(await boardModels(page)).strokes[0];
    await draw(page,points.slice(middle-1,nearEnd));
    await expect(page.locator('.trace-number-guide[data-number="1"]')).toHaveCount(0);
    await expect(page.locator('.trace-number-guide[data-number="3"]')).toHaveCount(1);
    await capture(page,`ta-end-${width}`);
    points=(await boardModels(page)).strokes[0];await draw(page,points.slice(nearEnd-1));
    await expect(page.locator('.writing-cue')).toContainText('Tinggal 2 titik');
    await expect(page.locator('.trace-number-label')).not.toContainText('Siap');
    await capture(page,`ta-dots-${width}`);await tapDots(page);
    await expect(page.locator('.book-completed')).toBeVisible();
  });
}
test('Nga shows its real restart and remaining dots, completing only after fresh dot taps',async({page})=>{
  await page.setViewportSize({width:768,height:1024});await openLesson(page,'Nga','play');
  await draw(page,(await boardModels(page)).strokes[0]);
  await expect(page.locator('.writing-cue')).toHaveText('Angkat pen. Mula semula di 4.');
  expect(await page.evaluate(() => {
    const cue=document.querySelector('.trace-announcements.stage-cue').getBoundingClientRect();
    return [...document.querySelectorAll('.trace-number-label-backdrop')].some(n=>{const b=n.getBoundingClientRect();return b.left<cue.right&&cue.left<b.right&&b.top<cue.bottom&&cue.top<b.bottom;});
  })).toBe(false);
  await capture(page,'nga-restart');await draw(page,(await boardModels(page)).strokes[1]);
  await expect(page.locator('.writing-cue')).toContainText('Tinggal 3 titik');
  const dots=(await boardModels(page)).dots;await page.mouse.click(dots[0].x,dots[0].y);
  await expect(page.locator('.writing-cue')).toContainText('Tinggal 2 titik');await capture(page,'nga-two-dots');
  for(const dot of dots.slice(1))await page.mouse.click(dot.x,dot.y);
  await expect(page.locator('.book-completed')).toBeVisible();
});
for(const label of ['Wau','Ha ه'])test(`${label}: section demonstration preserves measured progress and cannot complete`,async({page})=>{
  const letter=label==='Wau'?letters.find(l=>l.id==='wau'):letters.find(l=>l.id==='ha');
  await page.emulateMedia({reducedMotion:label==='Wau'?'no-preference':'reduce'});await openLesson(page,letter.labelMs,'play');
  const points=(await boardModels(page)).strokes[0], split=Math.floor(points.length*.2);
  await draw(page,points.slice(0,split));
  const before=await page.locator('.play-fill').getAttribute('data-measured-frontier');await capture(page,`${letter.id}-partial`);
  await menuAction(page,'Tunjuk bahagian ini');
  await expect(page.locator('.trace-board')).toHaveAttribute('data-demo','section');await capture(page,`${letter.id}-section-demo`);
  await expect(page.locator('.demonstration-ink')).toHaveCount(0,{timeout:15000});
  expect(await page.locator('.play-fill').getAttribute('data-measured-frontier')).toBe(before);
  await expect(page.locator('.book-completed')).toHaveCount(0);
  await draw(page,points.slice(split-1));await expect(page.locator('.book-completed')).toBeVisible();
});
for(const [width,height] of [[320,600],[320,740],[1366,768]])test(`adult comparisons ${width}x${height} are paged and proposals stay out of student lessons`,async({page})=>{
  test.setTimeout(45000);
  await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
  await page.getByRole('tab',{name:'Huruf',exact:true}).click();await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
  await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
  await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
  await capture(page,`approved-review-${width}-${height}`);

});
test('all 36 current letters complete with unchanged approved revisions',async({page})=>{
  test.setTimeout(300000);await page.goto('/');await dismissSplash(page);await page.getByRole('button',{name:'Jom mula',exact:true}).click();
  for(const letter of letters) {
    await chooseLetter(page,letter.labelMs);
    for(const [index] of letter.geometry.strokes.entries()) await draw(page,(await boardModels(page)).strokes[index]);
    await tapDots(page);await expect(page.locator('.book-completed'),letter.id).toBeVisible();
    const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(record).toMatchObject({letterId:letter.id,preview:false,contentVersion:letter.contentVersion,geometryStatus:'approved'});
    await menuAction(page,'Isi kandungan');
  }
});
