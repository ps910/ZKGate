import { useState, useCallback, useEffect } from 'react';
import { GAME_CONFIG, NETWORK_CONFIG } from '../config';
import { PrivateStateStore, Position } from '../../witnesses/privateState';

export interface Unit {
  id: string;
  owner: 'playerA' | 'playerB';
  alive: boolean;
  position?: Position; // only known for own units or revealed
  commitment?: string;
}

export interface ScoutEvent {
  challengeId: string;
  x: number;
  y: number;
  occupied: boolean;
  timestamp: string;
}

export interface CombatEvent {
  claimId: string;
  targetUnitId: string;
  x: number;
  y: number;
  hit: boolean;
  timestamp: string;
}

export function useGameState(myPlayer: 'playerA' | 'playerB' = 'playerA') {
  const [phase, setPhase] = useState<'setup' | 'active' | 'ended'>('active');
  const [actionCount, setActionCount] = useState<number>(14);
  const [winner, setWinner] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [targetCell, setTargetCell] = useState<Position | null>(null);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string>(
    'Match ready on Midnight Preprod. Select your unit to move or target a cell to scout.'
  );

  // Private store for own units
  const [privateStore] = useState<PrivateStateStore>(() => new PrivateStateStore('0x3f2a...4f3a'));

  // Units list
  const [units, setUnits] = useState<Unit[]>([
    // Player A (Own Units)
    { id: 'unit_a_0', owner: 'playerA', alive: true, position: { x: 1, y: 1 } },
    { id: 'unit_a_1', owner: 'playerA', alive: true, position: { x: 2, y: 2 } },
    { id: 'unit_a_2', owner: 'playerA', alive: true, position: { x: 1, y: 3 } },
    { id: 'unit_a_3', owner: 'playerA', alive: true, position: { x: 0, y: 2 } },
    // Player B (Opponent Units — coordinates SHIELDED on-chain)
    { id: 'unit_b_0', owner: 'playerB', alive: true, commitment: '0x9e12...b4f0' },
    { id: 'unit_b_1', owner: 'playerB', alive: true, commitment: '0x3d71...a801' },
    { id: 'unit_b_2', owner: 'playerB', alive: true, commitment: '0xfe82...99a2' },
    { id: 'unit_b_3', owner: 'playerB', alive: true, commitment: '0x7c49...e31b' },
  ]);

  // Hidden Opponent actual positions (simulated on opponent client)
  const [opponentActualPositions, setOpponentActualPositions] = useState<Map<string, Position>>(
    new Map([
      ['unit_b_0', { x: 7, y: 7 }],
      ['unit_b_1', { x: 8, y: 8 }],
      ['unit_b_2', { x: 6, y: 8 }],
      ['unit_b_3', { x: 8, y: 6 }],
    ])
  );

  // Scout history & scan results
  const [scoutEvents, setScoutEvents] = useState<ScoutEvent[]>([
    { challengeId: '0xscout_init_1', x: 5, y: 5, occupied: false, timestamp: '17:42:10' },
    { challengeId: '0xscout_init_2', x: 7, y: 7, occupied: true, timestamp: '17:44:22' },
  ]);

  // Combat history
  const [combatEvents, setCombatEvents] = useState<CombatEvent[]>([]);

  // Initialize private store with initial own positions
  useEffect(() => {
    units
      .filter((u) => u.owner === myPlayer && u.position)
      .forEach((u) => {
        try {
          privateStore.registerLocalUnit(u.id, u.position!.x, u.position!.y);
        } catch {
          // Already registered
        }
      });
  }, [units, myPlayer, privateStore]);

  /**
   * Move own unit with ZK Chebyshev proof
   */
  const moveUnit = useCallback(
    async (unitId: string, targetX: number, targetY: number) => {
      const unit = units.find((u) => u.id === unitId);
      if (!unit || unit.owner !== myPlayer || !unit.position) {
        throw new Error('Invalid unit selection');
      }

      if (!PrivateStateStore.isLegalMove(unit.position, { x: targetX, y: targetY }, GAME_CONFIG.moveSpeed, GAME_CONFIG.gridSize)) {
        throw new Error(`Illegal move: exceeds Chebyshev move speed of ${GAME_CONFIG.moveSpeed} or off grid.`);
      }

      setActionInProgress(true);
      setLastActionMessage(`Generating ZK proof for unit ${unitId} moving to (${targetX}, ${targetY})...`);

      // Simulate ZK proof generation & Preprod settlement
      await new Promise((r) => setTimeout(r, 900));

      privateStore.updatePosition(unitId, targetX, targetY);
      privateStore.nextSalt(unitId);

      setUnits((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, position: { x: targetX, y: targetY } } : u))
      );

      setActionCount((c) => c + 1);
      setActionInProgress(false);
      setLastActionMessage(`✔ Move verified on Midnight Preprod! Commitment updated. Coordinates remain private.`);
      setSelectedUnitId(null);
    },
    [units, myPlayer, privateStore]
  );

  /**
   * Request scout on a grid cell
   */
  const requestScout = useCallback(
    async (targetX: number, targetY: number) => {
      setActionInProgress(true);
      setLastActionMessage(`Opening ScoutChallenge on Preprod for cell (${targetX}, ${targetY})...`);

      await new Promise((r) => setTimeout(r, 800));

      // Check opponent positions secretly
      let occupied = false;
      opponentActualPositions.forEach((pos) => {
        if (pos.x === targetX && pos.y === targetY) {
          occupied = true;
        }
      });

      const newEvent: ScoutEvent = {
        challengeId: `0xscout_${Date.now().toString(16).slice(-6)}`,
        x: targetX,
        y: targetY,
        occupied,
        timestamp: new Date().toLocaleTimeString(),
      };

      setScoutEvents((prev) => [newEvent, ...prev]);
      setActionCount((c) => c + 1);
      setActionInProgress(false);
      setLastActionMessage(
        occupied
          ? `Radar Alert: Cell (${targetX}, ${targetY}) is OCCUPIED! Opponent unit detected.`
          : `Clear: Cell (${targetX}, ${targetY}) is EMPTY. Only boolean disclosed.`
      );
    },
    [opponentActualPositions]
  );

  /**
   * Claim combat against opponent unit
   */
  const claimCombat = useCallback(
    async (targetUnitId: string, claimedX: number, claimedY: number) => {
      setActionInProgress(true);
      setLastActionMessage(`Submitting CombatClaim against ${targetUnitId} at (${claimedX}, ${claimedY}) on Preprod...`);

      await new Promise((r) => setTimeout(r, 1100));

      const oppPos = opponentActualPositions.get(targetUnitId);
      const hit =
        oppPos !== undefined &&
        PrivateStateStore.isInCombatRange(oppPos, { x: claimedX, y: claimedY }, GAME_CONFIG.combatRange);

      if (hit) {
        // Mutual destruction or target killed
        setUnits((prev) => prev.map((u) => (u.id === targetUnitId ? { ...u, alive: false } : u)));
        setOpponentActualPositions((prev) => {
          const next = new Map(prev);
          next.delete(targetUnitId);
          return next;
        });
      }

      const event: CombatEvent = {
        claimId: `0xcombat_${Date.now().toString(16).slice(-6)}`,
        targetUnitId,
        x: claimedX,
        y: claimedY,
        hit,
        timestamp: new Date().toLocaleTimeString(),
      };

      setCombatEvents((prev) => [event, ...prev]);
      setActionCount((c) => c + 1);
      setActionInProgress(false);

      if (hit) {
        setLastActionMessage(`💥 DIRECT HIT! Target unit ${targetUnitId} destroyed on Midnight Preprod!`);
      } else {
        setLastActionMessage(`❌ MISS! Target unit ${targetUnitId} was out of combat range.`);
      }

      // Check win condition
      const remainingOpp = units.filter((u) => u.owner === 'playerB' && u.alive && u.id !== targetUnitId).length;
      if (hit && remainingOpp === 0) {
        setPhase('ended');
        setWinner('Player A (0x3f2a...4f3a)');
        setLastActionMessage('🏆 VICTORY! All opposing units eliminated on Midnight Preprod.');
      }
    },
    [opponentActualPositions, units]
  );

  return {
    phase,
    actionCount,
    winner,
    units,
    selectedUnitId,
    setSelectedUnitId,
    targetCell,
    setTargetCell,
    actionInProgress,
    lastActionMessage,
    scoutEvents,
    combatEvents,
    moveUnit,
    requestScout,
    claimCombat,
    contractAddress: NETWORK_CONFIG.contractAddress,
  };
}
