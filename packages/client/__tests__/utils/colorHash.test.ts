import { describe, it, expect } from 'vitest';
import { getPlayerColor, getPlayerInitials } from '../../src/utils/colorHash';

describe('getPlayerColor', () => {
  it('should generate a valid HSL color string', () => {
    const color = getPlayerColor('Alice');
    expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
  });

  it('should generate the same color for the same name', () => {
    const color1 = getPlayerColor('Bob');
    const color2 = getPlayerColor('Bob');
    expect(color1).toBe(color2);
  });

  it('should generate different colors for different names', () => {
    const color1 = getPlayerColor('Alice');
    const color2 = getPlayerColor('Bob');
    expect(color1).not.toBe(color2);
  });

  it('should generate a color with hue between 0 and 360', () => {
    const color = getPlayerColor('Charlie');
    const hueMatch = color.match(/^hsl\((\d+), 70%, 60%\)$/);
    expect(hueMatch).not.toBeNull();
    const hue = parseInt(hueMatch![1], 10);
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });
});

describe('getPlayerInitials', () => {
  it('should extract first two letters from single word names', () => {
    expect(getPlayerInitials('Alice')).toBe('AL');
    expect(getPlayerInitials('bob')).toBe('BO');
  });

  it('should extract first letter of each word from multi-word names', () => {
    expect(getPlayerInitials('John Doe')).toBe('JD');
    expect(getPlayerInitials('mary jane watson')).toBe('MJ');
  });

  it('should handle single character names', () => {
    expect(getPlayerInitials('A')).toBe('A');
  });

  it('should return "?" for empty strings', () => {
    expect(getPlayerInitials('')).toBe('?');
    expect(getPlayerInitials('   ')).toBe('?');
  });

  it('should handle names with multiple spaces', () => {
    expect(getPlayerInitials('John    Doe')).toBe('JD');
  });

  it('should handle names with more than two words', () => {
    expect(getPlayerInitials('Mary Jane Watson')).toBe('MJ');
  });

  it('should always return uppercase', () => {
    expect(getPlayerInitials('alice')).toBe('AL');
    expect(getPlayerInitials('bob smith')).toBe('BS');
  });
});
