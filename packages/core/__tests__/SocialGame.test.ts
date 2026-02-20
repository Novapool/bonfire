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

    it('should return error when onPlayerJoin throws', async () => {
      const player = createTestPlayer({ id: 'p1' });
      vi.spyOn(game, 'onPlayerJoin').mockRejectedValueOnce(new Error('join hook failed'));

      const result = await game.joinPlayer(player);
      expect(result.success).toBe(false);
      expect(result.error).toBe('join hook failed');
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

    it('should return error when onPlayerLeave throws', async () => {
      vi.spyOn(game, 'onPlayerLeave').mockRejectedValueOnce(new Error('leave hook failed'));

      const result = await game.leavePlayer('p1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('leave hook failed');
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

    it('should reject disconnecting non-existent player', async () => {
      const result = await game.disconnectPlayer('p999');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
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

    it('should succeed without calling sendToPlayer when synchronizer is null', async () => {
      // Create a game without sync, go through the full join/disconnect cycle
      const gameWithoutSync = new TestGame('room', createTestState(), {}, null);
      await gameWithoutSync.joinPlayer(createTestPlayer({ id: 'p1' }));
      await gameWithoutSync.disconnectPlayer('p1');

      const result = await gameWithoutSync.reconnectPlayer('p1');
      expect(result.success).toBe(true);
      const player = gameWithoutSync.getPlayer('p1');
      expect(player?.isConnected).toBe(true);

      await gameWithoutSync.closeRoom();
    });

    it('should reject reconnecting non-existent player', async () => {
      const result = await game.reconnectPlayer('p999');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
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

    it('should return error when onGameStart throws', async () => {
      vi.spyOn(game, 'onGameStart').mockRejectedValueOnce(new Error('start hook failed'));

      const result = await game.startGame();
      expect(result.success).toBe(false);
      expect(result.error).toBe('start hook failed');
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

    it('should return error when onGameEnd throws', async () => {
      vi.spyOn(game, 'onGameEnd').mockRejectedValueOnce(new Error('end hook failed'));

      const result = await game.endGame();
      expect(result.success).toBe(false);
      expect(result.error).toBe('end hook failed');
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

    it('should cleanup player manager timers if initialized', async () => {
      // Ensure player manager is initialized by joining a player and disconnecting
      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      await game.disconnectPlayer('p1');

      // closeRoom should complete without errors even with pending timers
      const result = await game.closeRoom();
      expect(result.success).toBe(true);
    });
  });

  describe('transitionPhase', () => {
    it('should transition to valid next phase', async () => {
      // Initial phase is 'lobby', next is 'playing'
      await game.testTransitionPhase('playing');

      expect(game.getState().phase).toBe('playing');
    });

    it('should call onPhaseChange hook', async () => {
      await game.testTransitionPhase('playing');

      expect(game.onPhaseChangeCalls).toHaveLength(1);
      expect(game.onPhaseChangeCalls[0].from).toBe('lobby');
      expect(game.onPhaseChangeCalls[0].to).toBe('playing');
      expect(game.onPhaseChangeCalls[0].timestamp).toBeTypeOf('number');
    });

    it('should emit phase:changed event', async () => {
      const handler = vi.fn();
      game.on('phase:changed', handler);

      await game.testTransitionPhase('playing');

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0]).toMatchObject({
        from: 'lobby',
        to: 'playing',
      });
    });

    it('should sync state after phase transition', async () => {
      synchronizer.reset();
      await game.testTransitionPhase('playing');

      expect(synchronizer.broadcastStateCalls.length).toBeGreaterThan(0);
      const lastState = synchronizer.broadcastStateCalls[synchronizer.broadcastStateCalls.length - 1];
      expect(lastState.phase).toBe('playing');
    });

    it('should broadcast phase:changed event through synchronizer', async () => {
      synchronizer.reset();
      await game.testTransitionPhase('playing');

      const eventCalls = synchronizer.broadcastEventCalls;
      expect(eventCalls.some((call) => call.event === 'phase:changed')).toBe(true);
    });

    it('should throw ValidationError for transitioning to the same phase', async () => {
      // Transitioning to 'lobby' (current phase) is invalid
      await expect(game.testTransitionPhase('lobby')).rejects.toThrow();
    });

    it('should throw for unknown target phase not in config', async () => {
      await expect(game.testTransitionPhase('nonexistent')).rejects.toThrow();
    });

    it('should allow skipping forward to any phase in config', async () => {
      // The validator allows forward skips — 'lobby' -> 'results' directly is permitted
      await game.testTransitionPhase('results');
      expect(game.getState().phase).toBe('results');
    });

    it('should allow sequential phase progression', async () => {
      await game.testTransitionPhase('playing');
      await game.testTransitionPhase('results');
      expect(game.getState().phase).toBe('results');
    });

    it('should allow looping back to first phase', async () => {
      // Advance to last phase: lobby -> playing -> results
      await game.testTransitionPhase('playing');
      await game.testTransitionPhase('results');

      // Loop back to first phase (lobby)
      await game.testTransitionPhase('lobby');
      expect(game.getState().phase).toBe('lobby');
    });
  });

  describe('updateState', () => {
    it('should merge partial updates into current state', async () => {
      await game.testUpdateState({ metadata: { round: 1 } });

      expect(game.getState().metadata).toEqual({ round: 1 });
    });

    it('should preserve existing state fields when updating', async () => {
      await game.joinPlayer(createTestPlayer({ id: 'p1' }));
      synchronizer.reset();

      await game.testUpdateState({ metadata: { extraData: 'value' } });

      // Players should still be in state
      expect(game.getState().players).toHaveLength(1);
      expect(game.getState().roomId).toBe('test-room');
    });

    it('should sync state after update', async () => {
      synchronizer.reset();
      await game.testUpdateState({ metadata: { round: 2 } });

      expect(synchronizer.broadcastStateCalls.length).toBeGreaterThan(0);
    });

    it('should allow overwriting existing metadata', async () => {
      await game.testUpdateState({ metadata: { round: 1 } });
      await game.testUpdateState({ metadata: { round: 2, score: 100 } });

      expect(game.getState().metadata).toEqual({ round: 2, score: 100 });
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

  describe('broadcastEvent', () => {
    it('should broadcast custom event to synchronizer', async () => {
      await game.testBroadcastEvent('question_revealed', { question: 'What is love?' });

      expect(synchronizer.broadcastCustomEventCalls).toHaveLength(1);
      expect(synchronizer.broadcastCustomEventCalls[0]).toEqual({
        type: 'question_revealed',
        payload: { question: 'What is love?' },
      });
    });

    it('should not throw when synchronizer is null', async () => {
      const gameWithoutSync = new TestGame('room', createTestState(), {}, null);

      await expect(
        gameWithoutSync.testBroadcastEvent('round_ended', { round: 1 })
      ).resolves.not.toThrow();

      await gameWithoutSync.closeRoom();
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
