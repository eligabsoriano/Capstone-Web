import { expect, test } from "@playwright/test";

/**
 * Basic Login Page E2E Tests
 *
 * For comprehensive auth tests, see:
 * - e2e/auth/auth.spec.ts - API tests for login/logout
 * - e2e/auth/auth-ui.spec.ts - UI interaction tests
 * - e2e/auth/2fa.spec.ts - Two-factor authentication tests
 * - e2e/auth/password.spec.ts - Password management tests
 */

test.describe("Login Page", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");

    // Check that the login page is rendered
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("should have email and password inputs", async ({ page }) => {
    await page.goto("/login");

    // Check for email/username input
    const emailInput = page
      .locator(
        'input[type="email"], input[name="email"], input[name="username"]',
      )
      .first();
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test("should have a submit button", async ({ page }) => {
    await page.goto("/login");

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")',
    );
    await expect(submitButton.first()).toBeVisible();
  });

  test("should not allow submission with empty fields", async ({ page }) => {
    await page.goto("/login");

    const initialUrl = page.url();
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")',
    );
    await submitButton.first().click();

    // Should stay on the same page (native HTML validation or custom validation)
    await page.waitForTimeout(500);
    expect(page.url()).toContain("login");
  });
});
