import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
const folder = 'output/verification/fix-video-implementation';
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:1366,height:1100}});
const errors = [], models = [];
page.on('pageerror', error => errors.push(error.message));
await page.clock.install();
await page.setContent(readFileSync(`${folder}/content-review.html`, 'utf8'));
for (const [index, id] of ['mim','ta-marbuta','ain','ghain','nga','hamzah','jim'].entries()) {
  if (index) await page.locator('#next').click();
  await page.screenshot({path:`${folder}/review-${id}.png`});
  for (const label of ['Play original','Play proposal']) {
    await page.getByRole('button',{name:label,exact:true}).click();
    await page.clock.runFor(1000);
    if (!(await page.locator('.ink').count())) throw new Error(`${id}: playback did not draw`);
    await page.clock.runFor(60000);
    const panel=page.locator('.panel').filter({has:page.getByRole('button',{name:label,exact:true})});
    if (!(await panel.locator('p').textContent()).includes('finished')) throw new Error(`${id}: playback did not finish`);
    models.push({id,label,paths:await panel.locator('.ink').count(),dots:await panel.locator('g circle').count()});
  }
}
await page.setViewportSize({width:320,height:740});
await page.screenshot({path:`${folder}/review-phone.png`,fullPage:true});
if (await page.evaluate(()=>document.scrollingElement.scrollWidth>innerWidth)) throw new Error('Review has horizontal overflow');
if (errors.length) throw new Error(errors.join('\n'));
writeFileSync(`${folder}/review-check.json`,JSON.stringify({models,errors,viewport:[1366,1100],phone:[320,740]},null,2));
await browser.close();
console.log(`Verified ${models.length} review animations and phone width.`);
