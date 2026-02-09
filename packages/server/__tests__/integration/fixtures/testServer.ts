/**
 * Test server fixture for integration tests
 */

import { SocketServer } from '../../../src/core/SocketServer'
import { InMemoryAdapter } from '../../../src/database/InMemoryAdapter'
import type { ServerConfig } from '../../../src/types'
import { createTestGame } from '../../helpers/testGame'

export interface TestServerSetup {
  server: SocketServer
  port: number
  cleanup: () => Promise<void>
}

/**
 * Create a test server instance
 *
 * @param port - Port to listen on (0 = auto-assign random port)
 * @returns Test server setup with cleanup function
 */
export async function createTestServer(port: number = 0): Promise<TestServerSetup> {
  const config: ServerConfig = {
    port,
    nodeEnv: 'test',
    admin: {
      enabled: true,
      apiKey: 'test-admin-key',
    },
    cors: {
      origin: '*',
    },
  }

  const databaseAdapter = new InMemoryAdapter()
  const server = new SocketServer(
    config,
    databaseAdapter,
    (roomId, synchronizer) => createTestGame(roomId, synchronizer),
    'test-game'
  )

  try {
    // Wait for server to fully start
    await server.start()

    // Get actual port (if auto-assigned)
    const httpServer = server.getHttpServer()
    const address = httpServer.address()

    if (!address) {
      throw new Error('Server address is null - server did not start properly')
    }

    const actualPort = typeof address === 'object' && address ? address.port : port

    // Give server a moment to fully initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    const cleanup = async () => {
      try {
        await server.shutdown()
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    }

    return {
      server,
      port: actualPort,
      cleanup,
    }
  } catch (error) {
    console.error('Error creating test server:', error)
    throw error
  }
}
