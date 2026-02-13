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
  /** Whether to animate in on mount */
  animate?: boolean;
}

const variantConfig: Record<PromptVariant, { bg: string; border: string; badge: string; badgeText: string; icon: string }> = {
  standard: {
    bg: 'bg-surface',
    border: 'border-brand-primary/30',
    badge: 'bg-brand-primary/10 text-brand-primary',
    badgeText: 'Standard',
    icon: '💬',
  },
  spicy: {
    bg: 'bg-surface',
    border: 'border-red-400/40',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'Spicy',
    icon: '🌶️',
  },
  creative: {
    bg: 'bg-surface',
    border: 'border-purple-400/40',
    badge: 'bg-purple-100 text-purple-700',
    badgeText: 'Creative',
    icon: '🎨',
  },
  dare: {
    bg: 'bg-surface',
    border: 'border-orange-400/40',
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
  animate = false,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      className={`
        rounded-xl border-2 shadow-card p-6
        ${config.bg} ${config.border}
        ${animate ? 'animate-slide-up' : ''}
        ${className}
      `.trim()}
      role="article"
      aria-label="Game prompt"
    >
      {/* Header: round info and variant badge */}
      <div className="flex items-center justify-between mb-4">
        {round !== undefined ? (
          <span className="text-sm text-text-secondary">
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
      <p className="text-xl font-semibold text-center leading-relaxed text-text-primary mb-2">
        {prompt}
      </p>

      {/* Subtitle / instructions */}
      {subtitle && (
        <p className="text-sm text-center text-text-secondary mt-2">{subtitle}</p>
      )}

      {/* Additional slot content */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
