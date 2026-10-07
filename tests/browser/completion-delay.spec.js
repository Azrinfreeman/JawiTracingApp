import {expect} from '@playwright/test';
import {test} from './helpers/localTest.js';
import {dismissSplash,chooseLetter} from './helpers/navigation.js';
import {boardModels,draw,tapDots,menuAction} from './helpers/tracing.js';
import {instrument} from './helpers/audio.js';
import {mkdirSync} from 'node:fs';
const root=process.env.JAWI_EVIDENCE_DIR||'output/verification/completion-delay/browser';
mkdirSync(root,{recursive:true});
async function open(page,label,mode='play'){
  await instrument(page);await page.goto('/');await dismissSplash(page);
  if(mode!=='play'){
    await page.getByRole('button',{name:'Ruang guru',exact:true}).click();await page.getByLabel('Jenis latihan').selectOption(mode);
    await page.getByRole('button',{name:'Kembali',exact:true}).click();
  }
  await page.getByRole('button',{name:'Jom mula',exact:true}).click();await chooseLetter(page,label);await boardModels(page);
}
async function watch(page){
  await page.evaluate(()=>{
    window.completionTimes={};
    window.completionObserver=new MutationObserver(()=>{
      const t=window.completionTimes;
      if(document.querySelector('.book-completed')&&!t.finished)t.finished=performance.now();
      if(document.querySelector('.completion-overlay')&&!t.panel)t.panel=performance.now();
    });window.completionObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  });
}
async function finish(page){
  const model=await boardModels(page);for(const points of model.strokes)await draw(page,points);await tapDots(page);
  await expect(page.locator('.book-completed')).toBeVisible();
}
const attempts=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts);
for(const [label,mode,width,height]of [['Alif','play',320,600],['Ba','play',768,1024],['Mim','guided',768,1024],['Syin','precision',1280,800]]){
 test(`${label} ${mode}: finished letter stays visible before the panel, saves once and retries cleanly`,async({page,browserName})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});await open(page,label,mode);await watch(page);
  await finish(page);await expect(page.locator('.completion-overlay')).toHaveCount(0);
  expect(await attempts(page)).toHaveLength(1);
  await page.screenshot({path:`${root}/${browserName}-${label}-${mode}-unobscured.png`,animations:'disabled'});
  await expect(page.locator('.completion-overlay')).toBeVisible();
  const times=await page.evaluate(()=>window.completionTimes);expect(times.panel-times.finished).toBeGreaterThanOrEqual(1450);
  await page.screenshot({path:`${root}/${browserName}-${label}-${mode}-panel.png`,animations:'disabled'});
  await page.getByRole('button',{name:mode==='play'?'Main lagi':'Ulang huruf',exact:true}).click();
  await expect(page.locator('.completion-overlay')).toHaveCount(0);await expect(page.locator('.book-completed')).toHaveCount(0);
  expect(await attempts(page)).toHaveLength(1);
 });
}
test('leaving and retrying during the pause cancel the pending panel',async({page})=>{
  test.setTimeout(60000);await open(page,'Alif');await finish(page);
  await menuAction(page,'Cuba lagi');await expect(page.locator('.book-completed')).toHaveCount(0);
  await page.waitForTimeout(1700);await expect(page.locator('.completion-overlay')).toHaveCount(0);
  await finish(page);await menuAction(page,'Huruf seterusnya');
  await expect(page.getByRole('heading',{name:'Ba',exact:true})).toBeVisible();
  await page.waitForTimeout(1700);await expect(page.locator('.completion-overlay')).toHaveCount(0);
  expect(await attempts(page)).toHaveLength(2);
});
