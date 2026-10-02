import { expect } from '@playwright/test';

export async function dismissSplash(page) {
  const continueButton = page.getByRole('button', { name: 'Teruskan', exact: true });
  if (await continueButton.isVisible()) await continueButton.click();
  await expect(page.locator('.splash-screen')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Jom mula', exact: true })).toBeVisible();
}

export async function selectPractice(page, mode) {
  await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  await page.getByLabel('Jenis latihan').selectOption(mode);
  await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
}
