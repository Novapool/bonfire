/**
 * BonfireProvider - React context provider for Bonfire client.
 *
 * Wraps the app to provide the BonfireClient to all hooks.
 * Subscribes to client state/status changes for reactive rendering.
 */

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { BonfireClient } from '../client/BonfireClient';
import type { BonfireClientConfig, ConnectionStatus } from '../types';
import type { GameState } from '@bonfire/core';

export interface BonfireContextValue {
  client: BonfireClient;
  status: ConnectionStatus;
  gameState: GameState | null;
}

const BonfireContext = createContext<BonfireContextValue | null>(null);

export interface BonfireProviderProps {
  /** Pre-created BonfireClient instance */
  client?: BonfireClient;
  /** Config to create a BonfireClient internally (ignored if client is provided) */
  config?: BonfireClientConfig;
  /** Auto-connect when provider mounts (default: true) */
  autoConnect?: boolean;
  children: ReactNode;
}

export function BonfireProvider({
  client: externalClient,
  config,
  autoConnect = true,
  children,
}: BonfireProviderProps) {
  if (!externalClient && !config) {
    throw new Error('BonfireProvider requires either a "client" or "config" prop');
  }

  const clientRef = useRef<BonfireClient>(externalClient ?? new BonfireClient(config!));
  const client = clientRef.current;

  const [status, setStatus] = useState<ConnectionStatus>(client.status);
  const [gameState, setGameState] = useState<GameState | null>(client.gameState);

  useEffect(() => {
    const unsubStatus = client.onStatusChange(setStatus);
    const unsubState = client.onStateChange(setGameState);

    if (autoConnect && !client.isConnected) {
      client.connect();
    }

    return () => {
      unsubStatus();
      unsubState();
      if (!externalClient) {
        client.disconnect();
      }
    };
  }, [client, autoConnect, externalClient]);

  return (
    <BonfireContext.Provider value={{ client, status, gameState }}>
      {children}
    </BonfireContext.Provider>
  );
}

/** Internal hook used by all public hooks to access the Bonfire context */
export function useBonfireContext(): BonfireContextValue {
  const ctx = useContext(BonfireContext);
  if (!ctx) {
    throw new Error('Bonfire hooks must be used within a <BonfireProvider>');
  }
  return ctx;
}
