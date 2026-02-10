/**
 * Socket.io client utilities for integration tests
 */

import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../../../src/types'

export type TestSocket = Socket<ServerToClientEvents, ClientToServerEvents>

/**
 * Create a test Socket.io client
 *
 * @param port - Server port to connect to
 * @returns Socket.io client instance
 */
export function createTestClient(port: number): TestSocket {
  return io(`http://localhost:${port}`, {
    transports: ['websocket'],
    autoConnect: false,
    reconnection: false, // Disable reconnection for tests
    timeout: 10000, // Increase connection timeout
  })
}

/**
 * Connect a Socket.io client and wait for connection
 *
 * @param socket - Socket.io client instance
 */
export function connectClient(socket: TestSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.once('connect', resolve)
    socket.once('connect_error', reject)
    socket.connect()
  })
}

/**
 * Disconnect a Socket.io client and wait for disconnection
 *
 * @param socket - Socket.io client instance
 */
export function disconnectClient(socket: TestSocket): Promise<void> {
  return new Promise((resolve) => {
    socket.once('disconnect', resolve)
    socket.disconnect()
  })
}

/**
 * Wait for a specific event from the server
 *
 * @param socket - Socket.io client instance
 * @param event - Event name to wait for
 * @returns Event data
 */
export function waitForEvent<T = any>(
  socket: TestSocket,
  event: string
): Promise<T> {
  return new Promise((resolve) => {
    socket.once(event as any, resolve)
  })
}
