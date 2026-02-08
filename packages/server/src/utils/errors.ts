/**
 * Custom error classes for Bonfire server
 */

/**
 * Base server error
 */
export class ServerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ServerError'
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    }
  }
}

/**
 * Room not found error
 */
export class RoomNotFoundError extends ServerError {
  constructor(roomId: string) {
    super(`Room not found: ${roomId}`, 'ROOM_NOT_FOUND', 404, { roomId })
    this.name = 'RoomNotFoundError'
  }
}

/**
 * Room full error
 */
export class RoomFullError extends ServerError {
  constructor(roomId: string, maxPlayers: number) {
    super(
      `Room is full: ${roomId} (max ${maxPlayers} players)`,
      'ROOM_FULL',
      403,
      { roomId, maxPlayers }
    )
    this.name = 'RoomFullError'
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends ServerError {
  constructor(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    super(message, 'UNAUTHORIZED', 401, details)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Invalid action error
 */
export class InvalidActionError extends ServerError {
  constructor(actionType: string, reason: string) {
    super(
      `Invalid action: ${actionType} - ${reason}`,
      'INVALID_ACTION',
      400,
      { actionType, reason }
    )
    this.name = 'InvalidActionError'
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends ServerError {
  constructor(retryAfter?: number) {
    super(
      'Rate limit exceeded. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429,
      { retryAfter }
    )
    this.name = 'RateLimitError'
  }
}

/**
 * Player not found error
 */
export class PlayerNotFoundError extends ServerError {
  constructor(playerId: string) {
    super(`Player not found: ${playerId}`, 'PLAYER_NOT_FOUND', 404, { playerId })
    this.name = 'PlayerNotFoundError'
  }
}

/**
 * Duplicate player error
 */
export class DuplicatePlayerError extends ServerError {
  constructor(playerId: string) {
    super(`Player already in room: ${playerId}`, 'DUPLICATE_PLAYER', 409, { playerId })
    this.name = 'DuplicatePlayerError'
  }
}

/**
 * Game state error
 */
export class GameStateError extends ServerError {
  constructor(message: string, currentPhase: string, expectedPhase?: string) {
    super(
      message,
      'INVALID_GAME_STATE',
      400,
      { currentPhase, expectedPhase }
    )
    this.name = 'GameStateError'
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends ServerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', 500, details)
    this.name = 'ConfigurationError'
  }
}

/**
 * Database error
 */
export class DatabaseError extends ServerError {
  constructor(message: string, operation: string, originalError?: Error) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      {
        operation,
        originalError: originalError?.message,
      }
    )
    this.name = 'DatabaseError'
  }
}
