import { test, expect } from '@playwright/test';

test('basic usage', async ({ page }) => {
  await page.goto('http://localhost:5174/');
  await page.getByRole('textbox', { name: 'Allowed IPs', exact: true }).click();
  await page.getByRole('textbox', { name: 'Allowed IPs', exact: true }).fill('0.0.0.0/0');
  await page.getByRole('textbox', { name: 'Disallowed IPs', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Disallowed IPs', exact: true })
    .fill(
      '0.0.0.0/8, 10.4.0.0/14, 10.8.0.0/13, 10.16.0.0/12, 10.32.0.0/11, 10.64.0.0/10, 10.128.0.0/9, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12, 192.168.0.0/16, 240.0.0.0/4, 151.101.128.81/32, 142.251.175.138/32'
    );
  await expect(page.locator('xif-ip-range-calculator')).toContainText(
    'Result = 1.0.0.0/8, 2.0.0.0/7, 4.0.0.0/6, 8.0.0.0/7, 10.0.0.0/14, 11.0.0.0/8, 12.0.0.0/6, 16.0.0.0/4, 32.0.0.0/3, 64.0.0.0/3, 96.0.0.0/4, 112.0.0.0/5, 120.0.0.0/6, 124.0.0.0/7, 126.0.0.0/8, 128.0.0.0/5, 136.0.0.0/6, 140.0.0.0/7, 142.0.0.0/9, 142.128.0.0/10, 142.192.0.0/11, 142.224.0.0/12, 142.240.0.0/13, 142.248.0.0/15, 142.250.0.0/16, 142.251.0.0/17, 142.251.128.0/19, 142.251.160.0/21, 142.251.168.0/22, 142.251.172.0/23, 142.251.174.0/24, 142.251.175.0/25, 142.251.175.128/29, 142.251.175.136/31, 142.251.175.139/32, 142.251.175.140/30, 142.251.175.144/28, 142.251.175.160/27, 142.251.175.192/26, 142.251.176.0/20, 142.251.192.0/18, 142.252.0.0/14, 143.0.0.0/8, 144.0.0.0/6, 148.0.0.0/7, 150.0.0.0/8, 151.0.0.0/10, 151.64.0.0/11, 151.96.0.0/14, 151.100.0.0/16, 151.101.0.0/17, 151.101.128.0/26, 151.101.128.64/28, 151.101.128.80/32, 151.101.128.82/31, 151.101.128.84/30, 151.101.128.88/29, 151.101.128.96/27, 151.101.128.128/25, 151.101.129.0/24, 151.101.130.0/23, 151.101.132.0/22, 151.101.136.0/21, 151.101.144.0/20, 151.101.160.0/19, 151.101.192.0/18, 151.102.0.0/15, 151.104.0.0/13, 151.112.0.0/12, 151.128.0.0/9, 152.0.0.0/5, 160.0.0.0/5, 168.0.0.0/8, 169.0.0.0/9, 169.128.0.0/10, 169.192.0.0/11, 169.224.0.0/12, 169.240.0.0/13, 169.248.0.0/14, 169.252.0.0/15, 169.255.0.0/16, 170.0.0.0/7, 172.0.0.0/12, 172.32.0.0/11, 172.64.0.0/10, 172.128.0.0/9, 173.0.0.0/8, 174.0.0.0/7, 176.0.0.0/4, 192.0.0.0/9, 192.128.0.0/11, 192.160.0.0/13, 192.169.0.0/16, 192.170.0.0/15, 192.172.0.0/14, 192.176.0.0/12, 192.192.0.0/10, 193.0.0.0/8, 194.0.0.0/7, 196.0.0.0/6, 200.0.0.0/5, 208.0.0.0/4, 224.0.0.0/4'
  );

  await expect(page.locator('xif-ip-range-calculator')).toHaveScreenshot();
});

test('error handling', async ({ page }) => {
  await page.goto('http://localhost:5174/');
  await page.getByRole('textbox', { name: 'Allowed IPs', exact: true }).click();
  await page.getByRole('textbox', { name: 'Allowed IPs', exact: true }).fill('0.0.0.0');

  await page.getByRole('textbox', { name: 'Disallowed IPs' }).click();
  await page.getByRole('textbox', { name: 'Disallowed IPs' }).fill('192.168.0.1/33');

  await expect(page.locator('xif-ip-range-calculator')).toContainText(
    'Unable to match 0.0.0.0 as an IP range'
  );
  await expect(page.locator('xif-ip-range-calculator')).toContainText(
    '192.168.0.1/33 has invalid mask length'
  );

  await expect(page.locator('xif-ip-range-calculator')).toHaveScreenshot();
});
