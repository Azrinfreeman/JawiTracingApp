import { test, expect } from '@playwright/test';
import letters from '../../src/content/letters.json' with { type: 'json' };
import { dismissSplash } from './helpers/navigation.js';
import { openTeacher } from './helpers/tracing.js';
// Student-ready lessons follow the catalogue, so approvals or revisions never need a count edit here.
const readyLessons = letters.filter(letter => letter.geometry.status === 'approved' && letter.audio.name.status === 'approved').length;

async function teacher(page) {
  await page.goto('/'); await dismissSplash(page);
  await openTeacher(page);
}
async function observeAudio(page) {
  await page.addInitScript(() => {
    const NativeAudio = window.Audio; window.__reviewAudio = [];
    window.Audio = class extends NativeAudio {
      constructor(...args) { super(...args); window.__reviewAudio.push(this); }
    };
  });
}

test('all 37 active local recordings decode to non-silent audio; approved lessons open for students', async ({ page }) => {
  await page.goto('/'); await dismissSplash(page);
  test.skip(!await page.evaluate(() => typeof AudioContext !== 'undefined'), 'This runtime has no AudioContext; decode verification runs in Chromium.');
  const sources = letters.map(letter => ({ id: letter.id, src: letter.audio.name.src }));
  const decoded = await page.evaluate(async sources => {
    const context = new AudioContext();
    try {
      const results = [];
      for (const item of sources) {
        const response = await fetch(item.src);
        if (!response.ok) throw new Error(`${item.id}: HTTP ${response.status}`);
        const bytes = await response.arrayBuffer();
        const byteLength = bytes.byteLength;
        const buffer = await context.decodeAudioData(bytes);
        const samples = buffer.getChannelData(0);
        let sum = 0, peak = 0, clipped = 0;
        for (const sample of samples) { sum += sample * sample; peak = Math.max(peak, Math.abs(sample)); if (Math.abs(sample) >= .999) clipped++; }
        results.push({ id: item.id, bytes: byteLength, duration: buffer.duration, rms: Math.sqrt(sum / samples.length), peak, clippedFraction: clipped / samples.length });
      }
      return results;
    } finally { await context.close(); }
  }, sources);
  expect(decoded).toHaveLength(37);
  for (const file of decoded) {
    expect(file.bytes, file.id).toBeGreaterThan(1000);
    expect(file.duration, file.id).toBeGreaterThan(.3);
    expect(file.duration, file.id).toBeLessThan(8);
    expect(file.rms, file.id).toBeGreaterThan(.003);
    expect(file.clippedFraction, file.id).toBeLessThan(.001);
  }
  await test.info().attach('decoded-audio.json', { body: JSON.stringify(decoded, null, 2), contentType: 'application/json' });
  await page.getByRole('button', { name: 'Jom mula', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.letter-card:enabled')).toHaveCount(readyLessons);
});

test('teacher can listen, replay, mute and change letters without stale audio or changing approval', async ({ page, browserName }) => {
  test.skip(process.platform === 'win32' && browserName === 'webkit', 'Observed Windows WebKit MP3 playback rejects with NotSupportedError; feedback is checked separately.');
  await observeAudio(page); await teacher(page);
  const panel = page.locator('.audio-review-panel');
  await expect(panel).toContainText('37 rakaman nama huruf tersedia');
  await panel.getByRole('button', { name: 'Dengar rakaman Alif', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Rakaman Alif dimainkan');
  await expect.poll(() => page.evaluate(() => window.__reviewAudio.at(-1)?.currentTime ?? 0)).toBeGreaterThan(0);
  await panel.getByRole('button', { name: 'Rakaman seterusnya', exact: true }).click();
  await expect(page.getByLabel('Huruf untuk semakan suara')).toHaveValue('ba');
  expect(await page.evaluate(() => ({ paused: window.__reviewAudio[0].paused, src: window.__reviewAudio[0].getAttribute('src') }))).toEqual({ paused: true, src: null });
  await panel.getByRole('button', { name: 'Dengar rakaman Ba', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Rakaman Ba dimainkan');
  await page.getByRole('button', { name: 'Senyapkan audio', exact: true }).click();
  expect(await page.evaluate(() => window.__reviewAudio.at(-1).muted)).toBe(true);
  await page.getByRole('button', { name: 'Hidupkan audio', exact: true }).click();
  await page.getByLabel('Kelantangan audio').focus(); await page.keyboard.press('Home');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.__reviewAudio.at(-1).volume)).toBeCloseTo(.3, 4);
  await panel.getByRole('button', { name: 'Dengar rakaman Ba', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__reviewAudio.length)).toBe(3);
  await page.getByLabel('Huruf untuk semakan suara').selectOption('nya');
  await panel.getByRole('button', { name: 'Rakaman seterusnya', exact: true }).click();
  await expect(page.getByLabel('Huruf untuk semakan suara')).toHaveValue('alif');
  await expect(page.locator('.teacher-stat-grid')).toContainText(`${readyLessons}pelajaran sedia untuk murid`);
  await expect(page.getByRole('cell', { name: 'Diluluskan', exact: true })).toHaveCount(37);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('preschool preview plays its own local letter recording and stops it on navigation', async ({ page, browserName }) => {
  test.skip(process.platform === 'win32' && browserName === 'webkit', 'Observed Windows WebKit MP3 playback rejects with NotSupportedError; feedback is checked separately.');
  await observeAudio(page); await teacher(page);
  await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  await page.getByRole('button', { name: 'Ba', exact: true }).click();
  await page.getByRole('button', { name: 'Dengar', exact: true }).click();
  await expect(page.locator('.audio-notice')).toHaveText('Dengar dan sebut semula.');
  expect(await page.evaluate(src => window.__reviewAudio.at(-1).src.endsWith(src), letters.find(letter => letter.id === 'ba').audio.name.src)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__reviewAudio.at(-1)?.currentTime ?? 0)).toBeGreaterThan(0);
  await openTeacher(page);
  expect(await page.evaluate(() => window.__reviewAudio.at(-1).paused)).toBe(true);
});

test('a missing audio file reports failure and never substitutes another letter', async ({ page }) => {
  const alifSource = letters.find(letter => letter.id === 'alif').audio.name.src;
  await observeAudio(page); await page.route(`**${alifSource}`, route => route.fulfill({ status: 404, body: '' }));
  await teacher(page);
  const panel = page.locator('.audio-review-panel');
  await panel.getByRole('button', { name: 'Dengar rakaman Alif', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText(/Rakaman tidak dapat dimainkan|Pelayar ini tidak menyokong rakaman/);
  expect(await page.evaluate(() => window.__reviewAudio.length)).toBe(1);
  expect(await page.evaluate(src => window.__reviewAudio[0].src.endsWith(src), alifSource)).toBe(true);
});

test('review list, approval labels and mobile layout work even when the runtime lacks MP3 support', async ({ page, browserName }) => {
  await teacher(page);
  const panel = page.locator('.audio-review-panel');
  await expect(page.getByLabel('Huruf untuk semakan suara').locator('option')).toHaveCount(37);
  await expect(page.getByRole('cell', { name: 'Diluluskan', exact: true })).toHaveCount(37);
  await expect(page.locator('.teacher-stat-grid')).toContainText(`${readyLessons}pelajaran sedia untuk murid`);
  await page.getByLabel('Huruf untuk semakan suara').selectOption('ha-pedat');
  await expect(panel.locator('.audio-review-transcript')).toContainText('Nama disebut: Ha');
  await expect(panel.locator('.audio-review-transcript strong')).toHaveText('Ha');
  if (process.platform === 'win32' && browserName === 'webkit') {
    await panel.getByRole('button', { name: 'Dengar rakaman Ha (ح)', exact: true }).click();
    await expect(panel.getByRole('status')).toContainText('Pelayar ini tidak menyokong rakaman');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
