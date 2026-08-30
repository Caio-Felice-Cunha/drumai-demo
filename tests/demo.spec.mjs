import { test, expect } from '@playwright/test';

test('visitor can edit and operate the demo without network calls', async ({ page }) => {
  const external = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173')) external.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Hear the chart/i })).toBeVisible();
  const firstStep = page.getByRole('button', { name: 'kick, beat 1', exact: true });
  await expect(firstStep).toHaveAttribute('aria-pressed', 'true');
  await firstStep.click();
  await expect(firstStep).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: /Play/ }).click();
  await expect(page.locator('#player-status')).toContainText('Playing');
  await page.getByRole('button', { name: /Stop/ }).click();
  expect(external).toEqual([]);
});
