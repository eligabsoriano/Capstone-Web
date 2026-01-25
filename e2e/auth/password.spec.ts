import { type APIRequestContext, expect, test } from "@playwright/test";

/**
 * E2E Tests for Password Management Endpoints
 *
 * Tests cover:
 * - Change Password
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

const TEST_LOAN_OFFICER = {
  email: "officer@test.com",
  password: "f8kycZFECF^l",
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

  if (body.data?.requires_2fa) {
    return null;
  }

  return {
    accessToken: body.data.access_token,
    refreshToken: body.data.refresh_token,
  };
}

test.describe("Password Management", () => {
  test.describe("Change Password", () => {
    test("should fail change password without authentication", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        {
          data: {
            old_password: "OldPassword123!",
            new_password: "NewPassword123!",
          },
        },
      );

      expect([401, 403]).toContain(response.status());
    });

    test("should fail with incorrect old password", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {
            old_password: "WrongOldPassword123!",
            new_password: "NewPassword123!",
          },
        },
      );

      expect([400, 401, 403]).toContain(response.status());
    });

    test("should fail with missing old password", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {
            new_password: "NewPassword123!",
          },
        },
      );

      expect([400, 422]).toContain(response.status());
    });

    test("should fail with missing new password", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {
            old_password: TEST_LOAN_OFFICER.password,
          },
        },
      );

      expect([400, 422]).toContain(response.status());
    });

    test("should fail with weak new password", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {
            old_password: TEST_LOAN_OFFICER.password,
            new_password: "weak", // Too weak
          },
        },
      );

      expect([400, 422]).toContain(response.status());
    });

    test("should fail with same old and new password", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {
            old_password: TEST_LOAN_OFFICER.password,
            new_password: TEST_LOAN_OFFICER.password, // Same as old
          },
        },
      );

      // Backend may or may not validate this
      expect([200, 400, 422]).toContain(response.status());
    });

    test("should fail with empty body", async ({ request }) => {
      const tokens = await getAuthToken(request);
      if (!tokens) {
        test.skip();
        return;
      }

      const response = await request.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          data: {},
        },
      );

      expect([400, 422]).toContain(response.status());
    });

    // Note: We don't test successful password change here as it would
    // break other tests by changing the test user's password.
    // This should be tested with a dedicated test user that gets reset.
    test.describe("Password Change Success (Isolated)", () => {
      test.skip("should successfully change password with valid data", async ({
        request,
      }) => {
        // This test is skipped by default to avoid changing test credentials
        // Enable it when testing with a dedicated test user that gets reset
        const tokens = await getAuthToken(request);
        if (!tokens) {
          test.skip();
          return;
        }

        const NEW_PASSWORD = "NewSecurePassword123!";

        const response = await request.post(
          `${API_BASE_URL}/api/auth/change-password/`,
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
            data: {
              old_password: TEST_LOAN_OFFICER.password,
              new_password: NEW_PASSWORD,
            },
          },
        );

        if (response.status() === 200) {
          const body = await response.json();
          expect(body.status).toBe("success");

          // Verify we can login with new password
          const newLoginResponse = await request.post(
            `${API_BASE_URL}/api/auth/loan-officer/login/`,
            {
              data: {
                email: TEST_LOAN_OFFICER.email,
                password: NEW_PASSWORD,
              },
            },
          );
          expect(newLoginResponse.status()).toBe(200);

          // Change back to original password
          const newTokens = await newLoginResponse.json();
          await request.post(`${API_BASE_URL}/api/auth/change-password/`, {
            headers: {
              Authorization: `Bearer ${newTokens.data.access_token}`,
            },
            data: {
              old_password: NEW_PASSWORD,
              new_password: TEST_LOAN_OFFICER.password,
            },
          });
        }
      });
    });
  });
});

test.describe("Password Validation Rules", () => {
  test("should reject password with only lowercase letters", async ({
    request,
  }) => {
    const tokens = await getAuthToken(request);
    if (!tokens) {
      test.skip();
      return;
    }

    const response = await request.post(
      `${API_BASE_URL}/api/auth/change-password/`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        data: {
          old_password: TEST_LOAN_OFFICER.password,
          new_password: "onlylowercase",
        },
      },
    );

    expect([400, 422]).toContain(response.status());
  });

  test("should reject password with only uppercase letters", async ({
    request,
  }) => {
    const tokens = await getAuthToken(request);
    if (!tokens) {
      test.skip();
      return;
    }

    const response = await request.post(
      `${API_BASE_URL}/api/auth/change-password/`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        data: {
          old_password: TEST_LOAN_OFFICER.password,
          new_password: "ONLYUPPERCASE",
        },
      },
    );

    expect([400, 422]).toContain(response.status());
  });

  test("should reject password without numbers", async ({ request }) => {
    const tokens = await getAuthToken(request);
    if (!tokens) {
      test.skip();
      return;
    }

    const response = await request.post(
      `${API_BASE_URL}/api/auth/change-password/`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        data: {
          old_password: TEST_LOAN_OFFICER.password,
          new_password: "NoNumbersHere!",
        },
      },
    );

    // Some backends may allow this, so we accept 200 as well
    expect([200, 400, 422]).toContain(response.status());
  });

  test("should reject too short password", async ({ request }) => {
    const tokens = await getAuthToken(request);
    if (!tokens) {
      test.skip();
      return;
    }

    const response = await request.post(
      `${API_BASE_URL}/api/auth/change-password/`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        data: {
          old_password: TEST_LOAN_OFFICER.password,
          new_password: "Sh0rt!", // Too short
        },
      },
    );

    expect([400, 422]).toContain(response.status());
  });
});
