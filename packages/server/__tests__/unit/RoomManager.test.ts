/**
 * Tests for RoomManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RoomManager } from '../../src/core/RoomManager'
import { InMemoryAdapter } from '../../src/database/InMemoryAdapter'
import { createMockSocketServer } from '../helpers/mockSocket'
import { createTestGame } from '../helpers/testGame'
import { RoomNotFoundError } from '../../src/utils/errors'

describe('RoomManager', () => {
  let roomManager: RoomManager
  let mockIo: ReturnType<typeof createMockSocketServer>
  let databaseAdapter: InMemoryAdapter

  beforeEach(async () => {
    mockIo = createMockSocketServer()
    databaseAdapter = new InMemoryAdapter()
    await databaseAdapter.initialize()

    roomManager = new RoomManager(
      mockIo.asTypedServer(),
      databaseAdapter,
      createTestGame,
      'test-game',
      {
        defaultTTL: 60000, // 1 minute for testing
        maxRooms: 100,
        cleanupInterval: 5000, // 5 seconds for testing
      }
    )
  })

  afterEach(async () => {
    await roomManager.shutdown()
  })

  describe('createRoom', () => {
    it('should create a new room with unique ID', async () => {
      const room = await roomManager.createRoom('host1')

      expect(room.roomId).toMatch(/^[A-Z0-9]{6}$/)
      expect(room.game).toBeDefined()
      expect(room.synchronizer).toBeDefined()
      expect(room.metadata.hostId).toBe('host1')
      expect(room.metadata.status).toBe('waiting')
    })

    it('should create rooms with different IDs', async () => {
      const room1 = await roomManager.createRoom('host1')
      const room2 = await roomManager.createRoom('host2')

      expect(room1.roomId).not.toBe(room2.roomId)
    })

    it('should save room metadata to database', async () => {
      const room = await roomManager.createRoom('host1')
      const metadata = await databaseAdapter.getRoomMetadata(room.roomId)

      expect(metadata).toBeDefined()
      expect(metadata!.roomId).toBe(room.roomId)
      expect(metadata!.hostId).toBe('host1')
    })

    it('should throw when max rooms reached', async () => {
      const smallManager = new RoomManager(
        mockIo.asTypedServer(),
        databaseAdapter,
        createTestGame,
        'test-game',
        { maxRooms: 2 }
      )

      await smallManager.createRoom('host1')
      await smallManager.createRoom('host2')

      await expect(smallManager.createRoom('host3')).rejects.toThrow('Maximum room limit')
      await smallManager.shutdown()
    })
  })

  describe('getRoom', () => {
    it('should retrieve existing room', async () => {
      const created = await roomManager.createRoom('host1')
      const retrieved = roomManager.getRoom(created.roomId)

      expect(retrieved.roomId).toBe(created.roomId)
      expect(retrieved.game).toBe(created.game)
    })

    it('should throw RoomNotFoundError for non-existent room', () => {
      expect(() => roomManager.getRoom('NONEXISTENT')).toThrow(RoomNotFoundError)
    })
  })

  describe('hasRoom', () => {
    it('should return true for existing room', async () => {
      const room = await roomManager.createRoom('host1')
      expect(roomManager.hasRoom(room.roomId)).toBe(true)
    })

    it('should return false for non-existent room', () => {
      expect(roomManager.hasRoom('NONEXISTENT')).toBe(false)
    })
  })

  describe('deleteRoom', () => {
    it('should delete room from memory', async () => {
      const room = await roomManager.createRoom('host1')
      await roomManager.deleteRoom(room.roomId)

      expect(roomManager.hasRoom(room.roomId)).toBe(false)
    })

    it('should delete room from database', async () => {
      const room = await roomManager.createRoom('host1')
      await roomManager.deleteRoom(room.roomId)

      const metadata = await databaseAdapter.getRoomMetadata(room.roomId)
      expect(metadata).toBeNull()
    })

    it('should clear player mappings for room', async () => {
      const room = await roomManager.createRoom('host1')
      roomManager.trackPlayer('player1', room.roomId)
      roomManager.trackPlayer('player2', room.roomId)

      await roomManager.deleteRoom(room.roomId)

      expect(roomManager.getRoomIdForPlayer('player1')).toBeUndefined()
      expect(roomManager.getRoomIdForPlayer('player2')).toBeUndefined()
    })

    it('should clear synchronizer player mappings', async () => {
      const room = await roomManager.createRoom('host1')
      room.synchronizer.registerPlayer('player1', 'socket1')

      await roomManager.deleteRoom(room.roomId)

      expect(room.synchronizer.getRegisteredPlayers()).toHaveLength(0)
    })

    it('should not throw when deleting non-existent room', async () => {
      await expect(roomManager.deleteRoom('NONEXISTENT')).resolves.toBeUndefined()
    })
  })

  describe('listRooms', () => {
    it('should return empty array when no rooms', () => {
      const rooms = roomManager.listRooms()
      expect(rooms).toEqual([])
    })

    it('should list all rooms', async () => {
      await roomManager.createRoom('host1')
      await roomManager.createRoom('host2')

      const rooms = roomManager.listRooms()
      expect(rooms).toHaveLength(2)
    })

    it('should include room information', async () => {
      const room = await roomManager.createRoom('host1')
      await room.game.joinPlayer({
        id: 'host1',
        name: 'Alice',
        isHost: true,
        isConnected: true,
        joinedAt: Date.now(),
      })

      const rooms = roomManager.listRooms()
      const info = rooms[0]

      expect(info.roomId).toBe(room.roomId)
      expect(info.status).toBe('waiting')
      expect(info.gameType).toBe('test-game')
      expect(info.hostName).toBe('Alice')
      expect(info.maxPlayers).toBe(8)
    })

    it('should filter rooms', async () => {
      const room1 = await roomManager.createRoom('host1')
      const room2 = await roomManager.createRoom('host2')

      // Update metadata for filtering
      await roomManager.updateRoomMetadata(room1.roomId, { status: 'playing' })

      const playingRooms = roomManager.listRooms(
        (room) => room.metadata.status === 'playing'
      )

      expect(playingRooms).toHaveLength(1)
      expect(playingRooms[0].roomId).toBe(room1.roomId)
    })
  })

  describe('player tracking', () => {
    it('should track player in room', async () => {
      const room = await roomManager.createRoom('host1')
      roomManager.trackPlayer('player1', room.roomId)

      expect(roomManager.getRoomIdForPlayer('player1')).toBe(room.roomId)
    })

    it('should untrack player', async () => {
      const room = await roomManager.createRoom('host1')
      roomManager.trackPlayer('player1', room.roomId)
      roomManager.untrackPlayer('player1')

      expect(roomManager.getRoomIdForPlayer('player1')).toBeUndefined()
    })

    it('should track multiple players', async () => {
      const room = await roomManager.createRoom('host1')
      roomManager.trackPlayer('player1', room.roomId)
      roomManager.trackPlayer('player2', room.roomId)

      expect(roomManager.getRoomIdForPlayer('player1')).toBe(room.roomId)
      expect(roomManager.getRoomIdForPlayer('player2')).toBe(room.roomId)
    })

    it('should update player room when moved', async () => {
      const room1 = await roomManager.createRoom('host1')
      const room2 = await roomManager.createRoom('host2')

      roomManager.trackPlayer('player1', room1.roomId)
      roomManager.trackPlayer('player1', room2.roomId)

      expect(roomManager.getRoomIdForPlayer('player1')).toBe(room2.roomId)
    })
  })

  describe('updateActivity', () => {
    it('should update lastActivity timestamp', async () => {
      const room = await roomManager.createRoom('host1')
      const originalActivity = room.metadata.lastActivity

      await new Promise((resolve) => setTimeout(resolve, 10))
      await roomManager.updateActivity(room.roomId)

      expect(room.metadata.lastActivity).toBeGreaterThan(originalActivity)
    })

    it('should persist updated metadata', async () => {
      const room = await roomManager.createRoom('host1')
      await roomManager.updateActivity(room.roomId)

      const metadata = await databaseAdapter.getRoomMetadata(room.roomId)
      expect(metadata!.lastActivity).toBe(room.metadata.lastActivity)
    })

    it('should set cleanup timer', async () => {
      const room = await roomManager.createRoom('host1')
      await roomManager.updateActivity(room.roomId)

      expect(room.cleanupTimer).toBeDefined()
    })

    it('should not throw for non-existent room', async () => {
      await expect(roomManager.updateActivity('NONEXISTENT')).resolves.toBeUndefined()
    })
  })

  describe('updateRoomMetadata', () => {
    it('should update room metadata', async () => {
      const room = await roomManager.createRoom('host1')
      await roomManager.updateRoomMetadata(room.roomId, {
        playerCount: 5,
        status: 'playing',
      })

      expect(room.metadata.playerCount).toBe(5)
      expect(room.metadata.status).toBe('playing')
    })

    it('should persist updated metadata', async () => {
      const room = await roomManager.createRoom('host1')
      await roomManager.updateRoomMetadata(room.roomId, {
        playerCount: 3,
      })

      const metadata = await databaseAdapter.getRoomMetadata(room.roomId)
      expect(metadata!.playerCount).toBe(3)
    })

    it('should throw for non-existent room', async () => {
      await expect(
        roomManager.updateRoomMetadata('NONEXISTENT', { playerCount: 5 })
      ).rejects.toThrow(RoomNotFoundError)
    })
  })

  describe('statistics', () => {
    it('should get room count', async () => {
      expect(roomManager.getRoomCount()).toBe(0)

      await roomManager.createRoom('host1')
      expect(roomManager.getRoomCount()).toBe(1)

      await roomManager.createRoom('host2')
      expect(roomManager.getRoomCount()).toBe(2)
    })

    it('should get player count', async () => {
      expect(roomManager.getPlayerCount()).toBe(0)

      const room = await roomManager.createRoom('host1')
      roomManager.trackPlayer('player1', room.roomId)
      expect(roomManager.getPlayerCount()).toBe(1)

      roomManager.trackPlayer('player2', room.roomId)
      expect(roomManager.getPlayerCount()).toBe(2)
    })
  })

  describe('cleanup', () => {
    it('should start and stop cleanup interval', () => {
      roomManager.startCleanup()
      roomManager.stopCleanup()
      // No error should occur
    })

    it('should not start cleanup twice', () => {
      roomManager.startCleanup()
      roomManager.startCleanup()
      roomManager.stopCleanup()
      // No error should occur
    })
  })

  describe('shutdown', () => {
    it('should clear all rooms', async () => {
      await roomManager.createRoom('host1')
      await roomManager.createRoom('host2')

      await roomManager.shutdown()

      expect(roomManager.getRoomCount()).toBe(0)
    })

    it('should clear player mappings', async () => {
      const room = await roomManager.createRoom('host1')
      roomManager.trackPlayer('player1', room.roomId)

      await roomManager.shutdown()

      expect(roomManager.getPlayerCount()).toBe(0)
    })

    it('should stop cleanup', () => {
      roomManager.startCleanup()
      roomManager.shutdown()
      // No error should occur
    })
  })
})
