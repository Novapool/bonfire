import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PromptCard } from '../../src/components/PromptCard';

describe('PromptCard', () => {
  it('should render prompt text', () => {
    render(<PromptCard prompt="What is your favorite color?" />);
    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
  });

  it('should have role="article" and aria-label', () => {
    render(<PromptCard prompt="Test prompt" />);
    expect(screen.getByRole('article', { name: 'Game prompt' })).toBeInTheDocument();
  });

  it('should show variant badge defaulting to Standard', () => {
    render(<PromptCard prompt="Test prompt" />);
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });

  it('should show Spicy badge for spicy variant', () => {
    render(<PromptCard prompt="Test" variant="spicy" />);
    expect(screen.getByText('Spicy')).toBeInTheDocument();
  });

  it('should show Creative badge for creative variant', () => {
    render(<PromptCard prompt="Test" variant="creative" />);
    expect(screen.getByText('Creative')).toBeInTheDocument();
  });

  it('should show Dare badge for dare variant', () => {
    render(<PromptCard prompt="Test" variant="dare" />);
    expect(screen.getByText('Dare')).toBeInTheDocument();
  });

  it('should show custom category instead of variant badge text', () => {
    render(<PromptCard prompt="Test" variant="spicy" category="Hot Takes" />);
    expect(screen.getByText('Hot Takes')).toBeInTheDocument();
    expect(screen.queryByText('Spicy')).not.toBeInTheDocument();
  });

  it('should show round number', () => {
    render(<PromptCard prompt="Test" round={2} />);
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('should show round with total rounds', () => {
    render(<PromptCard prompt="Test" round={2} totalRounds={5} />);
    expect(screen.getByText('Round 2 of 5')).toBeInTheDocument();
  });

  it('should not show round info when round is undefined', () => {
    render(<PromptCard prompt="Test" />);
    expect(screen.queryByText(/Round/)).not.toBeInTheDocument();
  });

  it('should show subtitle when provided', () => {
    render(<PromptCard prompt="Test" subtitle="You have 60 seconds." />);
    expect(screen.getByText('You have 60 seconds.')).toBeInTheDocument();
  });

  it('should not show subtitle when not provided', () => {
    render(<PromptCard prompt="Test" />);
    expect(screen.queryByText('You have 60 seconds.')).not.toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <PromptCard prompt="Test">
        <div data-testid="child-content">Timer here</div>
      </PromptCard>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<PromptCard prompt="Test" className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should not apply animate class by default', () => {
    const { container } = render(<PromptCard prompt="Test" />);
    expect(container.querySelector('.animate-slide-up')).not.toBeInTheDocument();
  });
});
