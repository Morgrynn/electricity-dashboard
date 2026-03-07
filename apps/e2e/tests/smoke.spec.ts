import { test, expect } from '@playwright/test';

test.describe('electricity dashboard smoke', () => {
  test('home loads and shows DB meta', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Electricity Dashboard')).toBeVisible();
    await expect(page.getByText(/DB:\s*ok/i)).toBeVisible();
    await expect(page.getByText(/Table:\s*electricitydata/i)).toBeVisible();
    await expect(page.getByText(/Rows:\s*\d+/i)).toBeVisible();
  });

  test('daily stats table is visible and contains date links', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /date/i })).toBeVisible();

    const firstDayLink = page.locator('a[href^="/day/"]').first();
    await expect(firstDayLink).toBeVisible();
    await expect(firstDayLink).toHaveText(/\d{4}-\d{2}-\d{2}/);
  });

  test('can open single day summary from home table', async ({ page }) => {
    await page.goto('/');

    const firstDayLink = page.locator('a[href^="/day/"]').first();
    const dayText = (await firstDayLink.textContent())?.trim();

    expect(dayText).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await firstDayLink.click();

    await expect(page).toHaveURL(new RegExp(`/day/${dayText}$`));
    await expect(page.getByRole('heading', { name: 'Electricity Dashboard' })).toBeVisible();
    await expect(page.getByText(new RegExp(`Day summary\\s+—\\s+${dayText}`))).toBeVisible();

    await expect(page.getByText('Consumption (MWh)')).toBeVisible();
    await expect(page.getByText('Production (MWh)')).toBeVisible();
    await expect(page.getByText('Average price (€/MWh)')).toBeVisible();
    await expect(page.getByText('Negative price streak (hours)')).toBeVisible();
    await expect(page.getByText('Cheapest hours')).toBeVisible();
  });

  test('back button returns from day summary to home', async ({ page }) => {
    await page.goto('/');

    const firstDayLink = page.locator('a[href^="/day/"]').first();
    await firstDayLink.click();

    await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
    await page.getByRole('button', { name: /back/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Electricity Dashboard' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('day summary shows ranked cheapest hours', async ({ page }) => {
    await page.goto('/');

    await page.locator('a[href^="/day/"]').first().click();

    const cheapestList = page.locator('.cheapest__list');
    await expect(cheapestList).toBeVisible();

    const items = cheapestList.locator('.cheapest__item');
    await expect(items.first()).toBeVisible();

    await expect(items.first()).toContainText(/#1/);
  });

  test('price explanation tooltip exists for cheapest hour price', async ({ page }) => {
    await page.goto('/');

    await page.locator('a[href^="/day/"]').first().click();

    const tooltip = page.locator('.tooltip').first();
    await expect(tooltip).toBeVisible();

    const title = await tooltip.getAttribute('title');
    expect(title).toBeTruthy();
  });
});
