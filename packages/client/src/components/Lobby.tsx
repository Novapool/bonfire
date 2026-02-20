import React, { ReactNode, useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { usePlayer } from '../hooks/usePlayer';
import { useRoom } from '../hooks/useRoom';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '@bonfire/core';

export interface LobbyProps {
  /** Override automatic room code detection */
  roomCode?: string;
  /** Custom player rendering function */
  renderPlayer?: (player: Player, isHost: boolean) => ReactNode;
  /** Show ready states for players */
  showReadyStates?: boolean;
  /** Custom start button handler */
  onStart?: () => void | Promise<void>;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles for the root element */
  style?: React.CSSProperties;
  /** Hide the start button */
  hideStartButton?: boolean;
}

/**
 * Pre-built lobby component with room code display, player list, and start button
 * Automatically connects to game state via hooks
 */
export const Lobby: React.FC<LobbyProps> = ({
  roomCode: overrideRoomCode,
  renderPlayer,
  showReadyStates = false,
  onStart,
  hideStartButton = false,
  className = '',
  style,
}) => {
  const { state } = useGameState();
  const { isHost, playerId } = usePlayer();
  const { startGame } = useRoom();
  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Room code from metadata or override
  const roomCode = overrideRoomCode || (state?.metadata?.roomCode as string) || state?.roomId || '';
  const players = state?.players || [];

  // Config from metadata or defaults
  const config = (state?.metadata?.config as any) || {};
  const minPlayers = config.minPlayers || 2;
  const maxPlayers = config.maxPlayers || 8;

  // Find host from players array
  const hostPlayer = players.find((p) => p.isHost);

  const canStart = isHost && players.length >= minPlayers;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const handleStart = async () => {
    if (!canStart) return;

    setIsStarting(true);
    try {
      if (onStart) {
        await onStart();
      } else {
        const result = await startGame();
        if (!result.success) {
          console.error('Failed to start game:', result.error);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div
      className={`max-w-md mx-auto p-6 bg-white rounded-lg shadow-md ${className}`}
      style={style}
      role="region"
      aria-label="Game lobby"
    >
      {/* Room Code Section */}
      <div className="text-center mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-2">
          Room Code
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className="text-4xl font-bold tracking-wider font-mono text-indigo-500">
            {roomCode || '------'}
          </div>
          {roomCode && (
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Copy room code"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Player Count */}
      <div className="text-center mb-4">
        <span className="text-sm text-gray-500">
          {players.length} / {maxPlayers} players
        </span>
      </div>

      {/* Player List */}
      <div className="space-y-2 mb-6">
        {players.map((player) => {
          const isPlayerHost = player.isHost;

          if (renderPlayer) {
            return (
              <div key={player.id}>{renderPlayer(player, isPlayerHost)}</div>
            );
          }

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                player.id === playerId
                  ? 'bg-indigo-50'
                  : 'bg-gray-100'
              }`}
            >
              <PlayerAvatar
                name={player.name}
                size="md"
                isHost={isPlayerHost}
                showStatus={false}
              />
              <div className="flex-1">
                <div className="font-medium">
                  {player.name}
                  {player.id === playerId && (
                    <span className="text-sm text-gray-500 ml-2">
                      (You)
                    </span>
                  )}
                </div>
                {showReadyStates && (
                  <div className="text-sm text-gray-500">
                    {(player.metadata?.status as string) === 'ready' ? 'Ready' : 'Not ready'}
                  </div>
                )}
              </div>
              {isPlayerHost && (
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                  HOST
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Start Button */}
      {!hideStartButton && isHost && (
        <div>
          <button
            onClick={handleStart}
            disabled={!canStart || isStarting}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
              canStart && !isStarting
                ? 'bg-indigo-500 hover:bg-indigo-600 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            aria-label="Start game"
          >
            {isStarting ? 'Starting...' : 'Start Game'}
          </button>
          {!canStart && players.length < minPlayers && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Need at least {minPlayers} players to start
            </p>
          )}
        </div>
      )}

      {/* Waiting message for non-hosts */}
      {!hideStartButton && !isHost && (
        <div className="text-center text-gray-500">
          <p className="text-sm">Waiting for host to start the game...</p>
        </div>
      )}
    </div>
  );
};
