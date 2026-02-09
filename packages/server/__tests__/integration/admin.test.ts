/**
 * Integration tests for admin endpoints
 *
 * Tests admin utilities:
 * - Get stats
 * - Force-end room
 * - Kick player
 * - Unauthorized access
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestServer, type TestServerSetup } from './fixtures/testServer'
import { createTestClient, connectClient, disconnectClient, waitForEvent, type TestSocket } from './fixtures/socketClient'

describe('Admin Utilities Integration', () => {
  let testSetup: TestServerSetup
  let port: number
  const adminKey = 'test-admin-key'

  beforeEach(async () => {
    testSetup = await createTestServer()
    port = testSetup.port
  })

  afterEach(async () => {
    await testSetup.cleanup()
  })

  it('should get server stats', async () => {
    // Create some rooms first
    const host1 = createTestClient(port)
    await connectClient(host1)
    await new Promise<any>((resolve) => {
      host1.emit('room:create', 'test-game', 'Host1', resolve)
    })

    const host2 = createTestClient(port)
    await connectClient(host2)
    await new Promise<any>((resolve) => {
      host2.emit('room:create', 'test-game', 'Host2', resolve)
    })

    // Get stats
    const response = await fetch(`http://localhost:${port}/admin/stats`, {
      headers: {
        'x-api-key': adminKey,
      },
    })

    expect(response.status).toBe(200)
    const stats = await response.json()

    expect(stats.totalRooms).toBe(2)
    expect(stats.totalPlayers).toBe(2)
    expect(stats.roomsByStatus).toBeDefined()
    expect(stats.roomsByStatus.waiting).toBe(2)
    expect(stats.uptime).toBeGreaterThan(0)
    expect(stats.memoryUsage).toBeDefined()

    await disconnectClient(host1)
    await disconnectClient(host2)
  })

  it('should reject stats request without admin key', async () => {
    const response = await fetch(`http://localhost:${port}/admin/stats`)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should reject stats request with wrong admin key', async () => {
    const response = await fetch(`http://localhost:${port}/admin/stats`, {
      headers: {
        'x-api-key': 'wrong-key',
      },
    })

    expect(response.status).toBe(401)
  })

  it('should force-end a room', async () => {
    // Create room
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    // Join player
    const player = createTestClient(port)
    await connectClient(player)

    await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })

    // Listen for room:closed event
    const hostClosedPromise = waitForEvent(host, 'room:closed', 1000)
    const playerClosedPromise = waitForEvent(player, 'room:closed', 1000)

    // Force-end room
    const response = await fetch(`http://localhost:${port}/admin/force-end/${roomId}`, {
      method: 'POST',
      headers: {
        'x-api-key': adminKey,
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)

    // Both clients should receive room:closed event
    const hostReason = await hostClosedPromise
    const playerReason = await playerClosedPromise

    expect(hostReason).toContain('admin')
    expect(playerReason).toContain('admin')

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should handle force-end for non-existent room', async () => {
    const response = await fetch(`http://localhost:${port}/admin/force-end/NOROOM`, {
      method: 'POST',
      headers: {
        'x-api-key': adminKey,
      },
    })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  it('should kick a player from room', async () => {
    // Create room
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    // Join player
    const player = createTestClient(port)
    await connectClient(player)

    const joinResponse = await new Promise<any>((resolve) => {
      player.emit('room:join', roomId, 'Player2', resolve)
    })
    const playerId = joinResponse.playerId

    // Listen for room:closed on player socket
    const kickPromise = waitForEvent(player, 'room:closed', 1000)

    // Kick player
    const response = await fetch(`http://localhost:${port}/admin/kick/${roomId}/${playerId}`, {
      method: 'POST',
      headers: {
        'x-api-key': adminKey,
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)

    // Player should receive kick notification
    const reason = await kickPromise
    expect(reason).toContain('kicked')

    // Host should still be in room
    const stateResponse = await new Promise<any>((resolve) => {
      host.emit('state:request', resolve)
    })

    expect(stateResponse.success).toBe(true)
    expect(stateResponse.state.players).toHaveLength(1)

    await disconnectClient(host)
    await disconnectClient(player)
  })

  it('should handle kick for non-existent room', async () => {
    const response = await fetch(`http://localhost:${port}/admin/kick/NOROOM/player-123`, {
      method: 'POST',
      headers: {
        'x-api-key': adminKey,
      },
    })

    expect(response.status).toBe(404)
  })

  it('should reject admin operations without auth', async () => {
    // Force-end without auth
    const response1 = await fetch(`http://localhost:${port}/admin/force-end/ABC123`, {
      method: 'POST',
    })
    expect(response1.status).toBe(401)

    // Kick without auth
    const response2 = await fetch(`http://localhost:${port}/admin/kick/ABC123/player-1`, {
      method: 'POST',
    })
    expect(response2.status).toBe(401)
  })

  it('should show room stats by status', async () => {
    // Create waiting room
    const host1 = createTestClient(port)
    await connectClient(host1)
    const createResponse1 = await new Promise<any>((resolve) => {
      host1.emit('room:create', 'test-game', 'Host1', resolve)
    })

    // Create and start active room
    const host2 = createTestClient(port)
    await connectClient(host2)
    const createResponse2 = await new Promise<any>((resolve) => {
      host2.emit('room:create', 'test-game', 'Host2', resolve)
    })

    const player2 = createTestClient(port)
    await connectClient(player2)
    await new Promise<any>((resolve) => {
      player2.emit('room:join', createResponse2.roomId, 'Player2', resolve)
    })

    await new Promise<any>((resolve) => {
      host2.emit('game:start', resolve)
    })

    // Get stats
    const response = await fetch(`http://localhost:${port}/admin/stats`, {
      headers: {
        'x-api-key': adminKey,
      },
    })

    const stats = await response.json()

    expect(stats.totalRooms).toBe(2)
    expect(stats.roomsByStatus.waiting).toBe(1)
    expect(stats.roomsByStatus.playing).toBe(1)

    await disconnectClient(host1)
    await disconnectClient(host2)
    await disconnectClient(player2)
  })
})
