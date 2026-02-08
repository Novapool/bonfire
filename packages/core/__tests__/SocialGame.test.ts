/**
 * Tests for SocialGame
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  TestGame,
  MockStateSynchronizer,
  createTestPlayer,
  createTestState,
  createTestConfig,
} from './helpers';
import type { GameState } from '../src/types';

describe('SocialGame', () => {
  let game: TestGame;
  let synchronizer: MockStateSynchronizer<GameState>;

  beforeEach(() => {
    vi.useFakeTimers();
    synchronizer = new MockStateSynchronizer<GameState>();
    const initialState = createTestState();
    game = new TestGame('test-room', initialState, {}, synchronizer);
  });

  afterEach(() => {
    game.closeRoom();
    vi.restoreAllMocks();
  });

  describe('joinPlayer', () => {
    it('should successfully add a player', async () => {
      const player = createTestPlayer({ id: 'p1', name: 'Alice' });
      const result = await game.joinPlayer(player);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(player);
      expect(game.getPlayers()).toHaveLength(1);
      expect(game.getPlayer('p1')).toEqual(player);
    });

    it('should call onPlayerJoin hook', async () => {
      const player = createTestPlayer({ id: 'p1' });
      await game.joinPlayer(player);

      expect(game.onPlayerJoinCalls).toHaveLength(1);
      expect(game.onPlayerJoinCalls[0]).toEqual(player);
    });

    it('should emit player:joined event', async () => {
      const player = createTestPlayer({ id: 'p1' });
      const handler = vi.fn();

      game.on('player:joined', handler);
      await game.joinPlayer(player);

      expect(handler).toHaveBeenCalledWith({ player });
    });

    it('should sync state after join', async () => {
      const player = createTestPlayer({ id: 'p1' });
      await game.joinPlayer(player);

      expect(synchronizer.broadcastStateCalls.length).toBeGreaterThan(0);
      const lastState = synchronizer.broadcastStateCalls[synchronizer.broadcastStateCalls.length - 1];
      expect(lastState.players).toHaveLength(1);
    });

    it('should reject duplicate player', async () => {
      const player = createTestPlayer({ id: 'p1' });
      await game.joinPlayer(player);

      const result = await game.joinPlayer(player);
      expect(result.success).toBe(false);
      expect(result.error).toContain('already joined');
    });

    it('should reject when game is full', async () => {
      game = new TestGame('test-room', createTestState(), { maxPlayers: 2 }, synchronizer);

      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      await game.joinPlayer(createTestPlayer({ id: 'p2' }));

      const result = await game.joinPlayer(createTestPlayer({ id: 'p3' }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('full');
    });
  });

  describe('leavePlayer', () => {
    beforeEach(async () => {
      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      synchronizer.reset();
    });

    it('should successfully remove a player', async () => {
      const result = await game.leavePlayer('p1');

      expect(result.success).toBe(true);
      expect(game.getPlayers()).toHaveLength(0);
    });

    it('should call onPlayerLeave hook', async () => {
      await game.leavePlayer('p1');

      expect(game.onPlayerLeaveCalls).toHaveLength(1);
      expect(game.onPlayerLeaveCalls[0]).toBe('p1');
    });

    it('should emit player:left event', async () => {
      const handler = vi.fn();
      game.on('player:left', handler);

      await game.leavePlayer('p1');

      expect(handler).toHaveBeenCalledWith({ playerId: 'p1', reason: 'manual' });
    });

    it('should sync state after leave', async () => {
      await game.leavePlayer('p1');

      expect(synchronizer.broadcastStateCalls.length).toBeGreaterThan(0);
    });

    it('should reject removing non-existent player', async () => {
      const result = await game.leavePlayer('p999');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('disconnectPlayer', () => {
    beforeEach(async () => {
      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      synchronizer.reset();
    });

    it('should mark player as disconnected', async () => {
      const result = await game.disconnectPlayer('p1');

      expect(result.success).toBe(true);
      const player = game.getPlayer('p1');
      expect(player?.isConnected).toBe(false);
    });

    it('should emit player:disconnected event', async () => {
      const handler = vi.fn();
      game.on('player:disconnected', handler);

      await game.disconnectPlayer('p1');

      expect(handler).toHaveBeenCalledWith({ playerId: 'p1' });
    });

    it('should remove player after timeout', async () => {
      await game.disconnectPlayer('p1');

      expect(game.getPlayers()).toHaveLength(1);

      vi.advanceTimersByTime(1000); // Default timeout in test config
      await vi.runAllTimersAsync();

      expect(game.getPlayers()).toHaveLength(0);
      expect(game.onPlayerLeaveCalls).toContain('p1');
    });

    it('should emit timeout reason when player times out', async () => {
      const handler = vi.fn();
      game.on('player:left', handler);

      await game.disconnectPlayer('p1');
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(handler).toHaveBeenCalledWith({ playerId: 'p1', reason: 'timeout' });
    });
  });

  describe('reconnectPlayer', () => {
    beforeEach(async () => {
      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      await game.disconnectPlayer('p1');
      synchronizer.reset();
    });

    it('should mark player as connected', async () => {
      const result = await game.reconnectPlayer('p1');

      expect(result.success).toBe(true);
      const player = game.getPlayer('p1');
      expect(player?.isConnected).toBe(true);
    });

    it('should emit player:reconnected event', async () => {
      const handler = vi.fn();
      game.on('player:reconnected', handler);

      await game.reconnectPlayer('p1');

      expect(handler).toHaveBeenCalledWith({ playerId: 'p1' });
    });

    it('should cancel timeout timer', async () => {
      await game.reconnectPlayer('p1');

      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();

      expect(game.getPlayers()).toHaveLength(1); // Player still in game
    });

    it('should send state to reconnected player', async () => {
      await game.reconnectPlayer('p1');

      expect(synchronizer.sendToPlayerCalls).toHaveLength(1);
      expect(synchronizer.sendToPlayerCalls[0].playerId).toBe('p1');
    });
  });

  describe('startGame', () => {
    beforeEach(async () => {
      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      await game.joinPlayer(createTestPlayer({ id: 'p2' }));
      synchronizer.reset();
    });

    it('should successfully start game', async () => {
      const result = await game.startGame();

      expect(result.success).toBe(true);
      expect(game.getState().startedAt).toBeDefined();
      expect(game.getRoomStatus()).toBe('playing');
    });

    it('should call onGameStart hook', async () => {
      await game.startGame();

      expect(game.onGameStartCalls).toBe(1);
    });

    it('should emit game:started event', async () => {
      const handler = vi.fn();
      game.on('game:started', handler);

      await game.startGame();

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].startedAt).toBeDefined();
    });

    it('should reject starting with not enough players', async () => {
      game = new TestGame(
        'test-room',
        createTestState({ players: [createTestPlayer()] }),
        { minPlayers: 2 },
        synchronizer
      );

      const result = await game.startGame();
      expect(result.success).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('should reject starting already started game', async () => {
      await game.startGame();

      const result = await game.startGame();
      expect(result.success).toBe(false);
      expect(result.error).toContain('already started');
    });
  });

  describe('endGame', () => {
    beforeEach(async () => {
      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      await game.joinPlayer(createTestPlayer({ id: 'p2' }));
      await game.startGame();
      synchronizer.reset();
    });

    it('should successfully end game', async () => {
      const result = await game.endGame();

      expect(result.success).toBe(true);
      expect(game.getState().endedAt).toBeDefined();
      expect(game.getRoomStatus()).toBe('ended');
    });

    it('should call onGameEnd hook', async () => {
      await game.endGame();

      expect(game.onGameEndCalls).toBe(1);
    });

    it('should emit game:ended event', async () => {
      const handler = vi.fn();
      game.on('game:ended', handler);

      await game.endGame();

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].endedAt).toBeDefined();
    });

    it('should reject ending not started game', async () => {
      game = new TestGame('test-room', createTestState(), {}, synchronizer);

      const result = await game.endGame();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not started');
    });
  });

  describe('closeRoom', () => {
    it('should cleanup and close room', async () => {
      const handler = vi.fn();
      game.on('room:closed', handler);

      const result = await game.closeRoom();

      expect(result.success).toBe(true);
      expect(game.getRoomStatus()).toBe('closed');
      expect(handler).toHaveBeenCalledWith({ roomId: 'test-room' });
    });

    it('should remove all event listeners', async () => {
      const handler = vi.fn();
      game.on('player:joined', handler);

      await game.closeRoom();

      const player = createTestPlayer();
      await game.joinPlayer(player);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('event system', () => {
    it('should support on/off for events', async () => {
      const handler = vi.fn();

      game.on('player:joined', handler);
      const player = createTestPlayer();
      await game.joinPlayer(player);

      expect(handler).toHaveBeenCalledTimes(1);

      game.off('player:joined', handler);
      await game.joinPlayer(createTestPlayer({ id: 'p2' }));

      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('state synchronization', () => {
    it('should broadcast events through synchronizer', async () => {
      const player = createTestPlayer();
      await game.joinPlayer(player);

      const eventCalls = synchronizer.broadcastEventCalls;
      expect(eventCalls.some((call) => call.event === 'player:joined')).toBe(true);
    });

    it('should work without synchronizer', async () => {
      game = new TestGame('test-room', createTestState(), {}, null);

      const player = createTestPlayer();
      const result = await game.joinPlayer(player);

      expect(result.success).toBe(true);
      expect(game.getPlayers()).toHaveLength(1);
    });
  });

  describe('canStart and canPlayerJoin', () => {
    it('should report canStart correctly', async () => {
      expect(game.canStart()).toBe(false); // No players

      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      expect(game.canStart()).toBe(false); // 1 player, need 2

      await game.joinPlayer(createTestPlayer({ id: 'p2' }));
      expect(game.canStart()).toBe(true); // 2 players, can start

      await game.startGame();
      expect(game.canStart()).toBe(false); // Already started
    });

    it('should report canPlayerJoin correctly', async () => {
      game = new TestGame('test-room', createTestState(), { maxPlayers: 2 }, synchronizer);

      expect(game.canPlayerJoin()).toBe(true);

      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      expect(game.canPlayerJoin()).toBe(true);

      await game.joinPlayer(createTestPlayer({ id: 'p2' }));
      expect(game.canPlayerJoin()).toBe(false); // Full
    });
  });
});
