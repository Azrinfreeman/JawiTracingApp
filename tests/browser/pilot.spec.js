import { test,expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dismissSplash, selectPractice } from './helpers/navigation.js';
const letters=JSON.parse(readFileSync(new URL('../../src/content/letters.json',import.meta.url),'utf8'));
for(const mode of ['guided','play']) for(const letter of letters.filter(l=>l.pilot)) {
  test(`${mode} pilot preview ${letter.id}: every movement and dot completes through native pointer handlers`,async({page})=>{
    await page.setViewportSize({width:1280,height:1000});await page.goto('/');
    await dismissSplash(page);
    await page.getByRole('button',{name:'Ruang guru'}).click();await page.getByRole('button',{name:'Buka pratonton dewasa'}).click();
    if(mode !== 'play') await selectPractice(page,mode);
    await page.getByRole('button',{name:letter.labelMs,exact:true}).click();
    await expect(page.locator('.start-dot')).toBeVisible();
    const movements=await page.locator('.trace-board').evaluate(svg=>{
      const matrix=svg.getScreenCTM(); const convert=p=>{const q=new DOMPoint(p.x,p.y).matrixTransform(matrix);return {x:q.x,y:q.y};};
      return {strokes:[...svg.querySelectorAll('.reference-stroke')].map(path=>{const length=path.getTotalLength(),n=Math.ceil(length/6);return Array.from({length:n+1},(_,i)=>convert(path.getPointAtLength(length*i/n)));}),dots:[...svg.querySelectorAll('.reference-dot')].map(dot=>convert({x:+dot.getAttribute('cx'),y:+dot.getAttribute('cy')}))};
    });
    for(const stroke of movements.strokes) {
      await page.mouse.move(stroke[0].x,stroke[0].y);await page.mouse.down();
      for(const p of stroke.slice(1)) await page.mouse.move(p.x,p.y);
      await page.mouse.up();
    }
    for(const dot of movements.dots) await page.mouse.click(dot.x,dot.y);
    await expect(page.getByRole('heading',{name:mode==='play'?`Kamu sudah ikut huruf ${letter.labelMs}!`:'Bagus, kamu sudah cuba!'})).toBeVisible();
    const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(record.letterId).toBe(letter.id);expect(record.metrics.coverage).toBeGreaterThanOrEqual(.95);
    expect(record.geometryStatus).toBe(letter.geometry.status);expect(record.audioStatus).toBe(letter.audio.name.status);
    if(mode==='play') {expect(record.interactionPolicy).toBe('play-guided-v1');expect(record.inkPolicy).toBe('assistedRouteFill');expect(record.displayAssistance).toBe('routeFill');expect(record.outcome).toBe('playComplete');}
  });
}
