import React from 'react';
import { getPlayerColor, getPlayerInitials } from '../utils/colorHash';

export interface PlayerAvatarProps {
  /** Player name to display */
  name: string;
  /** Override auto-generated color */
  color?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show online status indicator */
  showStatus?: boolean;
  /** Online status (only shown if showStatus is true) */
  isOnline?: boolean;
  /** Show host crown icon */
  isHost?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
};

const crownSizeClasses = {
  xs: 'w-3 h-3 -top-1 -right-1',
  sm: 'w-4 h-4 -top-1.5 -right-1.5',
  md: 'w-5 h-5 -top-2 -right-2',
  lg: 'w-6 h-6 -top-2 -right-2',
  xl: 'w-8 h-8 -top-3 -right-3',
};

/**
 * PlayerAvatar component displays a player's avatar with initials and color
 * Supports online status indicator and host crown badge
 */
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  color,
  size = 'md',
  showStatus = false,
  isOnline = false,
  isHost = false,
  className = '',
}) => {
  const initials = getPlayerInitials(name);
  const backgroundColor = color || getPlayerColor(name);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full font-semibold text-white select-none ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor }}
      title={name}
      role="img"
      aria-label={`${name}${isHost ? ' (host)' : ''}${showStatus ? ` (${isOnline ? 'online' : 'offline'})` : ''}`}
    >
      {/* Initials */}
      <span>{initials}</span>

      {/* Status indicator */}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-white ${statusSizeClasses[size]} ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
          aria-hidden="true"
        />
      )}

      {/* Host crown */}
      {isHost && (
        <span
          className={`absolute rounded-full bg-yellow-400 flex items-center justify-center ${crownSizeClasses[size]}`}
          aria-hidden="true"
          title="Host"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3/4 h-3/4 text-yellow-600"
          >
            <path d="M12 2L15 8.5L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9 8.5L12 2Z" />
          </svg>
        </span>
      )}
    </div>
  );
};
