/**
 * Core type definitions for Bonfire
 */

/**
 * Unique identifier for players, rooms, and games
 */
export type PlayerId = string;
export type RoomId = string;
export type GameId = string;

/**
 * Player representation in a game
 */
export interface Player {
  id: PlayerId;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  joinedAt: number;
  metadata?: Record<string, unknown>;
}

/**
 * Game phase/stage
 */
export type Phase = string;

/**
 * Base game state that all games extend
 */
export interface GameState {
  roomId: RoomId;
  phase: Phase;
  players: Player[];
  startedAt?: number;
  endedAt?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Game configuration options
 */
export interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  phases: Phase[];
  allowJoinInProgress?: boolean;
  disconnectTimeout?: number; // milliseconds
}

/**
 * Player action submitted to the game
 */
export interface PlayerAction<T = unknown> {
  playerId: PlayerId;
  type: string;
  payload: T;
  timestamp: number;
}

/**
 * Result of processing a player action
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Phase transition event
 */
export interface PhaseTransition {
  from: Phase;
  to: Phase;
  timestamp: number;
}
