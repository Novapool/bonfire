import { useSyncExternalStore, useCallback } from 'react';
import { useBonfireContext } from '../context/BonfireProvider';
import type { GameState } from '@bonfire/core';

/**
 * Subscribe to game state updates from the server.
 *
 * Uses `useSyncExternalStore` for tear-free reads in concurrent mode.
 * The generic parameter allows narrowing to a game-specific state type.
 *
 * @example
 * const { state } = useGameState<MyGameState>();
 * if (state) console.log(state.customField);
 */
export function useGameState<TState extends GameState = GameState>(): {
  state: TState | null;
  requestState: () => Promise<void>;
} {
  const { client } = useBonfireContext();

  const subscribe = useCallback(
    (onStoreChange: () => void) => client.onStateChange(() => onStoreChange()),
    [client]
  );

  const getSnapshot = useCallback(() => client.gameState as TState | null, [client]);

  const state = useSyncExternalStore(subscribe, getSnapshot);

  const requestState = useCallback(async () => {
    await client.requestState();
  }, [client]);

  return { state, requestState };
}
