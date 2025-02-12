import { test, expect } from '@playwright/test';

import { resolve } from 'path';

test('test', async ({ page }) => {
  await page.route(
    'https://huggingface.co/Supabase/bge-small-en/resolve/main/onnx/model_quantized.onnx',
    (route) =>
      route.fulfill({
        path: resolve(import.meta.dirname, '../playwright-cache/model_quantized.onnx'),
      })
  );
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Embeddings' }).click();
  await page.getByRole('button', { name: 'Remove sentence' }).first().click();
  await page.getByRole('button', { name: 'Remove sentence' }).first().click();
  await page.getByRole('button', { name: 'Remove sentence' }).first().click();
  await page.getByRole('button', { name: 'Remove sentence' }).first().click();
  await page.getByRole('button', { name: 'Remove sentence' }).first().click();
  await page.getByRole('button', { name: 'Remove sentence' }).first().click();
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(0).click();
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(0).fill('cat');
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(1).fill('dog');
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(2).fill('hot');
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(3).click();
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(3).fill('cold');
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(4).click();
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(4).fill('close');
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(5).click();
  await page.getByRole('textbox', { name: 'Enter text...' }).nth(5).fill('far');
  await expect(await page.locator('.sticky .relative')).toContainText('cat', { timeout: 60000 });
  await expect(await page.locator('.sticky .relative')).toHaveScreenshot();

  await expect(page.locator('xif-embeddings').first()).toHaveScreenshot();
  await expect(page.locator('xif-embedding-figure').first()).toHaveScreenshot();
});
