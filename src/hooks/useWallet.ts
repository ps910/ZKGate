import { useState, useCallback } from 'react';
import { NETWORK_CONFIG } from '../config';

export interface WalletState {
  connected: boolean;
  address: string | null;
  networkId: string | null;
  balance?: string;
  error?: string | null;
}

/**
 * Custom hook for Lace / Midnight Wallet integration
 */
export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    networkId: null,
    error: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setWallet((prev) => ({ ...prev, error: null }));

    try {
      const midnight = (window as unknown as { midnight?: { lace?: { connect: (netId: string) => Promise<any> } } })?.midnight;

      if (midnight?.lace) {
        // Official Lace wallet DApp connector API
        const api = await midnight.lace.connect(NETWORK_CONFIG.networkId);
        const address = await api.getUnshieldedAddress?.() || await api.getAddress?.();

        setWallet({
          connected: true,
          address: address || '0x...lace-connected',
          networkId: NETWORK_CONFIG.networkId,
          error: null,
        });
      } else {
        // Fallback / Simulation mode for development without Lace extension installed
        const simulatedAddress =
          '0x' +
          Array.from(crypto.getRandomValues(new Uint8Array(20)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

        await new Promise((r) => setTimeout(r, 600));

        setWallet({
          connected: true,
          address: `${simulatedAddress.slice(0, 8)}...${simulatedAddress.slice(-6)}`,
          networkId: NETWORK_CONFIG.networkId,
          error: null,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Wallet connection failed';
      console.error('Wallet connection error:', err);
      setWallet((prev) => ({ ...prev, error: message }));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      connected: false,
      address: null,
      networkId: null,
      error: null,
    });
  }, []);

  return {
    wallet,
    isConnecting,
    connect,
    disconnect,
  };
}
