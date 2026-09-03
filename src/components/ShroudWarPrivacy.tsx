import React from 'react';

export const ShroudWarPrivacy: React.FC = () => {
  return (
    <div className="privacy-model-card" id="privacy-model">
      <div className="privacy-header">
        <span className="privacy-title">🛡️ Midnight Privacy Model: ShroudWar vs Dark Forest</span>
        <span className="privacy-badge">Compiler-Enforced disclose()</span>
      </div>

      <p className="privacy-summary">
        Unlike Dark Forest which relied on years of custom SNARK circuits, ShroudWar leverages Midnight’s native
        Compact <code>witness</code>, <code>persistentCommit</code>, and compiler-checked <code>disclose()</code>.
      </p>

      <div className="privacy-columns">
        {/* Public Ledger */}
        <div className="privacy-box box-public">
          <div className="box-title">
            <span>🌐 Visible on Midnight Ledger</span>
            <span className="box-tag tag-public">Public Ledger State</span>
          </div>
          <ul className="box-list">
            <li><strong>Unit Commitments</strong>: <code>unitCommitments[unitId]</code> (SHA-256 / Poseidon hash)</li>
            <li><strong>Survival State</strong>: <code>unitAlive[unitId]</code> (Boolean)</li>
            <li><strong>Scout Challenges</strong>: Target cell <code>(x, y)</code> and response deadline</li>
            <li><strong>Scout Results</strong>: Only binary <code>occupied: Boolean</code> (never coordinates!)</li>
            <li><strong>Action Counter</strong>: Global sequential transaction clock</li>
            <li><strong>Game Parameters</strong>: Grid dimensions, move speed, combat range</li>
          </ul>
        </div>

        {/* Private Witness */}
        <div className="privacy-box box-private">
          <div className="box-title">
            <span>🔒 Shielded in Client Witness</span>
            <span className="box-tag tag-private">Zero Data Leakage</span>
          </div>
          <ul className="box-list">
            <li><strong>Unit Coordinates</strong>: <code>Position &#123; x, y &#125;</code> never leaves local device</li>
            <li><strong>Random Salts</strong>: Rotated on every single move to prevent linkage</li>
            <li><strong>Movement Vectors</strong>: ZK proof validates Chebyshev range without showing direction</li>
            <li><strong>Fleet Dispersion</strong>: Opponents never know where your non-contact units are positioned</li>
            <li><strong>Unscouted Cells</strong>: Complete fog-of-war across the entire 10x10 board</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
