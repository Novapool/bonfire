# Bonfire - Development Milestones

> **Status Guide:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete

---

## Milestone 1: Foundation & Architecture 🟢

**Goal:** Establish core framework structure and development environment

### Tasks
- [x] 🟢 Set up monorepo structure (npm workspaces)
- [x] 🟢 Initialize TypeScript configuration for all packages
- [x] 🟢 Define base `Game` class interface and types
- [x] 🟢 Create package structure (`@bonfire/core`, `/server`, `/client`)
- [x] 🟢 Set up development tooling (ESLint, Prettier)
- [x] 🟢 Initialize Git repository with proper .gitignore

**Deliverable:** ✅ Empty framework structure with proper TypeScript setup - All packages build successfully!

---

## Milestone 2: Core Game Engine 🟢

**Goal:** Build the fundamental game abstraction layer

### Tasks
- [x] 🟢 Implement phase management system (state machine)
- [x] 🟢 Create player management (join, leave, reconnect)
- [x] 🟢 Build room lifecycle (create, start, end, cleanup)
- [x] 🟢 Design game state synchronization interface
- [x] 🟢 Implement event system for game hooks (`onPhaseChange`, `onPlayerAction`)
- [x] 🟢 Add validation system (player limits, phase transitions)
- [x] 🟢 Write unit tests for core game logic

**Deliverable:** ✅ Working `SocialGame` base class with lifecycle management

**Completed:** February 8, 2026

**What Was Built:**
- **SocialGame class** - Main concrete implementation with full player lifecycle management
- **PlayerManager** - Disconnect/reconnect handling with configurable timeout
- **GameEventEmitter** - Type-safe event system for all lifecycle hooks
- **GameValidator** - Centralized validation for all game rules
- **StateManager** - Immutable state update utilities
- **IStateSynchronizer** - Backend-agnostic interface for state sync
- **Custom Error Classes** - GameError, ValidationError, StateError, PlayerError
- **83 tests, 83.16% coverage** - Comprehensive test suite with integration tests
- **Complete API documentation** - packages/core/README.md with examples
- **Working example** - packages/core/examples/simple-game.ts

**Architecture Documentation:** See `docs/architecture/core-classes.md` for detailed class design and relationships.

**Time to Complete:** ~6 hours of focused development

---

## Milestone 3: Server Infrastructure 🟢

**Goal:** Build backend that handles realtime communication

**Status:** ✅ Complete (All 4 Phases Done)

**Completed:** February 8, 2026

### Phase 1: Foundation ✅ Complete
- [x] 🟢 Set up package dependencies (socket.io, firebase-admin, express, vitest)
- [x] 🟢 Create comprehensive type definitions (ServerConfig, RoomInfo, RoomMetadata, etc.)
- [x] 🟢 Implement room code generator (6-char alphanumeric, no ambiguous chars)
- [x] 🟢 Create custom error classes (RoomNotFoundError, UnauthorizedError, etc.)
- [x] 🟢 Build database abstraction layer (IDatabaseAdapter interface)
- [x] 🟢 Implement InMemoryAdapter for testing
- [x] 🟢 Write foundation tests (46 tests, all passing)

### Phase 2: Room Management Core ✅ Complete
- [x] 🟢 Implement SocketStateSynchronizer (broadcasts state via Socket.io + DB)
- [x] 🟢 Create room management (creation, deletion, tracking)
- [x] 🟢 Handle player connections/disconnections gracefully
- [x] 🟢 Implement automatic room cleanup (TTL for inactive rooms)
- [x] 🟢 Create mock Socket.io helpers for testing
- [x] 🟢 Write comprehensive unit tests (97 tests total, 91.2% coverage)

### Phase 3: Socket.io Integration ✅ Complete
- [x] 🟢 Implement SocketServer class
- [x] 🟢 Wire up client↔server event handlers
- [x] 🟢 Integration tests with real Socket.io client
- [x] 🟢 Add server-side validation and error handling
- [x] 🟢 Create admin utilities (force-end game, kick player)

### Phase 4: Firebase Integration ✅ Complete
- [x] 🟢 Set up Firebase Realtime Database integration
- [x] 🟢 Implement FirebaseAdapter for IDatabaseAdapter
- [x] 🟢 Test with Firebase Emulator
- [x] 🟢 Add Firebase configuration and setup guide

**What Was Built:**
- **FirebaseAdapter class** - Complete implementation of IDatabaseAdapter
  - Firebase SDK initialization with service accounts or emulator
  - All database operations (save, load, update, delete, query)
  - Automatic duplicate app detection
  - Environment-based configuration (emulator vs production)
- **Firebase Emulator setup** - Zero-setup local development
  - `firebase.json` and `database.rules.json` configuration
  - npm scripts for running emulator
  - No Firebase account required for testing!
- **Comprehensive tests** - 30+ tests for FirebaseAdapter (requires emulator to run)
- **Complete setup documentation** - `docs/api/FIREBASE.md` guide covering:
  - Firebase project creation (step-by-step)
  - Service account credentials setup
  - Local development with emulator (zero setup!)
  - Production deployment for Heroku, Railway, Render, GCP
  - Environment variable configuration
  - Troubleshooting guide
- **Example servers:**
  - `examples/firebase-server.ts` - Production server setup
  - `examples/firebase-emulator.ts` - Local development server
- **Security configuration:**
  - `.env.example` template for environment variables
  - `.gitignore` for credentials protection
  - Environment variable best practices
- **Database structure:**
  - `/rooms/{roomId}/state` - Game state storage
  - `/rooms/{roomId}/metadata` - Room tracking data
  - Indexed queries for efficient cleanup operations

**Deliverable:** Server that can manage multiple game rooms simultaneously

**What Was Built:**

**Phases 1-2 (Foundation & Room Management):**
- **RoomManager** - Multi-room orchestration with creation, deletion, player tracking, TTL cleanup
- **SocketStateSynchronizer** - State broadcasting via Socket.io + database persistence
- **IDatabaseAdapter** - Backend-agnostic interface for database operations
- **InMemoryAdapter** - Full in-memory implementation for testing
- **Room code generator** - 6-character alphanumeric codes with collision detection
- **Custom error classes** - RoomNotFoundError, UnauthorizedError, InvalidActionError
- **Mock Socket.io utilities** - Testing helpers for socket operations
- **97 tests, 91.2% coverage** - Comprehensive test suite covering all room lifecycle scenarios
- **Type-safe event system** - ClientToServerEvents and ServerToClientEvents interfaces

**Phase 3 (Socket.io Integration):**
- **SocketServer class** - Express + Socket.io wrapper with full lifecycle management
- **6 client↔server event handlers:**
  - `room:create` - Create new game room with unique code
  - `room:join` - Join existing room as player
  - `room:leave` - Leave current room
  - `game:start` - Start the game
  - `game:action` - Submit game action
  - `state:request` - Request current game state
- **Connection/disconnection handling** - Graceful player disconnect with reconnection support
- **3 admin REST endpoints:**
  - `GET /health` - Health check
  - `GET /admin/stats` - Server statistics (room count, player count, uptime)
  - `POST /admin/force-end/:roomId` - Force-end a room
  - `POST /admin/kick/:roomId/:playerId` - Kick a player from room
- **41 integration tests** - Real Socket.io client testing (1,303 lines across 6 test files)
- **138 total tests passing** - 97 unit + 41 integration tests
- **Production-ready server** - Fully functional multiplayer game hosting

**Phase 4 (Firebase Integration):**
- **FirebaseAdapter class** - Complete implementation of IDatabaseAdapter
  - Firebase SDK initialization with credentials or emulator
  - All database operations (save, load, update, delete, query)
  - Automatic duplicate app detection
  - Environment-based configuration
- **Firebase Emulator setup** - Local development without Firebase account
  - `firebase.json` configuration
  - `database.rules.json` for security rules
  - npm scripts for running emulator
- **Comprehensive tests** - 30+ tests for FirebaseAdapter (requires emulator)
- **Setup documentation** - `docs/api/FIREBASE.md` complete guide:
  - Firebase project creation step-by-step
  - Service account credentials setup
  - Local development with emulator (zero setup!)
  - Production deployment for Heroku, Railway, Render, GCP
  - Environment variable configuration
  - Troubleshooting guide
- **Example servers:**
  - `examples/firebase-server.ts` - Production server
  - `examples/firebase-emulator.ts` - Local development server
- **Security setup:**
  - `.env.example` template
  - `.gitignore` for credentials
  - Environment variable best practices

**Architecture Documentation:** See `docs/architecture/server-infrastructure.md` for detailed design and implementation details.

**Time to Complete:** ~4 hours focused development (Phase 4 only)

**Total Milestone 3 Time:** ~16 hours over 1 day

---

## Milestone 4: Client Library 🟢

**Goal:** Create React hooks and utilities for game UIs

**Status:** ✅ Complete

**Completed:** February 9, 2026

### Tasks
- [x] 🟢 Build `useGameState` hook for state synchronization
- [x] 🟢 Create `usePlayer` hook for player-specific data
- [x] 🟢 Implement `useRoom` hook for room management
- [x] 🟢 Add `usePhase` hook for phase-based rendering
- [x] 🟢 Build connection status indicator (`useConnection` hook)
- [x] 🟢 Handle optimistic updates and conflict resolution (server-authoritative model; optimistic patterns deferred to Milestone 7)
- [x] 🟢 Create error boundary components (`BonfireErrorBoundary`)
- [x] 🟢 Write unit tests with mock client (55 tests, 90.81% coverage)

**Deliverable:** ✅ React hooks that make building game UIs trivial

**What Was Built:**
- **BonfireClient class** - Socket.io wrapper with Promise-based API, subscription model, and internal state tracking
  - Promise wrappers: `createRoom()`, `joinRoom()`, `leaveRoom()`, `startGame()`, `sendAction()`, `requestState()`
  - Subscription API: `onStateChange()`, `onStatusChange()`, `onError()`, `onGameEvent()`, `onRoomClosed()`
  - Typed socket events matching server's `ClientToServerEvents`/`ServerToClientEvents` contracts
- **BonfireProvider** - React context provider accepting pre-created client or config
  - Auto-connect on mount, cleanup on unmount
  - Subscribes to client state/status for reactive rendering
- **6 React hooks:**
  - `useGameState<TState>()` - `useSyncExternalStore`-based state subscription with generic type support
  - `useConnection()` - Connection status tracking with `connect()`/`disconnect()` controls
  - `useRoom()` - Room management (create, join, leave, start) and `sendAction()`
  - `usePlayer()` - Derives current player, isHost, and player list from state
  - `usePhase()` - Current phase value (returns value directly: `const phase = usePhase()`)
  - `useBonfireEvent()` - Typed game event subscription with auto-cleanup
- **BonfireErrorBoundary** - Error boundary component with static/render-function fallback and reset
- **MockBonfireClient** - Test utility for simulating client behavior with state/event simulation methods
- **8 test files, 55 tests, 90.81% coverage** - All hooks at 100% coverage, BonfireClient at 97.4%
  - Architecture: Uses `useSyncExternalStore` for React state synchronization with external Socket.io client
- **Client types** - Duplicated server response types to avoid server package dependency

**Architecture Documentation:** See `docs/architecture/client-library.md` for detailed design.

**Time to Complete:** ~2 hours focused development

---

## Milestone 5: UI Component Library 🟢

**Goal:** Build reusable components for common game patterns

**Status:** ✅ Complete (Feb 12, 2026)

### Phase 1: Infrastructure ✅ Complete
- [x] 🟢 Tailwind CSS v4 configured with @theme directive for design tokens
- [x] 🟢 PostCSS build pipeline (`npm run build:css`)
- [x] 🟢 Storybook 8 installed and configured with BonfireProvider decorator
- [x] 🟢 Design system tokens (colors, spacing, typography, animations)

### Phase 2: Core Components ✅ Complete
- [x] 🟢 `<PlayerAvatar>` - Player initials, deterministic color hash, status indicator, host badge (5 sizes: xs/sm/md/lg/xl, 13 tests)
- [x] 🟢 `<Timer>` - Countdown with circular SVG progress ring, 3 variants (default/warning/danger), 3 sizes (12 tests)
- [x] 🟢 `<Lobby>` - Room code display with clipboard copy, player list, start button (18 tests)
- [x] 🟢 `colorHash` utility - Deterministic color and initials generation from player names (11 tests)

### Phase 3: Input & Display Components ✅ Complete
- [x] 🟢 `<PromptCard>` - Themed prompt display with 4 variants (standard/spicy/creative/dare), category badge, round indicator, subtitle, children slot (16 tests)
- [x] 🟢 `<ResponseInput>` - Polymorphic input: text (single-line/multiline/maxLength), multiple-choice (single/multi-select), ranking (add/reorder/remove) (34 tests)
- [x] 🟢 Storybook stories for all Phase 2-3 components

### Phase 4: Advanced Components ✅ Complete
- [x] 🟢 `<RevealPhase>` - Animated sequential reveal for answers/players (17 tests)
- [x] 🟢 `<GameProgress>` - Round/phase progress indicator (bar/dots/number) (15 tests)
- [x] 🟢 `<VotingInterface>` - Standard voting UI pattern with results display (20 tests)

### Phase 5: Testing & Documentation ✅ Complete
- [x] 🟢 All Phase 4 components have comprehensive tests (205 total tests, all passing)
- [x] 🟢 Storybook stories for all Phase 4 components
- [x] 🟢 Updated README.md, CLAUDE.md, MILESTONES.md, and IN-PROGRESS.md

**What Was Built (Phases 1-4):**
- **8 reusable UI components** exported from `@bonfire/client`: Lobby, PlayerAvatar, Timer, PromptCard, ResponseInput, RevealPhase, GameProgress, VotingInterface
- **colorHash utility** for deterministic player color assignment
- **Storybook 8** with full story coverage for all components
- **Tailwind CSS v4** design system with tokens for brand colors, surface, text variants, animations
- **205 tests** across all components, all passing

**Architecture Documentation:** See `docs/architecture/client-library.md` for component API reference.

**Deliverable:** ✅ Component library with visual documentation

---

## Milestone 6: First Game - Intimacy Ladder v2 🟡

**Goal:** Build complete game using the framework to validate abstractions

### Tasks
- [x] 🟢 Create LOIV2 project structure with curated Bonfire docs
- [x] 🟢 Port question database to TypeScript (levels 1–5, ~200 questions)
- [x] 🟢 Write GAME_DESIGN.md — state model, player actions, turn flow
- [x] 🟢 Write ARCHITECTURE.md — how game uses Bonfire layers
- [x] 🟢 Write docs/bonfire/ — curated server-setup and client-api guides
- [ ] 🔴 Implement `IntimacyLadderGame` extending `SocialGame`
- [ ] 🔴 Implement progressive disclosure mechanic (descending levels)
- [ ] 🔴 Add reflection phase between levels
- [ ] 🔴 Build mobile-responsive UI (screens: Lobby, Select, Answer, Finished)
- [ ] 🔴 Add game settings (start level, questions per level)
- [ ] 🔴 Implement reroll/skip question functionality
- [ ] 🔴 Test with real users, gather feedback
- [ ] 🔴 Document pain points in framework usage

**Deliverable:** Fully functional Intimacy Ladder game proving framework works

**Location:** `~/Documents/Programs/LOIV2/` (standalone project, not in this monorepo)

---

## Milestone 7: Framework Refinement 🔴

**Goal:** Improve framework based on first game experience

### Tasks
- [ ] 🔴 Refactor awkward APIs discovered during game 1
- [ ] 🔴 Add missing features identified during development
- [ ] 🔴 Improve error messages and developer warnings
- [ ] 🔴 Optimize bundle size (code splitting, tree shaking)
- [ ] 🔴 Add performance monitoring hooks
- [ ] 🔴 Improve TypeScript types based on actual usage
- [ ] 🔴 Write migration guide for breaking changes

**Deliverable:** Polished framework ready for game 2

---

## Milestone 8: Second Game - Validation 🔴

**Goal:** Build different game type to prove framework flexibility

### Tasks
- [ ] 🔴 Choose game concept (Two Truths and a Lie, Values Alignment, etc.)
- [ ] 🔴 Implement using framework (should be 5x faster than game 1)
- [ ] 🔴 Identify any missing patterns/components
- [ ] 🔴 Add new components to library if needed
- [ ] 🔴 Document reusability percentage (what % of code is framework vs custom)
- [ ] 🔴 Validate mobile experience
- [ ] 🔴 Test multiplayer with 4-8 players

**Deliverable:** Second complete game with <20% custom code

---

## Milestone 9: CLI Tool 🔴

**Goal:** Create `create-party-game` for easy project scaffolding

### Tasks
- [ ] 🔴 Build CLI script with project name input
- [ ] 🔴 Create template project structure
- [ ] 🔴 Generate boilerplate game class
- [ ] 🔴 Auto-configure package.json dependencies
- [ ] 🔴 Add example game with comments
- [ ] 🔴 Include README with quick start instructions
- [ ] 🔴 Test on fresh machine (verify it "just works")
- [ ] 🔴 Publish to npm as `create-bonfire-game`

**Deliverable:** Working CLI that scaffolds new games in <1 minute

---

## Milestone 10: Documentation Site 🔴

**Goal:** Create comprehensive docs for external developers

### Tasks
- [ ] 🔴 Set up documentation site (Docusaurus/VitePress)
- [ ] 🔴 Write "Quick Start" guide (5-minute tutorial)
- [ ] 🔴 Create step-by-step tutorial (build simple game from scratch)
- [ ] 🔴 Document all API methods and hooks
- [ ] 🔴 Add architecture explanation with diagrams
- [ ] 🔴 Include example games with source code
- [ ] 🔴 Write deployment guide (Vercel, Railway, self-hosted)
- [ ] 🔴 Create troubleshooting section
- [ ] 🔴 Deploy docs site

**Deliverable:** Live documentation site at custom domain

---

## Milestone 11: Third Game - Maturity Test 🔴

**Goal:** Prove framework is production-ready

### Tasks
- [ ] 🔴 Build third game with different mechanic (async, voting-heavy, etc.)
- [ ] 🔴 Development should take <1 day
- [ ] 🔴 Minimal custom code required
- [ ] 🔴 No framework modifications needed
- [ ] 🔴 Passes accessibility audit
- [ ] 🔴 Performance testing (100+ concurrent users)

**Deliverable:** Third game proving framework maturity

---

## Milestone 12: Open Source Preparation 🔴

**Goal:** Prepare for public release

### Tasks
- [ ] 🔴 Write comprehensive README.md
- [ ] 🔴 Add LICENSE (MIT recommended)
- [ ] 🔴 Create CONTRIBUTING.md guidelines
- [ ] 🔴 Set up GitHub issues templates
- [ ] 🔴 Add code of conduct
- [ ] 🔴 Create demo video/GIFs
- [ ] 🔴 Write blog post announcing project
- [ ] �4 Publish all packages to npm
- [ ] 🔴 Create GitHub organization/repo

**Deliverable:** Public GitHub repo ready for contributors

---

## Milestone 13: Community & Growth 🔴

**Goal:** Build adoption and community

### Tasks
- [ ] 🔴 Share on Reddit (r/gamedev, r/webdev)
- [ ] 🔴 Post on Hacker News
- [ ] 🔴 Share in Discord communities
- [ ] 🔴 Create example game showcases
- [ ] 🔴 Respond to first issues/PRs
- [ ] 🔴 Add to awesome lists (awesome-react, awesome-game-development)
- [ ] 🔴 Create roadmap for future features
- [ ] 🔴 Set up analytics (opt-in usage stats)

**Deliverable:** Active community with first external contributors

---

## Bonus Milestones (Future)

### Migration to Railway 🔴
- [ ] 🔴 Implement Railway database adapter
- [ ] 🔴 Build Socket.io server implementation
- [ ] 🔴 Create migration guide from Firebase
- [ ] 🔴 Add cost monitoring utilities
- [ ] 🔴 Test at scale (500+ concurrent users)

### Advanced Features 🔴
- [ ] 🔴 Spectator mode
- [ ] 🔴 Game replay/history
- [ ] 🔴 Custom theming system
- [ ] 🔴 Internationalization (i18n)
- [ ] 🔴 Voice chat integration
- [ ] 🔴 Screen sharing support
- [ ] 🔴 Analytics dashboard for game creators

### Platform Features 🔴
- [ ] 🔴 Game marketplace/directory
- [ ] 🔴 User accounts and game history (optional)
- [ ] 🔴 Content moderation tools
- [ ] 🔴 Mobile native apps (React Native)

---

## Progress Tracking

**Overall Progress:** 5/13 milestones complete (38.5%) — Milestone 6 next

**Current Focus:** Milestone 6 - First Game (Intimacy Ladder v2)

**Last Updated:** February 19, 2026

---

## Notes & Learnings

*Use this section to track insights, decisions, and lessons learned as you build*

- **Milestone 1 (Feb 8, 2026):** Chose npm workspaces over Turborepo for simplicity. Can migrate later if needed.
- **Milestone 1:** Base Game class uses abstract methods for lifecycle hooks, allowing game-specific implementations while enforcing structure.
- **Milestone 1:** TypeScript project references enable proper dependency management between packages.
- **Milestone 2 (Feb 8, 2026):** Composition over inheritance - SocialGame uses PlayerManager and EventEmitter rather than deep class hierarchy.
- **Milestone 2:** Custom EventEmitter (not Node's) for full TypeScript type safety and zero dependencies in core package.
- **Milestone 2:** Backend-agnostic design via IStateSynchronizer interface allows swapping Firebase/Railway without core changes.
- **Milestone 2:** Disconnect handling is complex enough to warrant dedicated PlayerManager class (timers, race conditions, cleanup).
- **Milestone 3 (Feb 8, 2026):** IDatabaseAdapter interface mirrors IStateSynchronizer pattern - backend abstraction enables testing with InMemoryAdapter.
- **Milestone 3:** Mock Socket.io utilities essential for unit testing broadcast/synchronization logic without real server.
- **Milestone 3:** Room code generator excludes ambiguous characters (0/O, 1/I/l) for better usability in physical/verbal contexts.
- **Milestone 3:** RoomManager handles TTL cleanup via intervals - important to clear intervals on shutdown to prevent memory leaks.
- **Milestone 3 (Feb 8, 2026):** FirebaseAdapter uses emulator detection for seamless local→production transitions without code changes.
- **Milestone 3:** Firebase Emulator enables zero-setup local development - no Firebase account or credentials needed for testing!
- **Milestone 4 (Feb 9, 2026):** `useSyncExternalStore` is the correct React 18 pattern for subscribing to external stores (BonfireClient) — prevents tearing in concurrent mode.
- **Milestone 4:** Duplicating server response types in the client avoids pulling in Node.js-only server deps (Express, firebase-admin) — clean client/server boundary.
- **Milestone 4:** MockBonfireClient with `simulate*` methods mirrors the real client's subscription API, enabling fast hook unit tests without sockets.
- **Milestone 4:** Server-authoritative model (no client-side optimistic update machinery) is sufficient for turn-based social games. Can revisit in Milestone 7 if needed.

