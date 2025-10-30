import { test, expect } from '@playwright/test';

test('Login as EVMStaff and navigate to service history', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  // Fill in the login form
  await page.fill('input[name="username"]', 'evmstaff');
  await page.fill('input[name="password"]', '1');

  // Click the login button
  await page.click('button[type="submit"]');

  // Wait for navigation to the dashboard
  await page.waitForURL('http://localhost:5173/evm/dashboard');

  // Verify that the dashboard title is visible
  await expect(page.locator('h1')).toHaveText('Dashboard');

  // Navigate to service history
  await page.click('a[href="/evm/service-histories"]');

  // Wait for navigation to the service history page
  await page.waitForURL('http://localhost:5173/evm/service-histories');

  // Verify that the service history title is visible
  await expect(page.locator('h1')).toHaveText('Lịch sử dịch vụ');

  // Take a screenshot of the service history page
  await page.screenshot({ path: 'evm_service_history.png' });
});