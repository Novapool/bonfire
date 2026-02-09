/**
 * Tests for custom error classes
 */

import { describe, it, expect } from 'vitest'
import {
  ServerError,
  RoomNotFoundError,
  UnauthorizedError,
  InvalidActionError,
} from '../../src/utils/errors'

describe('Error classes', () => {
  describe('ServerError', () => {
    it('should create error with message and code', () => {
      const error = new ServerError('Test error', 'TEST_ERROR')
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('ServerError')
    })

    it('should support custom status code', () => {
      const error = new ServerError('Test', 'TEST', 404)
      expect(error.statusCode).toBe(404)
    })

    it('should support details', () => {
      const error = new ServerError('Test', 'TEST', 500, { foo: 'bar' })
      expect(error.details).toEqual({ foo: 'bar' })
    })

    it('should serialize to JSON', () => {
      const error = new ServerError('Test', 'TEST', 400, { key: 'value' })
      const json = error.toJSON()
      expect(json).toEqual({
        name: 'ServerError',
        message: 'Test',
        code: 'TEST',
        statusCode: 400,
        details: { key: 'value' },
      })
    })
  })

  describe('RoomNotFoundError', () => {
    it('should create error with room ID', () => {
      const error = new RoomNotFoundError('ABC123')
      expect(error.message).toContain('ABC123')
      expect(error.code).toBe('ROOM_NOT_FOUND')
      expect(error.statusCode).toBe(404)
      expect(error.details).toEqual({ roomId: 'ABC123' })
    })
  })

  describe('UnauthorizedError', () => {
    it('should create error with default message', () => {
      const error = new UnauthorizedError()
      expect(error.message).toBe('Unauthorized')
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.statusCode).toBe(401)
    })

    it('should support custom message and details', () => {
      const error = new UnauthorizedError('Not host', { playerId: 'player1' })
      expect(error.message).toBe('Not host')
      expect(error.details).toEqual({ playerId: 'player1' })
    })
  })

  describe('InvalidActionError', () => {
    it('should create error with action type and reason', () => {
      const error = new InvalidActionError('submit_answer', 'Not your turn')
      expect(error.message).toContain('submit_answer')
      expect(error.message).toContain('Not your turn')
      expect(error.code).toBe('INVALID_ACTION')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({
        actionType: 'submit_answer',
        reason: 'Not your turn',
      })
    })
  })
})
