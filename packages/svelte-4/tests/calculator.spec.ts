import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Calculator' }).click();
  await page.getByRole('textbox', { name: 'Type stuff here!' }).first().click();
  await page.getByRole('textbox', { name: 'Type stuff here!' }).first().fill('5x^y - 21');
  await page.getByRole('textbox', { name: 'Type stuff here!' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Type stuff here!' }).nth(1).fill('7');
  await page.getByRole('textbox', { name: 'Type stuff here!' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Type stuff here!' }).nth(2).fill('2');
  await expect(page.locator('xif-calculator')).toContainText('224');
});
