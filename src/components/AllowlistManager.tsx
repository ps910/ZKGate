import { useState } from 'react';
import type { WalletState, ContractState } from '../App';

interface Props {
  wallet: WalletState;
  contract: ContractState;
  onAddMember: () => Promise<void>;
}

/**
 * AllowlistManager — Admin panel for managing the allowlist
 *
 * Allows the contract owner to:
 * - Add new members (by commitment hash)
 * - View current member count
 * - See the allowlist root hash
 */
export function AllowlistManager({ wallet, contract, onAddMember }: Props) {
  const [adding, setAdding] = useState(false);
  const [commitment, setCommitment] = useState('');

  const handleAdd = async () => {
    if (!wallet.connected) return;

    setAdding(true);
    try {
      await onAddMember();
      setCommitment('');
    } finally {
      setAdding(false);
    }
  };

  const generateCommitment = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    setCommitment(`0x${hex}`);
  };

  return (
    <div className="card" id="allowlist-manager">
      <div className="card-header">
        <div className="card-icon">📋</div>
        <div>
          <div className="card-title">Allowlist Manager</div>
          <div className="card-subtitle">Add members to the private allowlist</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Allowlist info */}
        <div style={{
          padding: 'var(--space-md)',
          background: 'var(--color-bg-glass)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
            ALLOWLIST NAME
          </div>
          <div style={{ fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            {contract.allowlistName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
            CONTRACT ADDRESS
          </div>
          <code style={{ fontSize: '0.75rem' }}>{contract.address}</code>
        </div>

        {/* Add member form */}
        <div className="input-group">
          <label className="input-label">Member Commitment (SHA-256 hash of secret)</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              className="input input-mono"
              style={{ flex: 1 }}
              placeholder="0x..."
              value={commitment}
              onChange={e => setCommitment(e.target.value)}
              id="commitment-input"
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={generateCommitment}
              title="Generate random commitment"
              id="generate-commitment-btn"
            >
              🎲
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!wallet.connected || adding}
          id="add-member-btn"
        >
          {adding ? (
            <>
              <span className="spinner"></span>
              Adding Member...
            </>
          ) : (
            <>➕ Add Member to Allowlist</>
          )}
        </button>

        {!wallet.connected && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Connect your wallet to manage the allowlist
          </p>
        )}
      </div>
    </div>
  );
}
