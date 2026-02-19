import React from 'react';

export interface VoteOption {
  id: string;
  label: string;
  /** Optional description */
  description?: string;
  /** Optional player name who submitted this answer */
  author?: string;
}

export interface VotingInterfaceProps {
  /** Options players can vote on */
  options: VoteOption[];
  /** ID of the currently selected option */
  currentVote?: string;
  /** Called when a user selects an option */
  onVote?: (optionId: string) => void;
  /** Disable voting (e.g., player has already voted or time is up) */
  disabled?: boolean;
  /** Show vote counts and results */
  showResults?: boolean;
  /** Map of option ID → vote count */
  voteCounts?: Record<string, number>;
  /** Total number of voters (for percentage calculation) */
  totalVoters?: number;
  /** Title shown above options */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

interface VoteBarProps {
  count: number;
  total: number;
}

const VoteBar: React.FC<VoteBarProps> = ({ count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mt-2 space-y-0.5">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{count} vote{count !== 1 ? 's' : ''}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
};

/**
 * Standard voting UI for collecting player votes on a set of options.
 * Supports result display with vote counts and percentages.
 */
export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  options,
  currentVote,
  onVote,
  disabled = false,
  showResults = false,
  voteCounts = {},
  totalVoters = 0,
  title,
  className = '',
}) => {
  const maxVotes = showResults
    ? Math.max(0, ...options.map((o) => voteCounts[o.id] ?? 0))
    : 0;

  return (
    <div
      className={`space-y-3 ${className}`}
      role="radiogroup"
      aria-label={title || 'Vote options'}
    >
      {title && (
        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h2>
      )}

      {options.map((option) => {
        const selected = currentVote === option.id;
        const count = voteCounts[option.id] ?? 0;
        const isWinner = showResults && count === maxVotes && maxVotes > 0;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => !disabled && onVote?.(option.id)}
            disabled={disabled && !showResults}
            className={`
              w-full text-left px-5 py-4 rounded-xl border-2 transition-all
              ${selected
                ? 'border-indigo-500 bg-indigo-50'
                : isWinner
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 bg-white hover:border-indigo-200'
              }
              ${disabled && !showResults ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `.trim()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span
                  className={`font-semibold block ${selected ? 'text-indigo-600' : isWinner ? 'text-yellow-700' : 'text-gray-900'}`}
                >
                  {isWinner && <span aria-hidden="true" className="mr-1">🏆</span>}
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-sm text-gray-500 block mt-0.5">{option.description}</span>
                )}
                {option.author && (
                  <span className="text-xs text-gray-500 block mt-0.5">— {option.author}</span>
                )}
              </div>
              {selected && !showResults && (
                <span
                  className="w-5 h-5 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center mt-0.5"
                  aria-hidden="true"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            {showResults && (
              <VoteBar count={count} total={totalVoters} />
            )}
          </button>
        );
      })}
    </div>
  );
};
