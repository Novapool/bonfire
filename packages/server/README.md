# @bonfire/server

Server infrastructure for Bonfire party game framework, providing multi-room orchestration, Socket.io integration, and database abstraction.

**Status:** Phases 1-2 Complete (97 tests, 91.2% coverage)

---

## Features

- **Multi-room orchestration** - Manage multiple concurrent game rooms
- **Realtime communication** - Socket.io-based state synchronization
- **Backend abstraction** - Swap databases without code changes
- **Automatic cleanup** - TTL-based room expiration
- **Type-safe events** - Full TypeScript event contracts
- **Comprehensive testing** - Mock Socket.io utilities for testing

---

## Installation

```bash
npm install @bonfire/server
```

**Dependencies:**
- `@bonfire/core` - Game engine
- `socket.io` - Realtime communication
- `express` - HTTP server
- `firebase-admin` - Firebase integration (optional)

---

## Quick Start

```typescript
import { RoomManager, InMemoryAdapter } from '@bonfire/server'
import { Server as SocketIOServer } from 'socket.io'
import { SocialGame } from '@bonfire/core'
import express from 'express'
import { createServer } from 'http'

// Create Express + Socket.io server
const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer)

// Create database adapter
const adapter = new InMemoryAdapter()
await adapter.initialize()

// Create game factory
const gameFactory = (roomId, synchronizer) => {
  return new SocialGame({
    roomId,
    maxPlayers: 8,
    stateSynchronizer: synchronizer,
    // ... game config
  })
}

// Create room manager
const roomManager = new RoomManager(
  io,
  adapter,
  gameFactory,
  'my-game',
  {
    defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
    maxRooms: 1000,
    cleanupInterval: 60 * 60 * 1000, // 1 hour
  }
)

// Start cleanup
roomManager.startCleanup()

// Start server
httpServer.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

---

## API Reference

### RoomManager

Orchestrates multiple game rooms with lifecycle management, player tracking, and automatic cleanup.

#### Constructor

```typescript
constructor(
  io: TypedSocketServer,
  databaseAdapter: IDatabaseAdapter,
  gameFactory: GameFactory<T>,
  gameType: string,
  config?: RoomManagerConfig
)
```

**Parameters:**
- `io` - Socket.io server instance (typed)
- `databaseAdapter` - Database adapter implementation
- `gameFactory` - Function to create game instances
- `gameType` - String identifier for game type
- `config` - Optional configuration

**Config Options:**
```typescript
interface RoomManagerConfig {
  defaultTTL?: number          // Room expiration time (default: 24 hours)
  maxRooms?: number            // Max concurrent rooms (default: 1000)
  cleanupInterval?: number     // Cleanup scan interval (default: 1 hour)
}
```

#### Room Management Methods

##### `createRoom(hostPlayerId: PlayerId): Promise<RoomInstance<T>>`

Create a new room with unique room code.

```typescript
const room = await roomManager.createRoom('host-player-id')
console.log(`Room created: ${room.roomId}`) // e.g., "A3K7N2"
```

**Features:**
- Generates 6-character alphanumeric room code
- Retries up to 10 times on collision
- Creates game instance via factory
- Initializes state synchronizer
- Persists metadata to database

**Throws:**
- `Error` - If max rooms limit reached
- `Error` - If unique code generation fails

---

##### `getRoom(roomId: RoomId): RoomInstance<T>`

Get room instance by ID.

```typescript
const room = roomManager.getRoom('A3K7N2')
console.log(room.game.getPlayers()) // Access game state
```

**Throws:**
- `RoomNotFoundError` - If room doesn't exist

---

##### `hasRoom(roomId: RoomId): boolean`

Check if room exists.

```typescript
if (roomManager.hasRoom('A3K7N2')) {
  // Room exists
}
```

---

##### `deleteRoom(roomId: RoomId): Promise<void>`

Delete a room and cleanup all resources.

```typescript
await roomManager.deleteRoom('A3K7N2')
```

**Cleanup:**
- Clears room cleanup timer
- Removes all player-to-room mappings
- Clears synchronizer socket mappings
- Deletes from database
- Removes from memory

---

##### `listRooms(filter?: (room: RoomInstance<T>) => boolean): RoomInfo[]`

List all rooms with optional filtering.

```typescript
// List all rooms
const allRooms = roomManager.listRooms()

// List only active rooms
const activeRooms = roomManager.listRooms(
  (room) => room.metadata.status === 'active'
)

// List rooms with space
const openRooms = roomManager.listRooms(
  (room) => room.metadata.playerCount < room.game.config.maxPlayers
)
```

**Returns:**
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

#### Player Tracking Methods

##### `trackPlayer(playerId: PlayerId, roomId: RoomId): void`

Track player's current room.

```typescript
roomManager.trackPlayer('player-123', 'A3K7N2')
```

---

##### `getRoomIdForPlayer(playerId: PlayerId): RoomId | undefined`

Get room ID for a player.

```typescript
const roomId = roomManager.getRoomIdForPlayer('player-123')
if (roomId) {
  const room = roomManager.getRoom(roomId)
}
```

---

##### `untrackPlayer(playerId: PlayerId): void`

Remove player tracking.

```typescript
roomManager.untrackPlayer('player-123')
```

---

#### Activity & Metadata Methods

##### `updateActivity(roomId: RoomId): Promise<void>`

Update room's last activity timestamp and reset TTL timer.

```typescript
await roomManager.updateActivity('A3K7N2')
```

**Behavior:**
- Updates `lastActivity` to current time
- Persists to database
- Cancels existing cleanup timer
- Sets new cleanup timer for `defaultTTL` milliseconds

---

##### `updateRoomMetadata(roomId: RoomId, updates: Partial<RoomMetadata>): Promise<void>`

Update room metadata.

```typescript
await roomManager.updateRoomMetadata('A3K7N2', {
  status: 'active',
  playerCount: 5,
})
```

**Throws:**
- `RoomNotFoundError` - If room doesn't exist

---

#### Cleanup Methods

##### `startCleanup(): void`

Start periodic cleanup of inactive rooms.

```typescript
roomManager.startCleanup()
```

**Behavior:**
- Sets interval for `cleanupInterval` duration
- Queries database for rooms inactive longer than `defaultTTL`
- Deletes inactive rooms
- Safe to call multiple times (no-op if already running)

---

##### `stopCleanup(): void`

Stop periodic cleanup.

```typescript
roomManager.stopCleanup()
```

---

#### Utility Methods

##### `getRoomCount(): number`

Get total number of active rooms.

```typescript
const count = roomManager.getRoomCount()
console.log(`${count} rooms active`)
```

---

##### `getPlayerCount(): number`

Get total number of tracked players.

```typescript
const count = roomManager.getPlayerCount()
console.log(`${count} players online`)
```

---

##### `shutdown(): Promise<void>`

Gracefully shutdown room manager.

```typescript
await roomManager.shutdown()
```

**Cleanup:**
- Stops cleanup interval
- Clears all room cleanup timers
- Clears all data from memory

---

### SocketStateSynchronizer

Broadcasts game state and events via Socket.io and persists to database. Implements `IStateSynchronizer` from `@bonfire/core`.

#### Constructor

```typescript
constructor(
  roomId: RoomId,
  io: TypedSocketServer,
  databaseAdapter: IDatabaseAdapter
)
```

**Parameters:**
- `roomId` - Room identifier (used as Socket.io room name)
- `io` - Socket.io server instance
- `databaseAdapter` - Database adapter for persistence

---

#### State Synchronization Methods

##### `broadcastState(state: GameState): Promise<void>`

Broadcast state to all players in room.

```typescript
await synchronizer.broadcastState(gameState)
```

**Behavior:**
- Emits `state:update` event to Socket.io room
- Persists state to database
- Both operations happen concurrently

**Socket Event:**
```typescript
// Server
io.to(roomId).emit('state:update', gameState)

// Client receives
socket.on('state:update', (state) => {
  // Update UI with new state
})
```

---

##### `sendToPlayer(playerId: PlayerId, state: GameState): Promise<void>`

Send state to specific player (for reconnection).

```typescript
await synchronizer.sendToPlayer('player-123', gameState)
```

**Behavior:**
- Looks up socket ID for player
- Emits `state:sync` event to that socket
- No-op if player socket not found (already disconnected)
- Does NOT persist to database (broadcast handles that)

**Socket Event:**
```typescript
// Server
io.to(socketId).emit('state:sync', gameState)

// Client receives
socket.on('state:sync', (state) => {
  // Sync local state after reconnection
})
```

---

##### `broadcastEvent(event: string, payload: unknown): Promise<void>`

Broadcast custom game event to room.

```typescript
await synchronizer.broadcastEvent('timer:tick', { secondsLeft: 30 })
await synchronizer.broadcastEvent('player:voted', { playerId: 'p1', vote: 'yes' })
```

**Socket Event:**
```typescript
// Server
io.to(roomId).emit('event:emit', { type: event, payload })

// Client receives
socket.on('event:emit', ({ type, payload }) => {
  if (type === 'timer:tick') {
    // Update timer UI
  }
})
```

---

#### Player Mapping Methods

##### `registerPlayer(playerId: PlayerId, socketId: string): void`

Register player's socket ID for targeted sends.

```typescript
synchronizer.registerPlayer('player-123', 'socket-abc')
```

**Usage:**
```typescript
io.on('connection', (socket) => {
  socket.on('room:join', (roomId, playerName, callback) => {
    const { playerId } = await game.addPlayer(playerName)

    // Register for targeted sends
    synchronizer.registerPlayer(playerId, socket.id)

    // Join Socket.io room for broadcasts
    socket.join(roomId)
  })
})
```

---

##### `unregisterPlayer(playerId: PlayerId): void`

Unregister player's socket mapping.

```typescript
synchronizer.unregisterPlayer('player-123')
```

---

##### `clearPlayerMappings(): void`

Clear all player-socket mappings (room cleanup).

```typescript
synchronizer.clearPlayerMappings()
```

---

### IDatabaseAdapter

Backend-agnostic interface for database operations. Implement this interface to support different databases.

#### Required Methods

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

  // Cleanup
  getInactiveRooms(olderThan: number): Promise<RoomId[]>
  deleteRoom(roomId: RoomId): Promise<void>
  roomExists(roomId: RoomId): Promise<boolean>
}
```

---

### InMemoryAdapter

In-memory database adapter for testing and development.

#### Constructor

```typescript
constructor()
```

#### Usage

```typescript
const adapter = new InMemoryAdapter()
await adapter.initialize()

// Use with RoomManager
const roomManager = new RoomManager(io, adapter, gameFactory, 'my-game')
```

**Features:**
- Stores data in JavaScript Maps
- Fully synchronous (wrapped in Promises)
- No persistence (data lost on restart)
- Perfect for testing

**Limitations:**
- ⚠️ NOT for production use
- ⚠️ No data persistence
- ⚠️ Single-process only

---

## Types

### Server Configuration

```typescript
interface ServerConfig {
  port: number
  nodeEnv?: 'development' | 'production' | 'test'

  firebase?: {
    projectId: string
    databaseURL: string
    credentialsPath?: string
  }

  room?: {
    defaultTTL?: number
    maxRooms?: number
    cleanupInterval?: number
  }

  rateLimit?: {
    windowMs?: number
    maxRequests?: number
  }

  admin?: {
    enabled?: boolean
    apiKey?: string
  }

  cors?: {
    origin: string | string[]
    credentials?: boolean
  }
}
```

---

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
  'state:update': (state: GameState) => void
  'state:sync': (state: GameState) => void
  'event:emit': (event: { type: string; payload: unknown }) => void
  'error': (error: ErrorResponse) => void
  'room:closed': (reason: string) => void
}
```

---

### Room Data Structures

```typescript
interface RoomInstance<T extends SocialGame<any>> {
  roomId: RoomId
  game: T
  synchronizer: SocketStateSynchronizer<any>
  metadata: RoomMetadata
  cleanupTimer?: NodeJS.Timeout
}

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

## Utilities

### Room Code Generation

```typescript
import { generateRoomCode, isValidRoomCode } from '@bonfire/server'

const roomId = generateRoomCode() // e.g., "A3K7N2"
const isValid = isValidRoomCode(roomId) // true
```

**Room Code Format:**
- 6 characters
- Uppercase alphanumeric
- Excludes ambiguous characters (0/O, 1/I/l)
- Characters: `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`

---

### Error Classes

```typescript
import {
  ServerError,
  RoomNotFoundError,
  RoomFullError,
  RoomClosedError,
  UnauthorizedError,
  ValidationError,
} from '@bonfire/server'

try {
  const room = roomManager.getRoom(roomId)
} catch (error) {
  if (error instanceof RoomNotFoundError) {
    socket.emit('error', {
      message: 'Room not found',
      code: 'ROOM_NOT_FOUND',
    })
  }
}
```

**Error Hierarchy:**
```typescript
ServerError (extends Error)
├── RoomNotFoundError
├── RoomFullError
├── RoomClosedError
├── UnauthorizedError
└── ValidationError
```

---

## Testing

### Running Tests

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Mock Socket.io Utilities

For testing server code that uses Socket.io:

```typescript
import { MockSocket, MockSocketServer } from '@bonfire/server/__mocks__/mockSocketIo'

// Create mock server
const mockIo = new MockSocketServer()

// Create mock socket
const mockSocket = new MockSocket()

// Use with synchronizer
const sync = new SocketStateSynchronizer('room1', mockIo, adapter)

// Verify emitted events
expect(mockSocket.emittedEvents).toContainEqual({
  event: 'state:update',
  args: [gameState]
})
```

**Mock API:**
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

---

## Examples

### Complete Server Setup

```typescript
import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { RoomManager, InMemoryAdapter } from '@bonfire/server'
import { SocialGame } from '@bonfire/core'

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' }
})

const adapter = new InMemoryAdapter()
await adapter.initialize()

const gameFactory = (roomId, synchronizer) => {
  return new SocialGame({
    roomId,
    maxPlayers: 8,
    stateSynchronizer: synchronizer,
  })
}

const roomManager = new RoomManager(io, adapter, gameFactory, 'party-game')
roomManager.startCleanup()

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  socket.on('room:create', async (gameType, hostName, callback) => {
    try {
      const room = await roomManager.createRoom(socket.id)
      const { playerId } = await room.game.addPlayer(hostName, { isHost: true })

      room.synchronizer.registerPlayer(playerId, socket.id)
      socket.join(room.roomId)
      roomManager.trackPlayer(socket.id, room.roomId)

      callback({ success: true, roomId: room.roomId, state: room.game.getState() })
    } catch (error) {
      callback({ success: false, error: error.message })
    }
  })

  socket.on('room:join', async (roomId, playerName, callback) => {
    try {
      const room = roomManager.getRoom(roomId)
      const { playerId } = await room.game.addPlayer(playerName)

      room.synchronizer.registerPlayer(playerId, socket.id)
      socket.join(roomId)
      roomManager.trackPlayer(socket.id, roomId)

      callback({ success: true, playerId, state: room.game.getState() })
    } catch (error) {
      callback({ success: false, error: error.message })
    }
  })

  socket.on('disconnect', () => {
    const roomId = roomManager.getRoomIdForPlayer(socket.id)
    if (roomId) {
      const room = roomManager.getRoom(roomId)
      room.game.handlePlayerDisconnect(socket.id)
      roomManager.untrackPlayer(socket.id)
    }
  })
})

httpServer.listen(3000)
```

---

## Architecture

See `docs/architecture/server-infrastructure.md` for detailed architecture documentation including:
- Design decisions and patterns
- Data flow diagrams
- Testing strategy
- Production considerations
- Phase 3 & 4 roadmap

---

## Phase Status

**Phase 1: Foundation** ✅ Complete
- Package setup, types, room code generator, errors, database abstraction, InMemoryAdapter

**Phase 2: Room Management Core** ✅ Complete
- RoomManager, SocketStateSynchronizer, mock Socket.io utilities, 97 tests

**Phase 3: Socket.io Integration** 🔵 Next
- SocketServer class, event handlers, integration tests

**Phase 4: Firebase Integration** 🔴 Future
- FirebaseAdapter implementation

---

## License

MIT
