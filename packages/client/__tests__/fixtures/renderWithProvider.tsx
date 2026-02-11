/**
 * Test helper: renders a hook or component within a BonfireProvider backed by a MockBonfireClient.
 */

import { render, renderHook, type RenderHookOptions, type RenderOptions } from '@testing-library/react';
import type { ReactNode, ReactElement } from 'react';
import { BonfireProvider } from '../../src/context/BonfireProvider';
import { MockBonfireClient } from './mockBonfireClient';
import type { GameState, PlayerId } from '@bonfire/core';

// Overloaded signatures for different use cases
export function renderWithProvider<TResult>(
  hook: () => TResult,
  mockClient?: MockBonfireClient,
  options?: Omit<RenderHookOptions<unknown>, 'wrapper'>
): ReturnType<typeof renderHook<TResult>> & { client: MockBonfireClient };

export function renderWithProvider(
  ui: ReactElement,
  options?: {
    mockClient?: MockBonfireClient;
    initialState?: GameState;
    playerId?: PlayerId;
  } & Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> & { mockClient: MockBonfireClient };

// Implementation
export function renderWithProvider<TResult>(
  hookOrUi: (() => TResult) | ReactElement,
  optionsOrClient?: MockBonfireClient | any,
  hookOptions?: Omit<RenderHookOptions<unknown>, 'wrapper'>
): any {
  // Determine if we're rendering a hook or a component
  const isHook = typeof hookOrUi === 'function';

  if (isHook) {
    // Hook rendering (original behavior)
    const client = optionsOrClient ?? new MockBonfireClient();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BonfireProvider client={client as any} autoConnect={false}>
        {children}
      </BonfireProvider>
    );

    const result = renderHook(hookOrUi, { wrapper, ...hookOptions });
    return { ...result, client };
  } else {
    // Component rendering (new behavior)
    const {
      mockClient,
      initialState,
      playerId,
      ...renderOptions
    } = optionsOrClient || {};

    const client = mockClient ?? new MockBonfireClient();

    // Set up initial state if provided
    if (initialState) {
      client.simulateStateUpdate(initialState);
    }
    if (playerId) {
      client.setPlayerId(playerId);
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BonfireProvider client={client as any} autoConnect={false}>
        {children}
      </BonfireProvider>
    );

    const result = render(hookOrUi, { wrapper, ...renderOptions });
    return { ...result, mockClient: client };
  }
}
