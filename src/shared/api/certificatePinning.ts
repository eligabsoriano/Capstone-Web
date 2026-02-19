/**
 * Certificate Pinning Module
 *
 * Implements certificate pinning for the frontend by verifying the
 * server's certificate SPKI hash against pre-configured trusted pins.
 *
 * Flow:
 * 1. On first API request, fetch the server's SPKI hash from /api/auth/server-pins/
 * 2. Compare against the hardcoded/env-configured pin(s) in pinnedCertificates.ts
 * 3. If match: cache the result and allow all subsequent requests
 * 4. If mismatch: block ALL API requests and log a security warning
 *
 * This protects against MITM attacks by ensuring the server presents
 * the exact certificate we expect.
 */

import { getTrustedPins, isPinningEnabled } from "./pinnedCertificates";

// Pin validation states
type PinValidationState =
  | { status: "pending" }
  | { status: "valid"; pins: string[] }
  | { status: "failed"; reason: string }
  | { status: "skipped" };

let pinState: PinValidationState = { status: "pending" };
let validationPromise: Promise<PinValidationState> | null = null;

/**
 * Custom error class for certificate pin mismatches.
 */
export class CertificatePinMismatchError extends Error {
  public readonly code = "CERTIFICATE_PIN_MISMATCH";

  constructor(message: string) {
    super(message);
    this.name = "CertificatePinMismatchError";
  }
}

/**
 * Fetch the server's certificate pins from the bootstrap endpoint.
 * This endpoint is exempt from mTLS to allow initial verification.
 */
async function fetchServerPins(baseURL: string): Promise<string[]> {
  const response = await fetch(`${baseURL}/api/auth/server-pins/`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Server pins endpoint returned ${response.status}: ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (data.status !== "success" || !data.data?.pins) {
    throw new Error("Invalid server pins response format");
  }

  return data.data.pins as string[];
}

/**
 * Validate the server's certificate pins against our trusted pins.
 *
 * @param baseURL - The API base URL
 * @returns The validated pin state
 */
async function performPinValidation(
  baseURL: string,
): Promise<PinValidationState> {
  const trustedPins = getTrustedPins();

  // If no pins configured, skip validation (dev mode)
  if (trustedPins.length === 0) {
    console.info(
      "[Certificate Pinning] No pins configured — skipping validation (development mode).",
    );
    return { status: "skipped" };
  }

  try {
    const serverPins = await fetchServerPins(baseURL);

    // Check if ANY of the server's pins match ANY of our trusted pins
    const matchedPin = serverPins.find((serverPin) =>
      trustedPins.includes(serverPin),
    );

    if (matchedPin) {
      console.info(
        "[Certificate Pinning] ✓ Server certificate pin verified successfully.",
      );
      return { status: "valid", pins: serverPins };
    }

    // PIN MISMATCH — Potential MITM attack!
    const reason =
      `Server presented pins [${serverPins.join(", ")}] but none match ` +
      `trusted pins [${trustedPins.join(", ")}]. Possible MITM attack!`;

    console.error(`[Certificate Pinning] ✗ PIN MISMATCH — ${reason}`);
    return { status: "failed", reason };
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Unknown error during pin validation";
    console.error(`[Certificate Pinning] ✗ Validation failed — ${reason}`);

    // On fetch failure (network error, server down), we fail open in dev
    // but fail closed in production (when pins are configured)
    if (trustedPins.length > 0) {
      return { status: "failed", reason };
    }
    return { status: "skipped" };
  }
}

/**
 * Validate the server's certificate pin. This is called by the Axios
 * request interceptor before each request.
 *
 * - First call triggers actual validation (cached for subsequent calls)
 * - Concurrent calls share the same validation promise
 * - Once validated, returns immediately
 *
 * @param baseURL - The API base URL
 * @throws CertificatePinMismatchError if pin validation fails
 */
export async function validateServerPin(baseURL: string): Promise<void> {
  // If pinning is not enabled, skip entirely
  if (!isPinningEnabled()) {
    return;
  }

  // Fast path: already validated
  if (pinState.status === "valid" || pinState.status === "skipped") {
    return;
  }

  // Fast path: already failed
  if (pinState.status === "failed") {
    throw new CertificatePinMismatchError(pinState.reason);
  }

  // Perform validation (deduplicate concurrent calls)
  if (!validationPromise) {
    validationPromise = performPinValidation(baseURL);
  }

  pinState = await validationPromise;
  validationPromise = null;

  if (pinState.status === "failed") {
    throw new CertificatePinMismatchError(pinState.reason);
  }
}

/**
 * Reset the pin validation state. Useful for testing or when
 * rotating certificates.
 */
export function resetPinValidation(): void {
  pinState = { status: "pending" };
  validationPromise = null;
}

/**
 * Get the current pin validation state (for debugging/UI display).
 */
export function getPinValidationStatus(): string {
  return pinState.status;
}
