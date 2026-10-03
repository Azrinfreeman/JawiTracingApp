import { test,expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dismissSplash, selectPractice, chooseLetter } from './helpers/navigation.js';
import { boardModels, draw } from './helpers/tracing.js';
const letters=JSON.parse(readFileSync(new URL('../../src/content/letters.json',import.meta.url),'utf8'));
for(const mode of ['guided','play']) for(const letter of letters.filter(l=>l.pilot)) {
  test(`${mode} pilot preview ${letter.id}: every movement and dot completes through native pointer handlers`,async({page})=>{
    await page.setViewportSize({width:1280,height:1000});await page.goto('/');
    await dismissSplash(page);
    await page.getByRole('button',{name:'Ruang guru'}).click();await page.getByRole('button',{name:'Buka pratonton dewasa'}).click();
    if(mode !== 'play') await selectPractice(page,mode);
    await chooseLetter(page, letter.labelMs);
    await expect(page.locator('.start-dot')).toBeVisible();
    const movements = await boardModels(page);
    for (const stroke of movements.strokes) await draw(page, stroke);
    for(const dot of movements.dots) await page.mouse.click(dot.x,dot.y);
    await expect(page.getByRole('heading',{name:mode==='play'?`Kamu sudah ikut huruf ${letter.labelMs}!`:'Bagus, kamu sudah cuba!'})).toBeVisible();
    const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('taman-jawi.progress.v1')).attempts.at(-1));
    expect(record.letterId).toBe(letter.id);expect(record.metrics.coverage).toBeGreaterThanOrEqual(.95);
    expect(record.geometryStatus).toBe(letter.geometry.status);expect(record.audioStatus).toBe(letter.audio.name.status);
    if(mode==='play') {expect(record.interactionPolicy).toBe('play-guided-v2');expect(record.inkPolicy).toBe('assistedRouteFill');expect(record.displayAssistance).toBe('routeFill');expect(record.outcome).toBe('playComplete');}
  });
}
