/**
 * In-memory database adapter for testing
 *
 * This adapter stores data in memory using Maps, making it perfect for
 * unit tests and development without requiring an actual database.
 */

import type { GameState, RoomId } from '@bonfire/core'
import type { RoomMetadata } from '../types'
import type { IDatabaseAdapter } from './IDatabaseAdapter'

/**
 * In-memory database adapter
 *
 * Warning: All data is lost when the process exits.
 * Only use for testing and development.
 */
export class InMemoryAdapter implements IDatabaseAdapter {
  private gameStates: Map<RoomId, GameState> = new Map()
  private roomMetadata: Map<RoomId, RoomMetadata> = new Map()
  private initialized: boolean = false

  async initialize(): Promise<void> {
    this.initialized = true
  }

  async saveGameState(roomId: RoomId, state: GameState): Promise<void> {
    this.ensureInitialized()
    // Deep clone to avoid reference issues in tests
    this.gameStates.set(roomId, JSON.parse(JSON.stringify(state)))
  }

  async loadGameState(roomId: RoomId): Promise<GameState | null> {
    this.ensureInitialized()
    const state = this.gameStates.get(roomId)
    // Deep clone to avoid reference issues
    return state ? JSON.parse(JSON.stringify(state)) : null
  }

  async deleteRoom(roomId: RoomId): Promise<void> {
    this.ensureInitialized()
    this.gameStates.delete(roomId)
    this.roomMetadata.delete(roomId)
  }

  async updateRoomMetadata(roomId: RoomId, metadata: RoomMetadata): Promise<void> {
    this.ensureInitialized()
    // Deep clone to avoid reference issues
    this.roomMetadata.set(roomId, JSON.parse(JSON.stringify(metadata)))
  }

  async getRoomMetadata(roomId: RoomId): Promise<RoomMetadata | null> {
    this.ensureInitialized()
    const metadata = this.roomMetadata.get(roomId)
    return metadata ? JSON.parse(JSON.stringify(metadata)) : null
  }

  async getAllRoomMetadata(): Promise<RoomMetadata[]> {
    this.ensureInitialized()
    return Array.from(this.roomMetadata.values()).map(m =>
      JSON.parse(JSON.stringify(m))
    )
  }

  async getInactiveRooms(olderThan: number): Promise<RoomId[]> {
    this.ensureInitialized()
    const inactiveRooms: RoomId[] = []

    for (const [roomId, metadata] of this.roomMetadata.entries()) {
      if (metadata.lastActivity < olderThan) {
        inactiveRooms.push(roomId)
      }
    }

    return inactiveRooms
  }

  async roomExists(roomId: RoomId): Promise<boolean> {
    this.ensureInitialized()
    return this.gameStates.has(roomId)
  }

  async close(): Promise<void> {
    this.gameStates.clear()
    this.roomMetadata.clear()
    this.initialized = false
  }

  /**
   * Clear all data (useful for tests)
   */
  clear(): void {
    this.gameStates.clear()
    this.roomMetadata.clear()
  }

  /**
   * Get number of stored rooms (useful for tests)
   */
  getRoomCount(): number {
    return this.gameStates.size
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('InMemoryAdapter not initialized. Call initialize() first.')
    }
  }
}
