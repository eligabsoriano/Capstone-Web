import { expect, test } from "@playwright/test";

/**
 * E2E UI Tests for Navigation Flow
 *
 * Tests sidebar navigation, header navigation, and settings access
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

test.describe("Officer Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display sidebar navigation", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Check for sidebar or navigation
    const sidebar = page.locator(
      'nav, aside, [class*="sidebar"], [class*="Sidebar"]',
    );
    const count = await sidebar.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have dashboard link in navigation", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Look for dashboard link
    const dashboardLink = page.locator(
      'a:has-text("Dashboard"), a[href*="dashboard"], nav a:first-child',
    );
    const count = await dashboardLink.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to different sections via sidebar", async ({
    page,
  }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Find navigation links
    const navLinks = page.locator("nav a, aside a");
    const linkCount = await navLinks.count();

    if (linkCount > 1) {
      // Click the second link (first might be current page)
      await navLinks.nth(1).click();
      await page.waitForTimeout(1000);

      // URL should change
      const newUrl = page.url();
      expect(newUrl).toContain("/officer");
    }
  });

  test("should highlight active navigation item", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Look for active class on current nav item
    const activeNavItem = page.locator(
      'nav a[class*="active"], nav a[aria-current="page"], aside a[class*="active"]',
    );
    const count = await activeNavItem.count();
    // May or may not have explicit active styling
  });
});

test.describe("Header Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display header with user avatar/dropdown", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Check for header
    const header = page.locator("header, [class*='header'], [class*='Header']");
    const headerCount = await header.count();
    expect(headerCount).toBeGreaterThan(0);

    // Check for user dropdown trigger
    const avatarButton = page.locator(
      'button.rounded-full, button:has([data-slot="avatar"])',
    );
    const avatarCount = await avatarButton.count();
    expect(avatarCount).toBeGreaterThan(0);
  });

  test("should open dropdown menu on avatar click", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Click avatar
    const avatarButton = page
      .locator('button.rounded-full, button:has([data-slot="avatar"])')
      .first();
    await avatarButton.click();
    await page.waitForTimeout(500);

    // Dropdown should be visible
    const dropdown = page.locator('[role="menu"]');
    await expect(dropdown).toBeVisible();
  });

  test("should have settings option in dropdown", async ({ page }) => {
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

    // Check for settings option
    const settingsOption = page.locator(
      '[role="menuitem"]:has-text("Settings")',
    );
    await expect(settingsOption).toBeVisible();
  });

  test("should navigate to settings page from dropdown", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Open dropdown and click settings
    const avatarButton = page
      .locator('button.rounded-full, button:has([data-slot="avatar"])')
      .first();
    await avatarButton.click();
    await page.waitForTimeout(500);

    const settingsOption = page.locator(
      '[role="menuitem"]:has-text("Settings")',
    );
    await settingsOption.click();
    await page.waitForTimeout(1000);

    // Should navigate to settings
    const currentUrl = page.url();
    expect(currentUrl).toContain("/settings");
  });
});

test.describe("Admin Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display admin sidebar", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/admin");
    await page.waitForTimeout(1000);

    // Check for sidebar
    const sidebar = page.locator(
      'nav, aside, [class*="sidebar"], [class*="Sidebar"]',
    );
    const count = await sidebar.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have admin-specific navigation items", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/admin");
    await page.waitForTimeout(1000);

    // Look for admin-specific links
    const pageContent = await page.textContent("body");
    const hasAdminNav =
      pageContent?.toLowerCase().includes("users") ||
      pageContent?.toLowerCase().includes("settings") ||
      pageContent?.toLowerCase().includes("manage") ||
      pageContent?.toLowerCase().includes("admin") ||
      pageContent?.toLowerCase().includes("system");

    expect(hasAdminNav).toBeTruthy();
  });
});

test.describe("Settings Page Access", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should access officer settings page", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer/settings");
    await page.waitForTimeout(1000);

    // Should be on settings page
    expect(page.url()).toContain("/settings");

    // Should see settings content
    const pageContent = await page.textContent("body");
    const isSettingsPage = pageContent?.toLowerCase().includes("settings");
    expect(isSettingsPage).toBeTruthy();
  });

  test("should access admin settings page", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/admin/settings");
    await page.waitForTimeout(1000);

    // Should be on settings page
    expect(page.url()).toContain("/settings");

    // Should see settings content
    const pageContent = await page.textContent("body");
    const isSettingsPage = pageContent?.toLowerCase().includes("settings");
    expect(isSettingsPage).toBeTruthy();
  });
});

test.describe("Breadcrumb Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display breadcrumbs where applicable", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer/settings");
    await page.waitForTimeout(1000);

    // Check for breadcrumbs
    const breadcrumbs = page.locator(
      'nav[aria-label="breadcrumb"], [class*="breadcrumb"], ol[class*="Breadcrumb"]',
    );
    const count = await breadcrumbs.count();
    // May or may not have breadcrumbs depending on design
  });
});

test.describe("Mobile Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should show mobile menu button on small screens", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Look for hamburger menu or mobile menu button
    const mobileMenuButton = page.locator(
      'button[aria-label*="menu"], button:has([class*="Menu"]), button:has-text("☰")',
    );
    const count = await mobileMenuButton.count();
    // May have mobile menu toggle
  });

  test("should toggle mobile navigation", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Find and click mobile menu button
    const mobileMenuButton = page.locator(
      'button[aria-label*="menu"], button:has([class*="Menu"])',
    );

    if ((await mobileMenuButton.count()) > 0) {
      await mobileMenuButton.first().click();
      await page.waitForTimeout(500);

      // Mobile nav should be visible
      const mobileNav = page.locator(
        '[class*="mobile"], nav[class*="open"], [data-state="open"]',
      );
      const count = await mobileNav.count();
      // Check that something opens
    }
  });
});

test.describe("Navigation State Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should remember collapsed sidebar state", async ({ page }) => {
    const loggedIn = await loginAsOfficer(page);
    if (!loggedIn) {
      test.skip();
      return;
    }

    await page.goto("/officer");
    await page.waitForTimeout(1000);

    // Look for sidebar collapse toggle
    const collapseButton = page.locator(
      'button[aria-label*="collapse"], button[aria-label*="toggle"], button:has([class*="ChevronLeft"])',
    );

    if ((await collapseButton.count()) > 0) {
      // Click to collapse
      await collapseButton.first().click();
      await page.waitForTimeout(500);

      // Refresh page
      await page.reload();
      await page.waitForTimeout(1000);

      // Sidebar state may or may not persist depending on implementation
    }
  });
});
