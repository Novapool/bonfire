# Client Library Architecture

## Overview

The `@bonfire/client` package provides React hooks and utilities for building game UIs that connect to a Bonfire server. It wraps `socket.io-client` in a type-safe, React-friendly API.

## Architecture

```
BonfireClient (plain TS class, wraps socket.io-client)
       ↓ subscription API (onStateChange, onStatusChange, etc.)
BonfireProvider (React context, subscribes to client)
       ↓ context value (client, status, gameState)
Hooks (useGameState, useRoom, usePlayer, usePhase, useConnection, useBonfireEvent)
```

## Key Classes

### BonfireClient (`src/client/BonfireClient.ts`)

Plain TypeScript class (no React dependency) that manages the socket connection. Can be used without React.

**Promise-based methods** (wrap Socket.io callback acknowledgments):
- `createRoom(gameType, hostName)` → `RoomCreateResponse`
- `joinRoom(roomId, playerName)` → `RoomJoinResponse`
- `leaveRoom()` → `BaseResponse`
- `startGame()` → `BaseResponse`
- `sendAction(actionType, payload)` → `ActionResponse`
- `requestState()` → `StateResponse`

**Subscription API** (each returns an unsubscribe function):
- `onStateChange(listener)` — fired on `state:update` and `state:sync` from server
- `onStatusChange(listener)` — connection status changes
- `onError(listener)` — server error events
- `onGameEvent(eventType, listener)` — typed game event dispatching
- `onRoomClosed(listener)` — room closed notification

**Internal state**: Tracks `gameState`, `playerId`, `roomId`, `status` so hooks can synchronously read current values.

### BonfireProvider (`src/context/BonfireProvider.tsx`)

React context provider that wraps the app tree.

- Accepts `client` (pre-created) or `config` (creates internally)
- `autoConnect` prop (default: true)
- Subscribes to client state/status and triggers React re-renders
- Exposes `useBonfireContext()` internal hook for all public hooks

## Hooks

| Hook | Key Return Values | Pattern |
|------|------------------|---------|
| `useGameState<TState>()` | `state`, `requestState` | `useSyncExternalStore` |
| `useConnection()` | `status`, `isConnected`, `connect`, `disconnect` | `useSyncExternalStore` |
| `useRoom()` | `roomId`, `isInRoom`, `createRoom`, `joinRoom`, `leaveRoom`, `startGame`, `sendAction` | `useCallback` wrappers |
| `usePlayer()` | `player`, `playerId`, `isHost`, `players` | `useMemo` derived from state |
| `usePhase()` | `phase`, `isPhase(target)` | `useCallback` derived from state |
| `useBonfireEvent(type, handler)` | void | `useEffect` with auto-cleanup |

### Why `useSyncExternalStore`

`useGameState` and `useConnection` use React 18's `useSyncExternalStore` to subscribe to the BonfireClient's internal state. This:
- Prevents tearing in concurrent mode
- Is the official React pattern for external store subscriptions
- Is simpler than `useState` + `useEffect` for this use case

## Type Strategy

The client package **does not depend on `@bonfire/server`**. Server response types (`BaseResponse`, `RoomCreateResponse`, etc.) and Socket.io event contracts (`ClientToServerEvents`, `ServerToClientEvents`) are duplicated in `src/types.ts`. This keeps the client free of Node.js-only dependencies (Express, firebase-admin).

## Testing

- **MockBonfireClient** (`__tests__/fixtures/mockBonfireClient.ts`) — Test double with `simulate*` methods
- **renderWithProvider** (`__tests__/fixtures/renderWithProvider.tsx`) — Helper wrapping `renderHook` with BonfireProvider
- 55 tests, 90.81% coverage, all hooks at 100%

## Directory Structure

```
packages/client/
├── src/
│   ├── index.ts                    # Barrel exports
│   ├── types.ts                    # Client types + mirrored server types
│   ├── client/
│   │   └── BonfireClient.ts        # Socket.io wrapper class
│   ├── context/
│   │   └── BonfireProvider.tsx      # React context provider
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   ├── useConnection.ts
│   │   ├── useRoom.ts
│   │   ├── usePlayer.ts
│   │   ├── usePhase.ts
│   │   └── useBonfireEvent.ts
│   └── components/
│       └── BonfireErrorBoundary.tsx
└── __tests__/
    ├── client/
    │   └── BonfireClient.test.ts
    ├── hooks/
    │   ├── useGameState.test.ts
    │   ├── useConnection.test.ts
    │   ├── useRoom.test.ts
    │   ├── usePlayer.test.ts
    │   ├── usePhase.test.ts
    │   └── useBonfireEvent.test.ts
    ├── components/
    │   └── BonfireErrorBoundary.test.tsx
    └── fixtures/
        ├── mockBonfireClient.ts
        └── renderWithProvider.tsx
```
