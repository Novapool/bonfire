import React, { ReactNode } from 'react';

export type PromptVariant = 'standard' | 'spicy' | 'creative' | 'dare';

export interface PromptCardProps {
  /** The prompt or question text */
  prompt: string;
  /** Visual variant affecting color theme */
  variant?: PromptVariant;
  /** Optional category label */
  category?: string;
  /** Optional round number */
  round?: number;
  /** Total rounds for round display */
  totalRounds?: number;
  /** Optional subtitle or instructions */
  subtitle?: string;
  /** Additional content rendered below the prompt */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles for the root element */
  style?: React.CSSProperties;
  /** Whether to animate in on mount */
  animate?: boolean;
}

const variantConfig: Record<PromptVariant, { bg: string; border: string; badge: string; badgeText: string; icon: string }> = {
  standard: {
    bg: 'bg-white',
    border: 'border-indigo-200',
    badge: 'bg-indigo-50 text-indigo-600',
    badgeText: 'Standard',
    icon: '💬',
  },
  spicy: {
    bg: 'bg-white',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'Spicy',
    icon: '🌶️',
  },
  creative: {
    bg: 'bg-white',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    badgeText: 'Creative',
    icon: '🎨',
  },
  dare: {
    bg: 'bg-white',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    badgeText: 'Dare',
    icon: '⚡',
  },
};

/**
 * Themed card for displaying game prompts, questions, or dares.
 * Supports multiple visual variants for different prompt types.
 */
export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  variant = 'standard',
  category,
  round,
  totalRounds,
  subtitle,
  children,
  className = '',
  style,
  animate: _animate = false,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      className={`
        rounded-xl border-2 shadow-md p-6
        ${config.bg} ${config.border}
        ${className}
      `.trim()}
      style={style}
      role="article"
      aria-label="Game prompt"
    >
      {/* Header: round info and variant badge */}
      <div className="flex items-center justify-between mb-4">
        {round !== undefined ? (
          <span className="text-sm text-gray-500">
            Round {round}{totalRounds !== undefined ? ` of ${totalRounds}` : ''}
          </span>
        ) : (
          <span />
        )}
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.badge}`}
        >
          <span aria-hidden="true">{config.icon}</span>
          {category || config.badgeText}
        </span>
      </div>

      {/* Prompt text */}
      <p className="text-xl font-semibold text-center leading-relaxed text-gray-900 mb-2">
        {prompt}
      </p>

      {/* Subtitle / instructions */}
      {subtitle && (
        <p className="text-sm text-center text-gray-500 mt-2">{subtitle}</p>
      )}

      {/* Additional slot content */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
