# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: numbered-guides.spec.js >> all 12 initial guides are legible and contained on phone and tablet
- Location: tests\browser\numbered-guides.spec.js:57:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.splash-screen')
Expected: 0
Received: 1

Call log:
  - Expect "toHaveCount" locator('.splash-screen') with timeout 5000ms
  - waiting for locator('.splash-screen')
    5 × locator resolved to 1 element
      - unexpected value "1"
  - Test timeout of 120000ms exceeded.

```

# Page snapshot

```yaml
- main [ref=f16e3]:
  - generic [ref=f16e4]:
    - generic [ref=f16e6]:
      - generic [ref=f16e7]: Dibangunkan oleh
      - img "Hanana Academy" [ref=f16e9]
    - heading [level=1] [ref=f16e10]:
      - text: Taman
      - emphasis [ref=f16e11]: Jawi
    - paragraph [ref=f16e12]: Mari kenal dan jejak huruf Jawi.
    - button "Teruskan" [active] [ref=f16e13] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | 
  3  | export async function dismissSplash(page) {
  4  |   const continueButton = page.getByRole('button', { name: 'Teruskan', exact: true });
  5  |   if (await continueButton.isVisible()) await continueButton.click();
> 6  |   await expect(page.locator('.splash-screen')).toHaveCount(0);
     |                                                ^ Error: expect(locator).toHaveCount(expected) failed
  7  |   await expect(page.getByRole('button', { name: 'Jom mula', exact: true })).toBeVisible();
  8  | }
  9  | 
  10 | export async function selectPractice(page, mode) {
  11 |   await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
  12 |   await page.getByLabel('Jenis latihan').selectOption(mode);
  13 |   await page.getByRole('button', { name: 'Buka pratonton dewasa', exact: true }).click();
  14 | }
  15 | 
```