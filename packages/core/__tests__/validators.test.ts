/**
 * Tests for GameValidator
 */

import { describe, it, expect } from 'vitest';
import { GameValidator } from '../src/validation/validators';
import { createTestState, createTestConfig, createTestPlayer } from './helpers';

describe('GameValidator', () => {
  describe('validatePlayerJoin', () => {
    it('should allow valid player join', () => {
      const state = createTestState();
      const config = createTestConfig();
      const player = createTestPlayer();

      const error = GameValidator.validatePlayerJoin(state, config, player);
      expect(error).toBeNull();
    });

    it('should reject duplicate player', () => {
      const player = createTestPlayer({ id: 'player-1' });
      const state = createTestState({ players: [player] });
      const config = createTestConfig();

      const error = GameValidator.validatePlayerJoin(state, config, player);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('PLAYER_ALREADY_JOINED');
    });

    it('should reject when game is full', () => {
      const state = createTestState({
        players: [createTestPlayer({ id: 'p1' }), createTestPlayer({ id: 'p2' })],
      });
      const config = createTestConfig({ maxPlayers: 2 });
      const player = createTestPlayer({ id: 'p3' });

      const error = GameValidator.validatePlayerJoin(state, config, player);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('GAME_FULL');
    });

    it('should reject joining in-progress game when not allowed', () => {
      const state = createTestState({ startedAt: Date.now() });
      const config = createTestConfig({ allowJoinInProgress: false });
      const player = createTestPlayer();

      const error = GameValidator.validatePlayerJoin(state, config, player);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('GAME_IN_PROGRESS');
    });

    it('should allow joining in-progress game when allowed', () => {
      const state = createTestState({ startedAt: Date.now() });
      const config = createTestConfig({ allowJoinInProgress: true });
      const player = createTestPlayer();

      const error = GameValidator.validatePlayerJoin(state, config, player);
      expect(error).toBeNull();
    });
  });

  describe('validateGameStart', () => {
    it('should allow starting with minimum players', () => {
      const state = createTestState({
        players: [createTestPlayer({ id: 'p1' }), createTestPlayer({ id: 'p2' })],
      });
      const config = createTestConfig({ minPlayers: 2 });

      const error = GameValidator.validateGameStart(state, config);
      expect(error).toBeNull();
    });

    it('should reject starting with not enough players', () => {
      const state = createTestState({
        players: [createTestPlayer({ id: 'p1' })],
      });
      const config = createTestConfig({ minPlayers: 2 });

      const error = GameValidator.validateGameStart(state, config);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('NOT_ENOUGH_PLAYERS');
    });

    it('should reject starting already started game', () => {
      const state = createTestState({
        players: [createTestPlayer({ id: 'p1' }), createTestPlayer({ id: 'p2' })],
        startedAt: Date.now(),
      });
      const config = createTestConfig({ minPlayers: 2 });

      const error = GameValidator.validateGameStart(state, config);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('GAME_ALREADY_STARTED');
    });
  });

  describe('validatePhaseTransition', () => {
    it('should allow valid phase transition', () => {
      const config = createTestConfig({ phases: ['lobby', 'playing', 'results'] });

      const error = GameValidator.validatePhaseTransition('lobby', 'playing', config);
      expect(error).toBeNull();
    });

    it('should reject transitioning to undefined phase', () => {
      const config = createTestConfig({ phases: ['lobby', 'playing', 'results'] });

      const error = GameValidator.validatePhaseTransition('lobby', 'unknown', config);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('INVALID_PHASE');
    });

    it('should reject transitioning to same phase', () => {
      const config = createTestConfig({ phases: ['lobby', 'playing', 'results'] });

      const error = GameValidator.validatePhaseTransition('lobby', 'lobby', config);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('SAME_PHASE');
    });

    it('should reject when current phase is invalid', () => {
      const config = createTestConfig({ phases: ['lobby', 'playing', 'results'] });

      const error = GameValidator.validatePhaseTransition('unknown', 'lobby', config);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('INVALID_CURRENT_PHASE');
    });

    it('should allow backward transitions', () => {
      const config = createTestConfig({ phases: ['lobby', 'playing', 'results'] });

      const error = GameValidator.validatePhaseTransition('results', 'lobby', config);
      expect(error).toBeNull();
    });
  });

  describe('validatePlayerExists', () => {
    it('should pass when player exists', () => {
      const player = createTestPlayer({ id: 'p1' });
      const state = createTestState({ players: [player] });

      const error = GameValidator.validatePlayerExists(state, 'p1');
      expect(error).toBeNull();
    });

    it('should fail when player does not exist', () => {
      const state = createTestState({ players: [] });

      const error = GameValidator.validatePlayerExists(state, 'p1');
      expect(error).not.toBeNull();
      expect(error?.code).toBe('PLAYER_NOT_FOUND');
    });
  });

  describe('validateGameEnded', () => {
    it('should pass when game is started but not ended', () => {
      const state = createTestState({ startedAt: Date.now() });

      const error = GameValidator.validateGameEnded(state);
      expect(error).toBeNull();
    });

    it('should fail when game already ended', () => {
      const state = createTestState({
        startedAt: Date.now(),
        endedAt: Date.now(),
      });

      const error = GameValidator.validateGameEnded(state);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('GAME_ALREADY_ENDED');
    });

    it('should fail when game not started', () => {
      const state = createTestState();

      const error = GameValidator.validateGameEnded(state);
      expect(error).not.toBeNull();
      expect(error?.code).toBe('GAME_NOT_STARTED');
    });
  });
});
