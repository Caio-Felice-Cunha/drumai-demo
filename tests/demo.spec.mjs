import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('visitor can edit and operate the demo without network calls', async ({ page }) => {
  const external = [];
  const consoleErrors = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173')) external.push(request.url());
  });
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Hear the chart/i })).toBeVisible();
  const firstStep = page.getByRole('button', { name: 'kick, beat 1', exact: true });
  await expect(firstStep).toHaveAttribute('aria-pressed', 'true');
  await firstStep.click();
  await expect(firstStep).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: /Play/ }).click();
  await expect(page.locator('#player-status')).toContainText('Playing');
  await page.getByRole('button', { name: /Stop/ }).click();
  await expect(page.getByRole('heading', { name: /private boundary/i })).toBeVisible();
  await expect(page.getByText('PRIVATE PIPELINE · PSEUDOCODE')).toBeVisible();
  await expect(page.getByText('0', { exact: true }).last()).toBeVisible();
  expect(external).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test.describe('mobile and reduced motion', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  test('keeps the demo and technical case usable without overflow', async ({ page }) => {
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.locator('#demo').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'kick, beat 1', exact: true }).click();
    await expect(page.getByText('PRIVATE PIPELINE · PSEUDOCODE')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
});

test('WCAG AA audit passes', async ({ page }) => {
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(violations).toEqual([]);
});
