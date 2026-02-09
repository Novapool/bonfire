import { useCallback } from 'react';
import { useBonfireContext } from '../context/BonfireProvider';
import { useGameState } from './useGameState';
import type { RoomId } from '@bonfire/core';
import type { RoomCreateResponse, RoomJoinResponse, BaseResponse, ActionResponse } from '../types';

/**
 * Room and game operations: create, join, leave, start, and send actions.
 *
 * @example
 * const { roomId, isInRoom, createRoom, joinRoom, startGame, sendAction } = useRoom();
 * await createRoom('my-game', 'Alice');
 */
export function useRoom(): {
  roomId: RoomId | null;
  isInRoom: boolean;
  createRoom: (gameType: string, hostName: string) => Promise<RoomCreateResponse>;
  joinRoom: (roomId: RoomId, playerName: string) => Promise<RoomJoinResponse>;
  leaveRoom: () => Promise<BaseResponse>;
  startGame: () => Promise<BaseResponse>;
  sendAction: (actionType: string, payload: unknown) => Promise<ActionResponse>;
} {
  const { client } = useBonfireContext();
  // Subscribe to state so roomId re-renders when it changes
  useGameState();

  const roomId = client.roomId;
  const isInRoom = roomId !== null;

  const createRoom = useCallback(
    (gameType: string, hostName: string) => client.createRoom(gameType, hostName),
    [client]
  );

  const joinRoom = useCallback(
    (roomId: RoomId, playerName: string) => client.joinRoom(roomId, playerName),
    [client]
  );

  const leaveRoom = useCallback(() => client.leaveRoom(), [client]);

  const startGame = useCallback(() => client.startGame(), [client]);

  const sendAction = useCallback(
    (actionType: string, payload: unknown) => client.sendAction(actionType, payload),
    [client]
  );

  return { roomId, isInRoom, createRoom, joinRoom, leaveRoom, startGame, sendAction };
}
