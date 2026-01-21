import { expect, test } from "@playwright/test";

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
});
