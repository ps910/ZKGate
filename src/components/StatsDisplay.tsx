import type { ContractState } from '../App';

interface Props {
  contract: ContractState;
}

/**
 * StatsDisplay — Shows public on-chain statistics
 *
 * These values are from the PUBLIC ledger — visible to all observers.
 * They reveal aggregate data but nothing about individual members.
 */
export function StatsDisplay({ contract }: Props) {
  return (
    <div className="stats-grid" id="stats-display">
      <div className="stat-card">
        <div className="stat-value">{contract.memberCount}</div>
        <div className="stat-label">Members Added</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{contract.verifiedCount}</div>
        <div className="stat-label">Verifications</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">
          {contract.deployed ? '✓' : '—'}
        </div>
        <div className="stat-label">Contract Status</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">ZK</div>
        <div className="stat-label">Privacy Level</div>
      </div>
    </div>
  );
}
