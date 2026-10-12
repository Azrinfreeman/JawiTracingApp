import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {openLesson,boardModels,draw} from './helpers/tracing.js';
import letters from '../../src/content/letters.json' with {type:'json'};

// Current approved outlines exercise the shared renderer beside referenceOutline.
for(const id of ['dal','zal','ra','zai','nun','ain','ghain','nga'])test(`${id}: approved outline still fills every stroke and separate dot`,async({page})=>{
 test.setTimeout(60000);
 const letter=letters.find(l=>l.id===id);
 expect(letter.geometry.status).toBe('approved');
 expect(letter.geometry.appearance.kind).toBe('catalogueOutline');
 await page.emulateMedia({reducedMotion:'reduce'});
 await openLesson(page,letter.labelMs,'play');
 const appearance=letter.geometry.appearance;
 const dotIds=new Set(letter.geometry.dotTargets.map(dot=>dot.id));
 const illustration=appearance.bodyContours?[{id:'body',contours:appearance.bodyContours},...appearance.parts.filter(part=>dotIds.has(part.id))]:appearance.parts;
 for(const part of illustration)await expect(page.locator(`.reference-outline[data-part-id="${part.id}"]`)).toHaveAttribute('d',part.contours.join(' '));
 for(const [i]of letter.geometry.strokes.entries()){
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id',`stroke-${i+1}`);
  await draw(page,(await boardModels(page)).strokes[i]);
 }
 for(const [i]of letter.geometry.dotTargets.entries()){
  await expect(page.locator('.trace-board')).not.toHaveAttribute('data-phase','complete');
  await expect(page.locator('.numbered-trace-guides')).toHaveAttribute('data-part-id',`dot-${i+1}`);
  const dot=(await boardModels(page)).dots[i];await page.mouse.click(dot.x,dot.y);
 }
 await expect(page.locator('.trace-board')).toHaveAttribute('data-phase','complete');
 await expect(page.locator('.outline-progress .outline-ink').first()).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1'))?.attempts?.length||0)).toBe(1);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts[0])).toMatchObject({letterId:id,contentVersion:letter.contentVersion,geometryStatus:'approved',preview:true,metrics:{dotCount:letter.geometry.dotTargets.length}});
});
