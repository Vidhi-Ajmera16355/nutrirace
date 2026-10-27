import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('landing page renders its core content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/NutriRace/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Eat well together');
  await expect(page.getByRole('heading', { name: 'Roadmap' })).toBeVisible();
});

test('does not present unbuilt features as working', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /sign in|log in|sign up/i })).toHaveCount(0);
  await expect(page.getByText('Planned').first()).toBeVisible();
});

test('skip link is the first keyboard stop and moves focus to main content', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'keyboard navigation is a desktop concern');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('mobile navigation opens, closes with Escape, and exposes state', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'mobile-only control');
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open menu' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(page.getByRole('navigation', { name: 'Primary mobile' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Primary mobile' })).toBeHidden();
});

test('unknown routes show the not-found presentation', async ({ page }) => {
  const response = await page.goto('/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('health probe returns ok without leaking environment', async ({ request }) => {
  const res = await request.get('/healthz');
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ status: 'ok', service: 'web' });
});

for (const path of ['/', '/styleguide']) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
    ).toEqual([]);
  });
}
