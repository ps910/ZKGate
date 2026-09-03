import React, { useState } from 'react';
import { Position } from '../../witnesses/privateState';
import { Unit } from '../hooks/useGameState';
import { GAME_CONFIG } from '../config';

interface ActionPanelProps {
  selectedUnitId: string | null;
  targetCell: Position | null;
  units: Unit[];
  actionInProgress: boolean;
  lastActionMessage: string;
  onMove: (unitId: string, x: number, y: number) => Promise<void>;
  onScout: (x: number, y: number) => Promise<void>;
  onCombat: (targetUnitId: string, x: number, y: number) => Promise<void>;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedUnitId,
  targetCell,
  units,
  actionInProgress,
  lastActionMessage,
  onMove,
  onScout,
  onCombat,
}) => {
  const [combatTargetUnit, setCombatTargetUnit] = useState<string>('unit_b_0');

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const enemyUnits = units.filter((u) => u.owner === 'playerB' && u.alive);

  return (
    <div className="action-panel-card" id="action-panel">
      <div className="panel-header">
        <span className="panel-title">⚡ Tactical Command Center</span>
        <span className="window-tag">Response Window: {GAME_CONFIG.scoutWindow} Actions</span>
      </div>

      <div className="action-status-banner">
        <div className="status-indicator">
          {actionInProgress ? <span className="spinner"></span> : <span className="pulse-dot"></span>}
          <span className="status-text">{lastActionMessage}</span>
        </div>
      </div>

      <div className="action-grid">
        {/* Action 1: ZK Move */}
        <div className="action-box">
          <div className="action-box-title">
            <span>🚀 1. ZK Move</span>
            <span className="badge-zk">Chebyshev &le; 2</span>
          </div>
          <p className="action-desc">
            Move your selected unit. A ZK-SNARK proves Chebyshev range validity without disclosing coordinates.
          </p>
          <div className="action-controls">
            <span className="selection-tag">
              {selectedUnit ? `Unit: ${selectedUnit.id} (${selectedUnit.position?.x},${selectedUnit.position?.y})` : 'Select unit on grid'}
            </span>
            <span className="selection-tag">
              {targetCell ? `Target: (${targetCell.x}, ${targetCell.y})` : 'Click target cell'}
            </span>
          </div>
          <button
            className="btn btn-primary"
            disabled={!selectedUnit || !targetCell || actionInProgress}
            onClick={() => {
              if (selectedUnit && targetCell) {
                onMove(selectedUnit.id, targetCell.x, targetCell.y);
              }
            }}
          >
            {actionInProgress ? 'Proving Move...' : 'Prove & Execute Move'}
          </button>
        </div>

        {/* Action 2: Challenge-Response Scout */}
        <div className="action-box">
          <div className="action-box-title">
            <span>📡 2. Scout Cell</span>
            <span className="badge-zk">Disclose Boolean Only</span>
          </div>
          <p className="action-desc">
            Open a ScoutChallenge against a cell. The opponent must disclose only if occupied, never coordinates.
          </p>
          <div className="action-controls">
            <span className="selection-tag">
              {targetCell ? `Scout Target: (${targetCell.x}, ${targetCell.y})` : 'Click cell to scan'}
            </span>
          </div>
          <button
            className="btn btn-secondary"
            disabled={!targetCell || actionInProgress}
            onClick={() => {
              if (targetCell) {
                onScout(targetCell.x, targetCell.y);
              }
            }}
          >
            {actionInProgress ? 'Scanning...' : 'Broadcast Scout Challenge'}
          </button>
        </div>

        {/* Action 3: Proximity Combat */}
        <div className="action-box">
          <div className="action-box-title">
            <span>⚔️ 3. Claim Combat</span>
            <span className="badge-zk">Range &le; 1 (Mutual Destruction)</span>
          </div>
          <p className="action-desc">
            Claim an opposing unit is at a cell. If within range, mutual destruction occurs on Preprod.
          </p>
          <div className="combat-inputs">
            <select
              className="select-field"
              value={combatTargetUnit}
              onChange={(e) => setCombatTargetUnit(e.target.value)}
              disabled={enemyUnits.length === 0 || actionInProgress}
            >
              {enemyUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id} (Commitment: {u.commitment?.slice(0, 8)}...)
                </option>
              ))}
            </select>
            <span className="selection-tag">
              {targetCell ? `At: (${targetCell.x}, ${targetCell.y})` : 'Select grid cell'}
            </span>
          </div>
          <button
            className="btn btn-danger"
            disabled={!targetCell || enemyUnits.length === 0 || actionInProgress}
            onClick={() => {
              if (targetCell) {
                onCombat(combatTargetUnit, targetCell.x, targetCell.y);
              }
            }}
          >
            {actionInProgress ? 'Resolving Combat...' : 'Engage Combat Claim'}
          </button>
        </div>
      </div>
    </div>
  );
};
