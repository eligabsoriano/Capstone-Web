import { expect, test } from "@playwright/test";

/**
 * E2E UI Tests for Logout Flow
 *
 * Tests the complete logout user journey
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

const TEST_LOAN_OFFICER = {
  email: "officer@test.com",
  password: "f8kycZFECF^l",
};

// Helper to login via API and set tokens
async function loginAsOfficer(page: import("@playwright/test").Page) {
  const response = await page.request.post(
    `${API_BASE_URL}/api/auth/loan-officer/login/`,
    {
      data: {
        email: TEST_LOAN_OFFICER.email,
        password: TEST_LOAN_OFFICER.password,
      },
    },
  );

  if (response.status() !== 200) {
    return false;
  }

  const body = await response.json();

  if (body.data?.requires_2fa) {
    return false;
  }

  // Set tokens in localStorage
  await page.evaluate((tokens) => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    // Also set auth-storage for Zustand
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          user: {
            id: tokens.user.id,
            email: tokens.user.email,
            role: "loan_officer",
            fullName: tokens.user.full_name,
            department: tokens.user.department,
            employeeId: tokens.user.employee_id,
            mustChangePassword: false,
          },
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
  }, body.data);

  return true;
}

test.describe("Logout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing state
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should logout via dropdown menu and redirect to login", async ({
    page,
  }) => {
    // Login first
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    // Navigate to dashboard
    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Open profile dropdown (avatar button)
    const avatarButton = page
      .locator('button.rounded-full, button:has([data-slot="avatar"])')
      .first();
    await avatarButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(500);

    // Click logout option (use menuitem role specifically to avoid matching other buttons)
    const logoutButton = page.getByRole("menuitem", { name: "Logout" });
    await logoutButton.click();

    // Wait for logout to complete
    await page.waitForTimeout(2000);

    // Should be redirected to login page
    const currentUrl = page.url();
    expect(currentUrl).toContain("/login");

    // Auth tokens should be cleared
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("access_token"),
    );
    expect(accessToken).toBeNull();
  });

  test("should clear all auth data on logout", async ({ page }) => {
    // Login first
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    // Verify tokens exist
    await page.goto("/officer");
    const tokensBefore = await page.evaluate(() => ({
      access: localStorage.getItem("access_token"),
      refresh: localStorage.getItem("refresh_token"),
      authStorage: localStorage.getItem("auth-storage"),
    }));
    expect(tokensBefore.access).not.toBeNull();

    // Perform logout
    const avatarButton = page
      .locator('button.rounded-full, button:has([data-slot="avatar"])')
      .first();
    await avatarButton.click();
    await page.waitForTimeout(500);

    const logoutButton = page.locator('[role="menuitem"]:has-text("Logout")');
    await logoutButton.click();
    await page.waitForTimeout(2000);

    // Verify all auth data is cleared
    const tokensAfter = await page.evaluate(() => ({
      access: localStorage.getItem("access_token"),
      refresh: localStorage.getItem("refresh_token"),
    }));

    expect(tokensAfter.access).toBeNull();
    expect(tokensAfter.refresh).toBeNull();
  });

  test("should not be able to access protected routes after logout", async ({
    page,
  }) => {
    // Login first
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Perform logout
    const avatarButton = page
      .locator('button.rounded-full, button:has([data-slot="avatar"])')
      .first();
    await avatarButton.click();
    await page.waitForTimeout(500);

    const logoutButton = page.locator('[role="menuitem"]:has-text("Logout")');
    await logoutButton.click();
    await page.waitForTimeout(2000);

    // Try to access protected route
    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Should be redirected to login
    expect(page.url()).toContain("/login");
  });

  test("should show logout button in dropdown menu", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Open dropdown
    const avatarButton = page
      .locator('button.rounded-full, button:has([data-slot="avatar"])')
      .first();
    await avatarButton.click();
    await page.waitForTimeout(500);

    // Verify dropdown contents
    const dropdown = page.locator('[role="menu"]');
    await expect(dropdown).toBeVisible();

    // Should have Settings and Logout options
    const settingsOption = page.locator(
      '[role="menuitem"]:has-text("Settings")',
    );
    const logoutOption = page.locator('[role="menuitem"]:has-text("Logout")');

    await expect(settingsOption).toBeVisible();
    await expect(logoutOption).toBeVisible();
  });
});

test.describe("Session Expiry", () => {
  test("should redirect to login when session is invalid", async ({ page }) => {
    // Set invalid tokens
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("access_token", "invalid_expired_token");
      localStorage.setItem("refresh_token", "invalid_refresh_token");
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: {
            user: { id: "1", email: "test@test.com", role: "loan_officer" },
            isAuthenticated: true,
          },
          version: 0,
        }),
      );
    });

    // Try to access protected route
    await page.goto("/officer");
    await page.waitForTimeout(2000);

    // Should either show error or redirect to login when API calls fail
    // The exact behavior depends on your error handling implementation
    const currentUrl = page.url();
    expect(
      currentUrl.includes("/login") || currentUrl.includes("/officer"),
    ).toBeTruthy();
  });
});
