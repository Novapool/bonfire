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
- 205 tests total, all passing (hooks at 100% coverage, BonfireClient at 97.4%)

---

## UI Components (Milestone 5)

Pre-built React components for common party game UI patterns. All components use Tailwind CSS v4 design tokens defined in the package's `@theme` configuration.

### Design System

The package ships a Tailwind CSS v4 design system with tokens for:
- **Brand colors**: `brand-primary`, `brand-secondary`
- **Surface/background**: `bg-surface`
- **Text hierarchy**: `text-primary`, `text-secondary`
- **Status colors**: `warning`, `error`
- **Animations**: `animate-slide-up`, `shadow-card`

Build CSS with `npm run build:css` in the client package.

### PlayerAvatar (`src/components/PlayerAvatar.tsx`)

Renders a player's avatar as a colored circle with initials. Color is deterministically derived from the player's name via the `colorHash` utility.

```
Props:
  name: string                         — Player name (used for initials and color)
  color?: string                       — Override auto-generated color
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'  — Size variant (default: 'md')
  showStatus?: boolean                 — Show online/offline indicator dot
  isOnline?: boolean                   — Online status (requires showStatus: true)
  isHost?: boolean                     — Show crown icon for host
  className?: string
```

### Timer (`src/components/Timer.tsx`)

Countdown timer with an optional circular SVG progress ring. Automatically transitions variant colors as time runs low.

```
Props:
  duration: number                     — Total countdown duration in seconds
  onComplete?: () => void              — Fired when countdown reaches zero
  showProgress?: boolean               — Show SVG progress ring (default: true)
  variant?: 'default' | 'warning' | 'danger'  — Color variant (default: 'default')
  size?: 'sm' | 'md' | 'lg'           — Size variant (default: 'md')
  autoStart?: boolean                  — Start on mount (default: true)
  className?: string
```

### Lobby (`src/components/Lobby.tsx`)

Pre-built lobby screen integrating `useGameState`, `usePlayer`, and `useRoom` hooks internally. Displays the room code with one-click clipboard copy, a scrollable player list using `PlayerAvatar`, and a host-only start button.

```
Props:
  roomCode?: string                    — Override auto-detected room code
  renderPlayer?: (player, isHost) => ReactNode  — Custom player row renderer
  showReadyStates?: boolean            — Show per-player ready indicators (default: false)
  onStart?: () => void | Promise<void> — Override start button handler
  hideStartButton?: boolean            — Hide start button entirely (default: false)
  className?: string
```

Reads min/max player counts from `state.metadata.config`.

### PromptCard (`src/components/PromptCard.tsx`)

Themed card for displaying questions, prompts, or dares. The `variant` controls the card's border color and badge appearance.

```
Props:
  prompt: string                       — The question or prompt text (required)
  variant?: 'standard' | 'spicy' | 'creative' | 'dare'  — Visual theme (default: 'standard')
  category?: string                    — Override the variant badge label
  round?: number                       — Current round number
  totalRounds?: number                 — Total rounds (shows "Round X of Y")
  subtitle?: string                    — Secondary instruction text below prompt
  children?: ReactNode                 — Slot rendered below the prompt (e.g., ResponseInput)
  animate?: boolean                    — Slide-up entrance animation (default: false)
  className?: string
```

Variant color scheme:
- `standard` — indigo/brand-primary border and badge
- `spicy` — red border and badge
- `creative` — purple border and badge
- `dare` — orange border and badge

### ResponseInput (`src/components/ResponseInput.tsx`)

Polymorphic input component. The input mode is determined entirely by the `config.type` discriminated union — no separate components to import.

```
Props:
  config: InputConfig                  — Determines mode (see below)
  value?: string | string[]            — Controlled value
  onChange?: (value) => void           — Called on every change
  onSubmit?: (value) => void           — Called when user submits
  disabled?: boolean                   — Disable all inputs (default: false)
  showSubmit?: boolean                 — Show submit button (default: true)
  submitLabel?: string                 — Submit button label (default: 'Submit')
  className?: string
```

**Config types:**

```typescript
// Text input (single-line or multiline)
{ type: 'text'; placeholder?: string; maxLength?: number; multiline?: boolean }

// Multiple choice (single-select or multi-select)
{ type: 'multiple-choice'; choices: Choice[]; allowMultiple?: boolean }

// Ranking (add items from pool, reorder, remove)
{ type: 'ranking'; items: Choice[] }

interface Choice { id: string; label: string; description?: string }
```

Text mode: Enter key submits (single-line only). Multiline shows character counter when `maxLength` is set.

Multiple choice: `allowMultiple: false` (default) = radio behavior (single selection replaces previous). `allowMultiple: true` = checkbox behavior (toggle selections).

Ranking: Items start in an unranked pool. Tap to add to the ranked list. Use up/down arrows to reorder. Remove button returns item to pool.

### RevealPhase (`src/components/RevealPhase.tsx`)

Sequentially reveals a list of items using configurable animation delays. Each item animates in one at a time. Fires `onRevealComplete` when all items have been shown.

```
Props:
  items: RevealItem[]                  — Array of { id, content } items to reveal
  renderItem?: (item, index) => ReactNode  — Custom render function per item
  delayBetween?: number                — Ms between each reveal (default: 600)
  animateIn?: boolean                  — Enable slide-in animation (default: true)
  onRevealComplete?: () => void        — Fired after last item reveals
  className?: string
```

### GameProgress (`src/components/GameProgress.tsx`)

Displays current progress through rounds or phases in one of three visual modes.

```
Props:
  current: number                      — Current step (1-indexed)
  total: number                        — Total number of steps
  variant?: 'bar' | 'dots' | 'number' — Visual mode (default: 'bar')
  label?: string                       — Label prefix (e.g. "Round" → "Round 2 of 5")
  className?: string
```

All variants render with `role="progressbar"` and `aria-valuenow`/`aria-valuemax` for accessibility.

### VotingInterface (`src/components/VotingInterface.tsx`)

Full voting UI component. Supports active voting mode and a results display mode with vote counts, percentage bars, and winner highlighting.

```
Props:
  options: VoteOption[]                — Array of { id, label, votes? } options
  onVote?: (optionId: string) => void  — Called when a player selects an option
  selectedId?: string                  — Currently selected option (controlled)
  disabled?: boolean                   — Disable all vote buttons (default: false)
  showResults?: boolean                — Show vote counts and percentages (default: false)
  totalVotes?: number                  — Total votes cast (used for percentage calculation)
  className?: string
```

### colorHash Utility (`src/utils/colorHash.ts`)

```typescript
getPlayerColor(name: string): string   — Returns a CSS hex color deterministically from name
getPlayerInitials(name: string): string — Returns 1-2 uppercase initials from name
```

Used by `PlayerAvatar` internally and available for custom avatar implementations.

### Storybook

All components have Storybook 8 stories under `src/components/*.stories.tsx`. Run with:

```bash
cd packages/client && npm run storybook
```

Stories include a combined `PromptCard` + `ResponseInput` demo showing the intended composition pattern.

---

## Directory Structure

```
packages/client/
├── src/
│   ├── index.ts                    # Barrel exports
│   ├── types.ts                    # Client types + mirrored server types
│   ├── client/
│   │   └── BonfireClient.ts        # Socket.io wrapper class
│   ├── context/
│   │   └── BonfireProvider.tsx     # React context provider
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   ├── useConnection.ts
│   │   ├── useRoom.ts
│   │   ├── usePlayer.ts
│   │   ├── usePhase.ts
│   │   └── useBonfireEvent.ts
│   ├── components/
│   │   ├── BonfireErrorBoundary.tsx
│   │   ├── Lobby.tsx               # Pre-built lobby screen
│   │   ├── Lobby.stories.tsx
│   │   ├── PlayerAvatar.tsx        # Player avatar with colorHash
│   │   ├── PlayerAvatar.stories.tsx
│   │   ├── Timer.tsx               # Countdown timer with progress ring
│   │   ├── Timer.stories.tsx
│   │   ├── PromptCard.tsx          # Themed prompt/question card
│   │   ├── PromptCard.stories.tsx
│   │   ├── ResponseInput.tsx       # Polymorphic response input
│   │   ├── ResponseInput.stories.tsx
│   │   ├── RevealPhase.tsx         # Sequential animated item reveal
│   │   ├── RevealPhase.stories.tsx
│   │   ├── GameProgress.tsx        # Round/phase progress indicator
│   │   ├── GameProgress.stories.tsx
│   │   ├── VotingInterface.tsx     # Voting UI with results display
│   │   └── VotingInterface.stories.tsx
│   └── utils/
│       └── colorHash.ts            # Deterministic player color utility
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
    │   ├── BonfireErrorBoundary.test.tsx
    │   ├── Lobby.test.tsx
    │   ├── PlayerAvatar.test.tsx
    │   ├── Timer.test.tsx
    │   ├── PromptCard.test.tsx
    │   ├── ResponseInput.test.tsx
    │   ├── RevealPhase.test.tsx
    │   ├── GameProgress.test.tsx
    │   └── VotingInterface.test.tsx
    └── fixtures/
        ├── mockBonfireClient.ts
        └── renderWithProvider.tsx
```
