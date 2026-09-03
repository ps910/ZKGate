/**
 * Re-exports contract definitions, types, and witness bindings
 */

export * from '../../witnesses/privateState';

export interface GameState {
  phase: number;
  gridSize: number;
  moveSpeed: number;
  combatRange: number;
  scoutWindow: number;
  players: [string, string];
  unitCommitments: Map<string, string>;
  unitAlive: Map<string, boolean>;
  scoutResults: Map<string, boolean>;
  actionCount: number;
  winner: string | null;
}
