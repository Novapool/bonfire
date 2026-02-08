/**
 * Bonfire Server - Socket.io server infrastructure for party games
 *
 * @packageDocumentation
 */

// Core classes
export { SocketStateSynchronizer } from './core/SocketStateSynchronizer'
export { RoomManager } from './core/RoomManager'
export type { RoomManagerConfig, GameFactory } from './core/RoomManager'

// Database adapters
export { InMemoryAdapter } from './database/InMemoryAdapter'
export type { IDatabaseAdapter, DatabaseAdapterOptions } from './database/IDatabaseAdapter'

// Utilities
export {
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
} from './utils/roomCodeGenerator'

export {
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
} from './utils/errors'

// Types
export type {
  ServerConfig,
  RoomMetadata,
  RoomInstance,
  RoomInfo,
  ClientToServerEvents,
  ServerToClientEvents,
  BaseResponse,
  RoomCreateResponse,
  RoomJoinResponse,
  StateResponse,
  ActionResponse,
  ErrorResponse,
  SocketContext,
  ServerStats,
  TypedSocketServer,
  TypedSocket,
} from './types'
