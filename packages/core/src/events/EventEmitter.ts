/**
 * Typed event emitter for game lifecycle events
 */

/**
 * Event handler function type
 */
type EventHandler<T> = (payload: T) => void | Promise<void>;

/**
 * Generic typed event emitter
 */
export class GameEventEmitter<TEvents extends Record<string, unknown>> {
  private listeners: Map<keyof TEvents, Set<EventHandler<unknown>>> = new Map();

  /**
   * Subscribe to an event
   */
  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler<unknown>);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler<unknown>);
    }
  }

  /**
   * Subscribe to an event once (auto-unsubscribe after first emission)
   */
  once<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    const onceHandler: EventHandler<TEvents[K]> = async (payload) => {
      this.off(event, onceHandler);
      await handler(payload);
    };
    this.on(event, onceHandler);
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): Promise<void> {
    const handlers = this.listeners.get(event);
    if (handlers) {
      // Execute all handlers in parallel
      await Promise.all(Array.from(handlers).map((handler) => handler(payload)));
    }
  }

  /**
   * Remove all listeners for a specific event, or all events if no event specified
   */
  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends keyof TEvents>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): Array<keyof TEvents> {
    return Array.from(this.listeners.keys());
  }
}
