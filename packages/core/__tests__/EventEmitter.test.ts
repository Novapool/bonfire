/**
 * Tests for GameEventEmitter
 */

import { describe, it, expect, vi } from 'vitest';
import { GameEventEmitter } from '../src/events/EventEmitter';
import type { GameEventPayloads } from '../src/types';

describe('GameEventEmitter', () => {
  it('should subscribe and emit events', async () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    const handler = vi.fn();

    emitter.on('game:started', handler);
    await emitter.emit('game:started', { startedAt: 12345 });

    expect(handler).toHaveBeenCalledWith({ startedAt: 12345 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should support multiple handlers for same event', async () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    emitter.on('game:started', handler1);
    emitter.on('game:started', handler2);
    await emitter.emit('game:started', { startedAt: 12345 });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe handlers', async () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    const handler = vi.fn();

    emitter.on('game:started', handler);
    emitter.off('game:started', handler);
    await emitter.emit('game:started', { startedAt: 12345 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support once() for single execution', async () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    const handler = vi.fn();

    emitter.once('game:started', handler);
    await emitter.emit('game:started', { startedAt: 12345 });
    await emitter.emit('game:started', { startedAt: 67890 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ startedAt: 12345 });
  });

  it('should remove all listeners for specific event', async () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    emitter.on('game:started', handler1);
    emitter.on('game:started', handler2);
    emitter.removeAllListeners('game:started');
    await emitter.emit('game:started', { startedAt: 12345 });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should remove all listeners for all events', async () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    emitter.on('game:started', handler1);
    emitter.on('game:ended', handler2);
    emitter.removeAllListeners();

    await emitter.emit('game:started', { startedAt: 12345 });
    await emitter.emit('game:ended', { endedAt: 12345 });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should return listener count', () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    expect(emitter.listenerCount('game:started')).toBe(0);

    emitter.on('game:started', handler1);
    expect(emitter.listenerCount('game:started')).toBe(1);

    emitter.on('game:started', handler2);
    expect(emitter.listenerCount('game:started')).toBe(2);

    emitter.off('game:started', handler1);
    expect(emitter.listenerCount('game:started')).toBe(1);
  });

  it('should return event names', () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();

    expect(emitter.eventNames()).toEqual([]);

    emitter.on('game:started', vi.fn());
    emitter.on('game:ended', vi.fn());

    expect(emitter.eventNames()).toContain('game:started');
    expect(emitter.eventNames()).toContain('game:ended');
    expect(emitter.eventNames()).toHaveLength(2);
  });

  it('should handle async handlers', async () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    const results: number[] = [];

    const handler1 = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      results.push(1);
    };

    const handler2 = async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      results.push(2);
    };

    emitter.on('game:started', handler1);
    emitter.on('game:started', handler2);
    await emitter.emit('game:started', { startedAt: 12345 });

    expect(results).toContain(1);
    expect(results).toContain(2);
  });

  it('should not fail when emitting event with no listeners', async () => {
    const emitter = new GameEventEmitter<GameEventPayloads>();
    await expect(emitter.emit('game:started', { startedAt: 12345 })).resolves.not.toThrow();
  });
});
