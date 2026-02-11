/**
 * Generates a deterministic HSL color from a player name
 * Same name always produces the same color
 *
 * @param name - Player name to hash into a color
 * @returns HSL color string (e.g., "hsl(180, 70%, 60%)")
 */
export function getPlayerColor(name: string): string {
  // Hash the name to get a hue value (0-360)
  const hue = name.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0) % 360;

  // Use consistent saturation and lightness for vibrant, readable colors
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Extracts initials from a player name
 * Takes first letter of first two words, or first two letters if single word
 *
 * @param name - Player name
 * @returns Initials (1-2 uppercase letters)
 */
export function getPlayerInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';

  const words = trimmed.split(/\s+/);

  if (words.length >= 2) {
    // Multiple words: first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    // Single word: first two letters (or just first if single character)
    return trimmed.substring(0, 2).toUpperCase();
  }
}
