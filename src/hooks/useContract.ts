import { useState, useCallback } from 'react';
import { NETWORK_CONFIG } from '../config';
import { deriveCommitment } from '../../contract/witnesses';

export interface ContractState {
  deployed: boolean;
  address: string;
  memberCount: number;
  verifiedCount: number;
  allowlistName: string;
}

export interface VerificationLog {
  id: string;
  nullifier: string;
  timestamp: Date;
  type: 'add_member' | 'prove_membership';
}

/**
 * Custom hook for interacting with the ZKGate Allowlist Compact contract
 */
export function useContract() {
  const [contract, setContract] = useState<ContractState>({
    deployed: true,
    address: NETWORK_CONFIG.contractAddress,
    memberCount: 3,
    verifiedCount: 1,
    allowlistName: 'ZKGate Alpha / Beta Access',
  });

  const [logs, setLogs] = useState<VerificationLog[]>([
    {
      id: 'init-1',
      nullifier: '0x8f2e9c1d04b6a782e35f9012a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4',
      timestamp: new Date(Date.now() - 3600000),
      type: 'add_member',
    },
    {
      id: 'init-2',
      nullifier: '0x4a7b9c2e5f80123456789abcdef0123456789abcdef0123456789abcdef01234',
      timestamp: new Date(Date.now() - 1800000),
      type: 'prove_membership',
    },
  ]);

  const [proofStatus, setProofStatus] = useState<'idle' | 'generating' | 'verified' | 'failed'>('idle');

  const addMember = useCallback(async (customCommitmentHex?: string) => {
    let commitment = customCommitmentHex;
    if (!commitment || !commitment.startsWith('0x')) {
      const randomSecret = crypto.getRandomValues(new Uint8Array(32));
      const commitmentBytes = await deriveCommitment(randomSecret);
      commitment = '0x' + Array.from(commitmentBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    setContract((prev) => ({
      ...prev,
      memberCount: prev.memberCount + 1,
    }));

    const newLog: VerificationLog = {
      id: crypto.randomUUID(),
      nullifier: commitment,
      timestamp: new Date(),
      type: 'add_member',
    };

    setLogs((prev) => [newLog, ...prev]);
    return commitment;
  }, []);

  const proveMembership = useCallback(async (): Promise<boolean> => {
    setProofStatus('generating');

    try {
      // Simulate proof server off-chain proof generation
      await new Promise((r) => setTimeout(r, 2200));

      const mockNullifierBytes = crypto.getRandomValues(new Uint8Array(32));
      const nullifier =
        '0x' +
        Array.from(mockNullifierBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

      setContract((prev) => ({
        ...prev,
        verifiedCount: prev.verifiedCount + 1,
      }));

      const newLog: VerificationLog = {
        id: crypto.randomUUID(),
        nullifier,
        timestamp: new Date(),
        type: 'prove_membership',
      };

      setLogs((prev) => [newLog, ...prev]);
      setProofStatus('verified');

      setTimeout(() => setProofStatus('idle'), 6000);
      return true;
    } catch (error) {
      console.error('Failed to generate proof:', error);
      setProofStatus('failed');
      setTimeout(() => setProofStatus('idle'), 6000);
      return false;
    }
  }, []);

  return {
    contract,
    logs,
    proofStatus,
    addMember,
    proveMembership,
  };
}
