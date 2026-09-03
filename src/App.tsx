import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { AllowlistManager } from './components/AllowlistManager';
import { MembershipProver } from './components/MembershipProver';
import { StatsDisplay } from './components/StatsDisplay';
import { AccessLog } from './components/AccessLog';
import { PrivacyModel } from './components/PrivacyModel';

export interface WalletState {
  connected: boolean;
  address: string | null;
  networkId: string | null;
}

export interface ContractState {
  deployed: boolean;
  address: string | null;
  memberCount: number;
  verifiedCount: number;
  allowlistName: string;
}

export interface LogEntry {
  id: string;
  nullifier: string;
  timestamp: Date;
  type: 'add_member' | 'prove_membership';
}

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    networkId: null,
  });

  const [contract, setContract] = useState<ContractState>({
    deployed: true,
    address: '0x7c5cfc...a78bfa42',
    memberCount: 0,
    verifiedCount: 0,
    allowlistName: 'ZKGate Beta Access',
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [proofStatus, setProofStatus] = useState<'idle' | 'generating' | 'verified' | 'failed'>('idle');

  const addLogEntry = (type: LogEntry['type'], nullifier: string) => {
    setLogs(prev => [{
      id: crypto.randomUUID(),
      nullifier,
      timestamp: new Date(),
      type,
    }, ...prev]);
  };

  const handleAddMember = async () => {
    const mockCommitment = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    setContract(prev => ({
      ...prev,
      memberCount: prev.memberCount + 1,
    }));

    addLogEntry('add_member', `0x${mockCommitment}`);
  };

  const handleProveMembership = async () => {
    setProofStatus('generating');

    // Simulate ZK proof generation (2-4 seconds)
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

    const success = Math.random() > 0.1; // 90% success rate for demo

    if (success) {
      const mockNullifier = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      setContract(prev => ({
        ...prev,
        verifiedCount: prev.verifiedCount + 1,
      }));

      addLogEntry('prove_membership', `0x${mockNullifier}`);
      setProofStatus('verified');
    } else {
      setProofStatus('failed');
    }

    // Reset after 5 seconds
    setTimeout(() => setProofStatus('idle'), 5000);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">🛡️</div>
          <div>
            <div className="app-logo-text">ZKGate</div>
            <div className="app-logo-subtitle">Private Allowlist on Midnight</div>
          </div>
        </div>
        <WalletConnect wallet={wallet} setWallet={setWallet} />
      </header>

      {/* Hero */}
      <section className="hero animate-fade-in">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Midnight Network · Preprod
        </div>
        <h1>Private Allowlist Access</h1>
        <p className="hero-subtitle">
          Prove you belong — without revealing who you are.
          Zero-knowledge proofs ensure your membership stays private.
        </p>
        <div className="privacy-indicator" style={{ display: 'inline-flex' }}>
          <span className="privacy-shield">🔒</span>
          ZK-Protected · No Identity Disclosure
        </div>
      </section>

      {/* Stats */}
      <section className="section animate-slide-up animate-delay-1">
        <StatsDisplay contract={contract} />
      </section>

      {/* Main Grid */}
      <section className="section grid grid-2 animate-slide-up animate-delay-2">
        <AllowlistManager
          wallet={wallet}
          contract={contract}
          onAddMember={handleAddMember}
        />
        <MembershipProver
          wallet={wallet}
          proofStatus={proofStatus}
          onProveMembership={handleProveMembership}
        />
      </section>

      {/* Access Log */}
      <section className="section animate-slide-up animate-delay-3">
        <AccessLog logs={logs} />
      </section>

      {/* Privacy Model */}
      <section className="section animate-slide-up animate-delay-4">
        <PrivacyModel />
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Built on{' '}
          <a href="https://midnight.network" target="_blank" rel="noopener">
            Midnight Network
          </a>{' '}
          · Zero-Knowledge Privacy ·{' '}
          Contract: <code>{contract.address}</code>
        </p>
      </footer>
    </div>
  );
}
