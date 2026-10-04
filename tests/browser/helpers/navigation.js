import { expect } from '@playwright/test';

export async function dismissSplash(page) {
  const continueButton = page.getByRole('button', { name: 'Teruskan', exact: true });
  if (await continueButton.isVisible()) {
    try { await continueButton.click({ timeout: 2500 }); }
    catch (error) {
      // The 1.8-second automatic entry may remove the animated button mid-click.
      if (await page.locator('.splash-screen').count()) throw error;
    }
  }
  await expect(page.locator('.splash-screen')).toHaveCount(0);
  // Entering a game requests browser fullscreen. In automation that really changes the window state and makes later
  // viewport changes fail, so neutralise only the native request; a test's own stub is left alone.
  await page.evaluate(() => {
    if (/\[native code\]/.test(Function.prototype.toString.call(document.documentElement.requestFullscreen))) Element.prototype.requestFullscreen = () => Promise.resolve();
  });
  if (await page.getByRole('dialog', { name: 'Besarkan ruang bermain' }).isVisible()) return;
  await expect(page.getByRole('button', { name: 'Jom mula', exact: true })).toBeVisible();
}

export async function selectPractice(page, mode) {
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await page.getByLabel('Jenis latihan').selectOption(mode);
  await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
}

export async function chooseLetter(page, label) {
  // Wait for the measured grid before paging: its initial capacity is provisional.
  await expect(page.locator('.letter-grid-host')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await settle();
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const card = page.getByRole('button', { name: new RegExp(`^${escapedLabel}(?:, pernah dijejak)?$`) });
  const previous = page.getByRole('button', { name: 'Halaman huruf sebelumnya', exact: true });
  for (let count = 0; count < 40 && !(await card.isVisible()) && await previous.isEnabled(); count++) {
    await previous.click(); await settle();
  }
  for (let count = 0; count < 40 && !(await card.isVisible()); count++) {
    const next = page.getByRole('button', { name: 'Halaman huruf seterusnya', exact: true });
    if (!(await next.isVisible()) || !(await next.isEnabled())) break;
    await next.click(); await settle();
  }
  await card.click();
}
