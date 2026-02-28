import React, { ReactNode, useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { usePlayer } from '../hooks/usePlayer';
import { useRoom } from '../hooks/useRoom';
import { PlayerAvatar } from './PlayerAvatar';
import { C, radius, shadow } from '../utils/theme';
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
 * Pre-built lobby component with room code display, player list, and start button.
 * Automatically connects to game state via hooks.
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
  const [copyHovered, setCopyHovered] = useState(false);
  const [startHovered, setStartHovered] = useState(false);

  const roomCode = overrideRoomCode || (state?.metadata?.roomCode as string) || state?.roomId || '';
  const players = state?.players || [];

  const config = (state?.metadata?.config as any) || {};
  const minPlayers = config.minPlayers || 2;
  const maxPlayers = config.maxPlayers || 8;

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
        if (!result.success) console.error('Failed to start game:', result.error);
      }
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div
      className={className}
      style={{
        maxWidth: '28rem',
        margin: '0 auto',
        padding: '1.5rem',
        backgroundColor: C.white,
        borderRadius: radius.md,
        boxShadow: shadow.card,
        ...style,
      }}
      role="region"
      aria-label="Game lobby"
    >
      {/* Room Code Section */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 500, color: C.gray500, marginBottom: '0.5rem', marginTop: 0 }}>
          Room Code
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'monospace', color: C.indigo500 }}>
            {roomCode || '------'}
          </div>
          {roomCode && (
            <button
              onClick={handleCopyCode}
              onMouseEnter={() => setCopyHovered(true)}
              onMouseLeave={() => setCopyHovered(false)}
              style={{
                padding: '0.5rem',
                borderRadius: radius.md,
                border: 'none',
                backgroundColor: copyHovered ? C.gray100 : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Copy room code"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg data-testid="copied-icon" style={{ width: '1.5rem', height: '1.5rem', color: C.green500 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg style={{ width: '1.5rem', height: '1.5rem', color: C.gray500 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Player Count */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: C.gray500 }}>
          {players.length} / {maxPlayers} players
        </span>
      </div>

      {/* Player List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {players.map((player) => {
          const isPlayerHost = player.isHost;

          if (renderPlayer) {
            return <div key={player.id}>{renderPlayer(player, isPlayerHost)}</div>;
          }

          return (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: radius.md,
                backgroundColor: player.id === playerId ? C.indigo50 : C.gray100,
              }}
            >
              <PlayerAvatar name={player.name} size="md" isHost={isPlayerHost} showStatus={false} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, color: C.gray900 }}>
                  {player.name}
                  {player.id === playerId && (
                    <span style={{ fontSize: '0.875rem', color: C.gray500, marginLeft: '0.5rem' }}>(You)</span>
                  )}
                </div>
                {showReadyStates && (
                  <div style={{ fontSize: '0.875rem', color: C.gray500 }}>
                    {(player.metadata?.status as string) === 'ready' ? 'Ready' : 'Not ready'}
                  </div>
                )}
              </div>
              {isPlayerHost && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: C.yellow600,
                  backgroundColor: C.yellow100,
                  padding: '0.25rem 0.5rem',
                  borderRadius: radius.sm,
                }}>
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
            onMouseEnter={() => setStartHovered(true)}
            onMouseLeave={() => setStartHovered(false)}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              borderRadius: radius.md,
              border: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              fontFamily: 'inherit',
              color: C.white,
              transition: 'all 0.15s ease',
              cursor: canStart && !isStarting ? 'pointer' : 'not-allowed',
              backgroundColor: canStart && !isStarting
                ? (startHovered ? C.indigo600 : C.indigo500)
                : C.gray300,
            }}
            aria-label="Start game"
          >
            {isStarting ? 'Starting...' : 'Start Game'}
          </button>
          {!canStart && players.length < minPlayers && (
            <p style={{ fontSize: '0.875rem', color: C.gray500, textAlign: 'center', marginTop: '0.5rem', marginBottom: 0 }}>
              Need at least {minPlayers} players to start
            </p>
          )}
        </div>
      )}

      {/* Waiting message for non-hosts */}
      {!hideStartButton && !isHost && (
        <div style={{ textAlign: 'center', color: C.gray500 }}>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>Waiting for host to start the game...</p>
        </div>
      )}
    </div>
  );
};
