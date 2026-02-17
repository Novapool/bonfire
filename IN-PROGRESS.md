# IN-PROGRESS - Bonfire

**Last Updated:** February 17, 2026 (Milestone 6 Started)

---

## Current Work

### Milestone 6 - First Game: Intimacy Ladder v2 (IN PROGRESS)
- Status: 🟡 In Progress — scaffolding done, implementation next
- Goal: Build a complete game using the framework to validate abstractions
- Location: `~/Documents/Programs/LOIV2/` (standalone project)

---

## Active Plan

LOIV2 is a standalone project that consumes Bonfire as a dependency via local `file:` references.
It has its own `CLAUDE.md`, `IN-PROGRESS.md`, and `docs/` with everything needed for implementation.

**Next implementation steps (work in LOIV2):**
1. Implement `IntimacyLadderGame` in `LOIV2/server/src/game.ts`
2. Wire up `SocketServer` in `LOIV2/server/src/index.ts`
3. Build React screens in `LOIV2/client/src/screens/`

---

## Recently Completed

1. **Milestone 6 - LOIV2 Project Scaffolded** (Feb 17, 2026)
   - Created `~/Documents/Programs/LOIV2/` as standalone project
   - Ported question bank (5 levels, ~200 questions) from LOI v1 to TypeScript
   - Wrote complete game design doc: state model, player actions, turn flow
   - Wrote architecture doc: how game uses Bonfire layers
   - Wrote curated Bonfire docs (server-setup + client-api) for LOIV2 sessions
   - Set up package.json with `file:` references to Bonfire packages
   - Created placeholder entry points ready for implementation

2. **Milestone 5 - UI Components Phase 4** (Feb 12, 2026)
   - Built `<RevealPhase>` - Sequential animated reveal for answers/players, supports custom renderItem, configurable delay, onRevealComplete callback
   - Built `<GameProgress>` - Progress indicator with bar/dots/number variants, all with ARIA progressbar role
   - Built `<VotingInterface>` - Full voting UI with results display, vote counts, percentages, winner highlighting
   - Added Storybook stories for all 3 Phase 4 components
   - Exported all new components from @bonfire/client index.ts
   - **205 total tests, all passing** (46 new for Phase 4)
   - Updated all documentation (CLAUDE.md, MILESTONES.md, IN-PROGRESS.md, client CLAUDE.md, client README.md)

2. **Milestone 5 - UI Components Phase 3** (Feb 12, 2026)
   - Built PromptCard with 4 variants (standard/spicy/creative/dare), category badge, round indicator
   - Built ResponseInput: text (single/multiline), multiple-choice (single/multi-select), ranking modes
   - Exported all 5 components + colorHash utility from @bonfire/client index
   - Added Storybook stories for both components (including combined PromptCard+ResponseInput demo)
   - 159 tests total (100 new for Phase 3), all passing

3. **Milestone 5 - UI Components Phase 1-2** (Feb 11, 2026)
   - Set up Tailwind CSS v4 with @theme directive for design tokens
   - Configured Storybook 8 with BonfireProvider decorator
   - Built 3 core components: Lobby, Timer, PlayerAvatar
   - Created colorHash utility for deterministic player colors
   - Wrote 59 tests (48 component + 11 utility), all passing

---

## Blockers

*None currently*

---

## Next Steps

1. **Short-term (Next Sprint — Milestone 6):**
   - Create new package or app for Intimacy Ladder v2
   - Design game state structure (phases, question levels, player actions)
   - Port existing game logic and question database

2. **Medium-term (Milestone 7+):**
   - Framework refinement based on Intimacy Ladder experience
   - Build second game to prove framework flexibility
   - CLI tool (`create-bonfire-game`) for scaffolding new games
   - Documentation site (Docusaurus/VitePress)

---

## Notes & Context

**Current Architecture:**
- Monorepo structure with TypeScript
- Three main packages: @bonfire/core, /server, /client
- Using npm workspaces for dependency management

**UI Component Library Summary (Milestone 5 Complete):**
- 8 components: Lobby, PlayerAvatar, Timer, PromptCard, ResponseInput, RevealPhase, GameProgress, VotingInterface
- 1 utility: colorHash
- 205 tests, all passing
- Storybook 8 with full story coverage
- Tailwind CSS v4 with design system tokens

**Key Decisions:**
- Chose npm workspaces over Turborepo for simplicity (can migrate later)
- useSyncExternalStore for hook state subscriptions (React 18 best practice)
- Server-authoritative model — no client-side optimistic update machinery
- Shared contract types in @bonfire/core/contracts.ts (client/server import from single source)

**Documentation Status:**
- Root CLAUDE.md ✅ (updated Feb 12, 2026 - Milestone 5 complete)
- docs/PROJECT_OVERVIEW.md ✅
- docs/MILESTONES.md ✅ (updated Feb 12, 2026 - Milestone 5 complete, 5/13 done)
- docs/architecture/core-classes.md ✅
- docs/architecture/server-infrastructure.md ✅
- docs/architecture/client-library.md ✅
- docs/api/FIREBASE.md ✅
- docs/api/ADMIN_API.md ✅
- IN-PROGRESS.md ✅ (updated Feb 12, 2026)
- packages/core/README.md ✅
- packages/server/README.md ✅
- packages/server/CLAUDE.md ✅
- packages/client/README.md ✅
- packages/client/CLAUDE.md ✅
