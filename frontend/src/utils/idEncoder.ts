import Sqids from 'sqids';

// Initialize Sqids with a custom alphabet and minimum length for security/aesthetics
// This ensures IDs are at least 6 chars long and look random
// The alphabet shuffle prevents simple sequential guessing
const sqids = new Sqids({
  minLength: 6,
  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
});

/**
 * Encodes a numeric ID into a secure string ID
 * Example: 1 -> "8xF2a1"
 */
export const encodeId = (id: number | string): string => {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numId)) return String(id); // Return original if not a number (e.g. UUID)
  return sqids.encode([numId]);
};

/**
 * Decodes a secure string ID back into a numeric ID
 * Example: "8xF2a1" -> 1
 */
export const decodeId = (secureId: string): number | null => {
  const decoded = sqids.decode(secureId);
  return decoded.length > 0 ? decoded[0] : null;
};
