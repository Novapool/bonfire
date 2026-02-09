/**
 * Integration tests for error handling
 *
 * Tests error scenarios and edge cases:
 * - Room not found
 * - Invalid inputs
 * - Unauthorized operations
 * - Room full
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestServer, type TestServerSetup } from './fixtures/testServer'
import { createTestClient, connectClient, disconnectClient, type TestSocket } from './fixtures/socketClient'

describe('Error Handling Integration', () => {
  let testSetup: TestServerSetup
  let port: number

  beforeEach(async () => {
    testSetup = await createTestServer()
    port = testSetup.port
  })

  afterEach(async () => {
    await testSetup.cleanup()
  })

  it('should handle room not found', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('room:join', 'NOROOM', 'Player', resolve)
    })

    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
    expect(response.code).toBe('ROOM_NOT_FOUND')
    expect(response.error).toContain('NOROOM')

    await disconnectClient(client)
  })

  it('should handle invalid game type', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('room:create', '', 'Host', resolve)
    })

    expect(response.success).toBe(false)
    expect(response.code).toBe('INVALID_INPUT')
    expect(response.error).toContain('game type')

    await disconnectClient(client)
  })

  it('should handle invalid player name', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    // Empty name
    const response1 = await new Promise<any>((resolve) => {
      client.emit('room:create', 'test-game', '', resolve)
    })

    expect(response1.success).toBe(false)
    expect(response1.code).toBe('INVALID_INPUT')

    // Whitespace only
    const response2 = await new Promise<any>((resolve) => {
      client.emit('room:create', 'test-game', '   ', resolve)
    })

    expect(response2.success).toBe(false)
    expect(response2.code).toBe('INVALID_INPUT')

    await disconnectClient(client)
  })

  it('should handle invalid room ID', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    const response = await new Promise<any>((resolve) => {
      client.emit('room:join', '', 'Player', resolve)
    })

    expect(response.success).toBe(false)
    expect(response.code).toBe('INVALID_INPUT')

    await disconnectClient(client)
  })

  it('should handle operations when not in room', async () => {
    const client = createTestClient(port)
    await connectClient(client)

    // Leave without joining
    const leaveResponse = await new Promise<any>((resolve) => {
      client.emit('room:leave', resolve)
    })
    expect(leaveResponse.success).toBe(false)
    expect(leaveResponse.code).toBe('NOT_IN_ROOM')

    // Start without joining
    const startResponse = await new Promise<any>((resolve) => {
      client.emit('game:start', resolve)
    })
    expect(startResponse.success).toBe(false)
    expect(startResponse.code).toBe('NOT_IN_ROOM')

    // Action without joining
    const actionResponse = await new Promise<any>((resolve) => {
      client.emit('game:action', 'test', {}, resolve)
    })
    expect(actionResponse.success).toBe(false)
    expect(actionResponse.code).toBe('NOT_IN_ROOM')

    // State request without joining
    const stateResponse = await new Promise<any>((resolve) => {
      client.emit('state:request', resolve)
    })
    expect(stateResponse.success).toBe(false)
    expect(stateResponse.code).toBe('NOT_IN_ROOM')

    await disconnectClient(client)
  })

  it('should handle room full error', async () => {
    // Create room with max 8 players (from test game config)
    // We need to fill it up to test the room full error
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })
    const roomId = createResponse.roomId

    // Join with 7 more players (total 8 = max)
    const players = []
    for (let i = 2; i <= 8; i++) {
      const player = createTestClient(port)
      await connectClient(player)
      players.push(player)

      const joinResponse = await new Promise<any>((resolve) => {
        player.emit('room:join', roomId, `Player${i}`, resolve)
      })
      expect(joinResponse.success).toBe(true)
    }

    // Try to join with player 9 (should fail - room full)
    const player9 = createTestClient(port)
    await connectClient(player9)

    const join9Response = await new Promise<any>((resolve) => {
      player9.emit('room:join', roomId, 'Player9', resolve)
    })

    expect(join9Response.success).toBe(false)
    expect(join9Response.error).toBeDefined()
    // Error message comes from GameValidator, check for "full" or "maximum"
    expect(join9Response.error.toLowerCase()).toMatch(/full|maximum|max/)

    await disconnectClient(host)
    for (const player of players) {
      await disconnectClient(player)
    }
    await disconnectClient(player9)
  })

  it('should handle game start validation errors', async () => {
    // Create room with only host (need min 2 players)
    const host = createTestClient(port)
    await connectClient(host)

    const createResponse = await new Promise<any>((resolve) => {
      host.emit('room:create', 'test-game', 'Host', resolve)
    })

    // Try to start with only 1 player (should fail)
    const startResponse = await new Promise<any>((resolve) => {
      host.emit('game:start', resolve)
    })

    expect(startResponse.success).toBe(false)
    expect(startResponse.error).toBeDefined()
    // Error message from GameValidator
    expect(startResponse.error.toLowerCase()).toMatch(/player|minimum/)

    await disconnectClient(host)
  })
})
