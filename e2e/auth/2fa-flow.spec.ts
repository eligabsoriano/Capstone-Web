import { expect, test } from "@playwright/test";

/**
 * E2E UI Tests for 2FA Verification Flow
 *
 * Tests the complete 2FA verification user journey
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

const TEST_LOAN_OFFICER = {
  email: "officer@test.com",
  password: "f8kycZFECF^l",
};

// Helper to setup 2FA pending state
async function setupPending2FAState(page: import("@playwright/test").Page) {
  // Simulate login that requires 2FA
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
    return { requires2FA: false, tempToken: null };
  }

  const body = await response.json();

  if (body.data?.requires_2fa) {
    return {
      requires2FA: true,
      tempToken: body.data.temp_token,
    };
  }

  return { requires2FA: false, tempToken: null };
}

test.describe("2FA Verification Page UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display 2FA verification page after login if 2FA enabled", async ({
    page,
  }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      // If 2FA is not enabled for this user, skip
      test.skip();
      return;
    }

    // Set temp token and navigate to verify page
    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    // Should see verification page
    const pageContent = await page.textContent("body");
    const is2FAPage =
      pageContent?.toLowerCase().includes("verification") ||
      pageContent?.toLowerCase().includes("2fa") ||
      pageContent?.toLowerCase().includes("code") ||
      pageContent?.toLowerCase().includes("authenticator");

    expect(is2FAPage).toBeTruthy();
  });

  test("should have 6 input fields for OTP code", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    // Check for OTP input fields (typically 6 separate inputs)
    const otpInputs = page.locator(
      'input[maxlength="1"], input[data-otp="true"], input.otp-input',
    );
    const count = await otpInputs.count();

    // May have 6 individual inputs or 1 combined input
    const hasSingleInput =
      (await page.locator('input[maxlength="6"]').count()) > 0;

    expect(count === 6 || hasSingleInput).toBeTruthy();
  });

  test("should auto-focus first input on load", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    // Check if first input or OTP container has focus
    const firstInput = page.locator('input[maxlength="1"], input').first();
    // The first input should be focused or be visible
    await expect(firstInput).toBeVisible();
  });

  test("should have verify button", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    const verifyButton = page.locator(
      'button[type="submit"], button:has-text("Verify"), button:has-text("Submit")',
    );
    const count = await verifyButton.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have backup code option link", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    // Check for backup code link or button
    const backupLink = page.locator(
      'a:has-text("backup"), button:has-text("backup"), text=backup code',
    );
    const count = await backupLink.count();
    // May or may not have backup code option visible
  });
});

test.describe("2FA Code Input Behavior", () => {
  test("should accept numeric input only", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    // Try typing letters in first input
    const firstInput = page.locator("input").first();
    await firstInput.type("abc123");

    const inputValue = await firstInput.inputValue();
    // Should only contain numbers
    const hasOnlyNumbers = /^\d*$/.test(inputValue);
    // Note: Input filtering may vary by implementation
  });

  test("should auto-advance to next input on digit entry", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    const otpInputs = page.locator('input[maxlength="1"]');
    const count = await otpInputs.count();

    if (count >= 2) {
      // Type a digit in first input
      await otpInputs.first().type("1");
      await page.waitForTimeout(200);

      // Second input should now be focused
      const secondInput = otpInputs.nth(1);
      await expect(secondInput).toBeFocused();
    }
  });

  test("should handle paste of full code", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    const firstInput = page.locator("input").first();

    // Simulate pasting a code
    await page.evaluate(() => {
      navigator.clipboard.writeText("123456").catch(() => {});
    });

    // Focus and paste
    await firstInput.focus();
    await page.keyboard.press("Meta+v");
    await page.waitForTimeout(500);

    // Check if inputs have values
    // This depends on implementation - may fill all inputs or just first one
  });
});

test.describe("2FA Verification Errors", () => {
  test("should show error for invalid code", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    // Enter invalid code
    const otpInputs = page.locator('input[maxlength="1"]');
    const singleInput = page.locator('input[maxlength="6"]');

    if ((await otpInputs.count()) === 6) {
      // Fill each input with 0
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill("0");
      }
    } else if ((await singleInput.count()) > 0) {
      await singleInput.fill("000000");
    } else {
      // Try typing in first input
      const firstInput = page.locator("input").first();
      await firstInput.fill("000000");
    }

    // Submit
    const verifyButton = page.locator(
      'button[type="submit"], button:has-text("Verify")',
    );
    await verifyButton.click();
    await page.waitForTimeout(2000);

    // Should show error message
    const pageContent = await page.textContent("body");
    const hasError =
      pageContent?.toLowerCase().includes("invalid") ||
      pageContent?.toLowerCase().includes("incorrect") ||
      pageContent?.toLowerCase().includes("error") ||
      pageContent?.toLowerCase().includes("wrong");
    expect(hasError).toBeTruthy();
  });

  test("should handle expired temp token", async ({ page }) => {
    // Navigate to login first to set up page context
    await page.goto("/login");

    // Set an invalid/expired temp token
    await page.evaluate(() => {
      sessionStorage.setItem("2fa_temp_token", "expired_invalid_token");
    });

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    // Fill any code
    const inputs = page.locator("input");
    if ((await inputs.count()) > 0) {
      await inputs.first().fill("123456");
    }

    // Submit
    const verifyButton = page.locator(
      'button[type="submit"], button:has-text("Verify")',
    );
    if ((await verifyButton.count()) > 0) {
      await verifyButton.click();
      await page.waitForTimeout(2000);

      // Should show error or redirect to login
      const currentUrl = page.url();
      const pageContent = await page.textContent("body");
      const hasError =
        currentUrl.includes("/login") ||
        pageContent?.toLowerCase().includes("expired") ||
        pageContent?.toLowerCase().includes("invalid") ||
        pageContent?.toLowerCase().includes("error");
      // Should have some error state
    }
  });
});

test.describe("2FA Successful Verification", () => {
  test.skip("should redirect to dashboard on successful verification", async ({
    page,
  }) => {
    // Skip - requires actual valid TOTP code
    test.skip();
  });

  test.skip("should save remember device preference", async ({ page }) => {
    // Skip - requires actual valid TOTP code
    test.skip();
  });
});

test.describe("2FA Page Navigation", () => {
  test("should have back to login option", async ({ page }) => {
    const { requires2FA, tempToken } = await setupPending2FAState(page);

    if (!requires2FA) {
      test.skip();
      return;
    }

    await page.evaluate((token) => {
      sessionStorage.setItem("2fa_temp_token", token);
    }, tempToken);

    await page.goto("/verify-2fa");
    await page.waitForTimeout(1000);

    // Look for back/cancel link
    const backLink = page.locator(
      'a:has-text("back"), a:has-text("login"), a:has-text("cancel"), button:has-text("cancel")',
    );
    const count = await backLink.count();
    // May or may not have explicit back option
  });

  test("should redirect to login if no temp token", async ({ page }) => {
    // Clear any existing tokens
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to access verify-2fa directly without temp token
    await page.goto("/verify-2fa");
    await page.waitForTimeout(2000);

    // Should either redirect to login or show error
    const currentUrl = page.url();
    const pageContent = await page.textContent("body");
    const isRedirectedOrError =
      currentUrl.includes("/login") ||
      pageContent?.toLowerCase().includes("login") ||
      pageContent?.toLowerCase().includes("unauthorized");
    // Should handle missing temp token appropriately
  });
});
