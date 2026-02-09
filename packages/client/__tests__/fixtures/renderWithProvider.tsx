/**
 * Test helper: renders a hook within a BonfireProvider backed by a MockBonfireClient.
 */

import { renderHook, type RenderHookOptions } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BonfireProvider } from '../../src/context/BonfireProvider';
import { MockBonfireClient } from './mockBonfireClient';

export function renderWithProvider<TResult>(
  hook: () => TResult,
  mockClient?: MockBonfireClient,
  options?: Omit<RenderHookOptions<unknown>, 'wrapper'>
) {
  const client = mockClient ?? new MockBonfireClient();

  const wrapper = ({ children }: { children: ReactNode }) => (
    // Cast mock as any since BonfireProvider expects BonfireClient
    <BonfireProvider client={client as any} autoConnect={false}>
      {children}
    </BonfireProvider>
  );

  const result = renderHook(hook, { wrapper, ...options });

  return { ...result, client };
}
