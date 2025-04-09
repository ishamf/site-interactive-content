import { test, expect } from '@playwright/test';

test.use({
  timezoneId: 'Asia/Makassar',
  locale: 'en-UK',
});

test.beforeEach(async ({ page }) => {
  page.clock.install({ time: 1744189200000 });
});

test('local city is added', async ({ page }) => {
  await page.goto('http://localhost:5175/');
  await expect(page.getByLabel('City', { exact: true }).nth(0)).toHaveValue('Makassar');
});

test('time changes from local time', async ({ page }) => {
  await page.goto('http://localhost:5175/');
  await expect(page.getByLabel('City', { exact: true }).nth(0)).toHaveValue('Makassar');

  await page.getByLabel('Time', { exact: true }).nth(0).fill('04/09/2025 01:00 PM');

  await expect(page.locator('xif-time-map')).toContainText('9 April 2025 at 05:00 UTC');

  // Unfocus the textbox
  await page.locator('canvas').click();

  await expect(page.locator('xif-time-map').first()).toHaveScreenshot({ maxDiffPixels: 10 });
});

test('time changes from specific city', async ({ page }) => {
  await page.goto('http://localhost:5175/');
  await expect(page.getByLabel('City', { exact: true }).nth(0)).toHaveValue('Makassar');

  const inputValues = await page
    .getByLabel('City')
    .all()
    .then((ls) => Promise.all(ls.map((l) => l.inputValue())));

  const londonIndex = inputValues.findIndex((v) => v === 'London');

  expect(londonIndex).toBeGreaterThan(-1);

  await page.getByLabel('Time', { exact: true }).nth(londonIndex).fill('04/09/2025 06:00 AM');

  await expect(page.locator('xif-time-map')).toContainText('9 April 2025 at 05:00 UTC');

  // During winter, London is UTC+0
  await page.getByLabel('Time', { exact: true }).nth(londonIndex).fill('01/09/2025 06:00 AM');

  await expect(page.locator('xif-time-map')).toContainText('9 January 2025 at 06:00 UTC');

  // Unfocus the textbox
  await page.locator('canvas').click();

  await expect(page.locator('xif-time-map').first()).toHaveScreenshot({ maxDiffPixels: 10 });
});
