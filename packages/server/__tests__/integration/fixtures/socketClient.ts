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
 * @param timeout - Connection timeout in milliseconds
 */
export function connectClient(socket: TestSocket, timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Connection timeout'))
    }, timeout)

    socket.once('connect', () => {
      clearTimeout(timer)
      resolve()
    })

    socket.once('connect_error', (error) => {
      clearTimeout(timer)
      reject(error)
    })

    socket.connect()
  })
}

/**
 * Disconnect a Socket.io client and wait for disconnection
 *
 * @param socket - Socket.io client instance
 * @param timeout - Disconnection timeout in milliseconds
 */
export function disconnectClient(socket: TestSocket, timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Disconnection timeout'))
    }, timeout)

    socket.once('disconnect', () => {
      clearTimeout(timer)
      resolve()
    })

    socket.disconnect()
  })
}

/**
 * Wait for a specific event from the server
 *
 * @param socket - Socket.io client instance
 * @param event - Event name to wait for
 * @param timeout - Event timeout in milliseconds
 * @returns Event data
 */
export function waitForEvent<T = any>(
  socket: TestSocket,
  event: string,
  timeout: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Event timeout: ${event}`))
    }, timeout)

    socket.once(event as any, (data: T) => {
      clearTimeout(timer)
      resolve(data)
    })
  })
}
