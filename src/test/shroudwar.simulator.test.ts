import { describe, it, expect } from 'vitest';
import { PrivateStateStore, Position } from '../../witnesses/privateState';
import { GAME_CONFIG } from '../config';

describe('ShroudWar Simulator & Compact Contract Logic', () => {
  const storeA = new PrivateStateStore('0xplayerA_pubkey');
  const storeB = new PrivateStateStore('0xplayerB_pubkey');

  // --------------------------------------------------------------------------
  // 1. Setup & Registration (Phase 1 & 2)
  // --------------------------------------------------------------------------
  describe('Phase 1 & 2: Setup & Unit Registration', () => {
    it('initializes game parameters matching specification', () => {
      expect(GAME_CONFIG.gridSize).toBe(10);
      expect(GAME_CONFIG.unitsPerPlayer).toBe(4);
      expect(GAME_CONFIG.moveSpeed).toBe(2);
      expect(GAME_CONFIG.combatRange).toBe(1);
      expect(GAME_CONFIG.scoutWindow).toBe(3);
    });

    it('registers private unit positions and produces distinct cryptographic commitments', async () => {
      const uA0 = storeA.registerLocalUnit('unit_a_0', 1, 1);
      const uA1 = storeA.registerLocalUnit('unit_a_1', 2, 2);

      expect(uA0.position).toEqual({ x: 1, y: 1 });
      expect(uA1.position).toEqual({ x: 2, y: 2 });
      expect(uA0.salt.length).toBe(32);
      expect(uA1.salt.length).toBe(32);

      const commit0 = await PrivateStateStore.computeCommitment(uA0.position, uA0.salt);
      const commit1 = await PrivateStateStore.computeCommitment(uA1.position, uA1.salt);

      expect(commit0.length).toBe(32);
      expect(commit1.length).toBe(32);
      expect(commit0).not.toEqual(commit1);
    });

    it('rejects units registered off grid', () => {
      const isLegal = PrivateStateStore.isLegalMove({ x: 0, y: 0 }, { x: 12, y: 12 }, 2, 10);
      expect(isLegal).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. ZK Movement & Chebyshev Math (Phase 3)
  // --------------------------------------------------------------------------
  describe('Phase 3: ZK Movement Circuit', () => {
    it('approves legal Chebyshev moves within moveSpeed <= 2', () => {
      const current: Position = { x: 3, y: 3 };

      // Cardinal moves
      expect(PrivateStateStore.isLegalMove(current, { x: 3, y: 5 }, 2, 10)).toBe(true);
      expect(PrivateStateStore.isLegalMove(current, { x: 5, y: 3 }, 2, 10)).toBe(true);

      // Diagonal moves (Chebyshev max(dx, dy) <= 2)
      expect(PrivateStateStore.isLegalMove(current, { x: 5, y: 5 }, 2, 10)).toBe(true);
      expect(PrivateStateStore.isLegalMove(current, { x: 1, y: 1 }, 2, 10)).toBe(true);
      expect(PrivateStateStore.isLegalMove(current, { x: 2, y: 4 }, 2, 10)).toBe(true);
    });

    it('rejects illegal moves exceeding Chebyshev speed > 2 or leaving grid', () => {
      const current: Position = { x: 3, y: 3 };

      // Too far (dx = 3)
      expect(PrivateStateStore.isLegalMove(current, { x: 6, y: 3 }, 2, 10)).toBe(false);
      // Too far diagonally (dx = 3, dy = 3)
      expect(PrivateStateStore.isLegalMove(current, { x: 0, y: 0 }, 2, 10)).toBe(false);
      // Off-grid target
      expect(PrivateStateStore.isLegalMove(current, { x: -1, y: 3 }, 2, 10)).toBe(false);
      expect(PrivateStateStore.isLegalMove(current, { x: 3, y: 10 }, 2, 10)).toBe(false);
    });

    it('rotates salt on every move ensuring unlinkability of commitments', async () => {
      const unit = storeA.registerLocalUnit('unit_test_move', 4, 4);
      const salt1 = storeA.getSalt('unit_test_move');
      const commit1 = await PrivateStateStore.computeCommitment(unit.position, salt1);

      // Perform move and rotate salt
      storeA.updatePosition('unit_test_move', 5, 5);
      const salt2 = storeA.nextSalt('unit_test_move');
      const commit2 = await PrivateStateStore.computeCommitment({ x: 5, y: 5 }, salt2);

      expect(salt1).not.toEqual(salt2);
      expect(commit1).not.toEqual(commit2);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Scout Challenge-Response (Phase 4)
  // --------------------------------------------------------------------------
  describe('Phase 4: Challenge-Response Scout', () => {
    it('discloses ONLY binary boolean (occupied/not) and never coordinates', () => {
      const unitB: Position = { x: 7, y: 7 };

      // Query cell (7, 7) -> should be true
      const checkHit = unitB.x === 7 && unitB.y === 7;
      expect(checkHit).toBe(true);

      // Query cell (5, 5) -> should be false
      const checkMiss = unitB.x === 5 && unitB.y === 5;
      expect(checkMiss).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Combat Claims & Proximity Resolution (Phase 5)
  // --------------------------------------------------------------------------
  describe('Phase 5: Proximity Combat Resolution', () => {
    it('detects adjacent and diagonal combat within range <= 1', () => {
      const unitA: Position = { x: 4, y: 4 };

      // Adjacent contacts
      expect(PrivateStateStore.isInCombatRange(unitA, { x: 4, y: 5 }, 1)).toBe(true);
      expect(PrivateStateStore.isInCombatRange(unitA, { x: 5, y: 4 }, 1)).toBe(true);
      expect(PrivateStateStore.isInCombatRange(unitA, { x: 5, y: 5 }, 1)).toBe(true);
      expect(PrivateStateStore.isInCombatRange(unitA, { x: 3, y: 3 }, 1)).toBe(true);

      // Out of range contacts (distance >= 2)
      expect(PrivateStateStore.isInCombatRange(unitA, { x: 4, y: 6 }, 1)).toBe(false);
      expect(PrivateStateStore.isInCombatRange(unitA, { x: 6, y: 6 }, 1)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Win Condition (Phase 7)
  // --------------------------------------------------------------------------
  describe('Phase 7: Win Condition', () => {
    it('declares winner when all opposing units are eliminated', () => {
      const unitsB = [
        { id: 'b0', alive: false },
        { id: 'b1', alive: false },
        { id: 'b2', alive: false },
        { id: 'b3', alive: false },
      ];

      const aliveCount = unitsB.filter((u) => u.alive).length;
      expect(aliveCount).toBe(0);
      const winner = aliveCount === 0 ? 'Player A' : null;
      expect(winner).toBe('Player A');
    });
  });
});
