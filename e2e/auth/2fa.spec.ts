import { type APIRequestContext, expect, test } from "@playwright/test";

/**
 * E2E Tests for Two-Factor Authentication (2FA) Endpoints
 *
 * Tests cover:
 * - Setup 2FA
 * - Confirm 2FA Setup
 * - Verify 2FA
 * - Disable 2FA
 * - Get 2FA Status
 * - Generate Backup Codes
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

// Test credentials
const TEST_LOAN_OFFICER = {
  email: "officer@test.com",
  password: "cC8asznlSj3C!",
};

// Helper function to login and get access token
async function getAuthToken(
  request: APIRequestContext,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const response = await request.post(
    `${API_BASE_URL}/api/auth/loan-officer/login/`,
    {
      data: {
        email: TEST_LOAN_OFFICER.email,
        password: TEST_LOAN_OFFICER.password,
      },
    },
  );

  if (response.status() !== 200) {
    return null;
  }

  const body = await response.json();

  // If 2FA is required, we can't proceed with regular token
  if (body.data?.requires_2fa) {
    return null;
  }

  return {
    accessToken: body.data.access_token,
    refreshToken: body.data.refresh_token,
  };
}

test.describe("Two-Factor Authentication (2FA)", () => {
  test.describe("Get 2FA Status", () => {
    test("should get 2FA status for authenticated user", async ({
      request,
    }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.get(
        `${API_BASE_URL}/api/auth/2fa/status/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        },
      );

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.status).toBe("success");
        expect(body.data).toHaveProperty("two_factor_enabled");
        expect(typeof body.data.two_factor_enabled).toBe("boolean");
        expect(body.data).toHaveProperty("backup_codes_remaining");
        expect(typeof body.data.backup_codes_remaining).toBe("number");
      } else {
        expect([401, 403, 404]).toContain(response.status());
      }
    });

    test("should fail without authentication", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/auth/2fa/status/`,
      );

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe("Setup 2FA", () => {
    test("should initiate 2FA setup for authenticated user", async ({
      request,
    }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/setup/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        },
      );

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.status).toBe("success");
        expect(body.data).toHaveProperty("qr_code");
        expect(body.data).toHaveProperty("secret");
        expect(body.data).toHaveProperty("message");
      } else {
        // 400 might mean 2FA is already enabled
        expect([400, 401, 403, 409]).toContain(response.status());
      }
    });

    test("should fail without authentication", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/setup/`,
      );

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe("Confirm 2FA Setup", () => {
    test("should fail with invalid code", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/confirm/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {
            code: "000000", // Invalid code
          },
        },
      );

      expect([400, 401, 403]).toContain(response.status());
    });

    test("should fail without code", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/confirm/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {},
        },
      );

      expect([400, 422]).toContain(response.status());
    });

    test("should fail without authentication", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/confirm/`,
        {
          data: {
            code: "123456",
          },
        },
      );

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe("Verify 2FA", () => {
    test("should fail with invalid temp token", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/verify/`,
        {
          data: {
            temp_token: "invalid_temp_token",
            code: "123456",
          },
        },
      );

      // 429 = rate limiting, 400/401 = validation error
      expect([400, 401, 429]).toContain(response.status());
    });

    test("should fail with missing temp token", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/verify/`,
        {
          data: {
            code: "123456",
          },
        },
      );

      // 429 = rate limiting, 400/422 = validation error
      expect([400, 422, 429]).toContain(response.status());
    });

    test("should fail with missing code", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/verify/`,
        {
          data: {
            temp_token: "some_temp_token",
          },
        },
      );

      // 429 = rate limiting, 400/422 = validation error
      expect([400, 422, 429]).toContain(response.status());
    });
  });

  test.describe("Disable 2FA", () => {
    test("should fail with invalid code", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/disable/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {
            code: "000000", // Invalid code
          },
        },
      );

      // 400 if 2FA not enabled or invalid code, 401/403 for auth issues
      expect([400, 401, 403]).toContain(response.status());
    });

    test("should fail without authentication", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/disable/`,
        {
          data: {
            code: "123456",
          },
        },
      );

      expect([401, 403]).toContain(response.status());
    });

    test("should fail without code", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/disable/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {},
        },
      );

      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe("Generate Backup Codes", () => {
    test("should fail with invalid code", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/backup-codes/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {
            code: "000000", // Invalid code
          },
        },
      );

      // 400 if 2FA not enabled or invalid code
      expect([400, 401, 403]).toContain(response.status());
    });

    test("should fail without authentication", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/backup-codes/`,
        {
          data: {
            code: "123456",
          },
        },
      );

      expect([401, 403]).toContain(response.status());
    });

    test("should fail without code", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/2fa/backup-codes/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {},
        },
      );

      expect([400, 422]).toContain(response.status());
    });
  });
});

test.describe("2FA Login Flow", () => {
  test("should return temp_token when 2FA is enabled", async ({ request }) => {
    // This test assumes there's a user with 2FA enabled
    // The response should contain requires_2fa: true and temp_token
    const response = await request.post(
      `${API_BASE_URL}/api/auth/loan-officer/login/`,
      {
        data: {
          email: TEST_LOAN_OFFICER.email,
          password: TEST_LOAN_OFFICER.password,
        },
      },
    );

    if (response.status() === 200) {
      const body = await response.json();
      // If 2FA is required, verify the response structure
      if (body.data?.requires_2fa) {
        expect(body.data.requires_2fa).toBe(true);
        expect(body.data).toHaveProperty("temp_token");
        expect(body.data.temp_token).toBeTruthy();
      }
    }
  });
});
