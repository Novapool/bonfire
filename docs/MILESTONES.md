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

## Milestone 3: Server Infrastructure 🔴

**Goal:** Build backend that handles realtime communication

### Tasks
- [ ] 🔴 Set up Firebase Realtime Database integration
- [ ] 🔴 Implement Socket.io server wrapper
- [ ] 🔴 Create room management (creation, joining, closing)
- [ ] 🔴 Handle player connections/disconnections gracefully
- [ ] 🔴 Build database abstraction layer (for future migration)
- [ ] 🔴 Implement automatic room cleanup (TTL for inactive rooms)
- [ ] 🔴 Add server-side validation and error handling
- [ ] 🔴 Create admin utilities (force-end game, kick player)

**Deliverable:** Server that can manage multiple game rooms simultaneously

---

## Milestone 4: Client Library 🔴

**Goal:** Create React hooks and utilities for game UIs

### Tasks
- [ ] 🔴 Build `useGameState` hook for state synchronization
- [ ] 🔴 Create `usePlayer` hook for player-specific data
- [ ] 🔴 Implement `useRoom` hook for room management
- [ ] 🔴 Add `usePhase` hook for phase-based rendering
- [ ] 🔴 Build connection status indicator
- [ ] 🔴 Handle optimistic updates and conflict resolution
- [ ] 🔴 Create error boundary components
- [ ] 🔴 Write integration tests with mock server

**Deliverable:** React hooks that make building game UIs trivial

---

## Milestone 5: UI Component Library 🔴

**Goal:** Build reusable components for common game patterns

### Tasks
- [ ] 🔴 `<Lobby>` - Room code display, player list, ready states
- [ ] 🔴 `<PromptCard>` - Themed question/prompt display
- [ ] 🔴 `<ResponseInput>` - Text, multiple choice, ranking inputs
- [ ] 🔴 `<Timer>` - Countdown with visual feedback
- [ ] 🔴 `<RevealPhase>` - Animated answer reveals
- [ ] 🔴 `<PlayerAvatar>` - Consistent player representation
- [ ] 🔴 `<GameProgress>` - Round/phase indicators
- [ ] 🔴 `<VotingInterface>` - Standard voting UI patterns
- [ ] 🔴 Create Storybook documentation for all components
- [ ] 🔴 Add Tailwind CSS theming system

**Deliverable:** Component library with visual documentation

---

## Milestone 6: First Game - Intimacy Ladder v2 🔴

**Goal:** Build complete game using the framework to validate abstractions

### Tasks
- [ ] 🔴 Port Intimacy Ladder to new framework
- [ ] 🔴 Implement progressive disclosure mechanic
- [ ] 🔴 Add reflection phase between rounds
- [ ] 🔴 Create question database with levels
- [ ] 🔴 Build mobile-responsive UI
- [ ] 🔴 Add game settings (customize levels, time limits)
- [ ] 🔴 Implement "skip question" functionality
- [ ] 🔴 Test with real users, gather feedback
- [ ] 🔴 Document pain points in framework usage

**Deliverable:** Fully functional Intimacy Ladder game proving framework works

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

**Overall Progress:** 2/13 milestones complete (15.4%)

**Current Focus:** Milestone 3 - Server Infrastructure

**Last Updated:** February 8, 2026

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

