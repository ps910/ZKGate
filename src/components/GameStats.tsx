import React from 'react';
import { Unit, ScoutEvent, CombatEvent } from '../hooks/useGameState';

interface GameStatsProps {
  units: Unit[];
  actionCount: number;
  winner: string | null;
  phase: string;
  scoutEvents: ScoutEvent[];
  combatEvents: CombatEvent[];
}

export const GameStats: React.FC<GameStatsProps> = ({
  units,
  actionCount,
  winner,
  phase,
  scoutEvents,
  combatEvents,
}) => {
  const playerAAlive = units.filter((u) => u.owner === 'playerA' && u.alive).length;
  const playerBAlive = units.filter((u) => u.owner === 'playerB' && u.alive).length;

  return (
    <div className="game-stats-container">
      {winner && (
        <div className="winner-banner">
          <span className="trophy-icon">🏆</span>
          <div className="winner-text">
            <h3>MATCH CONCLUDED ON PREPROD</h3>
            <p>Winner: <strong>{winner}</strong> — Opposing fleet completely neutralized.</p>
          </div>
        </div>
      )}

      {/* Roster Overview */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-title">🛡️ Player A (You)</div>
          <div className="stat-value color-green">{playerAAlive} / 4 Alive</div>
          <div className="stat-meta">Local Witness Active</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">⚔️ Player B (Opponent)</div>
          <div className="stat-value color-cyan">{playerBAlive} / 4 Alive</div>
          <div className="stat-meta">Coordinates Shielded</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">⏱️ Action Counter</div>
          <div className="stat-value color-purple">#{actionCount}</div>
          <div className="stat-meta">Contract Deadline Clock</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">📍 Match Phase</div>
          <div className="stat-value color-accent">{phase.toUpperCase()}</div>
          <div className="stat-meta">Midnight Preprod</div>
        </div>
      </div>

      {/* Events & Logs */}
      <div className="logs-grid">
        <div className="log-panel">
          <div className="log-header">📡 Scout Radar Logs</div>
          <div className="log-list">
            {scoutEvents.length === 0 ? (
              <div className="empty-log">No radar queries broadcast yet.</div>
            ) : (
              scoutEvents.slice(0, 5).map((e, idx) => (
                <div key={idx} className={`log-item ${e.occupied ? 'log-hit' : 'log-clear'}`}>
                  <span className="log-time">{e.timestamp}</span>
                  <span className="log-coords">Cell ({e.x}, {e.y})</span>
                  <span className="log-status">{e.occupied ? 'OCCUPIED' : 'CLEAR'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="log-panel">
          <div className="log-header">💥 Combat Engagement Logs</div>
          <div className="log-list">
            {combatEvents.length === 0 ? (
              <div className="empty-log">No combat claims resolved yet.</div>
            ) : (
              combatEvents.slice(0, 5).map((e, idx) => (
                <div key={idx} className={`log-item ${e.hit ? 'log-hit' : 'log-miss'}`}>
                  <span className="log-time">{e.timestamp}</span>
                  <span className="log-coords">{e.targetUnitId} at ({e.x}, {e.y})</span>
                  <span className="log-status">{e.hit ? 'DESTROYED' : 'MISS'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
