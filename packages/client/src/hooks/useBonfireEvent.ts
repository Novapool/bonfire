import { useEffect } from 'react';
import { useBonfireContext } from '../context/BonfireProvider';

/**
 * Subscribe to a specific game event type.
 * Automatically cleans up on unmount or when eventType/handler changes.
 *
 * @example
 * useBonfireEvent<{ player: Player }>('player:joined', (payload) => {
 *   toast(`${payload.player.name} joined!`);
 * });
 */
export function useBonfireEvent<TPayload = unknown>(
  eventType: string,
  handler: (payload: TPayload) => void
): void {
  const { client } = useBonfireContext();

  useEffect(() => {
    const unsubscribe = client.onGameEvent(eventType, handler as (data: unknown) => void);
    return unsubscribe;
  }, [client, eventType, handler]);
}
