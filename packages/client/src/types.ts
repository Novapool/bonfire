/**
 * Client-specific type definitions for Bonfire
 *
 * Response types are duplicated from @bonfire/server to avoid
 * depending on the server package (which has Node.js-only deps).
 */

import type { GameState, RoomId, PlayerId } from '@bonfire/core';

// ---- Connection ----

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// ---- Client Configuration ----

export interface BonfireClientConfig {
  /** Server URL (e.g., "http://localhost:3000") */
  url: string;
  /** Socket.io connection options */
  socketOptions?: Record<string, unknown>;
  /** Auto-connect on instantiation (default: false) */
  autoConnect?: boolean;
  /** Enable reconnection (default: true) */
  reconnection?: boolean;
  /** Max reconnection attempts (default: 5) */
  reconnectionAttempts?: number;
}

// ---- Server Response Types (mirrored from @bonfire/server) ----

export interface BaseResponse {
  success: boolean;
  error?: string;
  code?: string;
}

export interface RoomCreateResponse extends BaseResponse {
  roomId?: RoomId;
  state?: GameState;
}

export interface RoomJoinResponse extends BaseResponse {
  state?: GameState;
  playerId?: PlayerId;
}

export interface StateResponse extends BaseResponse {
  state?: GameState;
}

export interface ActionResponse extends BaseResponse {
  data?: unknown;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// ---- Socket.io Event Contracts (mirrored from @bonfire/server) ----

export interface ClientToServerEvents {
  'room:create': (gameType: string, hostName: string, callback: (response: RoomCreateResponse) => void) => void;
  'room:join': (roomId: RoomId, playerName: string, callback: (response: RoomJoinResponse) => void) => void;
  'room:leave': (callback?: (response: BaseResponse) => void) => void;
  'game:start': (callback?: (response: BaseResponse) => void) => void;
  'game:action': (actionType: string, payload: unknown, callback?: (response: ActionResponse) => void) => void;
  'state:request': (callback: (response: StateResponse) => void) => void;
}

export interface ServerToClientEvents {
  'state:update': (state: GameState) => void;
  'state:sync': (state: GameState) => void;
  'event:emit': (event: { type: string; payload: unknown }) => void;
  error: (error: ErrorResponse) => void;
  'room:closed': (reason: string) => void;
}

// ---- Game Events ----

export interface BonfireGameEvent {
  type: string;
  payload: unknown;
}
