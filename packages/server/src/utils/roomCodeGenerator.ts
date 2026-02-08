/**
 * Room code generator for creating unique, human-friendly room codes
 */

/**
 * Characters allowed in room codes
 * Excludes ambiguous characters: O, I, 0, 1
 */
const ALLOWED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/**
 * Default room code length
 */
const DEFAULT_CODE_LENGTH = 6

/**
 * Generate a random room code
 *
 * @param length - Length of the code (default: 6)
 * @returns Room code (e.g., "ABC234", "XY7Z34")
 *
 * @example
 * ```typescript
 * const roomCode = generateRoomCode()
 * // => "ABC234"
 * ```
 */
export function generateRoomCode(length: number = DEFAULT_CODE_LENGTH): string {
  let code = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALLOWED_CHARS.length)
    code += ALLOWED_CHARS[randomIndex]
  }

  return code
}

/**
 * Validate if a room code is valid
 *
 * @param code - Room code to validate
 * @param length - Expected length (default: 6)
 * @returns True if code is valid
 *
 * @example
 * ```typescript
 * isValidRoomCode("ABC234") // => true
 * isValidRoomCode("abc234") // => false (lowercase not allowed)
 * isValidRoomCode("ABC1")   // => false (contains '1')
 * isValidRoomCode("ABC")    // => false (too short)
 * ```
 */
export function isValidRoomCode(code: string, length: number = DEFAULT_CODE_LENGTH): boolean {
  if (code.length !== length) {
    return false
  }

  for (const char of code) {
    if (!ALLOWED_CHARS.includes(char)) {
      return false
    }
  }

  return true
}

/**
 * Normalize a room code (uppercase, trim whitespace)
 *
 * @param code - Room code to normalize
 * @returns Normalized code
 *
 * @example
 * ```typescript
 * normalizeRoomCode("abc234") // => "ABC234"
 * normalizeRoomCode(" XYZ789 ") // => "XYZ789"
 * ```
 */
export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase()
}
