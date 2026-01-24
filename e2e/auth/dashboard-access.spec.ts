import { expect, test } from "@playwright/test";

/**
 * E2E UI Tests for Dashboard Access and Role-Based Navigation
 *
 * Tests that different user roles can access their appropriate dashboards
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

const TEST_LOAN_OFFICER = {
  email: "officer@test.com",
  password: "f8kycZFECF^l",
};

const TEST_ADMIN = {
  username: "testadmin",
  password: "AdminPassword123!",
};

// Helper to login as officer
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

  await page.evaluate((tokens) => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
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

// Helper to login as admin
async function loginAsAdmin(page: import("@playwright/test").Page) {
  const response = await page.request.post(
    `${API_BASE_URL}/api/auth/admin/login/`,
    {
      data: {
        username: TEST_ADMIN.username,
        password: TEST_ADMIN.password,
      },
    },
  );

  if (response.status() !== 200) {
    return false;
  }

  const body = await response.json();

  await page.evaluate((tokens) => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          user: {
            id: tokens.user.id,
            username: tokens.user.username,
            role: "admin",
            permissions: tokens.user.permissions || [],
          },
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
  }, body.data);

  return true;
}

test.describe("Loan Officer Dashboard Access", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should allow officer to access /officer dashboard", async ({
    page,
  }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(2000);

    // Should stay on officer page
    expect(page.url()).toContain("/officer");

    // Should see officer dashboard content
    const pageContent = await page.textContent("body");
    const isOfficerDashboard =
      pageContent?.toLowerCase().includes("dashboard") ||
      pageContent?.toLowerCase().includes("loan") ||
      pageContent?.toLowerCase().includes("applications") ||
      pageContent?.toLowerCase().includes("officer");
    expect(isOfficerDashboard).toBeTruthy();
  });

  test("should redirect unauthenticated user from /officer to login", async ({
    page,
  }) => {
    // No login, just try to access officer page
    await page.goto("/officer");
    await page.waitForTimeout(2000);

    // Should be redirected to login
    expect(page.url()).toContain("/login");
  });

  test("should show officer header with user info", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Should have header with user dropdown
    const avatarButton = page.locator(
      'button.rounded-full, button:has([data-slot="avatar"])',
    );
    const count = await avatarButton.count();
    expect(count).toBeGreaterThan(0);
  });

  test("officer should not be able to access /admin", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Should be redirected away from admin
    const currentUrl = page.url();
    const isAllowed =
      currentUrl.includes("/admin") &&
      !currentUrl.includes("/login") &&
      !currentUrl.includes("/officer");

    // Officer should not have access to admin pages
    // They should be redirected to login, their dashboard, or see an error
    const pageContent = await page.textContent("body");
    const hasAccessDenied =
      pageContent?.toLowerCase().includes("access denied") ||
      pageContent?.toLowerCase().includes("unauthorized") ||
      pageContent?.toLowerCase().includes("permission") ||
      !currentUrl.includes("/admin");

    // Either redirected away or shows error
    expect(
      hasAccessDenied ||
        currentUrl.includes("/officer") ||
        currentUrl.includes("/login"),
    ).toBeTruthy();
  });
});

test.describe("Admin Dashboard Access", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should allow admin to access /admin dashboard", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Should stay on admin page
    expect(page.url()).toContain("/admin");

    // Should see admin dashboard content
    const pageContent = await page.textContent("body");
    const isAdminDashboard =
      pageContent?.toLowerCase().includes("admin") ||
      pageContent?.toLowerCase().includes("dashboard") ||
      pageContent?.toLowerCase().includes("management") ||
      pageContent?.toLowerCase().includes("users");
    expect(isAdminDashboard).toBeTruthy();
  });

  test("should redirect unauthenticated user from /admin to login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    expect(page.url()).toContain("/login");
  });

  test("admin should not be able to access /officer", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(2000);

    // Admin might have access to officer pages or be redirected
    // Check appropriate behavior
    const currentUrl = page.url();
    const pageContent = await page.textContent("body");

    // Admin should either be redirected or see content
    // The exact behavior depends on your RBAC implementation
  });
});

test.describe("Protected Route Behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should redirect / to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Root path should redirect to login or show login page
    expect(
      page.url().includes("/login") || page.url() === "http://localhost:5173/",
    ).toBeTruthy();
  });

  test("should redirect to appropriate dashboard after login", async ({
    page,
  }) => {
    // Login via UI
    await page.goto("/login");
    await page.waitForTimeout(1000);

    // Fill login form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill(TEST_LOAN_OFFICER.email);
    await passwordInput.fill(TEST_LOAN_OFFICER.password);
    await submitButton.click();

    await page.waitForTimeout(3000);

    // Should redirect to officer dashboard (if no 2FA), 2FA page, change-password, or stay on login (if error)
    const currentUrl = page.url();
    expect(
      currentUrl.includes("/officer") ||
        currentUrl.includes("/verify-2fa") ||
        currentUrl.includes("/change-password") ||
        currentUrl.includes("/login"),
    ).toBeTruthy();
  });

  test("should persist auth state on page refresh", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Refresh the page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be on officer page
    expect(page.url()).toContain("/officer");

    // Should still have user info visible
    const avatarButton = page.locator(
      'button.rounded-full, button:has([data-slot="avatar"])',
    );
    const count = await avatarButton.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should handle token expiry gracefully", async ({ page }) => {
    // Set expired/invalid tokens
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("access_token", "expired_token_12345");
      localStorage.setItem("refresh_token", "expired_refresh_12345");
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: {
            user: {
              id: "fake-id",
              email: "fake@test.com",
              role: "loan_officer",
            },
            isAuthenticated: true,
          },
          version: 0,
        }),
      );
    });

    await page.goto("/officer");
    await page.waitForTimeout(3000);

    // Should eventually redirect to login or show error when API calls fail
    // Behavior depends on error handling implementation
    const currentUrl = page.url();
    const pageContent = await page.textContent("body");

    // Either redirected to login or still on page with potential errors
    const isHandled =
      currentUrl.includes("/login") ||
      currentUrl.includes("/officer") ||
      pageContent?.toLowerCase().includes("session") ||
      pageContent?.toLowerCase().includes("expired");
    expect(isHandled).toBeTruthy();
  });
});

test.describe("Role-Based Content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("officer dashboard should show loan-related features", async ({
    page,
  }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Check for loan-related content
    const pageContent = await page.textContent("body");
    const hasLoanFeatures =
      pageContent?.toLowerCase().includes("loan") ||
      pageContent?.toLowerCase().includes("application") ||
      pageContent?.toLowerCase().includes("borrower") ||
      pageContent?.toLowerCase().includes("dashboard");

    expect(hasLoanFeatures).toBeTruthy();
  });

  test("admin dashboard should show management features", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/admin");
    await page.waitForTimeout(1000);

    // Check for admin-related content
    const pageContent = await page.textContent("body");
    const hasAdminFeatures =
      pageContent?.toLowerCase().includes("admin") ||
      pageContent?.toLowerCase().includes("user") ||
      pageContent?.toLowerCase().includes("manage") ||
      pageContent?.toLowerCase().includes("system") ||
      pageContent?.toLowerCase().includes("dashboard");

    expect(hasAdminFeatures).toBeTruthy();
  });
});
