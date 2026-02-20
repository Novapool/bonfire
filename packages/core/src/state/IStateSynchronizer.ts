/**
 * State synchronizer interface for backend implementations
 */

import type { GameState, PlayerId, GameEventType, GameEventPayloads } from '../types';

/**
 * Interface for synchronizing game state with backend/clients
 * Implementations will be provided by server packages (Firebase, Railway, etc.)
 */
export interface IStateSynchronizer<TState extends GameState> {
  /**
   * Broadcast full state to all connected players
   */
  broadcastState(state: TState): Promise<void>;

  /**
   * Send state to a specific player (for reconnection, etc.)
   */
  sendToPlayer(playerId: PlayerId, state: TState): Promise<void>;

  /**
   * Broadcast a game event to all connected players
   */
  broadcastEvent<K extends GameEventType>(
    event: K,
    payload: GameEventPayloads[K]
  ): Promise<void>;

  /**
   * Broadcast a custom game-specific event to all connected players.
   * Use this for game events that are not part of the framework lifecycle
   * (e.g. 'question_revealed', 'round_ended', 'score_updated').
   */
  broadcastCustomEvent(type: string, payload: unknown): Promise<void>;
}

/**
 * Optional synchronizer type (null when no backend is configured)
 */
export type OptionalSynchronizer<TState extends GameState> = IStateSynchronizer<TState> | null;
