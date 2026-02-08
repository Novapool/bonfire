/**
 * Tests for room code generator
 */

import { describe, it, expect } from 'vitest'
import { generateRoomCode, isValidRoomCode, normalizeRoomCode } from '../../src/utils/roomCodeGenerator'

describe('roomCodeGenerator', () => {
  describe('generateRoomCode', () => {
    it('should generate a 6-character code by default', () => {
      const code = generateRoomCode()
      expect(code).toHaveLength(6)
    })

    it('should generate a code with custom length', () => {
      const code = generateRoomCode(8)
      expect(code).toHaveLength(8)
    })

    it('should only contain allowed characters', () => {
      const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      for (let i = 0; i < 100; i++) {
        const code = generateRoomCode()
        for (const char of code) {
          expect(allowedChars).toContain(char)
        }
      }
    })

    it('should not contain ambiguous characters (O, I, 0, 1)', () => {
      const ambiguousChars = ['O', 'I', '0', '1']
      for (let i = 0; i < 100; i++) {
        const code = generateRoomCode()
        for (const char of ambiguousChars) {
          expect(code).not.toContain(char)
        }
      }
    })

    it('should generate different codes', () => {
      const codes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode())
      }
      // With 36^6 combinations, 100 codes should all be unique
      expect(codes.size).toBe(100)
    })
  })

  describe('isValidRoomCode', () => {
    it('should validate correct codes', () => {
      expect(isValidRoomCode('ABC234')).toBe(true)
      expect(isValidRoomCode('XYZ789')).toBe(true)
      expect(isValidRoomCode('HHHHH2')).toBe(true)
    })

    it('should reject codes with wrong length', () => {
      expect(isValidRoomCode('ABC')).toBe(false)
      expect(isValidRoomCode('ABC2345')).toBe(false)
      expect(isValidRoomCode('')).toBe(false)
    })

    it('should reject codes with ambiguous characters', () => {
      expect(isValidRoomCode('ABC0DE')).toBe(false) // contains 0
      expect(isValidRoomCode('ABC1DE')).toBe(false) // contains 1
      expect(isValidRoomCode('ABCODE')).toBe(false) // contains O
      expect(isValidRoomCode('ABCIDE')).toBe(false) // contains I
    })

    it('should reject codes with lowercase letters', () => {
      expect(isValidRoomCode('abc234')).toBe(false)
    })

    it('should reject codes with special characters', () => {
      expect(isValidRoomCode('ABC-23')).toBe(false)
      expect(isValidRoomCode('ABC_23')).toBe(false)
      expect(isValidRoomCode('ABC 23')).toBe(false)
    })

    it('should accept custom length codes', () => {
      expect(isValidRoomCode('ABCD', 4)).toBe(true)
      expect(isValidRoomCode('ABCD', 6)).toBe(false)
    })
  })

  describe('normalizeRoomCode', () => {
    it('should convert lowercase to uppercase', () => {
      expect(normalizeRoomCode('abc234')).toBe('ABC234')
    })

    it('should trim whitespace', () => {
      expect(normalizeRoomCode(' ABC234 ')).toBe('ABC234')
      expect(normalizeRoomCode('  ABC234  ')).toBe('ABC234')
    })

    it('should handle mixed case with whitespace', () => {
      expect(normalizeRoomCode(' AbC234 ')).toBe('ABC234')
    })

    it('should not modify already normalized codes', () => {
      expect(normalizeRoomCode('ABC234')).toBe('ABC234')
    })
  })
})
