import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VotingInterface } from '../../src/components/VotingInterface';

const options = [
  { id: 'a', label: 'Option A' },
  { id: 'b', label: 'Option B' },
  { id: 'c', label: 'Option C' },
];

describe('VotingInterface', () => {
  it('should render a radiogroup with aria-label', () => {
    render(<VotingInterface options={options} />);
    expect(screen.getByRole('radiogroup', { name: 'Vote options' })).toBeInTheDocument();
  });

  it('should use title as aria-label when provided', () => {
    render(<VotingInterface options={options} title="Pick the best" />);
    expect(screen.getByRole('radiogroup', { name: 'Pick the best' })).toBeInTheDocument();
  });

  it('should render a title heading when provided', () => {
    render(<VotingInterface options={options} title="Pick the best" />);
    expect(screen.getByText('Pick the best')).toBeInTheDocument();
  });

  it('should render all options', () => {
    render(<VotingInterface options={options} />);
    expect(screen.getByRole('radio', { name: /Option A/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Option B/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Option C/i })).toBeInTheDocument();
  });

  it('should show selected option as checked', () => {
    render(<VotingInterface options={options} currentVote="b" />);
    expect(screen.getByRole('radio', { name: /Option B/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Option A/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('should call onVote with option id when clicked', () => {
    const onVote = vi.fn();
    render(<VotingInterface options={options} onVote={onVote} />);
    fireEvent.click(screen.getByRole('radio', { name: /Option A/i }));
    expect(onVote).toHaveBeenCalledWith('a');
  });

  it('should not call onVote when disabled', () => {
    const onVote = vi.fn();
    render(<VotingInterface options={options} onVote={onVote} disabled />);
    fireEvent.click(screen.getByRole('radio', { name: /Option A/i }));
    expect(onVote).not.toHaveBeenCalled();
  });

  it('should show option descriptions when provided', () => {
    const withDesc = [{ id: 'a', label: 'Fly', description: 'Soar through the sky' }];
    render(<VotingInterface options={withDesc} />);
    expect(screen.getByText('Soar through the sky')).toBeInTheDocument();
  });

  it('should show author when provided', () => {
    const withAuthor = [{ id: 'a', label: 'An answer', author: 'Alice' }];
    render(<VotingInterface options={withAuthor} />);
    expect(screen.getByText('— Alice')).toBeInTheDocument();
  });

  describe('results mode', () => {
    const voteCounts = { a: 3, b: 7, c: 2 };

    it('should render vote counts when showResults is true', () => {
      render(
        <VotingInterface
          options={options}
          showResults
          voteCounts={voteCounts}
          totalVoters={12}
        />
      );
      expect(screen.getByText('3 votes')).toBeInTheDocument();
      expect(screen.getByText('7 votes')).toBeInTheDocument();
      expect(screen.getByText('2 votes')).toBeInTheDocument();
    });

    it('should display percentages', () => {
      render(
        <VotingInterface
          options={options}
          showResults
          voteCounts={voteCounts}
          totalVoters={12}
        />
      );
      expect(screen.getByText('58%')).toBeInTheDocument(); // 7/12
      expect(screen.getByText('25%')).toBeInTheDocument(); // 3/12
      expect(screen.getByText('17%')).toBeInTheDocument(); // 2/12
    });

    it('should show winner trophy emoji', () => {
      render(
        <VotingInterface
          options={options}
          showResults
          voteCounts={voteCounts}
          totalVoters={12}
        />
      );
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should show 0% when totalVoters is 0', () => {
      render(
        <VotingInterface
          options={options}
          showResults
          voteCounts={{ a: 0, b: 0, c: 0 }}
          totalVoters={0}
        />
      );
      expect(screen.getAllByText('0%')).toHaveLength(3);
    });

    it('should show "1 vote" (singular) for 1 vote', () => {
      render(
        <VotingInterface
          options={[{ id: 'a', label: 'Only option' }]}
          showResults
          voteCounts={{ a: 1 }}
          totalVoters={1}
        />
      );
      expect(screen.getByText('1 vote')).toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(<VotingInterface options={options} className="custom-vote" />);
    expect(container.querySelector('.custom-vote')).toBeInTheDocument();
  });

  it('should handle no currentVote (all unchecked)', () => {
    render(<VotingInterface options={options} />);
    options.forEach((o) => {
      expect(screen.getByRole('radio', { name: new RegExp(o.label) })).toHaveAttribute('aria-checked', 'false');
    });
  });
});
