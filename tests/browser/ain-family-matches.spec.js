import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {readFileSync} from 'node:fs';
import {boardModels,draw,tapDots} from './helpers/tracing.js';
const root=process.env.JAWI_OUTLINE_HARNESS_DIR||'output/verification/ain-family-approval';
const harness=readFileSync(`${root}/test-harness.js`,'utf8');
async function mount(page,id,mode,result=false){
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(url=>history.replaceState(null,'',url),`/?ain-family=1&approved=1&letter=${id}&mode=${mode}${result?'&result=1':''}`);
  await page.addScriptTag({content:harness});await expect(page.locator('.trace-board,.outline-result').first()).toBeVisible();
}
for(const mode of ['solo','duo'])for(const id of ['ain','ghain','nga'])test(`${mode} ${id}: approved two-part student outline and independent lanes`,async({page})=>{
  test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});await mount(page,id,mode);
  const count=mode==='duo'?2:1;await expect(page.locator('.trace-board')).toHaveCount(count);
  for(let slot=0;slot<count;slot++)await page.locator(`[data-player-slot="${slot}"]`).getByRole('button',{name:'Saya sedia!',exact:true}).click();
  await expect(page.locator('.countdown-overlay')).toHaveCount(0,{timeout:10000});
  for(let slot=0;slot<count;slot++){
    const board=page.locator('.trace-board').nth(slot);
    for(let index=0;index<2;index++)await draw(page,(await boardModels(page,board)).strokes[index]);
    await tapDots(page,board);
    await expect(board).toHaveAttribute('data-phase','complete');
    if(mode==='duo'&&slot===0){await expect(page.locator('[data-player-slot="0"] .race-lane-status')).toContainText('Siap');await expect(page.locator('.trace-board').nth(1).locator('.outline-progress')).toHaveCount(0);}
  }
  await expect(page.locator('.round-result')).toBeVisible();
  const attempts=await page.evaluate(()=>window.outlineAttempts);expect(attempts).toHaveLength(count);
  for(const attempt of attempts)expect(attempt).toEqual({letterId:id,contentVersion:4,geometryStatus:'approved',unscored:false});
  for(const text of await page.locator('.round-score-grid strong').allTextContents())expect(text).not.toContain('—');
  const clips=await page.locator('clipPath').evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(clips).size).toBe(clips.length);
});
for(const id of ['ain','ghain','nga'])test(`${id}: authored result retains the whole catalogue silhouette`,async({page})=>{
  await mount(page,id,'solo',true);await expect(page.locator('.outline-result path')).toHaveCount({ain:1,ghain:2,nga:4}[id]);
  await expect(page.locator('.play-completed-letter')).toHaveCount(0);
});
