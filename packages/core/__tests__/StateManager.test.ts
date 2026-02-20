/**
 * Tests for StateManager utility class
 */

import { describe, it, expect } from 'vitest';
import { StateManager } from '../src/state/StateManager';
import type { GameState } from '../src/types';

const baseState: GameState = {
  roomId: 'room-1',
  phase: 'lobby',
  players: [
    {
      id: 'p1',
      name: 'Alice',
      isHost: true,
      isConnected: true,
      joinedAt: 1000,
    },
  ],
  metadata: { round: 1 },
};

describe('StateManager', () => {
  describe('updateState', () => {
    it('should merge partial updates into existing state', () => {
      const updated = StateManager.updateState(baseState, { phase: 'playing' });
      expect(updated.phase).toBe('playing');
    });

    it('should preserve fields not included in the update', () => {
      const updated = StateManager.updateState(baseState, { phase: 'playing' });
      expect(updated.roomId).toBe('room-1');
      expect(updated.players).toHaveLength(1);
      expect(updated.metadata).toEqual({ round: 1 });
    });

    it('should overwrite metadata with new value', () => {
      const updated = StateManager.updateState(baseState, { metadata: { round: 2, score: 100 } });
      expect(updated.metadata).toEqual({ round: 2, score: 100 });
    });

    it('should allow setting optional fields', () => {
      const updated = StateManager.updateState(baseState, { startedAt: 5000, endedAt: 9000 });
      expect(updated.startedAt).toBe(5000);
      expect(updated.endedAt).toBe(9000);
    });

    it('should return a new object (not the same reference)', () => {
      const updated = StateManager.updateState(baseState, { phase: 'playing' });
      expect(updated).not.toBe(baseState);
    });

    it('should handle empty updates (no-op)', () => {
      const updated = StateManager.updateState(baseState, {});
      expect(updated).toEqual(baseState);
      expect(updated).not.toBe(baseState); // New object
    });

    it('should replace players array when provided', () => {
      const newPlayers = [
        { id: 'p2', name: 'Bob', isHost: false, isConnected: true, joinedAt: 2000 },
      ];
      const updated = StateManager.updateState(baseState, { players: newPlayers });
      expect(updated.players).toHaveLength(1);
      expect(updated.players[0].id).toBe('p2');
    });
  });

  describe('cloneState', () => {
    it('should return a deep clone of the state', () => {
      const cloned = StateManager.cloneState(baseState);
      expect(cloned).toEqual(baseState);
      expect(cloned).not.toBe(baseState);
    });

    it('should deeply clone nested objects', () => {
      const cloned = StateManager.cloneState(baseState);
      expect(cloned.players).not.toBe(baseState.players);
      expect(cloned.players[0]).not.toBe(baseState.players[0]);
    });

    it('should deeply clone metadata', () => {
      const cloned = StateManager.cloneState(baseState);
      expect(cloned.metadata).not.toBe(baseState.metadata);
      expect(cloned.metadata).toEqual(baseState.metadata);
    });

    it('should clone state without optional fields', () => {
      const minimalState: GameState = {
        roomId: 'room-2',
        phase: 'waiting',
        players: [],
      };
      const cloned = StateManager.cloneState(minimalState);
      expect(cloned).toEqual(minimalState);
      expect(cloned.startedAt).toBeUndefined();
      expect(cloned.endedAt).toBeUndefined();
    });
  });

  describe('validateStateUpdate', () => {
    it('should return true for a valid state', () => {
      expect(StateManager.validateStateUpdate(baseState)).toBe(true);
    });

    it('should return true for minimal valid state', () => {
      const minimal: GameState = {
        roomId: 'room-x',
        phase: 'lobby',
        players: [],
      };
      expect(StateManager.validateStateUpdate(minimal)).toBe(true);
    });

    it('should return false when roomId is missing', () => {
      const invalid = { ...baseState, roomId: '' };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when roomId is not a string', () => {
      const invalid = { ...baseState, roomId: 123 as any };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when phase is missing', () => {
      const invalid = { ...baseState, phase: '' };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when phase is not a string', () => {
      const invalid = { ...baseState, phase: null as any };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when players is not an array', () => {
      const invalid = { ...baseState, players: null as any };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when a player is missing id', () => {
      const invalid: GameState = {
        ...baseState,
        players: [{ id: '', name: 'Alice', isHost: true, isConnected: true, joinedAt: 1000 }],
      };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when a player is missing name', () => {
      const invalid: GameState = {
        ...baseState,
        players: [{ id: 'p1', name: '', isHost: true, isConnected: true, joinedAt: 1000 }],
      };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when isHost is not a boolean', () => {
      const invalid: GameState = {
        ...baseState,
        players: [{ id: 'p1', name: 'Alice', isHost: 'yes' as any, isConnected: true, joinedAt: 1000 }],
      };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when isConnected is not a boolean', () => {
      const invalid: GameState = {
        ...baseState,
        players: [{ id: 'p1', name: 'Alice', isHost: true, isConnected: 1 as any, joinedAt: 1000 }],
      };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return false when joinedAt is not a number', () => {
      const invalid: GameState = {
        ...baseState,
        players: [{ id: 'p1', name: 'Alice', isHost: true, isConnected: true, joinedAt: '1000' as any }],
      };
      expect(StateManager.validateStateUpdate(invalid)).toBe(false);
    });

    it('should return true for state with multiple valid players', () => {
      const state: GameState = {
        roomId: 'room-3',
        phase: 'playing',
        players: [
          { id: 'p1', name: 'Alice', isHost: true, isConnected: true, joinedAt: 1000 },
          { id: 'p2', name: 'Bob', isHost: false, isConnected: false, joinedAt: 2000 },
        ],
      };
      expect(StateManager.validateStateUpdate(state)).toBe(true);
    });
  });
});
