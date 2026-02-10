# @bonfire/client

React hooks and utilities for building Bonfire party game UIs.

**Status:** Milestone 4 Complete - 8 test files, 55 tests, 90.81% coverage

---

## Features

- **BonfireClient** - Promise-based Socket.io wrapper with subscription model
- **BonfireProvider** - React context provider with auto-connect/cleanup
- **6 React hooks** - Type-safe hooks for state, connection, room, player, phase, and events
- **BonfireErrorBoundary** - Error boundary component for graceful error handling
- **useSyncExternalStore** - Native React 18 external state synchronization
- **TypeScript** - Full type safety for game state and events
- **Comprehensive tests** - MockBonfireClient for easy testing

---

## Installation

```bash
npm install @bonfire/client socket.io-client
```

**Dependencies:**
- `@bonfire/core` - Core types and interfaces
- `socket.io-client` - Realtime communication
- `react` - React 18+ (peer dependency)

---

## Quick Start

### 1. Set up BonfireProvider

Wrap your app with `BonfireProvider` to make Bonfire hooks available:

```tsx
import { BonfireProvider, BonfireClient } from '@bonfire/client';
import { GameState } from '@bonfire/core';

// Option A: Pass config (provider creates client)
function App() {
  return (
    <BonfireProvider serverUrl="http://localhost:3000">
      <GameUI />
    </BonfireProvider>
  );
}

// Option B: Pass pre-created client (advanced usage)
const client = new BonfireClient({ serverUrl: 'http://localhost:3000' });

function App() {
  return (
    <BonfireProvider client={client}>
      <GameUI />
    </BonfireProvider>
  );
}
```

### 2. Use Bonfire Hooks in Your Components

```tsx
import { useGameState, useConnection, useRoom, usePlayer } from '@bonfire/client';

function GameUI() {
  const { state } = useGameState();
  const { status } = useConnection();
  const { createRoom, joinRoom, startGame } = useRoom();
  const { currentPlayer, isHost } = usePlayer();

  if (status !== 'connected') {
    return <div>Connecting...</div>;
  }

  if (!state) {
    return (
      <div>
        <button onClick={() => createRoom()}>Create Room</button>
        <button onClick={() => joinRoom('ABC123', 'Player1')}>Join Room</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Room: {state.roomId}</h1>
      <p>Phase: {state.phase}</p>
      <p>Players: {state.playerOrder.length}</p>

      {isHost && state.phase === 'lobby' && (
        <button onClick={() => startGame()}>Start Game</button>
      )}

      {/* Your game UI here */}
    </div>
  );
}
```

### 3. Add Error Boundary

Wrap components with `BonfireErrorBoundary` to catch and display errors:

```tsx
import { BonfireErrorBoundary } from '@bonfire/client';

function App() {
  return (
    <BonfireProvider serverUrl="http://localhost:3000">
      <BonfireErrorBoundary
        fallback={<div>Something went wrong. <button onClick={() => window.location.reload()}>Reload</button></div>}
      >
        <GameUI />
      </BonfireErrorBoundary>
    </BonfireProvider>
  );
}
```

---

## API Reference

### BonfireClient

Low-level Socket.io client wrapper. Usually used via `BonfireProvider` and hooks.

```typescript
import { BonfireClient } from '@bonfire/client';

const client = new BonfireClient({
  serverUrl: 'http://localhost:3000',
  autoConnect: true, // optional, default: true
});
```

**Methods:**

```typescript
// Connection
await client.connect(): Promise<void>
await client.disconnect(): Promise<void>

// Room Management
await client.createRoom(): Promise<RoomCreateResponse>
await client.joinRoom(roomId: string, playerName: string): Promise<RoomJoinResponse>
await client.leaveRoom(): Promise<BaseResponse>

// Game Actions
await client.startGame(): Promise<BaseResponse>
await client.sendAction(action: PlayerAction): Promise<ActionResponse>
await client.requestState(): Promise<StateResponse>

// Subscriptions (return unsubscribe functions)
client.onStateChange(callback: (state: GameState) => void): () => void
client.onStatusChange(callback: (status: ConnectionStatus) => void): () => void
client.onError(callback: (error: ErrorResponse) => void): () => void
client.onGameEvent(eventType: string, callback: (payload: any) => void): () => void
client.onRoomClosed(callback: () => void): () => void
```

**Properties:**

```typescript
client.gameState: GameState | null  // Current game state
client.status: ConnectionStatus      // 'disconnected' | 'connecting' | 'connected' | 'error'
client.currentPlayerId: string | null
client.currentRoomId: string | null
```

---

### BonfireProvider

React context provider for BonfireClient. Auto-connects on mount and cleans up on unmount.

```typescript
interface BonfireProviderProps {
  // Option 1: Pass client directly (advanced)
  client?: BonfireClient;

  // Option 2: Pass config (provider creates client)
  serverUrl?: string;
  autoConnect?: boolean;

  children: React.ReactNode;
}
```

**Example:**

```tsx
// Simple setup
<BonfireProvider serverUrl="http://localhost:3000">
  <App />
</BonfireProvider>

// Advanced setup with custom client
const client = new BonfireClient({ serverUrl: process.env.SERVER_URL });
<BonfireProvider client={client}>
  <App />
</BonfireProvider>
```

---

### Hooks

All hooks must be used inside a `BonfireProvider`.

#### useGameState()

Access current game state with reactive updates.

```typescript
function useGameState(): {
  state: GameState | null;
  requestState: () => Promise<void>;
}
```

**Example:**

```tsx
function GameBoard() {
  const { state, requestState } = useGameState();

  useEffect(() => {
    // Request latest state on mount
    requestState();
  }, []);

  if (!state) return <div>No active game</div>;

  return (
    <div>
      <h2>Phase: {state.phase}</h2>
      <p>Players: {state.playerOrder.length}/{state.config.maxPlayers}</p>
    </div>
  );
}
```

**Type-safe custom state:**

```tsx
interface MyGameState extends GameState {
  score: Record<string, number>;
  currentRound: number;
}

function ScoreBoard() {
  const { state } = useGameState();

  if (!state) return null;

  // Access custom fields (type-safe if you use TypeScript generics)
  const scores = (state as MyGameState).score;

  return (
    <ul>
      {Object.entries(scores).map(([playerId, score]) => (
        <li key={playerId}>{playerId}: {score}</li>
      ))}
    </ul>
  );
}
```

---

#### useConnection()

Manage connection status and manual connect/disconnect.

```typescript
function useConnection(): {
  status: ConnectionStatus; // 'disconnected' | 'connecting' | 'connected' | 'error'
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}
```

**Example:**

```tsx
function ConnectionIndicator() {
  const { status, connect, disconnect } = useConnection();

  return (
    <div>
      <span>Status: {status}</span>
      {status === 'disconnected' && <button onClick={connect}>Connect</button>}
      {status === 'connected' && <button onClick={disconnect}>Disconnect</button>}
    </div>
  );
}
```

---

#### useRoom()

Room management and game actions.

```typescript
function useRoom(): {
  roomId: string | null;
  createRoom: () => Promise<void>;
  joinRoom: (roomId: string, playerName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<void>;
  sendAction: (action: PlayerAction) => Promise<void>;
}
```

**Example:**

```tsx
function LobbyScreen() {
  const { createRoom, joinRoom } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  return (
    <div>
      <button onClick={createRoom}>Create New Room</button>

      <div>
        <input
          placeholder="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <input
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={() => joinRoom(roomCode, playerName)}>Join Room</button>
      </div>
    </div>
  );
}
```

**Sending game actions:**

```tsx
function GameControls() {
  const { sendAction } = useRoom();

  const submitAnswer = async (answer: string) => {
    try {
      await sendAction({
        type: 'submit_answer',
        payload: { answer }
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  return <button onClick={() => submitAnswer('My answer')}>Submit</button>;
}
```

---

#### usePlayer()

Access current player information and player list.

```typescript
function usePlayer(): {
  currentPlayer: Player | null;
  players: Player[];
  isHost: boolean;
}
```

**Example:**

```tsx
function PlayerList() {
  const { currentPlayer, players, isHost } = usePlayer();

  return (
    <div>
      <h3>Players ({players.length})</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name}
            {player.id === currentPlayer?.id && ' (You)'}
            {player.isHost && ' 👑'}
          </li>
        ))}
      </ul>

      {isHost && <p>You are the host!</p>}
    </div>
  );
}
```

---

#### usePhase()

Track current game phase with helper for conditional rendering.

```typescript
function usePhase(): {
  phase: Phase | null;
  isPhase: (targetPhase: Phase) => boolean;
}
```

**Example:**

```tsx
function GameScreen() {
  const { phase, isPhase } = usePhase();

  if (isPhase('lobby')) return <LobbyUI />;
  if (isPhase('playing')) return <GameplayUI />;
  if (isPhase('results')) return <ResultsUI />;

  return <div>Unknown phase: {phase}</div>;
}
```

---

#### useBonfireEvent()

Subscribe to custom game events with auto-cleanup.

```typescript
function useBonfireEvent<T = any>(
  eventType: string,
  callback: (payload: T) => void
): void
```

**Example:**

```tsx
function GameNotifications() {
  const [message, setMessage] = useState('');

  // Listen for custom 'player_scored' events
  useBonfireEvent('player_scored', (payload: { playerId: string; points: number }) => {
    setMessage(`Player ${payload.playerId} scored ${payload.points} points!`);
    setTimeout(() => setMessage(''), 3000);
  });

  return message ? <div className="notification">{message}</div> : null;
}
```

**Auto-cleanup:** The event listener is automatically removed when the component unmounts or when the event type changes.

---

### BonfireErrorBoundary

React error boundary for catching and displaying errors in game UI.

```typescript
interface BonfireErrorBoundaryProps {
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  children: React.ReactNode;
}
```

**Example with static fallback:**

```tsx
<BonfireErrorBoundary fallback={<div>Something went wrong</div>}>
  <GameUI />
</BonfireErrorBoundary>
```

**Example with render function:**

```tsx
<BonfireErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h2>Error: {error.message}</h2>
      <button onClick={reset}>Try Again</button>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  )}
>
  <GameUI />
</BonfireErrorBoundary>
```

---

## TypeScript Types

All types are fully exported and type-safe:

```typescript
import type {
  BonfireClientConfig,
  ConnectionStatus,
  BaseResponse,
  RoomCreateResponse,
  RoomJoinResponse,
  StateResponse,
  ActionResponse,
  ErrorResponse,
  BonfireGameEvent,
} from '@bonfire/client';
```

**Type Definitions:**

```typescript
interface BonfireClientConfig {
  serverUrl: string;
  autoConnect?: boolean;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface BaseResponse {
  success: boolean;
  error?: string;
  code?: string;
}

interface RoomCreateResponse extends BaseResponse {
  roomId?: string;
  state?: GameState;
}

interface RoomJoinResponse extends BaseResponse {
  playerId?: string;
  state?: GameState;
}

interface BonfireGameEvent {
  type: string;
  payload: any;
  timestamp: number;
}
```

---

## Testing

Use `MockBonfireClient` from test fixtures for easy testing:

```typescript
import { renderWithProvider } from './__tests__/fixtures/renderWithProvider';
import { mockBonfireClient } from './__tests__/fixtures/mockBonfireClient';

test('displays player count', () => {
  const client = mockBonfireClient();
  client.simulateState({
    phase: 'lobby',
    playerOrder: ['p1', 'p2'],
    // ... other state
  });

  const { getByText } = renderWithProvider(<PlayerList />, client);
  expect(getByText('Players (2)')).toBeInTheDocument();
});
```

**MockBonfireClient methods:**

```typescript
client.simulateState(state: GameState): void
client.simulateStatus(status: ConnectionStatus): void
client.simulateError(error: ErrorResponse): void
client.simulateEvent(type: string, payload: any): void
client.simulateRoomClosed(): void
```

---

## Architecture

The client library uses **React 18's `useSyncExternalStore`** to synchronize React component state with the external Socket.io client. This ensures:

- **Automatic re-renders** when server state changes
- **No stale state** from race conditions
- **Concurrent Mode compatible** for React 18+
- **Efficient updates** only when subscribed data changes

**Architecture diagram:**

```
Socket.io Server
       ↓
BonfireClient (subscription model)
       ↓
BonfireProvider (React Context)
       ↓
Hooks (useSyncExternalStore)
       ↓
Your Components (re-render on state change)
```

For detailed architecture documentation, see `docs/architecture/client-library.md`.

---

## Examples

### Complete Game UI Example

```tsx
import { BonfireProvider, useGameState, useRoom, usePlayer, usePhase } from '@bonfire/client';

function App() {
  return (
    <BonfireProvider serverUrl="http://localhost:3000">
      <BonfireErrorBoundary>
        <Game />
      </BonfireErrorBoundary>
    </BonfireProvider>
  );
}

function Game() {
  const { state } = useGameState();
  const { phase } = usePhase();

  if (!state) return <LobbyScreen />;
  if (phase === 'lobby') return <WaitingRoom />;
  if (phase === 'playing') return <Gameplay />;
  if (phase === 'results') return <Results />;

  return null;
}

function LobbyScreen() {
  const { createRoom, joinRoom } = useRoom();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  return (
    <div>
      <h1>Party Game</h1>
      <button onClick={createRoom}>Create Room</button>
      <input placeholder="Room Code" value={code} onChange={(e) => setCode(e.target.value)} />
      <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => joinRoom(code, name)}>Join Room</button>
    </div>
  );
}

function WaitingRoom() {
  const { state } = useGameState();
  const { players, isHost } = usePlayer();
  const { startGame } = useRoom();

  return (
    <div>
      <h2>Room: {state?.roomId}</h2>
      <h3>Players:</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name} {p.isHost && '👑'}</li>
        ))}
      </ul>
      {isHost && <button onClick={startGame}>Start Game</button>}
    </div>
  );
}

function Gameplay() {
  const { sendAction } = useRoom();

  return (
    <div>
      <h2>Playing...</h2>
      <button onClick={() => sendAction({ type: 'submit', payload: 'answer' })}>
        Submit Answer
      </button>
    </div>
  );
}

function Results() {
  const { state } = useGameState();

  return (
    <div>
      <h2>Results</h2>
      <p>Game over!</p>
    </div>
  );
}
```

---

## Related Documentation

- **Architecture:** `docs/architecture/client-library.md` - Detailed design and architecture
- **Server Package:** `packages/server/README.md` - Server API reference
- **Core Package:** `packages/core/README.md` - Game engine API
- **Milestones:** `docs/MILESTONES.md` - Development roadmap

---

## License

MIT
