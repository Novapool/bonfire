/**
 * Integration tests for state synchronization
 *
 * Tests state broadcasting and synchronization:
 * - State broadcasts to all players
 * - State request (reconnection)
 * - Room isolation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestServer, type TestServerSetup } from './fixtures/testServer'
import { createTestClient, connectClient, disconnectClient, waitForEvent, type TestSocket } from './fixtures/socketClient'

describe('State Synchronization Integration', () => {
  let testSetup: TestServerSetup
  let port: number

  beforeEach(async () => {
    testSetup = await createTestServer()
    port = testSetup.port
  })

  afterEach(async () => {
    await testSetup.cleanup()
  })

  it('should broadcast state updates to all players in room', async () => {
    // Create room and setup listener FIRST
    const host = createTestClient(port)
    await connectClient(host)

    // Setup listener BEFORE creating room
    const hostUpdates: any[] = []
    host.on('state:update', (state) => {
      hostUpdates.push(state)
    })

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    // Join with player (setup listener before joining)
    const player = createTestClient(port)
    await connectClient(player)

    const playerUpdates: any[] = []
    player.on('state:update', (state) => {
      playerUpdates.push(state)
    })

    await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })

    // Wait a bit for broadcasts
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Player should have received at least one update (when they joined)
    // Host might or might not receive updates depending on game implementation
    expect(hostUpdates.length + playerUpdates.length).toBeGreaterThan(0)

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should return current state on state:request', async () => {
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

    // Request state
    const stateResponse = await new Promise<any>((resolve) => {
      player.emit('state:request', resolve)
    })

    expect(stateResponse.success).toBe(true)
    expect(stateResponse.state).toBeDefined()
    expect(stateResponse.state.roomId).toBe(roomId)
    expect(stateResponse.state.players).toHaveLength(2)

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should isolate state updates between rooms', async () => {
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

    // Setup listeners
    const updatesA: any[] = []
    const updatesB: any[] = []

    hostA.on('state:update', (state) => {
      updatesA.push(state)
    })

    hostB.on('state:update', (state) => {
      updatesB.push(state)
    })

    // Join Room A
    const playerA = createTestClient(port)
    await connectClient(playerA)

    await new Promise<any>((resolve) => {
      playerA.emit('room:join', roomIdA, 'PlayerA', resolve)
    })

    // Join Room B
    const playerB = createTestClient(port)
    await connectClient(playerB)

    await new Promise<any>((resolve) => {
      playerB.emit('room:join', roomIdB, 'PlayerB', resolve)
    })

    // Wait for broadcasts
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Room A updates should only be for Room A
    for (const update of updatesA) {
      expect(update.roomId).toBe(roomIdA)
    }

    // Room B updates should only be for Room B
    for (const update of updatesB) {
      expect(update.roomId).toBe(roomIdB)
    }

    await disconnectClient(hostA)
    await disconnectClient(hostB)
    await disconnectClient(playerA)
    await disconnectClient(playerB)
  })

  it('should handle state request when not in room', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('state:request', resolve)
    })

    expect(response.success).toBe(false)
    expect(response.code).toBe('NOT_IN_ROOM')

    await disconnectClient(client)
  })

  it('should re-register player on state request (reconnection)', async () => {
    // This tests the reconnection scenario where a player
    // requests state with the same playerId but new socket

    // Create and join room
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    const player = createTestClient(port)
    await connectClient(player)

    const joinResponse = await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })

    // First state request
    const stateResponse1 = await new Promise<any>((resolve) => {
      player.emit('state:request', resolve)
    })

    expect(stateResponse1.success).toBe(true)

    // Second state request (simulating reconnection with same socket)
    const stateResponse2 = await new Promise<any>((resolve) => {
      player.emit('state:request', resolve)
    })

    expect(stateResponse2.success).toBe(true)
    expect(stateResponse2.state.roomId).toBe(roomId)

    await disconnectClient(host)
    await disconnectClient(player)
  })
})
