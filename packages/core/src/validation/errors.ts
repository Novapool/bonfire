/**
 * Custom error classes for Bonfire game engine
 */

import type { ValidationErrorDetails } from '../types';

/**
 * Base error class for all game-related errors
 */
export class GameError extends Error {
  constructor(message: string, public code: string = 'GAME_ERROR') {
    super(message);
    this.name = 'GameError';
    Object.setPrototypeOf(this, GameError.prototype);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends GameError {
  constructor(
    message: string,
    public code: string = 'VALIDATION_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message, code);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when game state is invalid
 */
export class StateError extends GameError {
  constructor(message: string, public code: string = 'STATE_ERROR') {
    super(message, code);
    this.name = 'StateError';
    Object.setPrototypeOf(this, StateError.prototype);
  }
}

/**
 * Error thrown when player operations fail
 */
export class PlayerError extends GameError {
  constructor(message: string, public code: string = 'PLAYER_ERROR') {
    super(message, code);
    this.name = 'PlayerError';
    Object.setPrototypeOf(this, PlayerError.prototype);
  }
}

/**
 * Helper to create structured validation errors
 */
export function createValidationError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ValidationErrorDetails {
  return {
    code,
    message,
    details,
  };
}
