/**
 * Tests for custom error classes
 */

import { describe, it, expect } from 'vitest'
import {
  ServerError,
  RoomNotFoundError,
  RoomFullError,
  UnauthorizedError,
  InvalidActionError,
  RateLimitError,
  PlayerNotFoundError,
  DuplicatePlayerError,
  GameStateError,
  ConfigurationError,
  DatabaseError,
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

  describe('RoomFullError', () => {
    it('should create error with room ID and max players', () => {
      const error = new RoomFullError('ABC123', 8)
      expect(error.message).toContain('ABC123')
      expect(error.message).toContain('8')
      expect(error.code).toBe('ROOM_FULL')
      expect(error.statusCode).toBe(403)
      expect(error.details).toEqual({ roomId: 'ABC123', maxPlayers: 8 })
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

  describe('RateLimitError', () => {
    it('should create error with default message', () => {
      const error = new RateLimitError()
      expect(error.message).toContain('Rate limit')
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(error.statusCode).toBe(429)
    })

    it('should include retry after time', () => {
      const error = new RateLimitError(60000)
      expect(error.details).toEqual({ retryAfter: 60000 })
    })
  })

  describe('PlayerNotFoundError', () => {
    it('should create error with player ID', () => {
      const error = new PlayerNotFoundError('player123')
      expect(error.message).toContain('player123')
      expect(error.code).toBe('PLAYER_NOT_FOUND')
      expect(error.statusCode).toBe(404)
      expect(error.details).toEqual({ playerId: 'player123' })
    })
  })

  describe('DuplicatePlayerError', () => {
    it('should create error with player ID', () => {
      const error = new DuplicatePlayerError('player123')
      expect(error.message).toContain('player123')
      expect(error.code).toBe('DUPLICATE_PLAYER')
      expect(error.statusCode).toBe(409)
      expect(error.details).toEqual({ playerId: 'player123' })
    })
  })

  describe('GameStateError', () => {
    it('should create error with phase information', () => {
      const error = new GameStateError(
        'Cannot start game',
        'waiting',
        'ready'
      )
      expect(error.message).toBe('Cannot start game')
      expect(error.code).toBe('INVALID_GAME_STATE')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({
        currentPhase: 'waiting',
        expectedPhase: 'ready',
      })
    })
  })

  describe('ConfigurationError', () => {
    it('should create error with message and details', () => {
      const error = new ConfigurationError('Missing API key', {
        required: 'FIREBASE_API_KEY',
      })
      expect(error.message).toBe('Missing API key')
      expect(error.code).toBe('CONFIGURATION_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.details).toEqual({ required: 'FIREBASE_API_KEY' })
    })
  })

  describe('DatabaseError', () => {
    it('should create error with operation details', () => {
      const originalError = new Error('Connection failed')
      const error = new DatabaseError(
        'Failed to save state',
        'saveGameState',
        originalError
      )
      expect(error.message).toBe('Failed to save state')
      expect(error.code).toBe('DATABASE_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.details).toEqual({
        operation: 'saveGameState',
        originalError: 'Connection failed',
      })
    })
  })
})
