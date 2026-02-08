# Party Game Framework

An open-source TypeScript framework for building social party games - "Rails for party games".

## Current Status
Milestone 1: Foundation & Architecture (Not Started)

## Documentation

**When working on this project, read documentation based on what you're doing:**

- `docs/PROJECT_OVERVIEW.md` - Architecture, tech stack, philosophy, features
  - Read when: Understanding project goals, making architectural decisions, choosing tech

- `docs/MILESTONES.md` - Development roadmap with detailed tasks
  - Read when: Planning work, checking project status, understanding priorities

**Future documentation (create as needed):**
- `docs/SETUP.md` - Local development setup instructions
- `docs/api/` - API integrations (Firebase, Socket.io, etc.)
- `docs/architecture/` - System design, component structure, data flow

## Project Structure

Currently minimal (pre-Milestone 1):
- `docs/` - Project documentation
- Future: Monorepo with `@party-game-framework/core`, `/server`, `/client` packages

## Tech Stack

- **Language:** TypeScript
- **Monorepo:** npm workspaces or Turborepo (TBD)
- **Realtime:** Socket.io
- **Frontend:** React
- **Backend (MVP):** Firebase Realtime Database
- **Backend (Production):** Railway + PostgreSQL + Redis
