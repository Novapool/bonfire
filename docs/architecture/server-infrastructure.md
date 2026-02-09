# Server Infrastructure Architecture

This document describes the server-side infrastructure for Bonfire, including room management, Socket.io integration, database abstraction, and core server classes.

**Status:** Phases 1-3 Complete (138 tests passing - 97 unit + 41 integration)

---

## Overview

The Bonfire server infrastructure provides:

- **Multi-room orchestration** - Manage multiple concurrent game rooms
- **Realtime communication** - Socket.io-based state synchronization
- **Backend abstraction** - Swap databases (Firebase, PostgreSQL, etc.) without code changes
- **Automatic cleanup** - TTL-based room expiration and resource management
- **Type-safe events** - Full TypeScript types for client-server communication

**Architecture Principles:**
- Backend-agnostic design via adapter pattern
- Composition over inheritance (similar to core package)
- Clean separation: RoomManager (orchestration) vs SocketStateSynchronizer (communication)
- Testability via mock Socket.io and InMemoryAdapter

---

## Core Classes

### RoomManager

**Purpose:** Orchestrates multiple game rooms, handles lifecycle, cleanup, and player tracking.

**Responsibilities:**
- Create and delete rooms with unique room codes
- Track player-to-room mapping
- Manage TTL-based automatic cleanup
- Update room activity timestamps
- List and filter rooms

**Key Design Decisions:**
- Uses `GameFactory` pattern to create game instances (dependency injection)
- Maintains bidirectional mapping: room→players and player→room
- TTL cleanup uses both interval scans and per-room timers for efficiency
- Room limit configurable to prevent resource exhaustion

**API Highlights:**
```typescript
class RoomManager<T extends SocialGame<any>> {
  async createRoom(hostPlayerId: PlayerId): Promise<RoomInstance<T>>
  getRoom(roomId: RoomId): RoomInstance<T>
  async deleteRoom(roomId: RoomId): Promise<void>
  listRooms(filter?: (room: RoomInstance<T>) => boolean): RoomInfo[]

  trackPlayer(playerId: PlayerId, roomId: RoomId): void
  getRoomIdForPlayer(playerId: PlayerId): RoomId | undefined

  async updateActivity(roomId: RoomId): Promise<void>
  startCleanup(): void
  stopCleanup(): void
}
```

**Configuration Options:**
- `defaultTTL` - Room expiration time (default: 24 hours)
- `maxRooms` - Maximum concurrent rooms (default: 1000)
- `cleanupInterval` - Scan frequency for inactive rooms (default: 1 hour)

**Cleanup Strategy:**
1. **Per-room timers** - Each room has cleanup timer reset on activity
2. **Periodic scans** - Background interval checks database for inactive rooms
3. **Graceful shutdown** - Clears all timers and mappings on shutdown

**Testing Approach:**
- Mock Socket.io server and database adapter
- Test room creation with collision detection
- Validate TTL cleanup and timer management
- Test concurrent room operations

---

### SocketStateSynchronizer

**Purpose:** Broadcasts game state updates and events via Socket.io and persists to database.

**Responsibilities:**
- Broadcast state to all players in room
- Send state to specific player (reconnection)
- Emit custom game events to room
- Track socket ID → player ID mapping
- Persist state to database on every update

**Key Design Decisions:**
- Implements `IStateSynchronizer` from @bonfire/core (backend-agnostic)
- Uses Socket.io rooms for efficient broadcasting
- Combines Socket.io (realtime) + database (persistence) in single operation
- Maintains socket-player mapping for targeted sends

**API Highlights:**
```typescript
class SocketStateSynchronizer<T extends GameState> implements IStateSynchronizer<T> {
  broadcastState(state: T): Promise<void>
  sendToPlayer(playerId: PlayerId, state: T): Promise<void>
  broadcastEvent(event: string, payload: unknown): Promise<void>

  registerPlayer(playerId: PlayerId, socketId: string): void
  unregisterPlayer(playerId: PlayerId): void
  clearPlayerMappings(): void
}
```

**Socket.io Integration:**
- Uses typed Socket.io server (`TypedSocketServer`)
- Emits `state:update` event for broadcasts
- Emits `state:sync` event for individual players
- Emits `event:emit` for custom game events
- Handles edge case: missing socket mapping (player disconnected)

**Database Integration:**
- Every state broadcast persisted via `IDatabaseAdapter.saveGameState()`
- Enables reconnection: player can request latest state from database
- Async persistence doesn't block realtime broadcast

**Testing Approach:**
- Mock Socket.io with in-memory rooms and emit tracking
- InMemoryAdapter for database operations
- Verify broadcast vs targeted send behavior
- Test edge cases (disconnected players, missing mappings)

---

### SocketServer

**Purpose:** Main entry point for running a Bonfire server - integrates Express, Socket.io, and RoomManager into a production-ready server.

**Responsibilities:**
- Initialize and manage HTTP server (Express)
- Setup WebSocket server (Socket.io) with CORS
- Wire up client↔server event handlers
- Handle player connections and disconnections
- Provide admin REST endpoints
- Graceful shutdown and cleanup

**Key Design Decisions:**
- Composition approach - uses RoomManager, not extends
- Separates initialization (`initialize()`) from startup (`start()`) for testing
- Maintains socket-to-player context mapping for disconnection handling
- Admin endpoints require API key authentication
- Health check endpoint for monitoring

**API Highlights:**
```typescript
class SocketServer<T extends SocialGame<any>> {
  async initialize(): Promise<void>
  async start(): Promise<void>
  async stop(): Promise<void>
  async shutdown(): Promise<void>

  getStats(): ServerStats
  getHttpServer(): HTTPServer
}
```

**Event Handlers (Client → Server):**
- `room:create` - Create new room with unique code
- `room:join` - Join existing room as player
- `room:leave` - Leave current room
- `game:start` - Start the game
- `game:action` - Submit game action with type and payload
- `state:request` - Request current game state (for reconnection)

**Connection Lifecycle:**
- `connection` - Track socket, register context
- `disconnect` - Unregister player, notify game of disconnect
- Reconnection - Player can rejoin with same ID, receives latest state

**Admin Endpoints:**
- `GET /health` - Returns `{ status: 'ok' }`
- `GET /admin/stats` - Server statistics (requires x-api-key header)
  - Returns: room count, player count, uptime
- `POST /admin/force-end/:roomId` - Force-end a room (requires x-api-key)
- `POST /admin/kick/:roomId/:playerId` - Kick player from room (requires x-api-key)

**Configuration:**
```typescript
interface ServerConfig {
  port: number
  nodeEnv?: 'development' | 'production' | 'test'
  room?: { defaultTTL, maxRooms, cleanupInterval }
  admin?: { enabled: boolean, apiKey: string }
  cors?: { origin: string[], credentials: boolean }
}
```

**Error Handling:**
- All event handlers use try-catch
- Errors sent to client via callback with `success: false, error` fields
- ServerError instances include error codes for client handling
- Socket errors logged to console

**Testing Approach:**
- Integration tests with real Socket.io client
- Test room creation, joining, leaving flows
- Test connection/disconnection scenarios
- Test admin endpoints with/without auth
- Mock database adapter for isolation

---

### IDatabaseAdapter

**Purpose:** Backend-agnostic interface for database operations.

**Why:** Enables swapping Firebase → PostgreSQL → Redis without changing game logic. Same pattern as `IStateSynchronizer` in core package.

**Operations:**
```typescript
interface IDatabaseAdapter {
  // Lifecycle
  initialize(): Promise<void>
  close(): Promise<void>

  // Game state
  saveGameState(roomId: RoomId, state: GameState): Promise<void>
  loadGameState(roomId: RoomId): Promise<GameState | null>

  // Room metadata
  updateRoomMetadata(roomId: RoomId, metadata: RoomMetadata): Promise<void>
  getRoomMetadata(roomId: RoomId): Promise<RoomMetadata | null>
  getAllRoomMetadata(): Promise<RoomMetadata[]>

  // Cleanup helpers
  getInactiveRooms(olderThan: number): Promise<RoomId[]>
  deleteRoom(roomId: RoomId): Promise<void>
  roomExists(roomId: RoomId): Promise<boolean>
}
```

**Implementations:**

1. **InMemoryAdapter** (Phase 1, for testing)
   - Stores data in JavaScript Maps
   - Fully synchronous (wraps with Promise for interface compliance)
   - No persistence - data lost on restart
   - Perfect for unit tests

2. **FirebaseAdapter** (Phase 4, planned)
   - Firebase Realtime Database integration
   - Automatic persistence and syncing
   - Handles Firebase SDK initialization

3. **PostgresAdapter** (Future)
   - Railway + PostgreSQL
   - Full persistence with SQL queries
   - Connection pooling

**Design Notes:**
- All methods return Promises (even InMemoryAdapter) for consistency
- Metadata stored separately from game state (faster queries)
- `getInactiveRooms()` enables efficient cleanup scans
- Interface designed to work with any key-value or document store

---

## Supporting Systems

### Room Code Generation

**Purpose:** Generate short, human-friendly room codes for players to share.

**Implementation:**
```typescript
function generateRoomCode(): RoomId {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // No ambiguous chars
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
```

**Design Decisions:**
- **6 characters** - Balance of brevity and collision resistance (~1 billion possibilities)
- **Excludes ambiguous characters** - No 0/O, 1/I/l (easier for verbal/physical sharing)
- **Uppercase only** - Consistent, easier to communicate
- **Collision detection** - RoomManager retries up to 10 times if code exists

**Collision Resistance:**
- 32 characters, length 6 = 32^6 ≈ 1 billion codes
- At 1000 concurrent rooms: collision probability ~0.0001%
- Retry logic ensures unique code even if collision occurs

---

### Custom Error Classes

**Purpose:** Specific error types for better error handling and client feedback.

**Error Hierarchy:**
```typescript
class ServerError extends Error {
  code: string
  statusCode: number
}

class RoomNotFoundError extends ServerError
class RoomFullError extends ServerError
class RoomClosedError extends ServerError
class UnauthorizedError extends ServerError
class ValidationError extends ServerError
```

**Benefits:**
- **Type checking** - `instanceof` checks in error handlers
- **Error codes** - Machine-readable codes for client handling
- **HTTP mapping** - Status codes for REST endpoints
- **Better debugging** - Specific error types in logs

**Usage Example:**
```typescript
try {
  const room = roomManager.getRoom(roomId)
} catch (error) {
  if (error instanceof RoomNotFoundError) {
    socket.emit('error', { message: error.message, code: 'ROOM_NOT_FOUND' })
  }
}
```

---

## Type System

### Server Configuration

Comprehensive config for server setup:
```typescript
interface ServerConfig {
  port: number
  nodeEnv?: 'development' | 'production' | 'test'

  firebase?: { projectId, databaseURL, credentialsPath }
  room?: { defaultTTL, maxRooms, cleanupInterval }
  rateLimit?: { windowMs, maxRequests }
  admin?: { enabled, apiKey }
  cors?: { origin, credentials }
}
```

### Socket.io Event Contracts

**Client → Server:**
```typescript
interface ClientToServerEvents {
  'room:create': (gameType: string, hostName: string, callback: (response: RoomCreateResponse) => void) => void
  'room:join': (roomId: RoomId, playerName: string, callback: (response: RoomJoinResponse) => void) => void
  'room:leave': (callback?: (response: BaseResponse) => void) => void
  'game:start': (callback?: (response: BaseResponse) => void) => void
  'game:action': (actionType: string, payload: unknown, callback?: (response: ActionResponse) => void) => void
  'state:request': (callback: (response: StateResponse) => void) => void
}
```

**Server → Client:**
```typescript
interface ServerToClientEvents {
  'state:update': (state: GameState) => void          // Broadcast to room
  'state:sync': (state: GameState) => void            // Individual player sync
  'event:emit': (event: { type: string; payload: unknown }) => void
  'error': (error: ErrorResponse) => void
  'room:closed': (reason: string) => void
}
```

**Design:**
- Callback-based acknowledgments for request/response pattern
- Namespaced event names (`room:`, `game:`, `state:`)
- Typed responses for type safety

### Room Data Structures

**RoomInstance** - In-memory room representation:
```typescript
interface RoomInstance<T extends SocialGame<any>> {
  roomId: RoomId
  game: T                                    // Game instance
  synchronizer: SocketStateSynchronizer<any> // State sync
  metadata: RoomMetadata                     // Tracking data
  cleanupTimer?: NodeJS.Timeout             // TTL timer
}
```

**RoomMetadata** - Database-persisted room info:
```typescript
interface RoomMetadata {
  roomId: RoomId
  createdAt: number
  lastActivity: number
  hostId: PlayerId
  playerCount: number
  status: RoomStatus
  gameType: string
  custom?: Record<string, unknown>
}
```

**RoomInfo** - Public room information (for listings):
```typescript
interface RoomInfo {
  roomId: RoomId
  status: RoomStatus
  playerCount: number
  maxPlayers: number
  hostName: string
  gameType: string
  createdAt: number
  isPrivate?: boolean
}
```

---

## Testing Strategy

### Test Coverage

**Phase 1-3 Results:**
- 138 total tests (97 unit + 41 integration)
- All tests passing
- Comprehensive coverage of core infrastructure and event flows

**Test Organization:**
```
__tests__/
├── unit/
│   ├── utils/
│   │   ├── roomCodeGenerator.test.ts
│   │   └── errors.test.ts
│   ├── database/
│   │   └── InMemoryAdapter.test.ts
│   └── core/
│       ├── SocketStateSynchronizer.test.ts
│       └── RoomManager.test.ts
├── integration/
│   ├── socketServer.test.ts           (41 tests)
│   ├── roomLifecycle.test.ts
│   ├── playerManagement.test.ts
│   ├── gameActions.test.ts
│   ├── adminEndpoints.test.ts
│   └── helpers/
│       ├── testServer.ts
│       └── socketClient.ts
└── __mocks__/
    └── mockSocketIo.ts
```

### Mock Socket.io

**Purpose:** Unit test Socket.io operations without real server.

**Implementation:**
```typescript
class MockSocket {
  rooms: Set<string>
  emittedEvents: Array<{ event: string; args: any[] }>

  emit(event: string, ...args: any[]): void
  join(room: string): void
  leave(room: string): void
  to(room: string): MockSocket
}

class MockSocketServer {
  sockets: Map<string, MockSocket>
  rooms: Map<string, Set<string>>

  to(room: string): MockSocket
  emit(event: string, ...args: any[]): void
}
```

**Benefits:**
- Track all emitted events for assertions
- No network I/O in tests (fast, deterministic)
- Simulate room joins/leaves
- Verify broadcast vs targeted send

**Test Examples:**
```typescript
test('broadcasts state to all players in room', async () => {
  const mockSocket = new MockSocket()
  const sync = new SocketStateSynchronizer(roomId, mockIo, adapter)

  sync.registerPlayer('player1', 'socket1')
  await sync.broadcastState(gameState)

  expect(mockIo.to).toHaveBeenCalledWith(roomId)
  expect(mockSocket.emittedEvents).toContainEqual({
    event: 'state:update',
    args: [gameState]
  })
})
```

### Test Scenarios Covered

**Unit Tests (97 tests):**

*RoomManager:*
- ✅ Create room with unique code
- ✅ Room code collision retry
- ✅ Get room (success and error)
- ✅ Delete room and cleanup timers
- ✅ Player tracking (track, untrack, lookup)
- ✅ TTL cleanup via timers
- ✅ Periodic cleanup scans
- ✅ Max rooms limit enforcement
- ✅ Graceful shutdown

*SocketStateSynchronizer:*
- ✅ Broadcast state to room
- ✅ Send state to specific player
- ✅ Broadcast custom events
- ✅ Player registration and mapping
- ✅ Database persistence on every update
- ✅ Handle missing socket mapping

*IDatabaseAdapter (InMemoryAdapter):*
- ✅ Initialize and close
- ✅ Save and load game state
- ✅ Update and get room metadata
- ✅ List all room metadata
- ✅ Find inactive rooms
- ✅ Delete room and all data
- ✅ Room existence checks

**Integration Tests (41 tests):**

*SocketServer Lifecycle:*
- ✅ Initialize and start server
- ✅ Graceful shutdown
- ✅ Health check endpoint

*Room Management:*
- ✅ Create room via Socket.io
- ✅ Join existing room
- ✅ Leave room
- ✅ Multiple players in room
- ✅ Room not found errors

*Game Actions:*
- ✅ Start game
- ✅ Submit game actions
- ✅ State synchronization
- ✅ Request current state

*Connection Handling:*
- ✅ Player disconnect
- ✅ Player reconnection
- ✅ Socket context cleanup

*Admin Endpoints:*
- ✅ Get server stats
- ✅ Force-end room
- ✅ Kick player
- ✅ Authentication (API key)

---

## Data Flow

### Room Creation Flow

```
Client                    SocketServer             RoomManager              Database
  |                            |                        |                       |
  |--room:create-------------->|                        |                       |
  |                            |--createRoom()--------->|                       |
  |                            |                        |--generateRoomCode()   |
  |                            |                        |--new Synchronizer---->|
  |                            |                        |--gameFactory()        |
  |                            |                        |--updateMetadata()---->|
  |                            |<-RoomInstance----------|                       |
  |<-RoomCreateResponse--------|                        |                       |
  |   { roomId, state }        |                        |                       |
```

### State Broadcast Flow

```
Game                 Synchronizer           Socket.io              Database
  |                       |                     |                      |
  |--broadcastState()---->|                     |                      |
  |                       |--io.to(room).emit-->|--state:update------->Clients
  |                       |--saveGameState()--->|                      |
  |                       |                     |                      |--persist
  |<-Promise resolved-----|                     |                      |
```

### Player Reconnection Flow

```
Client               SocketServer           RoomManager           Database
  |                       |                      |                    |
  |--state:request------->|                      |                    |
  |                       |--getRoomIdForPlayer->|                    |
  |                       |--getRoom()---------->|                    |
  |                       |--loadGameState()---->|                    |
  |<-StateResponse--------|                      |                    |
  |   { state }           |                      |                    |
```

### TTL Cleanup Flow

```
RoomManager          Cleanup Timer         Database            Socket.io
  |                       |                    |                   |
  |--startCleanup()       |                    |                   |
  |--setInterval()------->|                    |                   |
  |                       |--tick------------->|                   |
  |                       |--performCleanup()  |                   |
  |                       |--getInactiveRooms->|                   |
  |                       |<-[roomIds]---------|                   |
  |                       |--deleteRoom()----->|                   |
  |                       |--emit room:closed->|------------------>Clients
  |                       |--deleteRoom()----->|                   |
```

---

## Phase 4: Firebase Integration

**To implement FirebaseAdapter:**

1. Firebase SDK setup and initialization
2. Map interface methods to Firebase operations:
   - `saveGameState()` → `.set()` to `/rooms/{roomId}/state`
   - `loadGameState()` → `.once('value')` from `/rooms/{roomId}/state`
   - `updateRoomMetadata()` → `.set()` to `/rooms/{roomId}/metadata`
   - `getInactiveRooms()` → `.orderByChild('lastActivity').endAt(threshold)`
3. Test with real Firebase instance
4. Add configuration and setup docs

---

## Production Considerations

### Scalability
- Room limit prevents memory exhaustion (default: 1000 rooms)
- Cleanup intervals prevent zombie rooms
- Database queries use indexes on `lastActivity` for fast scans
- Socket.io rooms enable efficient broadcasting (no O(n) loops)

### Memory Management
- TTL cleanup clears room data and timers
- Shutdown handler clears all timers and maps
- Player mappings removed on room deletion
- No memory leaks from forgotten timers

### Error Handling
- Custom error classes for specific handling
- Try-catch on all database operations
- Socket error events for client notification
- Graceful degradation on database failures

### Monitoring
- Server stats API (room count, player count, uptime)
- Error logging for cleanup failures
- Database operation timing
- Memory usage tracking

### Security
- Room code validation (6 chars, uppercase alphanumeric)
- Max rooms limit prevents DoS
- Rate limiting (configurable)
- Admin endpoints require API key
- CORS configuration

---

## Related Documentation

- **Core Classes:** `docs/architecture/core-classes.md` - Game engine architecture
- **API Reference:** `packages/server/README.md` - Server package API docs
- **Project Overview:** `docs/PROJECT_OVERVIEW.md` - Overall architecture
- **Milestones:** `docs/MILESTONES.md` - Development roadmap
