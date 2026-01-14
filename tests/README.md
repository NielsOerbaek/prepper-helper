# Mobile Testing with Playwright

This project uses Playwright for automated mobile testing with device emulation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. On Linux, you may need to install system dependencies:
   ```bash
   npx playwright install-deps
   ```

## Running Tests

### All tests (all devices)
```bash
npm test
```

### Mobile devices only
```bash
npm run test:mobile
```

### With visible browser (useful for debugging)
```bash
npm run test:mobile:headed
```

### View test report
```bash
npm run test:report
```

## Testing on Real Mobile Devices

For testing on an actual mobile device on your network:

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Start the dev server bound to all interfaces:
   ```bash
   npm run dev -- --hostname 0.0.0.0
   ```

3. On your mobile device, open: `http://<your-ip>:3000`

4. Run headed tests to see issues:
   ```bash
   npm run test:mobile:headed
   ```

## Test Structure

- `mobile.spec.ts` - Mobile-specific tests
  - Touch interactions
  - Viewport handling
  - Form accessibility
  - Performance checks

## Writing Mobile Tests

```typescript
import { test, expect, devices } from '@playwright/test';

// Test will run on all configured mobile devices
test('my mobile test', async ({ page }) => {
  await page.goto('/');

  // Interact with elements
  await page.tap('button');

  // Check visibility
  await expect(page.locator('h1')).toBeVisible();
});
```

## Device Configurations

The tests run on these device profiles:
- Pixel 5 (Android)
- iPhone 12 (iOS Safari)
- iPhone 14 Pro Max (Large iOS)
- iPad Pro 11 (Tablet)
- Desktop Chrome (for comparison)

See `playwright.config.ts` for full configuration.

## CI Integration

For CI/CD, set the `CI` environment variable:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test
  env:
    CI: true
```

## Debugging Failed Tests

1. Check the HTML report:
   ```bash
   npm run test:report
   ```

2. Run specific test with debug mode:
   ```bash
   npx playwright test mobile.spec.ts --debug
   ```

3. Generate trace on failure (configured by default):
   - Traces are saved in `test-results/`
   - Open with: `npx playwright show-trace <trace.zip>`
