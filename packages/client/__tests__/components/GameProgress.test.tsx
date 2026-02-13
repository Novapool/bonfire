import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameProgress } from '../../src/components/GameProgress';

describe('GameProgress', () => {
  describe('bar variant', () => {
    it('should render a progressbar with correct aria attributes', () => {
      render(<GameProgress current={3} total={8} variant="bar" />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '3');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '8');
    });

    it('should have descriptive aria-label', () => {
      render(<GameProgress current={3} total={8} variant="bar" />);
      expect(screen.getByRole('progressbar', { name: 'Progress: 3 of 8' })).toBeInTheDocument();
    });

    it('should render the fill bar', () => {
      const { container } = render(<GameProgress current={4} total={8} variant="bar" />);
      // The inner fill div should exist
      const fill = container.querySelector('[style*="width"]') as HTMLElement;
      expect(fill).toBeInTheDocument();
      expect(fill.style.width).toBe('50%');
    });

    it('should cap at 100% when current > total', () => {
      const { container } = render(<GameProgress current={10} total={8} variant="bar" />);
      const fill = container.querySelector('[style*="width"]') as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });

    it('should show 0% when current is 0', () => {
      const { container } = render(<GameProgress current={0} total={8} variant="bar" />);
      const fill = container.querySelector('[style*="width"]') as HTMLElement;
      expect(fill.style.width).toBe('0%');
    });
  });

  describe('dots variant', () => {
    it('should render a progressbar with correct aria attributes', () => {
      render(<GameProgress current={2} total={5} variant="dots" />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '2');
      expect(bar).toHaveAttribute('aria-valuemax', '5');
    });

    it('should render the correct number of dots', () => {
      const { container } = render(<GameProgress current={2} total={5} variant="dots" />);
      // span dots are aria-hidden, so query by DOM
      const dots = container.querySelectorAll('span[aria-hidden="true"]');
      expect(dots).toHaveLength(5);
    });

    it('should have accessible label', () => {
      render(<GameProgress current={2} total={5} variant="dots" />);
      expect(screen.getByRole('progressbar', { name: 'Progress: 2 of 5' })).toBeInTheDocument();
    });
  });

  describe('number variant', () => {
    it('should render current and total numbers', () => {
      render(<GameProgress current={3} total={10} variant="number" />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('/ 10')).toBeInTheDocument();
    });

    it('should have a progressbar role', () => {
      render(<GameProgress current={3} total={10} variant="number" />);
      expect(screen.getByRole('progressbar', { name: 'Round 3 of 10' })).toBeInTheDocument();
    });
  });

  describe('label', () => {
    it('should render label when provided', () => {
      render(<GameProgress current={3} total={8} variant="bar" label="Round 3 of 8" />);
      expect(screen.getByText('Round 3 of 8')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      const { container } = render(<GameProgress current={3} total={8} variant="bar" />);
      expect(container.querySelector('p')).not.toBeInTheDocument();
    });
  });

  describe('defaults', () => {
    it('should default to bar variant', () => {
      render(<GameProgress current={1} total={5} />);
      expect(screen.getByRole('progressbar', { name: 'Progress: 1 of 5' })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<GameProgress current={1} total={5} className="custom-progress" />);
      expect(container.querySelector('.custom-progress')).toBeInTheDocument();
    });
  });
});
