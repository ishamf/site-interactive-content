import { test, expect } from '@playwright/test';

test('Basic timestamp', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Timestamp Converter' }).click();
  await page.getByRole('textbox', { name: 'Any datetime or timestamp...' }).click();
  await page.getByRole('textbox', { name: 'Any datetime or timestamp...' }).fill('1739347000');
  await page.getByText('Display in UTC').click();
  await expect(page.locator('xif-timestamp-converter')).toContainText(
    'The type of the input is timestamp (seconds).'
  );
  await expect(page.locator('td').nth(3)).toContainText('Timestamp (milliseconds)');
  await expect(page.locator('td').nth(4)).toContainText('1739347000000');
  await expect(page.locator('td').nth(6)).toContainText('ISO 8601');
  await expect(page.locator('td').nth(7)).toContainText('2025-02-12T07:56:40.000Z');
});
