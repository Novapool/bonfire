import { useCallback } from 'react';
import { useGameState } from './useGameState';
import type { Phase } from '@bonfire/core';

/**
 * Access the current game phase and check phase identity.
 *
 * @example
 * const { phase, isPhase } = usePhase();
 * if (isPhase('voting')) return <VotingUI />;
 */
export function usePhase(): {
  phase: Phase | null;
  isPhase: (targetPhase: Phase) => boolean;
} {
  const { state } = useGameState();

  const phase = state?.phase ?? null;

  const isPhase = useCallback((targetPhase: Phase) => phase === targetPhase, [phase]);

  return { phase, isPhase };
}
