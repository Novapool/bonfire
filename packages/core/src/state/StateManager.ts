/**
 * State management utilities
 */

import type { GameState } from '../types';

/**
 * State management helper class
 */
export class StateManager {
  /**
   * Immutably update state with partial updates
   */
  static updateState<TState extends GameState>(
    current: TState,
    updates: Partial<TState>
  ): TState {
    return {
      ...current,
      ...updates,
    };
  }

  /**
   * Deep clone state for immutability
   * Uses JSON serialization for simplicity (works for plain objects)
   */
  static cloneState<TState extends GameState>(state: TState): TState {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Basic state validation
   */
  static validateStateUpdate<TState extends GameState>(state: TState): boolean {
    // Check required fields exist
    if (!state.roomId || typeof state.roomId !== 'string') {
      return false;
    }
    if (!state.phase || typeof state.phase !== 'string') {
      return false;
    }
    if (!Array.isArray(state.players)) {
      return false;
    }

    // Validate each player has required fields
    for (const player of state.players) {
      if (
        !player.id ||
        !player.name ||
        typeof player.isHost !== 'boolean' ||
        typeof player.isConnected !== 'boolean' ||
        typeof player.joinedAt !== 'number'
      ) {
        return false;
      }
    }

    return true;
  }
}
