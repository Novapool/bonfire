import React from 'react';
import { C, radius } from '../utils/theme';

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
  /** Inline styles for the root element */
  style?: React.CSSProperties;
}

const BarProgress: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div
      style={{
        height: '0.625rem',
        backgroundColor: C.gray200,
        borderRadius: radius.full,
        overflow: 'hidden',
      }}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Progress: ${current} of ${total}`}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: C.indigo500,
          borderRadius: radius.full,
          transition: 'width 0.5s ease',
          width: `${pct}%`,
        }}
      />
    </div>
  );
};

const DotsProgress: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
    role="progressbar"
    aria-valuenow={current}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-label={`Progress: ${current} of ${total}`}
  >
    {Array.from({ length: total }, (_, i) => {
      const step = i + 1;
      const done   = step < current;
      const active = step === current;
      return (
        <span
          key={i}
          aria-hidden="true"
          style={{
            borderRadius: radius.full,
            transition: 'all 0.3s ease',
            ...(active
              ? { width: '0.75rem', height: '0.75rem', backgroundColor: C.indigo500 }
              : done
              ? { width: '0.625rem', height: '0.625rem', backgroundColor: 'rgba(99, 102, 241, 0.5)' }
              : { width: '0.625rem', height: '0.625rem', backgroundColor: C.gray300 }),
          }}
        />
      );
    })}
  </div>
);

const NumberProgress: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div
    style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}
    role="progressbar"
    aria-valuenow={current}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-label={`Round ${current} of ${total}`}
  >
    <span style={{ fontSize: '1.875rem', fontWeight: 700, color: C.indigo500 }}>{current}</span>
    <span style={{ fontSize: '1.125rem', color: C.gray500, fontWeight: 500 }}>/ {total}</span>
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
  style,
}) => (
  <div
    className={className}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', ...style }}
  >
    {variant === 'bar'    && <BarProgress    current={current} total={total} />}
    {variant === 'dots'   && <DotsProgress   current={current} total={total} />}
    {variant === 'number' && <NumberProgress current={current} total={total} />}
    {label && (
      <p style={{ fontSize: '0.75rem', textAlign: 'center', color: C.gray500, margin: 0 }}>{label}</p>
    )}
  </div>
);
