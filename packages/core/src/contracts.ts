/**
 * Shared contract types between client and server
 *
 * These types define the API contract for communication between
 * Bonfire clients and servers. Both packages import from here
 * to ensure type safety and prevent duplication.
 */

import type { GameState, RoomId, PlayerId } from './types';

/**
 * Base response structure for all server responses
 */
export interface BaseResponse {
  success: boolean;
  error?: string;
  code?: string;
}

/**
 * Room creation response
 */
export interface RoomCreateResponse extends BaseResponse {
  roomId?: RoomId;
  state?: GameState;
}

/**
 * Room join response
 */
export interface RoomJoinResponse extends BaseResponse {
  state?: GameState;
  playerId?: PlayerId;
}

/**
 * State request response
 */
export interface StateResponse extends BaseResponse {
  state?: GameState;
}

/**
 * Action response
 */
export interface ActionResponse extends BaseResponse {
  data?: unknown;
}

/**
 * Error response
 */
export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
