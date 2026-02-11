import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlayerAvatar } from '../../src/components/PlayerAvatar';

describe('PlayerAvatar', () => {
  it('should render player initials', () => {
    render(<PlayerAvatar name="Alice Johnson" />);
    expect(screen.getByText('AJ')).toBeInTheDocument();
  });

  it('should use auto-generated color by default', () => {
    const { container } = render(<PlayerAvatar name="Bob" />);
    const avatar = container.querySelector('[role="img"]');
    expect(avatar).toHaveStyle({ backgroundColor: expect.stringContaining('hsl') });
  });

  it('should use custom color when provided', () => {
    const { container } = render(<PlayerAvatar name="Charlie" color="#ff0000" />);
    const avatar = container.querySelector('[role="img"]');
    expect(avatar).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('should render different sizes', () => {
    const { rerender, container } = render(<PlayerAvatar name="Alice" size="xs" />);
    let avatar = container.querySelector('[role="img"]');
    expect(avatar).toHaveClass('w-6', 'h-6', 'text-xs');

    rerender(<PlayerAvatar name="Alice" size="xl" />);
    avatar = container.querySelector('[role="img"]');
    expect(avatar).toHaveClass('w-24', 'h-24', 'text-3xl');
  });

  it('should show online status indicator when showStatus is true', () => {
    const { container } = render(
      <PlayerAvatar name="Alice" showStatus isOnline />
    );
    const status = container.querySelector('.bg-green-500');
    expect(status).toBeInTheDocument();
  });

  it('should show offline status indicator', () => {
    const { container } = render(
      <PlayerAvatar name="Alice" showStatus isOnline={false} />
    );
    const status = container.querySelector('.bg-gray-400');
    expect(status).toBeInTheDocument();
  });

  it('should not show status indicator by default', () => {
    const { container } = render(<PlayerAvatar name="Alice" />);
    const status = container.querySelector('.bg-green-500, .bg-gray-400');
    expect(status).not.toBeInTheDocument();
  });

  it('should show host crown when isHost is true', () => {
    const { container } = render(<PlayerAvatar name="Alice" isHost />);
    const crown = container.querySelector('.bg-yellow-400');
    expect(crown).toBeInTheDocument();
  });

  it('should not show host crown by default', () => {
    const { container } = render(<PlayerAvatar name="Alice" />);
    const crown = container.querySelector('.bg-yellow-400');
    expect(crown).not.toBeInTheDocument();
  });

  it('should include name in title attribute', () => {
    const { container } = render(<PlayerAvatar name="Alice Johnson" />);
    const avatar = container.querySelector('[role="img"]');
    expect(avatar).toHaveAttribute('title', 'Alice Johnson');
  });

  it('should have descriptive aria-label', () => {
    const { container } = render(
      <PlayerAvatar name="Alice" isHost showStatus isOnline />
    );
    const avatar = container.querySelector('[role="img"]');
    expect(avatar).toHaveAttribute('aria-label', 'Alice (host) (online)');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PlayerAvatar name="Alice" className="custom-class" />
    );
    const avatar = container.querySelector('[role="img"]');
    expect(avatar).toHaveClass('custom-class');
  });

  it('should generate same color for same name consistently', () => {
    const { container: container1 } = render(<PlayerAvatar name="Bob" />);
    const { container: container2 } = render(<PlayerAvatar name="Bob" />);

    const avatar1 = container1.querySelector('[role="img"]');
    const avatar2 = container2.querySelector('[role="img"]');

    expect(avatar1).toHaveStyle(avatar2?.getAttribute('style') || '');
  });
});
