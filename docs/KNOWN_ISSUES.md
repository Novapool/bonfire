# Known Issues & Blockers

Active bugs and framework gaps discovered during development.

**Workflow:** Add issues here when found. Remove (or move to "Recently Fixed") once confirmed fixed.

---

## Active Issues

_No active issues. All known blockers have been resolved._

---

## Recently Fixed

### ~~`broadcastEvent` missing on SocialGame~~ ✅ Fixed Feb 19, 2026
**Symptom:** No clean way for game subclasses to push one-time custom events (e.g. `question_revealed`, `round_ended`) to clients. The underlying `synchronizer.broadcastEvent` was typed to framework-internal `GameEventType` only.
**Fix:** Added `broadcastCustomEvent(type, payload)` to `IStateSynchronizer` interface, implemented in `SocketStateSynchronizer`, and exposed as `protected broadcastEvent(type, payload)` on `SocialGame` for game subclasses to call.
**Usage:**
```typescript
// In your game class:
await this.broadcastEvent('question_revealed', { question, level });
```

---

### ~~`playerOrder` missing from base GameState~~ ✅ Fixed Feb 19, 2026
**Symptom:** Every turn-based game needs a player turn order, but `GameState` had no field for it, forcing games to manage this in custom metadata or a separate field.
**Fix:** Added `playerOrder?: PlayerId[]` as an optional field on `GameState` in `packages/core/src/types.ts`.
**Usage:**
```typescript
// Initialize in your game state:
playerOrder: players.map(p => p.id),
// Or shuffle:
playerOrder: shuffleArray(players.map(p => p.id)),
```

---

### ~~UI components missing `style` prop~~ ✅ Fixed Feb 19, 2026
**Symptom:** All 8 UI components accepted `className` but not `style`, making it impossible to apply inline styles (e.g. custom brand colors, dynamic values) without wrapping in a container div.
**Fix:** Added `style?: React.CSSProperties` to all 8 component prop interfaces (`Lobby`, `Timer`, `PlayerAvatar`, `PromptCard`, `ResponseInput`, `GameProgress`, `RevealPhase`, `VotingInterface`). `PlayerAvatar` merges the prop with its internal `backgroundColor` style.

---

### ~~UI components use custom Tailwind tokens~~ ✅ Fixed Feb 19, 2026
**Symptom:** Components referenced non-existent tokens (`bg-surface`, `text-brand-primary`, etc.) that would not work in consumer projects without copying the Bonfire Tailwind config.
**Fix:** Replaced all custom tokens with standard Tailwind v4 utilities across all 8 components and stories.

---

### ~~`SocketServer.handleGameAction` was a stub~~ ✅ Fixed Feb 19, 2026
**Symptom:** Game actions sent from clients were silently dropped — `handleGameAction` existed but did not delegate to `room.game.handleAction()`.
**Fix:** Wired up the delegation in `SocketServer`.

---

### ~~API documentation had wrong signatures~~ ✅ Fixed Feb 19, 2026
**Symptom:** Docs showed incorrect hook return keys and function signatures, causing silent failures.
**Fix:** Corrected in README.md, architecture doc, and CLAUDE.md:
- `usePlayer()` → key is `player`, not `currentPlayer`
- `sendAction(type, payload)` → two separate args, not one object
- `usePhase()` → returns value directly, not `{ phase }`
- `BonfireProvider` → use `config` prop, not `serverUrl`
