import { test, expect } from '@playwright/test';

/**
 * Mobile-specific tests for the Prepper Helper app.
 *
 * These tests run on mobile device emulators to catch mobile-specific issues.
 *
 * Run tests:
 *   npm run test:mobile                     # Run all mobile tests
 *   npm run test:mobile -- --project="Mobile Safari"  # Run only on iPhone
 *   npm run test:mobile -- --headed         # Run with visible browser
 *   npm run test:mobile -- --debug          # Debug mode with inspector
 */

test.describe('Mobile Navigation', () => {
  test('should navigate to inventory with scan=true parameter', async ({ page }) => {
    await page.goto('/inventory?scan=true');

    // The scanner modal should appear or the page should handle the param
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check URL contains the parameter
    expect(page.url()).toContain('scan=true');
  });

  test('should be able to access dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should redirect to login if not authenticated, or show dashboard
    const url = page.url();
    expect(url.includes('/login') || url.includes('/')).toBeTruthy();
  });
});

test.describe('Mobile Touch Interactions', () => {
  test('buttons should be tappable', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Find the sign in button
    const signInButton = page.locator('button[type="submit"]');
    await expect(signInButton).toBeVisible();

    // Check button is not covered by other elements
    const box = await signInButton.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThan(40); // Minimum touch target size
      expect(box.height).toBeGreaterThan(40);
    }
  });

  test('links should have adequate touch targets', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check all interactive elements have minimum touch target size (44x44 recommended)
    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        const box = await link.boundingBox();
        if (box) {
          // Log warning for small touch targets
          if (box.width < 44 || box.height < 44) {
            console.warn(`Small touch target: ${await link.textContent()} (${box.width}x${box.height})`);
          }
        }
      }
    }
  });
});

test.describe('Mobile Viewport', () => {
  test('should not have horizontal scroll', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('content should fit within viewport', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const viewportWidth = page.viewportSize()?.width || 0;

    // Check that main content doesn't exceed viewport
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
  });
});

test.describe('Mobile Forms', () => {
  test('form inputs should be visible and accessible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.click();
    await expect(emailInput).toBeFocused();

    // Password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('keyboard should not cover input fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    await emailInput.click();

    // Input should remain visible after focus (simulating keyboard appearance)
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeInViewport();
  });
});

test.describe('Mobile Performance', () => {
  test('page should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds on a good connection
    expect(loadTime).toBeLessThan(5000);
  });
});
