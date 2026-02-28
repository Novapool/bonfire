import React, { useState, useEffect, useCallback } from 'react';
import { C, radius } from '../utils/theme';

export interface RevealItem {
  id: string;
  /** The main content to display */
  label: string;
  /** Optional secondary content */
  sublabel?: string;
  /** Optional metadata (player name, score, etc.) */
  meta?: string;
}

export interface RevealPhaseProps {
  /** Items to reveal sequentially */
  items: RevealItem[];
  /** Milliseconds between each reveal */
  revealDelay?: number;
  /** If true, all items are revealed immediately */
  revealAll?: boolean;
  /** Called when all items have been revealed */
  onRevealComplete?: () => void;
  /** Custom render for each item */
  renderItem?: (item: RevealItem, index: number, revealed: boolean) => React.ReactNode;
  /** Title shown above the reveal */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles for the root element */
  style?: React.CSSProperties;
}

const defaultRenderItem = (item: RevealItem, index: number, revealed: boolean) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 1.25rem',
      borderRadius: radius.lg,
      border: `2px solid ${revealed ? C.indigo200 : 'transparent'}`,
      backgroundColor: revealed ? C.indigo50 : C.white,
      opacity: revealed ? 1 : 0,
      transform: revealed ? 'translateY(0)' : 'translateY(0.5rem)',
      transition: 'all 0.5s ease',
    }}
    aria-hidden={!revealed}
  >
    <span
      style={{
        width: '2rem',
        height: '2rem',
        borderRadius: radius.full,
        backgroundColor: C.indigo500,
        color: C.white,
        fontSize: '0.875rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {index + 1}
    </span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 600, color: C.gray900, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.label}
      </p>
      {item.sublabel && (
        <p style={{ fontSize: '0.875rem', color: C.gray500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.sublabel}
        </p>
      )}
    </div>
    {item.meta && (
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.indigo500, flexShrink: 0 }}>
        {item.meta}
      </span>
    )}
  </div>
);

/**
 * Sequentially reveals a list of items with staggered animation.
 * Useful for answer reveals, leaderboards, and countdown announcements.
 */
export const RevealPhase: React.FC<RevealPhaseProps> = ({
  items,
  revealDelay = 800,
  revealAll = false,
  onRevealComplete,
  renderItem,
  title,
  className = '',
  style,
}) => {
  const [revealedCount, setRevealedCount] = useState(revealAll ? items.length : 0);

  const reveal = useCallback(() => {
    setRevealedCount((prev) => {
      const next = prev + 1;
      if (next >= items.length) onRevealComplete?.();
      return next;
    });
  }, [items.length, onRevealComplete]);

  useEffect(() => {
    if (revealAll) {
      setRevealedCount(items.length);
      return;
    }
    setRevealedCount(0);
  }, [revealAll, items.length]);

  useEffect(() => {
    if (revealAll) return;
    if (revealedCount >= items.length) return;
    const timer = setTimeout(reveal, revealDelay);
    return () => clearTimeout(timer);
  }, [revealAll, revealedCount, items.length, revealDelay, reveal]);

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', ...style }}
      role="list"
      aria-label={title || 'Reveal list'}
    >
      {title && (
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: C.gray900, textAlign: 'center', marginBottom: '1rem', marginTop: 0 }}>
          {title}
        </h2>
      )}
      {items.map((item, index) => {
        const revealed = index < revealedCount;
        return (
          <div key={item.id} role="listitem">
            {renderItem ? renderItem(item, index, revealed) : defaultRenderItem(item, index, revealed)}
          </div>
        );
      })}
    </div>
  );
};
