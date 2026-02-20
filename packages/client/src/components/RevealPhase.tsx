import React, { useState, useEffect, useCallback } from 'react';

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
    className={`
      flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-500
      ${revealed
        ? 'border-indigo-200 bg-indigo-50 opacity-100 translate-y-0'
        : 'border-transparent bg-white opacity-0 translate-y-2'
      }
    `.trim()}
    aria-hidden={!revealed}
  >
    <span
      className="w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
      aria-hidden="true"
    >
      {index + 1}
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 truncate">{item.label}</p>
      {item.sublabel && (
        <p className="text-sm text-gray-500 truncate">{item.sublabel}</p>
      )}
    </div>
    {item.meta && (
      <span className="text-sm font-semibold text-indigo-500 flex-shrink-0">{item.meta}</span>
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
    <div className={`space-y-3 ${className}`} style={style} role="list" aria-label={title || 'Reveal list'}>
      {title && (
        <h2 className="text-lg font-bold text-gray-900 text-center mb-4">{title}</h2>
      )}
      {items.map((item, index) => {
        const revealed = index < revealedCount;
        return (
          <div key={item.id} role="listitem">
            {renderItem
              ? renderItem(item, index, revealed)
              : defaultRenderItem(item, index, revealed)}
          </div>
        );
      })}
    </div>
  );
};
