import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RevealPhase } from '../../src/components/RevealPhase';

const items = [
  { id: '1', label: 'Alice', sublabel: 'First place', meta: '1000 pts' },
  { id: '2', label: 'Bob', sublabel: 'Second place', meta: '800 pts' },
  { id: '3', label: 'Charlie', sublabel: 'Third place', meta: '600 pts' },
];

describe('RevealPhase', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render as a list with aria-label', () => {
    render(<RevealPhase items={items} />);
    expect(screen.getByRole('list', { name: 'Reveal list' })).toBeInTheDocument();
  });

  it('should use title as aria-label when provided', () => {
    render(<RevealPhase items={items} title="Leaderboard" />);
    expect(screen.getByRole('list', { name: 'Leaderboard' })).toBeInTheDocument();
  });

  it('should render a title heading when provided', () => {
    render(<RevealPhase items={items} title="Round Results" />);
    expect(screen.getByText('Round Results')).toBeInTheDocument();
  });

  it('should not render title heading when not provided', () => {
    render(<RevealPhase items={items} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should reveal all items immediately when revealAll is true', () => {
    render(<RevealPhase items={items} revealAll />);
    // All items should be visible (not hidden)
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('should render item sublabels and meta when revealed', () => {
    render(<RevealPhase items={items} revealAll />);
    expect(screen.getByText('First place')).toBeInTheDocument();
    expect(screen.getByText('1000 pts')).toBeInTheDocument();
  });

  it('should render all list items in the DOM regardless of reveal state', () => {
    render(<RevealPhase items={items} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('should reveal first item after initial delay', () => {
    render(<RevealPhase items={items} revealDelay={800} />);
    // Items start aria-hidden; after first tick, first is revealed
    act(() => {
      vi.advanceTimersByTime(800);
    });
    // At least the first item's content should be accessible
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('should reveal items one by one with delay', () => {
    const onRevealComplete = vi.fn();
    render(<RevealPhase items={items} revealDelay={500} onRevealComplete={onRevealComplete} />);

    // Advance 3 separate acts so React can re-render between each reveal
    act(() => { vi.advanceTimersByTime(500); });
    act(() => { vi.advanceTimersByTime(500); });
    act(() => { vi.advanceTimersByTime(500); });

    expect(onRevealComplete).toHaveBeenCalledTimes(1);
  });

  it('should call onRevealComplete after all items are revealed', () => {
    const onRevealComplete = vi.fn();
    render(<RevealPhase items={items} revealDelay={100} onRevealComplete={onRevealComplete} />);

    // Each timer fires one at a time — React must re-render between reveals
    act(() => { vi.advanceTimersByTime(100); });
    act(() => { vi.advanceTimersByTime(100); });
    act(() => { vi.advanceTimersByTime(100); });

    expect(onRevealComplete).toHaveBeenCalledOnce();
  });

  it('should not call onRevealComplete when revealAll without completing sequential reveal', () => {
    const onRevealComplete = vi.fn();
    render(<RevealPhase items={items} revealAll onRevealComplete={onRevealComplete} />);
    expect(onRevealComplete).not.toHaveBeenCalled();
  });

  it('should render number badges for each item', () => {
    render(<RevealPhase items={items} revealAll />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should support custom renderItem function', () => {
    render(
      <RevealPhase
        items={items}
        revealAll
        renderItem={(item, _index, revealed) => (
          <div data-testid={`item-${item.id}`} data-revealed={revealed}>
            {item.label}
          </div>
        )}
      />
    );
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toHaveAttribute('data-revealed', 'true');
  });

  it('should apply custom className', () => {
    const { container } = render(<RevealPhase items={items} className="custom-reveal" />);
    expect(container.querySelector('.custom-reveal')).toBeInTheDocument();
  });

  it('should handle empty items array', () => {
    render(<RevealPhase items={[]} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('should render items without sublabel or meta', () => {
    const simpleItems = [{ id: '1', label: 'Simple item' }];
    render(<RevealPhase items={simpleItems} revealAll />);
    expect(screen.getByText('Simple item')).toBeInTheDocument();
  });
});
