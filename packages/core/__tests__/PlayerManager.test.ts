/**
 * Tests for PlayerManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlayerManager } from '../src/players/PlayerManager';
import { createTestPlayer, createTestConfig } from './helpers';
import { PlayerError } from '../src/validation/errors';

describe('PlayerManager', () => {
  let manager: PlayerManager;

  beforeEach(() => {
    vi.useFakeTimers();
    const config = createTestConfig({ disconnectTimeout: 1000 });
    manager = new PlayerManager(config);
  });

  afterEach(() => {
    manager.cleanup();
    vi.restoreAllMocks();
  });

  describe('addPlayer', () => {
    it('should add a new player', () => {
      const player = createTestPlayer({ id: 'p1' });
      manager.addPlayer(player);

      expect(manager.getPlayerIds()).toContain('p1');
      expect(manager.isConnected('p1')).toBe(true);
    });

    it('should throw when adding duplicate player', () => {
      const player = createTestPlayer({ id: 'p1' });
      manager.addPlayer(player);

      expect(() => manager.addPlayer(player)).toThrow(PlayerError);
    });
  });

  describe('removePlayer', () => {
    it('should remove a player', () => {
      const player = createTestPlayer({ id: 'p1' });
      manager.addPlayer(player);
      manager.removePlayer('p1');

      expect(manager.getPlayerIds()).not.toContain('p1');
    });

    it('should clear timeout timer when removing disconnected player', () => {
      const player = createTestPlayer({ id: 'p1' });
      const onTimeout = vi.fn();

      manager.addPlayer(player);
      manager.disconnect('p1', onTimeout);
      manager.removePlayer('p1');

      vi.advanceTimersByTime(2000);
      expect(onTimeout).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should mark player as disconnected', () => {
      const player = createTestPlayer({ id: 'p1' });
      const onTimeout = vi.fn();

      manager.addPlayer(player);
      manager.disconnect('p1', onTimeout);

      expect(manager.isConnected('p1')).toBe(false);
      const connection = manager.getConnection('p1');
      expect(connection?.disconnectedAt).toBeDefined();
    });

    it('should call timeout callback after timeout period', () => {
      const player = createTestPlayer({ id: 'p1' });
      const onTimeout = vi.fn();

      manager.addPlayer(player);
      manager.disconnect('p1', onTimeout);

      expect(onTimeout).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(onTimeout).toHaveBeenCalledWith('p1');
    });

    it('should throw when disconnecting non-existent player', () => {
      const onTimeout = vi.fn();
      expect(() => manager.disconnect('p1', onTimeout)).toThrow(PlayerError);
    });

    it('should clear old timer when disconnecting again', () => {
      const player = createTestPlayer({ id: 'p1' });
      const onTimeout1 = vi.fn();
      const onTimeout2 = vi.fn();

      manager.addPlayer(player);
      manager.disconnect('p1', onTimeout1);
      vi.advanceTimersByTime(500);

      manager.disconnect('p1', onTimeout2);
      vi.advanceTimersByTime(600); // Total 1100ms, but new timer should trigger at 1500ms

      expect(onTimeout1).not.toHaveBeenCalled();
      expect(onTimeout2).not.toHaveBeenCalled();

      vi.advanceTimersByTime(400);
      expect(onTimeout2).toHaveBeenCalled();
    });
  });

  describe('reconnect', () => {
    it('should mark player as connected', () => {
      const player = createTestPlayer({ id: 'p1' });
      const onTimeout = vi.fn();

      manager.addPlayer(player);
      manager.disconnect('p1', onTimeout);
      manager.reconnect('p1');

      expect(manager.isConnected('p1')).toBe(true);
      const connection = manager.getConnection('p1');
      expect(connection?.disconnectedAt).toBeUndefined();
    });

    it('should cancel timeout timer', () => {
      const player = createTestPlayer({ id: 'p1' });
      const onTimeout = vi.fn();

      manager.addPlayer(player);
      manager.disconnect('p1', onTimeout);
      manager.reconnect('p1');

      vi.advanceTimersByTime(2000);
      expect(onTimeout).not.toHaveBeenCalled();
    });

    it('should throw when reconnecting non-existent player', () => {
      expect(() => manager.reconnect('p1')).toThrow(PlayerError);
    });
  });

  describe('cleanup', () => {
    it('should clear all timers and connections', () => {
      const player1 = createTestPlayer({ id: 'p1' });
      const player2 = createTestPlayer({ id: 'p2' });
      const onTimeout = vi.fn();

      manager.addPlayer(player1);
      manager.addPlayer(player2);
      manager.disconnect('p1', onTimeout);
      manager.disconnect('p2', onTimeout);

      manager.cleanup();

      expect(manager.getPlayerIds()).toHaveLength(0);
      vi.advanceTimersByTime(2000);
      expect(onTimeout).not.toHaveBeenCalled();
    });
  });

  describe('getConnection', () => {
    it('should return connection info', () => {
      const player = createTestPlayer({ id: 'p1' });
      manager.addPlayer(player);

      const connection = manager.getConnection('p1');
      expect(connection).toBeDefined();
      expect(connection?.playerId).toBe('p1');
      expect(connection?.isConnected).toBe(true);
    });

    it('should return undefined for non-existent player', () => {
      expect(manager.getConnection('p1')).toBeUndefined();
    });
  });
});
