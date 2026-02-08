/**
 * Base Game class that all party games extend
 */

import {
  GameState,
  GameConfig,
  Player,
  PlayerId,
  RoomId,
  Phase,
  PlayerAction,
  ActionResult,
  PhaseTransition,
} from './types';

export abstract class Game<TState extends GameState = GameState> {
  /**
  * Game configuration - must be defined by subclasses
   */
  abstract config: GameConfig;

  /**
   * Current game state
   */
  protected state: TState;

  /**
   * Room identifier
   */
  protected roomId: RoomId;

  constructor(roomId: RoomId, initialState: TState) {
    this.roomId = roomId;
    this.state = initialState;
  }

  /**
   * Get current game state (read-only)
   */
  getState(): Readonly<TState> {
    return { ...this.state };
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): Phase {
    return this.state.phase;
  }

  /**
   * Get all players
   */
  getPlayers(): Player[] {
    return [...this.state.players];
  }

  /**
   * Get a specific player by ID
   */
  getPlayer(playerId: PlayerId): Player | undefined {
    return this.state.players.find((p) => p.id === playerId);
  }

  /**
   * Check if player can join the game
   */
  canPlayerJoin(): boolean {
    const playerCount = this.state.players.length;
    const { maxPlayers, allowJoinInProgress = false } = this.config;

    if (playerCount >= maxPlayers) {
      return false;
    }

    if (this.state.startedAt && !allowJoinInProgress) {
      return false;
    }

    return true;
  }

  /**
   * Check if game can start
   */
  canStart(): boolean {
    const playerCount = this.state.players.length;
    return playerCount >= this.config.minPlayers && !this.state.startedAt;
  }

  /**
   * Lifecycle: Called when a player joins
   */
  abstract onPlayerJoin(player: Player): Promise<void>;

  /**
   * Lifecycle: Called when a player leaves
   */
  abstract onPlayerLeave(playerId: PlayerId): Promise<void>;

  /**
   * Lifecycle: Called when game starts
   */
  abstract onGameStart(): Promise<void>;

  /**
   * Lifecycle: Called when game ends
   */
  abstract onGameEnd(): Promise<void>;

  /**
   * Lifecycle: Called when phase changes
   */
  abstract onPhaseChange(transition: PhaseTransition): Promise<void>;

  /**
   * Handle player action - must be implemented by subclasses
   */
  abstract handleAction<T = unknown>(
    action: PlayerAction<T>
  ): Promise<ActionResult>;

  /**
   * Validate phase transition
   */
  protected canTransitionTo(nextPhase: Phase): boolean {
    const currentIndex = this.config.phases.indexOf(this.state.phase);
    const nextIndex = this.config.phases.indexOf(nextPhase);

    // Allow transitioning to next phase or back to first phase (loop)
    return nextIndex === currentIndex + 1 || (nextIndex === 0 && currentIndex === this.config.phases.length - 1);
  }

  /**
   * Transition to next phase
   */
  protected async transitionPhase(nextPhase: Phase): Promise<void> {
    if (!this.canTransitionTo(nextPhase)) {
      throw new Error(
        `Invalid phase transition from ${this.state.phase} to ${nextPhase}`
      );
    }

    const transition: PhaseTransition = {
      from: this.state.phase,
      to: nextPhase,
      timestamp: Date.now(),
    };

    this.state.phase = nextPhase;
    await this.onPhaseChange(transition);
  }
}
