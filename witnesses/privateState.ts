/**
 * ShroudWar — Client-Side Private Witness & State Store
 *
 * Implements the local private store for unit positions and salts.
 * These values NEVER leave the client browser. They are supplied
 * exclusively to the local ZK prover to generate proofs for:
 *  - registerUnit
 *  - move (Chebyshev legality)
 *  - respondScout (binary occupancy check)
 *  - respondCombat (proximity check)
 */

export interface Position {
  x: number;
  y: number;
}

export interface UnitPrivateState {
  unitId: string;
  position: Position;
  salt: Uint8Array;
}

export class PrivateStateStore {
  private units: Map<string, UnitPrivateState> = new Map();
  private myPubKey: string;

  constructor(myPublicKey: string) {
    this.myPubKey = myPublicKey;
  }

  public getMyPublicKey(): string {
    return this.myPubKey;
  }

  /**
   * Set or initialize a unit's position and salt
   */
  public registerLocalUnit(unitId: string, x: number, y: number): UnitPrivateState {
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const state: UnitPrivateState = {
      unitId,
      position: { x, y },
      salt,
    };
    this.units.set(unitId, state);
    return state;
  }

  /**
   * Get position witness for a unit
   */
  public getPosition(unitId: string): Position {
    const unit = this.units.get(unitId);
    if (!unit) {
      throw new Error(`Unit ${unitId} not found in private state store`);
    }
    return { ...unit.position };
  }

  /**
   * Get current salt for a unit
   */
  public getSalt(unitId: string): Uint8Array {
    const unit = this.units.get(unitId);
    if (!unit) {
      throw new Error(`Unit ${unitId} not found in private state store`);
    }
    return new Uint8Array(unit.salt);
  }

  /**
   * Rotate to a fresh salt upon movement
   */
  public nextSalt(unitId: string): Uint8Array {
    const unit = this.units.get(unitId);
    if (!unit) {
      throw new Error(`Unit ${unitId} not found in private state store`);
    }
    const freshSalt = crypto.getRandomValues(new Uint8Array(32));
    unit.salt = freshSalt;
    return new Uint8Array(freshSalt);
  }

  /**
   * Update position locally after a proven move
   */
  public updatePosition(unitId: string, newX: number, newY: number): void {
    const unit = this.units.get(unitId);
    if (!unit) {
      throw new Error(`Unit ${unitId} not found in private state store`);
    }
    unit.position = { x: newX, y: newY };
  }

  /**
   * Derive cryptographic commitment matching Compact persistentCommit<Position>
   * commit = Hash(x || y || salt)
   */
  public static async computeCommitment(pos: Position, salt: Uint8Array): Promise<Uint8Array> {
    const buffer = new Uint8Array(2 + salt.length);
    buffer[0] = pos.x;
    buffer[1] = pos.y;
    buffer.set(salt, 2);
    const hash = await crypto.subtle.digest('SHA-256', buffer as unknown as BufferSource);
    return new Uint8Array(hash);
  }

  /**
   * Calculate Chebyshev distance: max(|x1 - x2|, |y1 - y2|)
   */
  public static chebyshevDistance(p1: Position, p2: Position): number {
    return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
  }

  /**
   * Validate if a move is within move speed
   */
  public static isLegalMove(current: Position, target: Position, moveSpeed: number, gridSize: number): boolean {
    if (target.x < 0 || target.x >= gridSize || target.y < 0 || target.y >= gridSize) {
      return false;
    }
    return this.chebyshevDistance(current, target) <= moveSpeed;
  }

  /**
   * Check if target position is within combat range
   */
  public static isInCombatRange(pos: Position, claimedPos: Position, combatRange: number): boolean {
    return this.chebyshevDistance(pos, claimedPos) <= combatRange;
  }
}
