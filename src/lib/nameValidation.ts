export const PERSON_NAME_REGEX = /^[\p{L}]+(?:[ .'-][\p{L}]+)*$/u;

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function getNameValidationError(
  value: string,
  fieldLabel: string,
  maxLength = 50,
): string | null {
  const normalized = normalizeName(value);

  if (!normalized) {
    return `${fieldLabel} is required`;
  }

  if (!PERSON_NAME_REGEX.test(normalized)) {
    return `${fieldLabel} can only contain letters, spaces, apostrophes, hyphens, and periods`;
  }

  if (normalized.length > maxLength) {
    return `${fieldLabel} must be at most ${maxLength} characters`;
  }

  return null;
}
