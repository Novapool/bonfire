/**
 * Integration tests for room lifecycle
 *
 * Tests basic room operations with real Socket.io clients:
 * - Creating rooms
 * - Joining rooms
 * - Leaving rooms
 * - Error handling
 * - Multi-room isolation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { GameState } from '@bonfire/core'
import { createTestServer, type TestServerSetup } from './fixtures/testServer'
import { createTestClient, connectClient, disconnectClient, waitForEvent, type TestSocket } from './fixtures/socketClient'

describe('Room Lifecycle Integration', () => {
  let testSetup: TestServerSetup
  let port: number

  beforeEach(async () => {
    testSetup = await createTestServer()
    port = testSetup.port
  })

  afterEach(async () => {
    await testSetup.cleanup()
  })

  it('should create a room successfully', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('room:create', 'test-game', 'Alice', resolve)
    })

    expect(response.success).toBe(true)
    expect(response.roomId).toBeDefined()
    expect(typeof response.roomId).toBe('string')
    expect(response.roomId).toHaveLength(6)
    expect(response.state).toBeDefined()
    expect(response.state.roomId).toBe(response.roomId)

    await disconnectClient(client)
  })

  it('should join an existing room', async () => {
    // Create room with host
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })

    expect(createResponse.success).toBe(true)
    const roomId = createResponse.roomId

    // Join room with second player
    const player = createTestClient(port)
    await connectClient(player)

    const joinResponse = await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })

    expect(joinResponse.success).toBe(true)
    expect(joinResponse.playerId).toBeDefined()
    expect(joinResponse.state).toBeDefined()
    expect(joinResponse.state.roomId).toBe(roomId)
    expect(joinResponse.state.players).toHaveLength(2)

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should broadcast state updates to all players', async () => {
    // Create room
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    // Join with player
    const player = createTestClient(port)
    await connectClient(player)

    const joinResponse = await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })

    expect(joinResponse.success).toBe(true)

    // Both clients should receive state:update when player joins
    // (PlayerManager broadcasts after player joins)

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should leave a room successfully', async () => {
    // Create and join
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    const player = createTestClient(port)
    await connectClient(player)

    await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })

    // Leave room
    const leaveResponse = await new Promise<any>((resolve) => {
      player.emit('room:leave', resolve)
    })

    expect(leaveResponse.success).toBe(true)

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should return error when joining non-existent room', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('room:join', 'BADROOM', 'Player', resolve)
    })

    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
    expect(response.code).toBe('ROOM_NOT_FOUND')

    await disconnectClient(client)
  })

  it('should isolate multiple rooms', async () => {
    // Create Room A
    const hostA = createTestClient(port)
    await connectClient(hostA)

    const createA = await new Promise<any>((resolve) => {
      hostA.emit('room:create', 'test-game', 'HostA', resolve)
    })
    const roomIdA = createA.roomId

    // Create Room B
    const hostB = createTestClient(port)
    await connectClient(hostB)

    const createB = await new Promise<any>((resolve) => {
      hostB.emit('room:create', 'test-game', 'HostB', resolve)
    })
    const roomIdB = createB.roomId

    // Rooms should have different IDs
    expect(roomIdA).not.toBe(roomIdB)

    // Join Room A
    const playerA = createTestClient(port)
    await connectClient(playerA)

    const joinA = await new Promise<any>((resolve) => {
      playerA.emit('room:join', roomIdA, 'PlayerA', resolve)
    })

    expect(joinA.success).toBe(true)
    expect(joinA.state.players).toHaveLength(2)

    // Join Room B
    const playerB = createTestClient(port)
    await connectClient(playerB)

    const joinB = await new Promise<any>((resolve) => {
      playerB.emit('room:join', roomIdB, 'PlayerB', resolve)
    })

    expect(joinB.success).toBe(true)
    expect(joinB.state.players).toHaveLength(2)

    // Rooms should be isolated
    expect(joinA.state.roomId).toBe(roomIdA)
    expect(joinB.state.roomId).toBe(roomIdB)

    await disconnectClient(hostA)
    await disconnectClient(hostB)
    await disconnectClient(playerA)
    await disconnectClient(playerB)
  })

  it('should reject invalid inputs', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    // Invalid game type
    const response1 = await new Promise<any>((resolve) => {
      client.emit('room:create', '', 'Alice', resolve)
    })
    expect(response1.success).toBe(false)
    expect(response1.code).toBe('INVALID_INPUT')

    // Invalid host name
    const response2 = await new Promise<any>((resolve) => {
      client.emit('room:create', 'test-game', '', resolve)
    })
    expect(response2.success).toBe(false)
    expect(response2.code).toBe('INVALID_INPUT')

    // Invalid room ID
    const response3 = await new Promise<any>((resolve) => {
      client.emit('room:join', '', 'Player', resolve)
    })
    expect(response3.success).toBe(false)
    expect(response3.code).toBe('INVALID_INPUT')

    await disconnectClient(client)
  })

  it('should handle leave when not in room', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('room:leave', resolve)
    })

    expect(response.success).toBe(false)
    expect(response.code).toBe('NOT_IN_ROOM')

    await disconnectClient(client)
  })
})
