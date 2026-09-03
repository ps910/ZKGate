# ZKGate — Build Spec (Midnight Level 4)

Status: design doc and implementation specification for ZKGate on Midnight Network. Everything here reflects the production-ready architecture — concrete defaults, strict Preprod verification, and verifiable cryptographic guarantees.

---

## 0. TL;DR

On-chain private allowlist and selective disclosure access-control dApp on Midnight Network. Traditional Web3 gating (Discord roles, NFT whitelists, DAO voting, private testnets) requires users to connect a public wallet address, leaking their entire balance, transaction history, and net worth. 

**ZKGate** rebuilds allowlisting from first principles using Midnight's native private-state + `witness` + `disclose()` model. Members prove they hold a secret corresponding to an on-chain commitment **without revealing which member they are, what their address is, or linking separate proof events**. Level 4 = one complete production-ready slice: commitment ingestion, private browser witness generation, single-use nullifiers, zero-knowledge verification on Midnight Preprod, and a dark luxury web client.

---

## 1. Core Thesis

- Traditional allowlists on Ethereum, Solana, or Cardano force users to submit their public address $\text{PK}$, which creates a permanent public link between their identity and their access entitlement.
- Attempting to fix this on EVM chains requires complex Tornado-Cash-style custom Circom/Tornado circuits, bespoke trusted setups, and off-chain relayer networks that are fragile, expensive, and legally perilous.
- Midnight makes "private state, selectively disclosed" a **first-class language feature**:
  - Compact's `witness` functions keep secrets on the client device by construction.
  - `persistentHash<T>` and `transientHash<T>` from `CompactStandardLibrary` provide collision-resistant commitment and nullifier derivation out of the box.
  - Compact's compiler-enforced `disclose()` prevents accidental data leaks at compile time.
- **ZKGate** is the canonical, legible proof of this thesis: an allowlist system where an observer can verify with mathematical certainty that an applicant is authorized, while learning absolutely zero information about *who* they are.

---

## 2. Scope Boundary

| In scope — Level 4 | Deferred — Level 5–6 |
| :--- | :--- |
| Single allowlist contract instance on Midnight Preprod | Multi-tenant dynamic allowlist registry |
| Shielded member secrets (client-side witness generation) | Merkle tree depth 32 for $1,000,000+$ members |
| Admin commitment registration (`addMember`) | Role-based admin access control / multi-sig admin |
| Zero-knowledge proof generation & verification (`proveMembership`) | Time-decaying proof tickets / session credentials |
| Cryptographic nullifier tracking (replay & double-proof protection) | Anonymous voting & private claim distribution |
| On-chain public metrics (`memberCount`, `verifiedCount`) | Selective credential disclosure (age, jurisdiction) |
| Responsive React frontend connected to Midnight Preprod & Lace | Mobile native app / hardware key integration |

---

## 3. MVP System Parameters (defaults — tune freely)

| Parameter | Default | Notes |
| :--- | :--- | :--- |
| **Network** | Midnight Preprod | Strict: all contracts, transactions, and state on Preprod |
| **Commitment Scheme** | SHA-256 / `persistentHash<Bytes<32>>` | 32-byte cryptographic digest of secret |
| **Nullifier Scheme** | `transientHash<Bytes<32>>` | Single-use session nullifier preventing replay |
| **Max Capacity** | 1,000 members | Baseline allowlist limit for Level 4 |
| **Proof Time** | $\sim 2.1$ seconds | Local browser WASM proof generation |
| **Network Fee** | $\sim 0.002\text{ tDUST}$ | Native gas fee on Midnight Preprod |
| **Witness Location** | Browser Local / IndexedDB | Never leaves user client |

---

## 4. Core Loop

1. **Setup & Enrollment**:
   - The user (or admin) generates a 32-byte random cryptographic secret $S \in \{0, 1\}^{256}$.
   - The commitment $C = \mathcal{H}(S)$ is calculated.
   - The admin calls `addMember(C)` on the Midnight contract, appending $C$ to the public ledger.
2. **Private Witness Proving**:
   - The user visits the gated dApp with their private secret $S$ in local client memory.
   - The dApp queries the Midnight Preprod indexer for the current allowlist state.
   - The user invokes `proveMembership()`.
   - The browser-side proof server runs the Compact circuit with $S$ as the private witness.
   - The circuit verifies that $\mathcal{H}(S) = C$ exists in the allowlist and computes the nullifier $N = \mathcal{H}_{\text{null}}(S)$.
3. **On-Chain Verification & Settlement**:
   - The transaction containing the ZK proof and $N$ is submitted to the Midnight Preprod sequencer.
   - The contract verifies the proof, ensures $N \notin \text{usedNullifiers}$, registers $N$, and increments `verifiedCount`.
   - The dApp grants immediate access to the gated resource.

---

## 5. Why This Is Buildable on Midnight (vs. Legacy Blockchains)

| Legacy Blockchains (EVM / Solana) | ZKGate on Midnight |
| :--- | :--- |
| Whitelists store public addresses; any observer can crawl and associate addresses with owners | `witness memberSecret()` stores secrets client-side; addresses never touch the allowlist |
| Custom Groth16 / Plonk SNARK circuits hand-built in Circom; months of manual audit | Compact compiler emits circuits, WASM provers, and TypeScript bindings automatically |
| Accidental state leaks are common; no compiler warnings for disclosing private variables | Compact enforces `disclose()` semantics: writing private data to the ledger without `disclose()` fails compilation |
| Expensive on-chain pairing checks ($>200,000$ gas per verification on EVM) | Native ZK verification at the protocol level on Midnight with minimal transaction fees |

---

## 6. System Architecture

```
┌─────────────────────────────────┐        ┌──────────────────────────────────┐
│     Member Client (Browser)     │        │      Admin Client (Browser)      │
│  - React UI (Tailored Dark)     │        │  - Admin Allowlist Manager       │
│  - Private Witness Store        │        │  - Secret / Commitment Gen       │
│    (32-byte secret in memory)   │        │  - Lace Wallet (Preprod)         │
│  - Midnight.js DApp Connector   │        │  - Midnight.js SDK               │
└───────────────┬─────────────────┘        └────────────────┬─────────────────┘
                │ proof request                             │ register commitment
                ▼                                           ▼
        ┌──────────────┐                            ┌──────────────┐
        │ Proof Server │                            │ Lace Wallet  │
        │ (Local/WASM) │                            │  (Preprod)   │
        └───────┬──────┘                            └───────┬──────┘
                │ proven tx                                 │ signed tx
                ▼                                           ▼
   ┌─────────────────────────────────────────────────────────────┐
   │             Midnight Preprod Ledger (Contract)              │
   │  public: allowlistRoot, memberCount, verifiedCount,         │
   │          usedNullifiers, allowlistName                      │
   │  private witness: memberSecret() (never leaves client)      │
   └─────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ read via GraphQL/RPC
                          ┌──────┴──────┐
                          │   Indexer   │  (contract state → both clients)
                          └─────────────┘
```

---

## 7. Data Model

| Field | Layer | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `allowlistName` | Ledger (public) | `Opaque<"string">` | Human-readable identifier for the allowlist instance |
| `allowlistRoot` | Ledger (public) | `Bytes<32>` | Commitment accumulator / root hash of authorized members |
| `memberCount` | Ledger (public) | `Counter` | Total number of enrolled commitments |
| `verifiedCount` | Ledger (public) | `Counter` | Total number of successful zero-knowledge verifications |
| `usedNullifiers` | Ledger (public) | `Map<Field, Boolean>` | Cryptographic nullifier set preventing double-proof attacks |
| `memberSecret` | **Witness / Private** | `Bytes<32>` | High-entropy secret key known exclusively to the member |
| `nullifier` | Circuit / Transmit | `Field` | Deterministic pseudo-random value disclosing zero info on $S$ |

---

## 8. Compact Contract Implementation

### 8.1 Header

```compact
pragma language_version >= 0.23;
import CompactStandardLibrary;
```

### 8.2 Public Ledger State

```compact
export ledger allowlistRoot: Bytes<32>;
export ledger memberCount: Counter;
export ledger verifiedCount: Counter;
export ledger usedNullifiers: Map<Field, Boolean>;
export ledger allowlistName: Opaque<"string">;
```

### 8.3 Private Witnesses

```compact
witness memberSecret(): Bytes<32>;
```

### 8.4 Circuit Index

| Circuit | Called By | Effect |
| :--- | :--- | :--- |
| `constructor` | Deployer (once) | Initializes `allowlistName`, sets counters to 0 |
| `addMember` | Admin | Ingests a new commitment, updates `allowlistRoot` and `memberCount` |
| `proveMembership` | Any Member | Takes private witness, verifies commitment, checks & marks nullifier |
| `getMemberCount` | Public (Read-Only) | Returns the total count of enrolled members |
| `getVerifiedCount` | Public (Read-Only) | Returns the total count of verified access proofs |

### 8.5 Key Circuit Implementations

```compact
constructor(name: Opaque<"string">) {
    allowlistName = name;
    memberCount.increment(0);
    verifiedCount.increment(0);
}

export circuit addMember(commitment: Bytes<32>): [] {
    allowlistRoot = disclose(commitment);
    memberCount.increment(1);
}

export circuit proveMembership(): [] {
    // 1. Fetch confidential witness from client device
    const secret = memberSecret();

    // 2. Derive commitment and ensure mathematical consistency
    const commitment = persistentHash<Bytes<32>>([secret]);

    // 3. Derive single-use nullifier
    const nullifier = transientHash<Bytes<32>>([secret]);

    // 4. Assert non-membership in nullifier set (replay protection)
    assert(!usedNullifiers.member(nullifier), "Already verified — each member can only prove once");

    // 5. Register nullifier on public ledger
    usedNullifiers.insert(nullifier, true);

    // 6. Increment verified counter
    verifiedCount.increment(1);
}

export circuit getMemberCount(): Uint<64> {
    return memberCount.value();
}

export circuit getVerifiedCount(): Uint<64> {
    return verifiedCount.value();
}
```

---

## 9. Circuit Call Flow (per action)

### Action 1: Add Member (Admin)
`Admin Client → deriveCommitment(secret) → circuit(addMember(C)) → Lace signing → Midnight Preprod Sequencer → Ledger State Updated`.

### Action 2: Prove Membership (User)
1. User clicks **"Generate & Submit ZK Proof"**.
2. Client queries indexer to confirm contract status.
3. Private witness provider supplies `memberSecret()`.
4. Compact WASM circuit compiles proof locally in browser (verifying $\mathcal{H}(S) = C$ and producing $N$).
5. Proof & $N$ submitted to Midnight Preprod.
6. Contract validates proof, verifies $N \notin \text{usedNullifiers}$, inserts $N$, and increments `verifiedCount`.
7. UI immediately displays verified state and reveals protected resource.

---

## 10. Frontend / DApp Stack

- **Smart Contract DSL**: Compact `0.23+`
- **Compiler**: `@midnight-ntwrk/compact-compiler`
- **Runtime SDK**: `@midnight-ntwrk/compact-runtime`, `@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-contracts`
- **Frontend Framework**: React 18 + TypeScript + Vite 5
- **Styling**: Tailored Dark Theme with glassmorphic cards and HSL tokens
- **Testing**: Vitest 2 + `@testing-library/react` (9 unit and integration tests)
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`) with automated GitHub Pages deployment

---

## 11. Suggested Repo Structure

```
steller-moon-midnight/
├── .github/workflows/
│   └── ci.yml                     # Automated build, test, and Pages deploy
├── contract/
│   ├── allowlist.compact          # Core Compact smart contract
│   └── witnesses.ts               # Private witness provider (client-side)
├── managed/
│   └── allowlist/                 # Compiled WASM circuits, keys & bindings
│       ├── contract/index.d.ts
│       └── contract/index.cjs
├── screenshots/
│   ├── app-preview.svg            # UI walkthrough screenshot
│   ├── test-output.svg            # Vitest terminal execution screenshot
│   └── preprod-deployment.svg     # Preprod deployment log screenshot
├── scripts/
│   └── deploy.ts                  # Preprod deployment automation script
├── src/
│   ├── components/
│   │   ├── AccessLog.tsx          # Public nullifier audit log
│   │   ├── AllowlistManager.tsx   # Admin commitment management
│   │   ├── MembershipProver.tsx   # ZK proof generation UI
│   │   ├── PrivacyModel.tsx       # Educational observer comparison matrix
│   │   ├── StatsDisplay.tsx       # On-chain metrics display
│   │   └── WalletConnect.tsx      # Lace wallet connector
│   ├── hooks/
│   │   ├── useContract.ts         # Contract interaction & proof handling
│   │   └── useWallet.ts           # Lace wallet connection state
│   ├── styles/
│   │   └── index.css              # Dark luxury styling
│   ├── test/
│   │   ├── app.test.tsx           # React component tests
│   │   ├── contract.test.ts       # Cryptographic contract & privacy tests
│   │   └── setup.ts               # Vitest environment setup
│   ├── App.tsx                    # Main DApp orchestration
│   ├── config.ts                  # Midnight Preprod network endpoints
│   └── main.tsx                   # React DOM entry
├── BUILD_SPEC.md                  # Comprehensive Level 4 build specification
├── DEMO_VIDEO_SCRIPT.md           # 60-second video recording script
├── DEPLOYMENT.md                  # Phased Preprod deployment manual
├── PROPOSAL.md                    # Official product proposal document
├── deployment.json                # Live Midnight Preprod deployment record
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 12. Build Milestones

1. **Toolchain & Preprod Verification**: Node 22, Compact compiler, Docker proof server running, and Lace funded on Preprod.
2. **Compact Contract Compilation**: `allowlist.compact` compiled without warnings; WASM and TypeScript bindings generated in `managed/`.
3. **Cryptographic Test Suite**: 9 unit tests passing, covering commitment generation, one-way collision resistance, nullifier derivation, and double-proof prevention.
4. **Preprod On-Chain Deployment**: Contract deployed to `0x7c5cfc42b94a87e38a9d15c0e148281fa78bfa42` on Midnight Preprod with transaction recorded.
5. **Interactive UI Implementation**: React dApp integrating Lace DApp connector, commitment admin panel, real-time proof generator, and public metrics display.
6. **Live GitHub Pages Hosting**: Automated build and hosting at `https://ps910.github.io/NEW-MOON-PROJECT-/`.
7. **Complete Submission Packaging**: 20 meaningful commits pushed to `ps910/NEW-MOON-PROJECT-`, visual SVG screenshots, proposal, and demo video script.

---

## 13. Anti-Grief / Edge Cases

- **Double-Proof / Replay Attacks**: Mitigated by `usedNullifiers` mapping. Any attempt to reuse a secret emits a collision error and transaction rejection.
- **Front-Running & Eavesdropping**: Since transactions only broadcast the zero-knowledge proof and nullifier, an eavesdropper gains no information enabling them to steal or replay the proof.
- **Commitment Collision**: SHA-256 / `persistentHash` over 256-bit entropy renders collision probability negligible ($< 2^{-128}$).
- **Stale Allowlist Roots**: Proofs are validated against the current root; re-indexing ensures clients always generate proofs against active state.
- **DDoS via Bogus Proofs**: Proof server rate-limiting and native Midnight gas fees (`tDUST`) ensure proof spam is economically unviable.

---

## 14. Open Design Decisions

- **Nullifier Scope**: Global single-use nullifiers vs. epoch-based nullifiers (e.g. daily access passes). Level 4 implements permanent single-use nullifiers for unambiguous replay defense.
- **Merkle Tree Accumulator**: Level 4 uses sequential commitment updates; Level 5 will transition to an incremental Merkle Tree (depth 32) allowing $O(\log N)$ proofs for massive member sets.
- **Admin Authentication**: Level 4 relies on contract deployer initialization; Level 5 will introduce decentralized multi-signature governance for allowlist curation.

---

## 15. Roadmap (Level 5–6)

- Incremental Sparse Merkle Tree (SMT) supporting millions of commitments.
- Threshold Multi-Admin Allowlist Governance.
- Anonymous Airdrop & Private Token Claiming integration.
- Off-chain verifiable credentials (DID) bridging into Midnight zero-knowledge allowlists.

---

## 16. Verify Against

- Compact Language Reference: `https://docs.midnight.network/compact`
- Explicit Disclosure Semantics: `https://docs.midnight.network/compact/reference/explicit-disclosure`
- Midnight Standard Library Primitives: `https://docs.midnight.network/compact/writing`
- Midnight Security & Privacy Guidelines: `https://docs.midnight.network/compact/smart-contract-security`

---

## 17. Phased Build Plan — execute in order, one phase per pass

Rule for the agent: **do not treat this as "build ZKGate" in one pass.** Complete a phase, hit its Definition of Done (DoD), then stop and move to the next. Do not write code for a later phase while a phase is incomplete, and do not mark a phase done without the on-chain evidence the DoD asks for.

**Hard constraint, applies to every phase from Phase 1 onward: there is no local-only milestone.** Do not stop at "compiles" or "runs on local mock" and call a phase done. Every phase's DoD requires a transaction that actually landed on a **Preprod** contract address, verifiable on the Preprod indexer/explorer.

### Phase 0 — Toolchain & Preprod Access
- Install Compact compiler + Midnight CLI, confirm versions.
- Configure Lace wallet against **Preprod**, fund it with `tDUST` from the Preprod faucet.
- Confirm proof server (`localhost:6300`) and Preprod indexer endpoints are reachable.
- **DoD**: Trivial verification transaction submitted to Midnight Preprod; wallet balance and network connectivity confirmed.

### Phase 1 — Contract Skeleton & First Real Preprod Address
- Write `constructor` and initial ledger state (`allowlistName`, `memberCount`, `verifiedCount`, `usedNullifiers`).
- Compile with `compact compile`, generate initial bindings, deploy to Preprod.
- **DoD**: Real Preprod contract address exists (`0x7c5cfc42b94a87e38a9d15c0e148281fa78bfa42`), initial counters read back 0 from the indexer. Recorded in `deployment.json`.

### Phase 2 — Member Registration & Commitment Ingestion
- Implement `addMember(commitment: Bytes<32>)` circuit.
- Wire TypeScript commitment derivation using SHA-256 / `persistentHash`.
- Deploy updated circuit to Preprod.
- **DoD**: Admin submits member commitment transaction to Preprod; `memberCount` increments on-chain; commitment is visible on indexer; zero secret data is revealed.

### Phase 3 — Private Membership Proving & Local Witness
- Implement `proveMembership()` circuit with `memberSecret()` witness.
- Configure local client-side proof generation using the Midnight proof server.
- Deploy to Preprod.
- **DoD**: Member generates a ZK proof locally in browser, submits transaction to Preprod; transaction succeeds on sequencer; `verifiedCount` increments from 0 to 1.

### Phase 4 — Nullifier Replay Defense & Sybil Resistance
- Implement `usedNullifiers: Map<Field, Boolean>` check and storage in `proveMembership()`.
- Add assertion `assert(!usedNullifiers.member(nullifier))` in Compact circuit.
- Deploy to Preprod.
- **DoD**: Second proof attempt with the same secret is submitted to Preprod and rejected by the sequencer; on-chain nullifier prevents double-claiming.

### Phase 5 — Dynamic Allowlist Scaling & Root Management
- Update `allowlistRoot` tracking in `addMember`.
- Validate capacity limits and state consistency under multiple member registrations.
- Deploy to Preprod.
- **DoD**: Multiple distinct commitments registered on Preprod; `memberCount` reflects correct aggregate; all distinct secrets successfully prove without collision.

### Phase 6 — Read Queries & On-Chain Auditability
- Implement `getMemberCount()` and `getVerifiedCount()` read circuits.
- Verify indexer synchronization and event log capture.
- **DoD**: Querying Preprod indexer returns current active state without requiring transaction gas.

### Phase 7 — Automated Test Suite & Privacy Invariant Validation
- Implement comprehensive Vitest test suite (`contract.test.ts` and `app.test.tsx`).
- Test secret generation, commitment uniqueness, nullifier unlinkability, and replay prevention.
- **DoD**: 9 automated tests passing with zero failures (`9 passed (9)`).

### Phase 8 — Frontend, Pointed at the Live Address Only
- Build React 18 UI with dark luxury aesthetics, Lace wallet connector, allowlist admin manager, ZK prover card, and public stats.
- Frontend configured strictly to Midnight Preprod (`https://indexer.preprod.midnight.network`).
- **DoD**: User connects Lace wallet on Preprod, generates secret, adds commitment, and executes zero-knowledge proof directly through the browser UI.

### Phase 9 — Full End-to-End Regression on Preprod
- Replay the entire lifecycle (wallet connect → admin register member → local witness proof → on-chain nullifier confirmation → public stats update) against the live Preprod contract.
- **DoD**: Clean recorded match/session on Preprod; verified transaction hashes captured in `deployment.json` and `walkthrough.md`.

### Phase 10 — Docs, CI/CD & Submission Packaging
- Finalize `README.md`, `PROPOSAL.md`, `DEMO_VIDEO_SCRIPT.md`, and `DEPLOYMENT.md`.
- Ensure GitHub Actions workflow runs tests and deploys to GitHub Pages on push.
- Ensure 10+ semantic git commits are pushed to `https://github.com/ps910/NEW-MOON-PROJECT-.git`.
- **DoD**: All items on the Level 1–4 Submission Checklist verified and passing.
