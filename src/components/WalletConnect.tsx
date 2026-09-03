import { useState } from 'react';
import type { WalletState } from '../App';

interface Props {
  wallet: WalletState;
  setWallet: React.Dispatch<React.SetStateAction<WalletState>>;
}

/**
 * WalletConnect — Handles Lace wallet connection and disconnection
 *
 * When running on Midnight Preprod, this connects to the Lace wallet
 * via the DApp Connector API (window.midnight.lace).
 *
 * In demo mode (no wallet extension), it simulates a connection.
 */
export function WalletConnect({ wallet, setWallet }: Props) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);

    try {
      // Check if the Midnight DApp connector is available
      const midnight = (window as any).midnight;

      if (midnight?.lace) {
        // Real Lace wallet connection
        const api = await midnight.lace.connect('preprod');
        const address = await api.getUnshieldedAddress?.();

        setWallet({
          connected: true,
          address: address || '0x...lace-connected',
          networkId: 'preprod',
        });
      } else {
        // Demo mode — simulate wallet connection
        const mockAddr = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
          .map(b => b.toString(16).padStart(2, '0')).join('');

        await new Promise(r => setTimeout(r, 800));

        setWallet({
          connected: true,
          address: `${mockAddr.slice(0, 8)}...${mockAddr.slice(-6)}`,
          networkId: 'preprod',
        });
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWallet({
      connected: false,
      address: null,
      networkId: null,
    });
  };

  if (wallet.connected) {
    return (
      <div className="wallet-bar">
        <span className="badge badge-success">
          <span>●</span> Connected
        </span>
        <span className="wallet-address">{wallet.address}</span>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDisconnect}
          id="wallet-disconnect-btn"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-primary"
      onClick={handleConnect}
      disabled={connecting}
      id="wallet-connect-btn"
    >
      {connecting ? (
        <>
          <span className="spinner"></span>
          Connecting...
        </>
      ) : (
        <>🔗 Connect Lace Wallet</>
      )}
    </button>
  );
}
