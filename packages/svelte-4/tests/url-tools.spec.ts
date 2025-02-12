import { test, expect } from '@playwright/test';

test('Parsing complex url', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Url Tools' }).click();
  await page.getByRole('button', { name: 'Try it out with a complex url!' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter URL...' })).toHaveValue(
    'https://archive.org/wayback/available'
  );
  await expect(page.getByRole('textbox', { name: 'Key...' }).first()).toHaveValue('url');
  await expect(page.getByRole('textbox', { name: 'Value...' }).first()).toHaveValue(
    'https://en.wikipedia.org/w/index.php'
  );
  await expect(page.getByRole('textbox', { name: 'Key...' }).nth(2)).toHaveValue('action');
  await expect(page.getByRole('textbox', { name: 'Value...' }).nth(2)).toHaveValue('history');
  await expect(page.getByRole('textbox', { name: 'Key...' }).nth(3)).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Value...' }).nth(3)).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Key...' }).nth(4)).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Value...' }).nth(4)).toBeEmpty();
  await expect(page.getByRole('paragraph')).toContainText(
    'https://archive.org/wayback/available?url=https%3A%2F%2Fen.wikipedia.org%2Fw%2Findex.php%3Ftitle%3DWayback_Machine%26action%3Dhistory'
  );

  await expect(page.locator('xif-url-tools').first()).toHaveScreenshot();
});

test('Getting url from hash', async ({ page }) => {
  await page.goto(
    'http://localhost:5173/#url=https%3A%2F%2Farchive.org%2Fwayback%2Favailable%3Furl%3Dhttps%253A%252F%252Fen.wikipedia.org%252Fw%252Findex.php%253Ftitle%253DWayback_Machine%2526action%253Dhistory'
  );
  await page.getByRole('button', { name: 'Url Tools' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter URL...' })).toHaveValue(
    'https://archive.org/wayback/available'
  );
  await expect(page.getByRole('textbox', { name: 'Key...' }).first()).toHaveValue('url');
  await expect(page.getByRole('textbox', { name: 'Value...' }).first()).toHaveValue(
    'https://en.wikipedia.org/w/index.php'
  );
  await expect(page.getByRole('textbox', { name: 'Key...' }).nth(2)).toHaveValue('action');
  await expect(page.getByRole('textbox', { name: 'Value...' }).nth(2)).toHaveValue('history');
  await expect(page.getByRole('textbox', { name: 'Key...' }).nth(3)).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Value...' }).nth(3)).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Key...' }).nth(4)).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Value...' }).nth(4)).toBeEmpty();
  await expect(page.getByRole('paragraph')).toContainText(
    'https://archive.org/wayback/available?url=https%3A%2F%2Fen.wikipedia.org%2Fw%2Findex.php%3Ftitle%3DWayback_Machine%26action%3Dhistory'
  );
});

test('Constructing url from UI', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page
    .getByRole('textbox', { name: 'Enter URL...' })
    .fill('https://archive.org/wayback/available');
  await page.getByRole('textbox', { name: 'Key...' }).click();
  await page.getByRole('textbox', { name: 'Key...' }).fill('url');
  await page.getByRole('textbox', { name: 'Value...' }).first().click();
  await page
    .getByRole('textbox', { name: 'Value...' })
    .first()
    .fill('https://archive.org/wayback/available');
  await page.getByRole('textbox', { name: 'Key...' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Key...' }).nth(1).fill('other');
  await page.getByRole('textbox', { name: 'Value...' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Value...' }).nth(1).fill('test');
  await page.getByRole('textbox', { name: 'Key...' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Key...' }).nth(2).fill('another');
  await page.getByRole('textbox', { name: 'Value...' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Value...' }).nth(2).fill('value');
  await expect(page.getByRole('paragraph')).toContainText(
    'https://archive.org/wayback/available?url=https%3A%2F%2Farchive.org%2Fwayback%2Favailable&other=test&another=value'
  );
  await page.getByRole('button', { name: 'Add parameter' }).first().click();
  await page.getByRole('textbox', { name: 'Key...' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Key...' }).nth(1).fill('url');
  await page.getByRole('textbox', { name: 'Value...' }).nth(1).click();
  await page
    .getByRole('textbox', { name: 'Value...' })
    .nth(1)
    .fill('https://archive.org/wayback/available');
  await page.getByRole('button', { name: 'Add parameter' }).first().click();
  await page.getByRole('textbox', { name: 'Key...' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Key...' }).nth(2).fill('url');
  await page.getByRole('textbox', { name: 'Value...' }).nth(2).click();
  await page
    .getByRole('textbox', { name: 'Value...' })
    .nth(2)
    .fill('https://archive.org/wayback/available');
  await expect(page.getByRole('paragraph')).toContainText(
    'https://archive.org/wayback/available?url=https%3A%2F%2Farchive.org%2Fwayback%2Favailable%3Furl%3Dhttps%253A%252F%252Farchive.org%252Fwayback%252Favailable%253Furl%253Dhttps%25253A%25252F%25252Farchive.org%25252Fwayback%25252Favailable&other=test&another=value'
  );

  await expect(page.locator('xif-url-tools').first()).toHaveScreenshot();
});
