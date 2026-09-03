import React from 'react';
import { GAME_CONFIG } from '../config';
import { Position } from '../../witnesses/privateState';
import { Unit, ScoutEvent } from '../hooks/useGameState';

interface BoardProps {
  units: Unit[];
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string | null) => void;
  targetCell: Position | null;
  onSelectCell: (cell: Position) => void;
  scoutEvents: ScoutEvent[];
  myPlayer: 'playerA' | 'playerB';
}

export const Board: React.FC<BoardProps> = ({
  units,
  selectedUnitId,
  onSelectUnit,
  targetCell,
  onSelectCell,
  scoutEvents,
  myPlayer,
}) => {
  const { gridSize, moveSpeed } = GAME_CONFIG;

  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  // Helper to check if a cell is within movement reach
  const isReachable = (x: number, y: number): boolean => {
    if (!selectedUnit || !selectedUnit.position) return false;
    const dx = Math.abs(selectedUnit.position.x - x);
    const dy = Math.abs(selectedUnit.position.y - y);
    return Math.max(dx, dy) <= moveSpeed && !(dx === 0 && dy === 0);
  };

  // Helper to find unit on cell
  const getUnitAt = (x: number, y: number): Unit | undefined => {
    return units.find((u) => u.alive && u.position && u.position.x === x && u.position.y === y);
  };

  // Helper to get scout status
  const getScoutStatus = (x: number, y: number): 'occupied' | 'empty' | null => {
    const event = scoutEvents.find((e) => e.x === x && e.y === y);
    if (!event) return null;
    return event.occupied ? 'occupied' : 'empty';
  };

  return (
    <div className="shroudwar-board-container" id="board-container">
      <div className="board-header">
        <div className="board-title">
          <span>🌌 10x10 Fog-of-War Grid</span>
          <span className="network-pill">Preprod Circuit: 0x8b3f...5d4c</span>
        </div>
        <div className="board-legend">
          <span className="legend-item"><span className="dot dot-own"></span> Own Unit (Shielded)</span>
          <span className="legend-item"><span className="dot dot-radar"></span> Radar Ping (Disclosed)</span>
          <span className="legend-item"><span className="dot dot-clear"></span> Scouted Clear</span>
          <span className="legend-item"><span className="dot dot-fog"></span> Deep Fog</span>
        </div>
      </div>

      <div className="board-grid">
        {Array.from({ length: gridSize }).map((_, y) => (
          <div key={`row-${y}`} className="grid-row">
            {Array.from({ length: gridSize }).map((_, x) => {
              const unitOnCell = getUnitAt(x, y);
              const reachable = isReachable(x, y);
              const isSelectedTarget = targetCell?.x === x && targetCell?.y === y;
              const scoutStatus = getScoutStatus(x, y);

              // Cell class computation
              const cellClasses = [
                'grid-cell',
                reachable ? 'cell-reachable' : '',
                isSelectedTarget ? 'cell-targeted' : '',
                scoutStatus === 'occupied' ? 'cell-scouted-occupied' : '',
                scoutStatus === 'empty' ? 'cell-scouted-empty' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={`cell-${x}-${y}`}
                  className={cellClasses}
                  onClick={() => {
                    if (unitOnCell && unitOnCell.owner === myPlayer) {
                      onSelectUnit(unitOnCell.id === selectedUnitId ? null : unitOnCell.id);
                    } else {
                      onSelectCell({ x, y });
                    }
                  }}
                  title={`Cell (${x}, ${y})`}
                >
                  <span className="cell-coords">{x},{y}</span>

                  {unitOnCell && (
                    <div
                      className={`unit-marker ${unitOnCell.owner === myPlayer ? 'unit-own' : 'unit-enemy'} ${
                        unitOnCell.id === selectedUnitId ? 'unit-selected' : ''
                      }`}
                    >
                      {unitOnCell.owner === myPlayer ? '🛡️' : '⚔️'}
                      <span className="unit-label">{unitOnCell.id.replace('unit_', '')}</span>
                    </div>
                  )}

                  {!unitOnCell && scoutStatus === 'occupied' && (
                    <div className="radar-ping" title="Radar contact disclosed">
                      📡
                    </div>
                  )}

                  {!unitOnCell && scoutStatus === 'empty' && (
                    <div className="empty-marker" title="Scouted: Empty">
                      ·
                    </div>
                  )}

                  {reachable && !unitOnCell && (
                    <div className="move-indicator">✦</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
