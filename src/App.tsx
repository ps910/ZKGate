import { useWallet, WalletState } from './hooks/useWallet';
import { useGameState } from './hooks/useGameState';
import { Board } from './components/Board';
import { ActionPanel } from './components/ActionPanel';
import { GameStats } from './components/GameStats';
import { ShroudWarPrivacy } from './components/ShroudWarPrivacy';
import { NETWORK_CONFIG } from './config';

export type { WalletState };

export interface ContractState {
  deployed: boolean;
  address: string;
  memberCount: number;
  verifiedCount: number;
  allowlistName?: string;
  network: string;
}

export interface LogEntry {
  id: string;
  type: 'deploy' | 'add_member' | 'verify' | 'prove_membership' | 'move' | 'scout' | 'combat';
  message: string;
  timestamp: string | Date;
  txHash?: string;
  nullifier?: string;
}

export const App: React.FC = () => {
  const { wallet, connect, disconnect } = useWallet();
  const {
    phase,
    actionCount,
    winner,
    units,
    selectedUnitId,
    setSelectedUnitId,
    targetCell,
    setTargetCell,
    actionInProgress,
    lastActionMessage,
    scoutEvents,
    combatEvents,
    moveUnit,
    requestScout,
    claimCombat,
    contractAddress,
  } = useGameState('playerA');

  return (
    <div className="shroudwar-app">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <div className="logo-badge">
            <span className="logo-icon">🌌</span>
            <div className="logo-text">
              <h1 className="title">ShroudWar</h1>
              <span className="subtitle">On-Chain Fog-of-War Strategy · Midnight Level 4</span>
            </div>
          </div>
          <span className="network-status-badge">
            <span className="status-bullet"></span>
            MIDNIGHT PREPROD
          </span>
        </div>

        <div className="navbar-right">
          <div className="contract-tag" title={NETWORK_CONFIG.contractAddress}>
            <span className="tag-label">Contract:</span>
            <code>{contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}</code>
          </div>

          {wallet.connected ? (
            <div className="wallet-connected-pill">
              <span className="wallet-dot"></span>
              <span className="wallet-address">{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)} (Preprod)</span>
              <button className="btn-link" onClick={disconnect}>Disconnect</button>
            </div>
          ) : (
            <button className="btn btn-connect" onClick={connect}>
              🦊 Connect Lace Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Game Interface */}
      <main className="main-content">
        <div className="game-layout">
          {/* Left: 10x10 Fog of War Board */}
          <section className="board-section">
            <Board
              units={units}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
              targetCell={targetCell}
              onSelectCell={setTargetCell}
              scoutEvents={scoutEvents}
              myPlayer="playerA"
            />
          </section>

          {/* Right: Tactical Command Center & Stats */}
          <section className="controls-section">
            <ActionPanel
              selectedUnitId={selectedUnitId}
              targetCell={targetCell}
              units={units}
              actionInProgress={actionInProgress}
              lastActionMessage={lastActionMessage}
              onMove={moveUnit}
              onScout={requestScout}
              onCombat={claimCombat}
            />

            <GameStats
              units={units}
              actionCount={actionCount}
              winner={winner}
              phase={phase}
              scoutEvents={scoutEvents}
              combatEvents={combatEvents}
            />
          </section>
        </div>

        {/* Bottom: Privacy Model */}
        <section className="privacy-section">
          <ShroudWarPrivacy />
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          <span>Midnight Network Level 4 Challenge Submission · Zero-Knowledge Fog-of-War</span>
        </div>
        <div className="footer-right">
          <a href="https://indexer.preprod.midnight.network" target="_blank" rel="noreferrer">Preprod Indexer</a>
          <span>·</span>
          <a href="https://github.com/ps910/NEW-MOON-PROJECT-" target="_blank" rel="noreferrer">GitHub Repository</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
