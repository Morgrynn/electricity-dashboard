import { test, expect } from '@playwright/test';

test('home loads and shows DB meta', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Electricity Dashboard')).toBeVisible();
  await expect(page.getByText(/DB:\s*ok/i)).toBeVisible();
  await expect(page.getByText(/Table:\s*electricitydata/i)).toBeVisible();
  await expect(page.getByText(/Row count:\s*\d+/i)).toBeVisible();
});
