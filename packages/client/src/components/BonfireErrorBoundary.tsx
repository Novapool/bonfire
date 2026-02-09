import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface BonfireErrorBoundaryProps {
  /** Static fallback UI or render function receiving (error, reset) */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
}

interface BonfireErrorBoundaryState {
  error: Error | null;
}

/**
 * Error boundary for Bonfire game UI trees.
 * Catches React rendering errors and displays a fallback.
 *
 * @example
 * <BonfireErrorBoundary fallback={(error, reset) => (
 *   <div>
 *     <p>Something went wrong: {error.message}</p>
 *     <button onClick={reset}>Try Again</button>
 *   </div>
 * )}>
 *   <GameUI />
 * </BonfireErrorBoundary>
 */
export class BonfireErrorBoundary extends Component<
  BonfireErrorBoundaryProps,
  BonfireErrorBoundaryState
> {
  constructor(props: BonfireErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): BonfireErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.reset);
      }
      return fallback ?? null;
    }
    return this.props.children;
  }
}
