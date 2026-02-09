// ---- Client ----
export { BonfireClient } from './client/BonfireClient';

// ---- Context ----
export { BonfireProvider } from './context/BonfireProvider';
export type { BonfireProviderProps, BonfireContextValue } from './context/BonfireProvider';

// ---- Hooks ----
export { useGameState } from './hooks/useGameState';
export { useConnection } from './hooks/useConnection';
export { useRoom } from './hooks/useRoom';
export { usePlayer } from './hooks/usePlayer';
export { usePhase } from './hooks/usePhase';
export { useBonfireEvent } from './hooks/useBonfireEvent';

// ---- Components ----
export { BonfireErrorBoundary } from './components/BonfireErrorBoundary';

// ---- Types ----
export type {
  BonfireClientConfig,
  ConnectionStatus,
  BaseResponse,
  RoomCreateResponse,
  RoomJoinResponse,
  StateResponse,
  ActionResponse,
  ErrorResponse,
  BonfireGameEvent,
} from './types';
