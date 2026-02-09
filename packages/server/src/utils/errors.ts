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
