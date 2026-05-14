const { test, expect } = require('@playwright/test');

test.describe('Admin Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error toast or message
    const errorToast = page.locator('text=Invalid credentials');
    await expect(errorToast).toBeVisible();
  });
});

test.describe('Public Navigation', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Muhyo Tech/);
  });

  test('should navigate to services', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Services');
    await expect(page).toHaveURL(/\/services/);
  });
});
