import type { LogEntry } from '../App';

interface Props {
  logs: LogEntry[];
}

/**
 * AccessLog — Shows public verification events
 *
 * Displays nullifiers from on-chain events. These prove that
 * verifications happened but CANNOT be linked to specific members.
 */
export function AccessLog({ logs }: Props) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="card" id="access-log">
      <div className="card-header">
        <div className="card-icon">📜</div>
        <div>
          <div className="card-title">Access Log</div>
          <div className="card-subtitle">
            Public events — nullifiers only, no identities
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-2xl)',
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>📭</div>
          No events yet. Add a member or prove membership to see activity.
        </div>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {logs.map(log => (
            <div className="log-entry" key={log.id}>
              <div
                className="log-dot"
                style={{
                  background: log.type === 'prove_membership'
                    ? 'var(--color-success)'
                    : 'var(--color-accent)',
                }}
              ></div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  {log.type === 'prove_membership'
                    ? '🔑 Membership Verified'
                    : '➕ Member Added'}
                </div>
                <div className="log-hash">
                  Nullifier: {log.nullifier.slice(0, 18)}...{log.nullifier.slice(-8)}
                </div>
              </div>
              <div className="log-time">{formatTime(log.timestamp)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
