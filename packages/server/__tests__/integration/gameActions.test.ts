/**
 * Integration tests for game actions and lifecycle
 *
 * Tests game state transitions:
 * - Starting games
 * - Authorization (host-only actions)
 * - Game action handling
 * - State updates
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestServer, type TestServerSetup } from './fixtures/testServer'
import { createTestClient, connectClient, disconnectClient, type TestSocket } from './fixtures/socketClient'

describe('Game Actions Integration', () => {
  let testSetup: TestServerSetup
  let port: number

  beforeEach(async () => {
    testSetup = await createTestServer()
    port = testSetup.port
  })

  afterEach(async () => {
    await testSetup.cleanup()
  })

  it('should allow host to start game', async () => {
    // Create room
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })

    expect(createResponse.success).toBe(true)
    const roomId = createResponse.roomId

    // Join with second player
    const player = createTestClient(port)
    await connectClient(player)

    await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })

    // Host starts game
    const startResponse = await new Promise<any>((resolve) => {
      host.emit('game:start', resolve)
    })

    expect(startResponse.success).toBe(true)

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should prevent non-host from starting game', async () => {
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

    await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })

    // Player tries to start (should fail)
    const startResponse = await new Promise<any>((resolve) => {
      player.emit('game:start', resolve)
    })

    expect(startResponse.success).toBe(false)
    expect(startResponse.code).toBe('UNAUTHORIZED')
    expect(startResponse.error).toContain('host')

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should reject game start when not in room', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('game:start', resolve)
    })

    expect(response.success).toBe(false)
    expect(response.code).toBe('NOT_IN_ROOM')

    await disconnectClient(client)
  })

  it('should handle game action (stub)', async () => {
    // Create and join room
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })

    // Try game action
    const actionResponse = await new Promise<any>((resolve) => {
      host.emit('game:action', 'test-action', { data: 'test' }, resolve)
    })

    // Should return not implemented (Phase 3 stub)
    expect(actionResponse.success).toBe(false)
    expect(actionResponse.code).toBe('NOT_IMPLEMENTED')

    await disconnectClient(host)
  })

  it('should reject game action when not in room', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('game:action', 'test-action', {}, resolve)
    })

    expect(response.success).toBe(false)
    expect(response.code).toBe('NOT_IN_ROOM')

    await disconnectClient(client)
  })

  it('should reject game action with invalid action type', async () => {
    // Create room
    const host = createTestClient(port)
    await connectClient(host)

    await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })

    // Invalid action type
    const response = await new Promise<any>((resolve) => {
      host.emit('game:action', '', {}, resolve)
    })

    expect(response.success).toBe(false)
    expect(response.code).toBe('INVALID_INPUT')

    await disconnectClient(host)
  })
})
