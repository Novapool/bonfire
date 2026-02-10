import { useSyncExternalStore, useCallback } from 'react';
import { useBonfireContext } from '../context/BonfireProvider';
import type { GameState } from '@bonfire/core';

/**
 * Subscribe to game state updates from the server.
 *
 * Uses `useSyncExternalStore` for tear-free reads in concurrent mode.
 *
 * @example
 * const { state } = useGameState();
 * if (state) console.log(state.phase);
 *
 * // For custom state fields, use type assertion:
 * interface MyGameState extends GameState {
 *   score: Record<string, number>;
 * }
 * const { state } = useGameState();
 * const myState = state as MyGameState;
 * if (myState) console.log(myState.score);
 */
export function useGameState(): {
  state: GameState | null;
  requestState: () => Promise<void>;
} {
  const { client } = useBonfireContext();

  const subscribe = useCallback(
    (onStoreChange: () => void) => client.onStateChange(onStoreChange),
    [client]
  );

  const getSnapshot = useCallback(() => client.gameState, [client]);

  const state = useSyncExternalStore(subscribe, getSnapshot);

  const requestState = useCallback(async () => {
    await client.requestState();
  }, [client]);

  return { state, requestState };
}
