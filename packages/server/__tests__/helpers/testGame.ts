/**
 * Test game implementation for unit tests
 */

import { SocialGame, type GameState, type GameConfig, type RoomId } from '@bonfire/core'
import type { SocketStateSynchronizer } from '../../src/core/SocketStateSynchronizer'

/**
 * Simple test game state
 */
export interface TestGameState extends GameState {
  testData?: string
}

/**
 * Simple test game for unit testing
 */
export class TestGame extends SocialGame<TestGameState> {
  config: GameConfig = {
    minPlayers: 2,
    maxPlayers: 8,
    phases: ['waiting', 'playing', 'ended'],
    allowJoinInProgress: false,
    disconnectTimeout: 30000,
  }

  constructor(roomId: RoomId, synchronizer: SocketStateSynchronizer<TestGameState>) {
    const initialState: TestGameState = {
      roomId,
      phase: 'waiting',
      players: [],
    }
    super(roomId, initialState, synchronizer)
  }

  protected onStart(): void {
    // No-op for test
  }

  protected onEnd(): void {
    // No-op for test
  }
}

/**
 * Factory function for creating test games
 */
export function createTestGame(
  roomId: RoomId,
  synchronizer: SocketStateSynchronizer<TestGameState>
): TestGame {
  return new TestGame(roomId, synchronizer)
}
