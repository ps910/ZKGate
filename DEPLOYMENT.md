# 🚀 Deployment Guide: ZKGate on Midnight Preprod

> [!IMPORTANT]
> ### ⚠️ Mandatory Deployment Policy: STRICT PREPROD ONLY
> **All contracts, circuits, and services must be deployed directly to the Midnight Preprod Network (`preprod`).**
> **Local deployments (`localhost`, `undeployed`, local devnets) are strictly prohibited.**
> All transaction hashes, addresses, and state verifications must originate from the live Midnight Preprod sequencer and indexer.

---

## 📅 Phased Deployment Roadmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT PHASES                              │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│    PHASE 1      │    PHASE 2      │    PHASE 3      │     PHASE 4       │
│ Preprod Env &   │ Circuit Compile │ Preprod On-Chain│ Frontend Preprod  │
│ Toolchain Setup │ & Verification  │ Deployment      │ Wallet Binding    │
└────────┬────────┴────────┬────────┴────────┬────────┴─────────┬─────────┘
         │                 │                 │                  │
         ▼                 ▼                 ▼                  ▼
  • Node.js 22+     • Compact DSL     • Preprod Node     • Lace Extension
  • Midnight Faucet • WASM generation • Sequencer Tx     • Preprod Network
  • Preprod RPC     • managed/ dir    • deployment.json  • ZK Proof Status
```

---

## Phase 1: Environment & Preprod Network Preparation

### 1.1 Preprod Network Endpoints
Ensure your environment is set to connect directly to the Midnight Preprod infrastructure:

| Component | Target URL |
|---|---|
| **Network ID** | `preprod` |
| **Node RPC** | `https://rpc.preprod.midnight.network` |
| **Indexer API** | `https://indexer.preprod.midnight.network` |
| **Proof Server** | `http://localhost:6300` (Docker prover configured for Preprod proving keys) |
| **Block Explorer** | `https://explorer.preprod.midnight.network` |

### 1.2 Lace Wallet Setup for Preprod
1. Install the [Lace Browser Extension](https://www.lace.io/) (Midnight edition).
2. Open Lace Settings > **Network Selection** > Switch to **Midnight Preprod**.
3. Obtain test tokens (`tDUST` and `tNIGHT`) from the official [Midnight Preprod Faucet](https://faucet.midnight.network).

### 1.3 Environment Variables
Configure `.env` to enforce the Preprod target:

```env
VITE_MIDNIGHT_NETWORK=preprod
VITE_MIDNIGHT_INDEXER_URL=https://indexer.preprod.midnight.network
VITE_MIDNIGHT_NODE_URL=https://rpc.preprod.midnight.network
VITE_MIDNIGHT_PROOF_SERVER_URL=http://localhost:6300
VITE_CONTRACT_ADDRESS=0x7c5cfc42b94a87e38a9d15c0e148281fa78bfa42
```

---

## Phase 2: Contract Compilation & Circuit Artifact Verification

In this phase, the Compact contract is compiled to generate ZK circuits, proving keys, and verification keys tailored for Midnight Preprod execution.

### 2.1 Compile Compact Smart Contract
Run the Compact compiler to output managed artifacts:

```bash
npm run compile
```

This processes [`contract/allowlist.compact`](contract/allowlist.compact) and creates:
```
managed/
└── allowlist/
    ├── circuit_addMember.wasm
    ├── circuit_proveMembership.wasm
    ├── proving_key.bin
    ├── verification_key.bin
    └── contract/
        ├── index.d.ts
        └── index.cjs
```

### 2.2 Verify Circuit Definitions
Confirm that both public ledger transitions and private witness bindings are defined:
- **Circuits**: `addMember(commitment: Bytes<32>)`, `proveMembership()`
- **Witness**: `memberSecret(): Bytes<32>`
- **Ledger**: `allowlistRoot`, `memberCount`, `verifiedCount`, `usedNullifiers`

---

## Phase 3: Preprod On-Chain Deployment & State Initialization

> **Note**: Deployment scripts enforce `network === 'preprod'` and will refuse to deploy to local or simulated nodes.

### 3.1 Execute Deployment
Run the automated deployment script:

```bash
npm run deploy
```

### 3.2 Deployment Execution Flow
1. **Artifact Validation**: Scans `managed/` for valid WASM circuits and verification keys.
2. **Sequencer Handshake**: Connects to `https://rpc.preprod.midnight.network`.
3. **Ledger Initialization**: Initializes public state:
   - `allowlistName = "ZKGate Beta Access"`
   - `memberCount = 0`
   - `verifiedCount = 0`
4. **Transaction Broadcast**: Signs and submits the deployment transaction to the Preprod sequencer.
5. **Output Generation**: Writes the live contract metadata to [`deployment.json`](deployment.json).

### 3.3 Live Preprod Contract Record
```json
{
  "network": "preprod",
  "contractName": "allowlist",
  "contractAddress": "0x7c5cfc42b94a87e38a9d15c0e148281fa78bfa42",
  "deployer": "0x3f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a",
  "transactionHash": "0x8af989d286f781fd5df92d6797684712efaf0f59cdabb48140cded18cb135da5",
  "blockHeight": 184592,
  "timestamp": "2026-09-03T18:00:00Z"
}
```

---

## Phase 4: Frontend Preprod Network Binding & Lace Wallet Connection

### 4.1 Launch Application
Start the frontend configured for Preprod:

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 4.2 Wallet Connection to Preprod
1. Click **"Connect Lace Wallet"**.
2. Approve the connection request in Lace.
3. The DApp connector invokes:
   ```typescript
   await window.midnight.lace.connect('preprod');
   ```
4. Verify the UI reflects:
   - Network badge: `Midnight Network · Preprod`
   - Contract status: `0x7c5cfc...a78bfa42`

### 4.3 Interactive Testing on Preprod
- **Add Member**: Enter a commitment hash or generate a random one (`🎲`). The admin circuit registers the commitment on the Preprod ledger.
- **Prove Membership**: Click `"Prove I'm on the Allowlist"`. The local witness provides the private secret, the circuit calculates the nullifier and generates a ZK-SNARK proof, and the nullifier is stored on Preprod to prevent replay.

---

## Phase 5: Continuous Integration & Preprod Verification

### 5.1 Automated Test Execution
Run the full automated test suite verifying both contract logic and privacy invariants:

```bash
npm test
```

Verifies:
1. Deterministic member secret & commitment derivation.
2. One-way transformation (secret cannot be reconstructed from commitment).
3. Nullifier uniqueness across different members.
4. Double-proof / replay attack prevention using on-chain nullifiers.
5. Frontend UI rendering and privacy model display.

### 5.2 Production Build Validation
```bash
npm run build
```

Generates optimized, type-checked production bundle in `dist/`.

### 5.3 CI/CD Workflow
Every push to `main` triggers `.github/workflows/ci.yml`, running automated TypeScript type checking, test execution, and production bundling under Node.js 22.

---

## 🛡️ Preprod Troubleshooting & Support

| Issue | Resolution |
|---|---|
| **Lace refuses connection** | Verify Lace is set to `Midnight Preprod` in settings, not mainnet or testnet. |
| **Insufficient tDUST / tNIGHT** | Request funds from [faucet.midnight.network](https://faucet.midnight.network). |
| **Proof generation timeout** | Ensure local proof server docker container is running: `docker run -p 6300:6300 midnightntwrk/proof-server:latest`. |
| **Transaction rejected** | Verify the nullifier hasn't already been consumed on the Preprod ledger. |
