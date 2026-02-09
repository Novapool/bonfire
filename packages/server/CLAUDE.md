# @bonfire/server Package

Server infrastructure for Bonfire - multi-room orchestration, Socket.io integration, and database abstraction.

**Status:** Phases 1-3 Complete (138 tests passing - 97 unit + 41 integration)

---

## Package Overview

This package provides the server-side infrastructure for running Bonfire games:
- **SocketServer** - Production-ready Express + Socket.io server
- **RoomManager** - Multi-room orchestration and lifecycle management
- **SocketStateSynchronizer** - Realtime state broadcasting via Socket.io + database
- **IDatabaseAdapter** - Backend abstraction interface
- **InMemoryAdapter** - In-memory implementation for testing
- Type-safe Socket.io event contracts
- Room code generation and validation
- Custom error classes for server operations
- Admin REST endpoints for server management

---

## Directory Structure

```
src/
├── index.ts                          - Package exports
├── types.ts                          - Server type definitions and Socket.io contracts
├── core/
│   ├── SocketServer.ts               - Express + Socket.io server (NEW - Phase 3)
│   ├── RoomManager.ts                - Multi-room orchestration and lifecycle
│   └── SocketStateSynchronizer.ts    - Socket.io + database state broadcasting
├── database/
│   ├── IDatabaseAdapter.ts           - Database abstraction interface
│   └── InMemoryAdapter.ts            - In-memory implementation for testing
└── utils/
    ├── roomCodeGenerator.ts          - 6-char room code generation
    └── errors.ts                     - Custom error classes

__tests__/
├── unit/                             - Unit tests (97 tests)
│   ├── utils/
│   ├── database/
│   └── core/
├── integration/                      - Integration tests (41 tests, NEW - Phase 3)
│   ├── socketServer.test.ts
│   ├── roomLifecycle.test.ts
│   ├── playerManagement.test.ts
│   ├── gameActions.test.ts
│   ├── adminEndpoints.test.ts
│   └── helpers/
│       ├── testServer.ts
│       └── socketClient.ts
└── __mocks__/                        - Mock Socket.io utilities for unit testing
```

---

## When to Read What

**README.md** - API reference and usage examples
- Read when: Understanding package API, implementing server, writing tests

**types.ts** - Type definitions and Socket.io event contracts
- Read when: Understanding server types, implementing event handlers, adding new events

**core/RoomManager.ts** - Multi-room orchestration
- Read when: Understanding room lifecycle, cleanup, player tracking

**core/SocketStateSynchronizer.ts** - State broadcasting
- Read when: Understanding state sync, Socket.io integration, database persistence

**database/IDatabaseAdapter.ts** - Database interface
- Read when: Implementing new database adapter (Firebase, PostgreSQL, etc.)

**database/InMemoryAdapter.ts** - Reference implementation
- Read when: Understanding adapter pattern, writing tests, implementing new adapter

**utils/roomCodeGenerator.ts** - Room code utilities
- Read when: Understanding room code format, validation, collision handling

**utils/errors.ts** - Error class hierarchy
- Read when: Adding new error types, handling server errors

---

## Key Patterns & Conventions

### Architecture Patterns
- **Backend abstraction** via IDatabaseAdapter (same pattern as IStateSynchronizer in core)
- **Composition over inheritance** - RoomManager uses Synchronizer, not extends
- **Factory pattern** - GameFactory injected for creating game instances
- **Mock utilities** - Mock Socket.io for unit testing without network I/O

### Code Conventions
- All async methods return `Promise<void>` for consistency
- Error classes extend `ServerError` with `code` and `statusCode` properties
- Socket.io events use namespaced names (`room:create`, `game:action`)
- Room IDs are 6-character uppercase alphanumeric (no ambiguous chars)

### Testing Approach
- **Unit tests** use mock Socket.io and InMemoryAdapter
- **Integration tests** (Phase 3) use real Socket.io client
- Mock utilities track emitted events for assertions
- Test coverage goal: >90%

### Resource Management
- TTL cleanup via per-room timers + periodic scans
- Shutdown handler clears all timers and maps
- Player mappings cleared on room deletion
- No memory leaks from forgotten timers

---

## Socket.io Event Flow

**Room Creation:**
```
Client: room:create → Server: RoomManager.createRoom() → Response: { roomId, state }
```

**Player Join:**
```
Client: room:join → Server: Game.addPlayer() + Synchronizer.registerPlayer() → Response: { playerId, state }
```

**State Broadcast:**
```
Game: broadcastState() → Synchronizer: io.to(room).emit('state:update') + DB.save()
```

**Player Disconnect:**
```
Socket: disconnect → Server: Game.handlePlayerDisconnect() + RoomManager.untrackPlayer()
```

---

## Next Steps (Phase 4)

1. Implement FirebaseAdapter for IDatabaseAdapter
2. Configure Firebase project and credentials
3. Test with real Firebase Realtime Database
4. Add Firebase setup and deployment documentation

---

## Related Documentation

- **Architecture:** `docs/architecture/server-infrastructure.md` - Detailed design and architecture
- **Core Package:** `packages/core/README.md` - Game engine API
- **Milestones:** `docs/MILESTONES.md` - Development roadmap
