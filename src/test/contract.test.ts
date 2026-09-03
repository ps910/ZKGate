import { describe, it, expect } from 'vitest';
import { generateMemberSecret, deriveCommitment } from '../../contract/witnesses';

describe('Allowlist Contract Logic', () => {
  /**
   * Test 1: Member secret generation
   * Verifies that secrets are 32 bytes and unique
   */
  it('generates a valid 32-byte member secret', () => {
    const secret = generateMemberSecret();

    expect(secret).toBeInstanceOf(Uint8Array);
    expect(secret.length).toBe(32);

    // Ensure secrets are random (two secrets should differ)
    const secret2 = generateMemberSecret();
    expect(secret).not.toEqual(secret2);
  });

  /**
   * Test 2: Commitment derivation
   * Verifies that the same secret always produces the same commitment
   * (deterministic hashing)
   */
  it('derives a deterministic commitment from a secret', async () => {
    const secret = new Uint8Array(32);
    secret.fill(42); // Fixed secret for deterministic test

    const commitment1 = await deriveCommitment(secret);
    const commitment2 = await deriveCommitment(secret);

    expect(commitment1).toBeInstanceOf(Uint8Array);
    expect(commitment1.length).toBe(32);
    expect(commitment1).toEqual(commitment2);
  });

  /**
   * Test 3: Different secrets produce different commitments
   * This ensures the hash function has no trivial collisions
   */
  it('produces different commitments for different secrets', async () => {
    const secret1 = new Uint8Array(32).fill(1);
    const secret2 = new Uint8Array(32).fill(2);

    const commitment1 = await deriveCommitment(secret1);
    const commitment2 = await deriveCommitment(secret2);

    expect(commitment1).not.toEqual(commitment2);
  });

  /**
   * Test 4: Commitment is not the same as the secret
   * This is crucial for privacy — the commitment should be a
   * one-way transformation of the secret
   */
  it('commitment differs from the original secret', async () => {
    const secret = new Uint8Array(32).fill(99);
    const commitment = await deriveCommitment(secret);

    // The commitment should NOT be the same bytes as the secret
    expect(commitment).not.toEqual(secret);
  });
});

describe('Privacy Properties', () => {
  /**
   * Test 5: Nullifier uniqueness
   * Verifies that different secrets produce different nullifiers,
   * ensuring each member has a unique replay-prevention identifier
   */
  it('generates unique nullifiers for different members', async () => {
    // Simulate nullifier generation (transientHash in contract)
    const deriveNullifier = async (secret: Uint8Array): Promise<Uint8Array> => {
      // Prefix with "nullifier:" to differentiate from commitment hash
      const prefixed = new Uint8Array(secret.length + 10);
      const prefix = new TextEncoder().encode('nullifier:');
      prefixed.set(prefix);
      prefixed.set(secret, 10);
      const hash = await crypto.subtle.digest('SHA-256', prefixed as unknown as BufferSource);
      return new Uint8Array(hash);
    };

    const secret1 = new Uint8Array(32).fill(10);
    const secret2 = new Uint8Array(32).fill(20);

    const nullifier1 = await deriveNullifier(secret1);
    const nullifier2 = await deriveNullifier(secret2);

    // Different secrets should produce different nullifiers
    expect(nullifier1).not.toEqual(nullifier2);

    // Nullifier should differ from commitment (unlinkable)
    const commitment1 = await deriveCommitment(secret1);
    expect(nullifier1).not.toEqual(commitment1);
  });

  /**
   * Test 6: Double-proof prevention simulation
   * Verifies the nullifier tracking logic prevents replay attacks
   */
  it('prevents double-proof using nullifier tracking', async () => {
    const usedNullifiers = new Set<string>();

    const tryProve = async (secret: Uint8Array): Promise<boolean> => {
      const hash = await crypto.subtle.digest('SHA-256', secret as unknown as BufferSource);
      const nullifier = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      if (usedNullifiers.has(nullifier)) {
        return false; // Already verified
      }

      usedNullifiers.add(nullifier);
      return true;
    };

    const memberSecret = new Uint8Array(32).fill(77);

    // First proof should succeed
    const firstProof = await tryProve(memberSecret);
    expect(firstProof).toBe(true);

    // Second proof with SAME secret should fail (replay)
    const secondProof = await tryProve(memberSecret);
    expect(secondProof).toBe(false);

    // Different member should still succeed
    const otherSecret = new Uint8Array(32).fill(88);
    const otherProof = await tryProve(otherSecret);
    expect(otherProof).toBe(true);
  });
});
