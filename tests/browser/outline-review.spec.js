import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash} from './helpers/navigation.js';
import {mkdirSync} from 'node:fs';
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/four-letter-outlines/browser';mkdirSync(root,{recursive:true});
const entries=[['Dal',3],['Zal',4],['Ra',3],['Zai',4]];
for(const [width,height]of [[320,600],[768,1024]])test(`four approved teacher entries and no obsolete proposals ${width}x${height}`,async({page,browserName})=>{
  test.setTimeout(45000);
  await page.setViewportSize({width,height});await page.goto('/');await dismissSplash(page);
  await page.getByRole('button',{name:'Ruang guru',exact:true}).click();
  await page.getByRole('tab',{name:'Huruf',exact:true}).click();
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  for(const [label,revision]of entries){
    const card=page.locator('.record-card').filter({has:page.getByRole('heading',{name:label,exact:true})});
    const next=page.getByRole('button',{name:'Halaman kandungan seterusnya',exact:true});
    for(let i=0;i<40&&!(await card.isVisible())&&await next.isEnabled();i++)await next.click();
    await expect(card).toContainText(`Diluluskan · ${revision}`);
  }
  await page.getByRole('button',{name:'Semakan video · bandingkan cadangan'}).click();
  await page.getByLabel('Jenis semakan').selectOption('outline');
  await expect(page.locator('.empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
  await expect(page.locator('.model-comparison-pair')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.screenshot({path:`${root}/${browserName}-approved-review-${width}x${height}.png`,animations:'disabled'});
  await page.getByLabel('Jenis semakan').selectOption('video');
  await expect(page.locator('.model-comparison-pair svg')).toHaveCount(2);
  await expect(page.locator('.video-model-review .empty-state')).toHaveText('Tiada cadangan yang sepadan dengan versi semasa.');
});
