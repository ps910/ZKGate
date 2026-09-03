# Managed Directory

This directory contains the compiled Zero-Knowledge circuits, proving keys, verification keys, and generated TypeScript bindings produced by the Compact compiler:

```bash
compact compile contract/allowlist.compact --output managed/
```

## Structure
- `allowlist/contract/index.d.ts`: TypeScript interface definitions for public ledger state, circuits, and private witnesses.
- `allowlist/contract/index.cjs`: Runtime JavaScript bindings for Midnight.js contract deployment and execution.
- `allowlist/circuit_addMember.wasm`: WASM circuit for adding allowlist commitments.
- `allowlist/circuit_proveMembership.wasm`: WASM circuit for generating ZK proofs of membership.
- `allowlist/proving_key.bin`: Prover key for off-chain proof generation.
- `allowlist/verification_key.bin`: Verifier key for on-chain proof verification.
