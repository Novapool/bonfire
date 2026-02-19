import React from 'react';

export type GameProgressVariant = 'bar' | 'dots' | 'number';

export interface GameProgressProps {
  /** Current progress value (1-based) */
  current: number;
  /** Total number of steps */
  total: number;
  /** Visual style */
  variant?: GameProgressVariant;
  /** Optional label shown below */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

const BarProgress: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="w-full">
      <div
        className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progress: ${current} of ${total}`}
      >
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const DotsProgress: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div
    className="flex items-center justify-center gap-2 flex-wrap"
    role="progressbar"
    aria-valuenow={current}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-label={`Progress: ${current} of ${total}`}
  >
    {Array.from({ length: total }, (_, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <span
          key={i}
          aria-hidden="true"
          className={`
            rounded-full transition-all duration-300
            ${active ? 'w-3 h-3 bg-indigo-500' : done ? 'w-2.5 h-2.5 bg-indigo-500/50' : 'w-2.5 h-2.5 bg-gray-300'}
          `.trim()}
        />
      );
    })}
  </div>
);

const NumberProgress: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div
    className="flex items-baseline justify-center gap-1"
    role="progressbar"
    aria-valuenow={current}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-label={`Round ${current} of ${total}`}
  >
    <span className="text-3xl font-bold text-indigo-500">{current}</span>
    <span className="text-lg text-gray-500 font-medium">/ {total}</span>
  </div>
);

/**
 * Displays game progress as a bar, dot indicators, or a number.
 * Use to show round progress, phase counts, or question numbers.
 */
export const GameProgress: React.FC<GameProgressProps> = ({
  current,
  total,
  variant = 'bar',
  label,
  className = '',
}) => (
  <div className={`space-y-1.5 ${className}`}>
    {variant === 'bar' && <BarProgress current={current} total={total} />}
    {variant === 'dots' && <DotsProgress current={current} total={total} />}
    {variant === 'number' && <NumberProgress current={current} total={total} />}
    {label && (
      <p className="text-xs text-center text-gray-500">{label}</p>
    )}
  </div>
);
