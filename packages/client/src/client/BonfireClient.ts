/**
 * BonfireClient - Socket.io wrapper for connecting to a Bonfire server.
 *
 * This is a plain TypeScript class (no React dependency) that manages
 * the socket connection, tracks game state, and provides a subscription
 * API for React hooks to consume.
 */

import { io, type Socket } from 'socket.io-client';
import type { GameState, PlayerId, RoomId } from '@bonfire/core';
import type {
  BonfireClientConfig,
  ConnectionStatus,
  RoomCreateResponse,
  RoomJoinResponse,
  BaseResponse,
  ActionResponse,
  StateResponse,
  ErrorResponse,
  BonfireGameEvent,
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types';

type Listener<T> = (data: T) => void;

type TypedClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class BonfireClient {
  private socket: TypedClientSocket;
  private _status: ConnectionStatus = 'disconnected';
  private _gameState: GameState | null = null;
  private _playerId: PlayerId | null = null;
  private _roomId: RoomId | null = null;

  private stateListeners = new Set<Listener<GameState>>();
  private statusListeners = new Set<Listener<ConnectionStatus>>();
  private errorListeners = new Set<Listener<ErrorResponse>>();
  private eventListeners = new Map<string, Set<Listener<unknown>>>();
  private roomClosedListeners = new Set<Listener<string>>();

  constructor(config: BonfireClientConfig) {
    this.socket = io(config.url, {
      transports: ['websocket'],
      autoConnect: config.autoConnect ?? false,
      reconnection: config.reconnection ?? true,
      reconnectionAttempts: config.reconnectionAttempts ?? 5,
      ...config.socketOptions,
    }) as TypedClientSocket;

    this.setupSocketListeners();
  }

  // ---- Getters ----

  get status(): ConnectionStatus {
    return this._status;
  }

  get gameState(): GameState | null {
    return this._gameState;
  }

  get playerId(): PlayerId | null {
    return this._playerId;
  }

  get roomId(): RoomId | null {
    return this._roomId;
  }

  get isConnected(): boolean {
    return this._status === 'connected';
  }

  // ---- Connection ----

  connect(): void {
    this.setStatus('connecting');
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
    this.setStatus('disconnected');
    this._gameState = null;
    this._playerId = null;
    this._roomId = null;
  }

  // ---- Room Operations ----

  createRoom(gameType: string, hostName: string): Promise<RoomCreateResponse> {
    return new Promise((resolve) => {
      this.socket.emit('room:create', gameType, hostName, (response: RoomCreateResponse) => {
        if (response.success && response.state && response.roomId) {
          this._roomId = response.roomId;
          this._gameState = response.state;
          const host = response.state.players.find((p) => p.isHost);
          if (host) this._playerId = host.id;
          this.notifyStateListeners(response.state);
        }
        resolve(response);
      });
    });
  }

  joinRoom(roomId: RoomId, playerName: string): Promise<RoomJoinResponse> {
    return new Promise((resolve) => {
      this.socket.emit('room:join', roomId, playerName, (response: RoomJoinResponse) => {
        if (response.success && response.state && response.playerId) {
          this._roomId = roomId;
          this._playerId = response.playerId;
          this._gameState = response.state;
          this.notifyStateListeners(response.state);
        }
        resolve(response);
      });
    });
  }

  leaveRoom(): Promise<BaseResponse> {
    return new Promise((resolve) => {
      this.socket.emit('room:leave', (response: BaseResponse) => {
        if (response.success) {
          this._roomId = null;
          this._playerId = null;
          this._gameState = null;
        }
        resolve(response);
      });
    });
  }

  // ---- Game Operations ----

  startGame(): Promise<BaseResponse> {
    return new Promise((resolve) => {
      this.socket.emit('game:start', (response: BaseResponse) => {
        resolve(response);
      });
    });
  }

  sendAction(actionType: string, payload: unknown): Promise<ActionResponse> {
    return new Promise((resolve) => {
      this.socket.emit('game:action', actionType, payload, (response: ActionResponse) => {
        resolve(response);
      });
    });
  }

  requestState(): Promise<StateResponse> {
    return new Promise((resolve) => {
      this.socket.emit('state:request', (response: StateResponse) => {
        if (response.success && response.state) {
          this._gameState = response.state;
          this.notifyStateListeners(response.state);
        }
        resolve(response);
      });
    });
  }

  // ---- Subscription API ----

  onStateChange(listener: Listener<GameState>): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  onStatusChange(listener: Listener<ConnectionStatus>): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  onError(listener: Listener<ErrorResponse>): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  onGameEvent(eventType: string, listener: Listener<unknown>): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
    return () => {
      this.eventListeners.get(eventType)?.delete(listener);
    };
  }

  onRoomClosed(listener: Listener<string>): () => void {
    this.roomClosedListeners.add(listener);
    return () => {
      this.roomClosedListeners.delete(listener);
    };
  }

  /** Expose raw socket for advanced use cases */
  getSocket(): TypedClientSocket {
    return this.socket;
  }

  // ---- Internal ----

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.setStatus('connected');
    });

    this.socket.on('disconnect', () => {
      this.setStatus('disconnected');
    });

    this.socket.io.on('reconnect_attempt', () => {
      this.setStatus('reconnecting');
    });

    this.socket.on('state:update', (state: GameState) => {
      this._gameState = state;
      this.notifyStateListeners(state);
    });

    this.socket.on('state:sync', (state: GameState) => {
      this._gameState = state;
      this.notifyStateListeners(state);
    });

    this.socket.on('event:emit', (event: BonfireGameEvent) => {
      const listeners = this.eventListeners.get(event.type);
      if (listeners) {
        listeners.forEach((l) => l(event.payload));
      }
    });

    this.socket.on('error', (error: ErrorResponse) => {
      this.errorListeners.forEach((l) => l(error));
    });

    this.socket.on('room:closed', (reason: string) => {
      this._roomId = null;
      this._playerId = null;
      this._gameState = null;
      this.roomClosedListeners.forEach((l) => l(reason));
    });
  }

  private setStatus(status: ConnectionStatus): void {
    this._status = status;
    this.statusListeners.forEach((l) => l(status));
  }

  private notifyStateListeners(state: GameState): void {
    this.stateListeners.forEach((l) => l(state));
  }
}
