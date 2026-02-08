/**
 * Player lifecycle and connection management
 */

import type { Player, PlayerId, PlayerConnection, GameConfig } from '../types';
import { PlayerError } from '../validation/errors';

/**
 * Manages player lifecycle, connections, and disconnect/reconnect handling
 */
export class PlayerManager {
  private connections: Map<PlayerId, PlayerConnection> = new Map();
  private disconnectTimeout: number;

  constructor(config: GameConfig) {
    this.disconnectTimeout = config.disconnectTimeout ?? 30000; // Default 30 seconds
  }

  /**
   * Add a new player
   */
  addPlayer(player: Player): void {
    if (this.connections.has(player.id)) {
      throw new PlayerError(`Player ${player.id} already exists`);
    }

    this.connections.set(player.id, {
      playerId: player.id,
      isConnected: true,
    });
  }

  /**
   * Remove a player immediately
   */
  removePlayer(playerId: PlayerId): void {
    const connection = this.connections.get(playerId);
    if (connection?.timeoutTimer) {
      clearTimeout(connection.timeoutTimer);
    }
    this.connections.delete(playerId);
  }

  /**
   * Mark player as disconnected and start timeout timer
   */
  disconnect(playerId: PlayerId, onTimeout: (playerId: PlayerId) => void): void {
    const connection = this.connections.get(playerId);
    if (!connection) {
      throw new PlayerError(`Player ${playerId} not found`);
    }

    // Clear existing timer if any
    if (connection.timeoutTimer) {
      clearTimeout(connection.timeoutTimer);
    }

    // Update connection status
    connection.isConnected = false;
    connection.disconnectedAt = Date.now();

    // Start timeout timer
    connection.timeoutTimer = setTimeout(() => {
      onTimeout(playerId);
    }, this.disconnectTimeout);
  }

  /**
   * Reconnect a player (cancel timeout)
   */
  reconnect(playerId: PlayerId): void {
    const connection = this.connections.get(playerId);
    if (!connection) {
      throw new PlayerError(`Player ${playerId} not found`);
    }

    // Clear timeout timer
    if (connection.timeoutTimer) {
      clearTimeout(connection.timeoutTimer);
      connection.timeoutTimer = undefined;
    }

    // Update connection status
    connection.isConnected = true;
    connection.disconnectedAt = undefined;
  }

  /**
   * Check if a player is connected
   */
  isConnected(playerId: PlayerId): boolean {
    return this.connections.get(playerId)?.isConnected ?? false;
  }

  /**
   * Get connection info for a player
   */
  getConnection(playerId: PlayerId): PlayerConnection | undefined {
    return this.connections.get(playerId);
  }

  /**
   * Get all player IDs
   */
  getPlayerIds(): PlayerId[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Cleanup all timers (call when destroying game)
   */
  cleanup(): void {
    for (const connection of this.connections.values()) {
      if (connection.timeoutTimer) {
        clearTimeout(connection.timeoutTimer);
      }
    }
    this.connections.clear();
  }
}
