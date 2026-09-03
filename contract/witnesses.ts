/**
 * Witness Provider for ZKGate Private Allowlist
 *
 * Witnesses are functions that provide private inputs to Compact circuits.
 * They run LOCALLY on the user's device and NEVER leave the browser.
 *
 * The memberSecret witness returns the user's secret key, which is used
 * to derive their commitment (for membership proof) and nullifier
 * (for replay protection).
 */

export interface LocalState {
  /** The member's secret key — stored only in local browser storage */
  secret: Uint8Array;
}

/**
 * Create a witness provider bound to the user's local state.
 *
 * @param localState - The local private state containing the member's secret
 * @returns Witness functions that the Compact runtime can call during proof generation
 */
export function createWitnessProvider(localState: LocalState) {
  return {
    /**
     * memberSecret witness — called by the proveMembership circuit
     *
     * Returns the member's 32-byte secret key from local state.
     * This value NEVER appears on-chain or in any ZK proof output.
     * The circuit only uses it to compute hashes internally.
     */
    memberSecret: (): Uint8Array => {
      if (!localState.secret || localState.secret.length !== 32) {
        throw new Error(
          'Member secret not found in local state. ' +
          'Please ensure you have registered as a member first.'
        );
      }
      return localState.secret;
    },
  };
}

/**
 * Generate a random 32-byte secret for a new member.
 * This secret should be stored securely in local browser storage.
 */
export function generateMemberSecret(): Uint8Array {
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  return secret;
}

/**
 * Derive a commitment from a secret.
 * The commitment is what gets added to the allowlist (public).
 * The secret stays private.
 *
 * NOTE: In the actual contract, this is done by persistentHash.
 * This TypeScript version is for local preview/testing only.
 */
export async function deriveCommitment(secret: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', secret as unknown as BufferSource);
  return new Uint8Array(hashBuffer);
}
