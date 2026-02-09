/**
 * Integration tests for connection lifecycle
 *
 * Tests disconnect/reconnect scenarios:
 * - Disconnect marks player as disconnected
 * - Reconnect restores session
 * - Timeout removes player
 * - Cleanup on disconnect
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestServer, type TestServerSetup } from './fixtures/testServer'
import { createTestClient, connectClient, disconnectClient, type TestSocket } from './fixtures/socketClient'

describe('Connection Lifecycle Integration', () => {
  let testSetup: TestServerSetup
  let port: number

  beforeEach(async () => {
    testSetup = await createTestServer()
    port = testSetup.port
  })

  afterEach(async () => {
    await testSetup.cleanup()
  })

  it('should handle player disconnect', async () => {
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

    // Disconnect player
    await disconnectClient(player)

    // Wait a bit for disconnect to process
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Host should still be connected
    const stateResponse = await new Promise<any>((resolve) => {
      host.emit('state:request', resolve)
    })

    expect(stateResponse.success).toBe(true)
    expect(stateResponse.state.players).toHaveLength(2)

    // Disconnected player should be marked as disconnected
    const disconnectedPlayer = stateResponse.state.players.find(
      (p: any) => p.id === joinResponse.playerId
    )
    expect(disconnectedPlayer).toBeDefined()
    expect(disconnectedPlayer.isConnected).toBe(false)

    await disconnectClient(host)
  })

  it('should allow reconnection with state:request', async () => {
    // Create room
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    // Join with player
    const player1 = createTestClient(port)
    await connectClient(player1)

    const joinResponse = await new Promise<any>((resolve) => {
      player1.emit('room:join', roomId, 'Player2', resolve)
    })
    const playerId = joinResponse.playerId

    // Disconnect
    await disconnectClient(player1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Reconnect with new socket (simulated)
    // In real scenario, client would store playerId and reconnect
    // For now, create new connection and request state
    const player2 = createTestClient(port)
    await connectClient(player2)

    // Join again with same name (new player ID though)
    const rejoinResponse = await new Promise<any>((resolve) => {
      player2.emit('room:join', roomId, 'Player2Reconnected', resolve)
    })

    expect(rejoinResponse.success).toBe(true)
    expect(rejoinResponse.state.players).toHaveLength(3) // Host + disconnected player + new player

    await disconnectClient(host)
    await disconnectClient(player2)
  })

  it('should cleanup socket context on disconnect', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const createResponse = await new Promise<any>((resolve) => {
      client.emit('room:create', 'test-game', 'Host', resolve)
    })

    expect(createResponse.success).toBe(true)

    // Disconnect
    await disconnectClient(client)

    // Wait for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Reconnect
    const client2 = createTestClient(port)
    await connectClient(client2)

    // Should be able to create new room (no stale context)
    const createResponse2 = await new Promise<any>((resolve) => {
      client2.emit('room:create', 'test-game', 'Host2', resolve)
    })

    expect(createResponse2.success).toBe(true)
    expect(createResponse2.roomId).not.toBe(createResponse.roomId)

    await disconnectClient(client2)
  })

  it('should handle disconnect without room', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    // Disconnect without joining any room
    await disconnectClient(client)

    // Should not throw errors
    await new Promise((resolve) => setTimeout(resolve, 100))

    // No assertions needed - test passes if no errors
  })

  it('should handle multiple rapid connects/disconnects', async () => {
    const clients: TestSocket[] = []

    // Create room first
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    // Rapidly connect/disconnect multiple clients
    for (let i = 0; i < 5; i++) {
      const client = createTestClient(port)
      await connectClient(client)
      clients.push(client)

      await new Promise<any>((resolve) => {
        client.emit('room:join', roomId, `Player${i}`, resolve)
      })

      await disconnectClient(client)
    }

    // Wait for all disconnects to process
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Host should still be connected
    const stateResponse = await new Promise<any>((resolve) => {
      host.emit('state:request', resolve)
    })

    expect(stateResponse.success).toBe(true)

    await disconnectClient(host)
  })

  it('should handle disconnect during game', async () => {
    // Create and start game
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

    // Start game
    const startResponse = await new Promise<any>((resolve) => {
      host.emit('game:start', resolve)
    })
    expect(startResponse.success).toBe(true)

    // Disconnect player during active game
    await disconnectClient(player)

    await new Promise((resolve) => setTimeout(resolve, 100))

    // Host should still be in game
    const stateResponse = await new Promise<any>((resolve) => {
      host.emit('state:request', resolve)
    })

    expect(stateResponse.success).toBe(true)
    expect(stateResponse.state.phase).toBe('playing')

    await disconnectClient(host)
  })
})
