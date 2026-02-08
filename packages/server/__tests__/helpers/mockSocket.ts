/**
 * Mock Socket.io for unit testing
 */

import type { TypedSocket, TypedSocketServer } from '../../src/types'
import { vi } from 'vitest'

/**
 * Mock Socket.io socket
 */
export class MockSocket {
  id: string
  rooms: Set<string> = new Set()
  emitMock = vi.fn()
  joinMock = vi.fn()
  leaveMock = vi.fn()
  disconnectMock = vi.fn()

  constructor(id: string) {
    this.id = id
  }

  emit(...args: any[]) {
    this.emitMock(...args)
    return true
  }

  join(room: string) {
    this.joinMock(room)
    this.rooms.add(room)
    return this
  }

  leave(room: string) {
    this.leaveMock(room)
    this.rooms.delete(room)
    return this
  }

  disconnect(close?: boolean) {
    this.disconnectMock(close)
  }

  to(room: string) {
    return this
  }

  // Type assertion helper
  asTypedSocket(): TypedSocket {
    return this as any
  }

  reset() {
    this.emitMock.mockClear()
    this.joinMock.mockClear()
    this.leaveMock.mockClear()
    this.disconnectMock.mockClear()
  }
}

/**
 * Mock Socket.io server
 */
export class MockSocketServer {
  sockets: Map<string, MockSocket> = new Map()
  toMock = vi.fn()
  emitMock = vi.fn()
  private roomEmitters: Map<string, MockRoomEmitter> = new Map()

  /**
   * Create a mock socket and add it to the server
   */
  createSocket(id: string): MockSocket {
    const socket = new MockSocket(id)
    this.sockets.set(id, socket)
    return socket
  }

  /**
   * Mock the to() method for room-based broadcasting
   */
  to(room: string): MockRoomEmitter {
    this.toMock(room)
    if (!this.roomEmitters.has(room)) {
      this.roomEmitters.set(room, new MockRoomEmitter(room, this))
    }
    return this.roomEmitters.get(room)!
  }

  /**
   * Emit to all sockets
   */
  emit(...args: any[]) {
    this.emitMock(...args)
    return true
  }

  /**
   * Get all sockets in a room
   */
  getSocketsInRoom(roomId: string): MockSocket[] {
    return Array.from(this.sockets.values()).filter((socket) =>
      socket.rooms.has(roomId)
    )
  }

  // Type assertion helper
  asTypedServer(): TypedSocketServer {
    return this as any
  }

  reset() {
    this.toMock.mockClear()
    this.emitMock.mockClear()
    this.roomEmitters.clear()
    this.sockets.forEach((socket) => socket.reset())
  }

  clear() {
    this.sockets.clear()
    this.roomEmitters.clear()
    this.reset()
  }
}

/**
 * Mock room emitter (returned by io.to())
 */
export class MockRoomEmitter {
  emitMock = vi.fn()

  constructor(
    private room: string,
    private server: MockSocketServer
  ) {}

  emit(...args: any[]) {
    this.emitMock(...args)
    // Also emit to all sockets in this room
    const sockets = this.server.getSocketsInRoom(this.room)
    sockets.forEach((socket) => socket.emit(...args))
    return true
  }

  reset() {
    this.emitMock.mockClear()
  }
}

/**
 * Create a mock socket server with utilities
 */
export function createMockSocketServer(): MockSocketServer {
  return new MockSocketServer()
}

/**
 * Create a mock socket with utilities
 */
export function createMockSocket(id: string = 'socket-1'): MockSocket {
  return new MockSocket(id)
}
