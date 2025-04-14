import { test, expect, Page } from '@playwright/test';

test.use({
  timezoneId: 'Asia/Makassar',
  locale: 'en-UK',
});

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: 1744189200000 });
});

const initialItemCount = 7;

test('local city is added', async ({ page }) => {
  await page.goto('http://localhost:5175/');
  await expect(page.getByLabel('City', { exact: true }).nth(0)).toHaveValue('Makassar');
});

test('time changes from local time', async ({ page, browserName }) => {
  // Linux webkit cannot render correct locale time
  test.skip(browserName === 'webkit' && process.platform === 'linux');

  await page.goto('http://localhost:5175/');
  await expect(page.getByLabel('City', { exact: true }).nth(0)).toHaveValue('Makassar');

  await page.getByLabel('Time', { exact: true }).nth(0).fill('04/09/2025 01:00 PM');

  await expect(page.locator('xif-time-map')).toContainText('9 April 2025 at 05:00 UTC');

  // Unfocus the textbox
  await page.locator('canvas').click();

  await expect(page.locator('xif-time-map').first()).toHaveScreenshot({ maxDiffPixels: 10 });
});

test('time changes from specific city', async ({ page, browserName }) => {
  // Linux webkit cannot render correct locale time
  test.skip(browserName === 'webkit' && process.platform === 'linux');

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

test('clicking another city while the selector is open should work', async ({ page }) => {
  // Reduce animation for faster tests
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('http://localhost:5175/');

  await page.getByRole('figure').getByRole('button', { name: 'Jakarta' }).click();
  await expect(page.getByRole('listbox', { name: 'Select hours' })).toBeVisible();

  await page.getByRole('figure').getByRole('button', { name: 'London' }).click();

  // The old datepicker should be closing, the new one should open
  await expect(page.getByRole('listbox', { name: 'Select hours' })).toHaveCount(2);

  // After a while, the old one should close
  await expect(page.getByRole('listbox', { name: 'Select hours' })).toHaveCount(1);

  // Picker for new city should be visible
  await expect(page.getByRole('listbox', { name: 'Select hours' })).toBeVisible();
});

async function deleteAllInitialItems(page: Page) {
  await expect(page.getByRole('combobox')).toHaveCount(initialItemCount + 1); // With new item

  for (let i = 0; i < initialItemCount; i++) {
    await page.getByRole('combobox').first().hover();
    await page.getByRole('button', { name: 'Clear' }).click();
  }

  await expect(page.getByRole('combobox')).toHaveCount(1);
}

async function addItem(page: Page, name: string) {
  const newRowBox = page.getByRole('combobox').last();

  await newRowBox.click();

  await newRowBox.fill(name);

  await page.getByRole('option').first().click();
}

test('deleting all cities and reload should preload', async ({ page }) => {
  await page.goto('http://localhost:5175/');

  await deleteAllInitialItems(page);

  await page.goto('http://localhost:5175/');

  await expect(page.getByRole('combobox')).toHaveCount(initialItemCount + 1); // With new item
});

test('lower priority items should be removed first', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 695 });

  await page.goto('http://localhost:5175/');

  await deleteAllInitialItems(page);

  const testItems = [
    'Jakarta',
    'New York City',
    'Los Angeles',
    'London',
    'Tokyo',
    'Berlin',
    'Vienna',
    'Mumbai',
  ];

  for (const item of testItems) {
    await addItem(page, item);
  }

  for (const item of testItems.slice(0, -1)) {
    await expect(page.getByRole('figure').getByRole('button', { name: item })).toBeVisible();
  }
});
