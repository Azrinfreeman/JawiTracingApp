import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {readFileSync} from 'node:fs';
import {boardModels,draw,tapDots} from './helpers/tracing.js';
const harness=readFileSync(`${process.env.JAWI_OUTLINE_HARNESS_DIR||'output/verification/four-letter-outlines'}/test-harness.js`,'utf8');
async function mount(page,id,mode,result=false){
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(url=>history.replaceState(null,'',url),`/?letter=${id}&mode=${mode}&approved=1${result?'&result=1':''}`);
  await page.addScriptTag({content:harness});
  await expect.poll(async()=>errors.length||await page.locator('.trace-board,.outline-result').count()).toBeGreaterThan(0);
  expect(errors).toEqual([]);
}
for(const mode of ['solo','duo'])for(const id of ['dal','zal','ra','zai'])test(`${mode} ${id}: approved outlines, scoring and independent lanes`,async({page})=>{
  await page.setViewportSize({width:1024,height:768});await mount(page,id,mode);
  const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
  const allIds=await page.locator('.trace-board clipPath').evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(allIds).size).toBe(allIds.length);
  for(let i=0;i<count;i++)await page.locator(`[data-player-slot="${i}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
  for(let i=0;i<count;i++){
    const board=page.locator('.trace-board').nth(i),points=(await boardModels(page,board)).strokes[0];
    await draw(page,points);await tapDots(page,board);
    if(mode==='duo'&&i===0){await expect(page.locator('[data-player-slot="0"] .race-lane-status')).toContainText('Siap');await expect(page.locator('.trace-board').nth(1).locator('.outline-progress')).toHaveCount(0);}
  }
  await expect(page.locator('.round-result')).toBeVisible();
  const attempts=await page.evaluate(()=>window.outlineAttempts);expect(attempts).toHaveLength(count);
  for(const attempt of attempts)expect(attempt).toEqual({letterId:id,contentVersion:['dal','ra'].includes(id)?3:4,geometryStatus:'approved',unscored:false});
  const clips=await page.locator('clipPath').evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(clips).size).toBe(clips.length);
});
test('authored standalone result uses the same outline',async({page})=>{
  await mount(page,'zai','solo',true);await expect(page.locator('.outline-result')).toBeVisible();
  await expect(page.locator('.outline-result path')).toHaveCount(2);await expect(page.locator('.play-completed-letter')).toHaveCount(0);
});
