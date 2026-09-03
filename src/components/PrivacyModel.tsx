/**
 * PrivacyModel — Educational component explaining what an observer can/cannot learn
 */
export function PrivacyModel() {
  return (
    <div className="card" id="privacy-model">
      <div className="card-header">
        <div className="card-icon">🛡️</div>
        <div>
          <div className="card-title">Privacy Model</div>
          <div className="card-subtitle">What an observer can and cannot learn</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Public - Observable */}
        <div style={{
          padding: 'var(--space-lg)',
          background: 'var(--color-bg-glass)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            color: 'var(--color-info)',
            marginBottom: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}>
            👁️ PUBLIC (Observable)
          </h4>
          <ul style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
          }}>
            <li>✓ Total number of members on the allowlist</li>
            <li>✓ Total number of successful verifications</li>
            <li>✓ That a verification event occurred (nullifier)</li>
            <li>✓ The allowlist Merkle root hash</li>
            <li>✓ Contract code and circuit definitions</li>
          </ul>
        </div>

        {/* Private - Hidden */}
        <div style={{
          padding: 'var(--space-lg)',
          background: 'rgba(124, 92, 252, 0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-accent)',
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            color: 'var(--color-accent-light)',
            marginBottom: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}>
            🔒 PRIVATE (Hidden by ZK)
          </h4>
          <ul style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
          }}>
            <li>✗ Which specific member performed a verification</li>
            <li>✗ The member's secret key</li>
            <li>✗ The link between a nullifier and a member</li>
            <li>✗ Individual member commitments</li>
            <li>✗ Any personally identifying information</li>
          </ul>
        </div>
      </div>

      <div style={{
        marginTop: 'var(--space-lg)',
        padding: 'var(--space-md)',
        background: 'var(--color-success-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(52, 211, 153, 0.2)',
        fontSize: '0.8125rem',
        color: 'var(--color-text-secondary)',
      }}>
        <strong style={{ color: 'var(--color-success)' }}>Privacy Guarantee:</strong>{' '}
        When a member proves they belong to the allowlist, a ZK-SNARK proof is generated locally
        on their device. The blockchain verifier learns only that "someone on the list proved membership"
        — it cannot determine which member did so. The member's secret never leaves their browser.
      </div>
    </div>
  );
}
