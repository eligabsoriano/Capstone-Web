/**
 * Pinned Server Certificate Hashes
 *
 * Contains the trusted SPKI (Subject Public Key Info) SHA-256 hashes
 * of the server's TLS certificate. These are used for certificate
 * pinning to detect MITM attacks.
 *
 * The pin is loaded from the VITE_SERVER_CERT_PIN environment variable,
 * which should be set to the value printed by:
 *   python scripts/generate_certs.py
 *
 * Format: "sha256/BASE64_ENCODED_HASH"
 */

/**
 * Get the list of trusted server certificate pin hashes.
 * Loaded from environment variable at build time.
 */
export function getTrustedPins(): string[] {
  const envPin = import.meta.env.VITE_SERVER_CERT_PIN;

  if (!envPin || typeof envPin !== "string" || envPin.trim().length === 0) {
    console.warn(
      "[Certificate Pinning] VITE_SERVER_CERT_PIN not configured. " +
        "Pin validation will be skipped in development.",
    );
    return [];
  }

  // Support multiple pins separated by commas (for key rotation)
  return envPin
    .split(",")
    .map((pin: string) => pin.trim())
    .filter((pin: string) => pin.length > 0);
}

/**
 * Check if certificate pinning is enabled.
 * Pinning is enabled when at least one pin hash is configured.
 */
export function isPinningEnabled(): boolean {
  return getTrustedPins().length > 0;
}
