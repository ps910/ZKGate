import type { WalletState } from '../App';

interface Props {
  wallet: WalletState;
  proofStatus: 'idle' | 'generating' | 'verified' | 'failed';
  onProveMembership: () => Promise<void>;
}

/**
 * MembershipProver — Prove you are on the allowlist
 *
 * This component triggers the ZK proof generation circuit.
 * The proof demonstrates membership WITHOUT revealing:
 * - Which member you are
 * - Your secret key
 * - Any link between your identity and the nullifier
 *
 * Observable privacy behavior:
 * An observer sees "a verification happened" but NOT "who verified"
 */
export function MembershipProver({ wallet, proofStatus, onProveMembership }: Props) {
  const getStatusDisplay = () => {
    switch (proofStatus) {
      case 'generating':
        return (
          <div className="proof-status generating">
            <span className="spinner"></span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-info)' }}>
                Generating ZK Proof...
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Your secret stays on your device. Only the proof goes on-chain.
              </div>
            </div>
          </div>
        );
      case 'verified':
        return (
          <div className="proof-status verified">
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                Membership Verified!
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                You proved membership without revealing your identity.
              </div>
            </div>
          </div>
        );
      case 'failed':
        return (
          <div className="proof-status failed">
            <span style={{ fontSize: '1.5rem' }}>❌</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-error)' }}>
                Proof Failed
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Your secret may not match any commitment on the allowlist.
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card" id="membership-prover">
      <div className="card-header">
        <div className="card-icon">🔐</div>
        <div>
          <div className="card-title">Prove Membership</div>
          <div className="card-subtitle">Verify your access with zero-knowledge</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* How it works */}
        <div style={{
          padding: 'var(--space-md)',
          background: 'rgba(124, 92, 252, 0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-accent)',
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--color-accent-light)', marginBottom: '0.5rem' }}>
            🛡️ How ZK Proof Works
          </div>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Your secret key is loaded from local storage</li>
            <li>A ZK circuit computes a commitment hash</li>
            <li>The circuit verifies the commitment exists on the allowlist</li>
            <li>A unique nullifier is generated (prevents replay)</li>
            <li>Only the proof + nullifier go on-chain — NOT your secret</li>
          </ol>
        </div>

        {/* Proof status */}
        {getStatusDisplay()}

        {/* Action button */}
        <button
          className="btn btn-success btn-lg"
          onClick={onProveMembership}
          disabled={!wallet.connected || proofStatus === 'generating'}
          style={{ width: '100%' }}
          id="prove-membership-btn"
        >
          {proofStatus === 'generating' ? (
            <>
              <span className="spinner"></span>
              Generating Proof...
            </>
          ) : (
            <>🔑 Prove I'm on the Allowlist</>
          )}
        </button>

        {!wallet.connected && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Connect your wallet to prove membership
          </p>
        )}
      </div>
    </div>
  );
}
