import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { usePhase } from '../../src/hooks/usePhase';
import { renderWithProvider } from '../fixtures/renderWithProvider';
import { MockBonfireClient } from '../fixtures/mockBonfireClient';
import type { GameState } from '@bonfire/core';

describe('usePhase', () => {
  it('should return null phase initially', () => {
    const { result } = renderWithProvider(() => usePhase());
    expect(result.current.phase).toBeNull();
  });

  it('should return current phase from state', () => {
    const client = new MockBonfireClient();
    const { result } = renderWithProvider(() => usePhase(), client);

    const state: GameState = {
      roomId: 'ABC123',
      phase: 'voting',
      players: [],
    };

    act(() => {
      client.simulateStateUpdate(state);
    });

    expect(result.current.phase).toBe('voting');
  });

  it('should correctly identify phase with isPhase', () => {
    const client = new MockBonfireClient();
    const { result } = renderWithProvider(() => usePhase(), client);

    act(() => {
      client.simulateStateUpdate({
        roomId: 'ABC123',
        phase: 'voting',
        players: [],
      });
    });

    expect(result.current.isPhase('voting')).toBe(true);
    expect(result.current.isPhase('lobby')).toBe(false);
    expect(result.current.isPhase('reveal')).toBe(false);
  });

  it('should update phase when state changes', () => {
    const client = new MockBonfireClient();
    const { result } = renderWithProvider(() => usePhase(), client);

    act(() => {
      client.simulateStateUpdate({ roomId: 'A', phase: 'lobby', players: [] });
    });
    expect(result.current.phase).toBe('lobby');

    act(() => {
      client.simulateStateUpdate({ roomId: 'A', phase: 'playing', players: [] });
    });
    expect(result.current.phase).toBe('playing');
  });
});
