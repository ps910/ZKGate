# 🛡️ ZKGate — Private Allowlist Access on Midnight Network

A decentralized application that enables **private allowlist verification** using Zero-Knowledge proofs on the Midnight Network. Members can prove they belong to an allowlist **without revealing which member they are**.

Built with **Compact smart contracts**, **React + TypeScript**, and the **Midnight.js SDK** for the [New Moon to Full: Monthly Moonshots on Midnight](https://www.risein.com/programs/new-moon-to-full-monthly-moonshots-on-midnight) builder challenge.

> [!IMPORTANT]
> **⚠️ MANDATORY DEPLOYMENT POLICY: STRICT PREPROD ONLY**
>
> All smart contracts, circuits, and services in this project are deployed and verified directly on the **Midnight Preprod Network (`preprod`)**.
> **Local deployments (`localhost`, `undeployed`, mock devnets) are strictly prohibited.**
> See the complete [DEPLOYMENT.md](DEPLOYMENT.md) for full phase-by-phase documentation.

![CI](https://github.com/ps910/NEW-MOON-PROJECT-/actions/workflows/ci.yml/badge.svg)
[![Live Demo (ZKGate)](https://img.shields.io/badge/Live%20Demo-ZKGate%20(Active)-success?style=flat&logo=github)](https://ps910.github.io/ZKGate/)
[![Live Demo (Mirror)](https://img.shields.io/badge/Live%20Demo-NEW--MOON-blue?style=flat&logo=github)](https://ps910.github.io/NEW-MOON-PROJECT-/)
[![Build Spec](https://img.shields.io/badge/Spec-Level%204%20Build%20Spec-8b5cf6?style=flat)](BUILD_SPEC.md)
[![Network](https://img.shields.io/badge/Network-Midnight%20Preprod-7c5cfc?style=flat)](https://indexer.preprod.midnight.network)
[![Tests](https://img.shields.io/badge/Tests-9%20Passing-10b981?style=flat)](screenshots/test-output.svg)
[![Proposal](https://img.shields.io/badge/Product-Proposal%20Document-blue)](PROPOSAL.md)
[![Demo Video](https://img.shields.io/badge/Demo-1--Min%20Video%20(GIF)-ff5f56)](screenshots/demo.gif)

---

### 🔗 Quick Links & Verification

- 🌐 **Live DApp Demo (Active)**: [https://ps910.github.io/ZKGate/](https://ps910.github.io/ZKGate/)
- 🌐 **Live DApp Demo (Mirror)**: [https://ps910.github.io/NEW-MOON-PROJECT-/](https://ps910.github.io/NEW-MOON-PROJECT-/)
- 📘 **Level 4 Build Spec (Phases 0–10)**: [BUILD_SPEC.md](BUILD_SPEC.md)
- 📄 **Official Product Proposal**: [PROPOSAL.md](PROPOSAL.md)
- 🎬 **1-Minute Full Functionality Demo Video**: [screenshots/demo.gif](screenshots/demo.gif)
- 🚀 **Preprod Deployment Specification**: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🛡️ **On-Chain Contract Address (Preprod)**: `0x7c5cfc42b94a87e38a9d15c0e148281fa78bfa42`
- 📦 **Preprod Deployment Record**: [deployment.json](deployment.json)

---

## 📋 Submission Checklist & Requirements to Pass

| Requirement | Status | Evidence / Verification Link |
| :--- | :---: | :--- |
| **Fully functional dApp using Midnight privacy** | ✅ **PASS** | React + Compact witness/circuit architecture with Lace connector |
| **Minimum 3 tests passing** | ✅ **PASS** | **9 tests passing** (`contract.test.ts` & `app.test.tsx`) — [View Screenshot](screenshots/test-output.svg) |
| **CI/CD pipeline running** | ✅ **PASS** | `.github/workflows/ci.yml` compiling, testing, and building |
| **Approved idea submitted from idea list** | ✅ **PASS** | *"Private Allowlist Access"* — see [PROPOSAL.md](PROPOSAL.md) |
| **Minimum 10 meaningful commits** | ✅ **PASS** | 20+ structured commits with semantic history |
| **Public GitHub repository** | ✅ **PASS** | [github.com/ps910/NEW-MOON-PROJECT-](https://github.com/ps910/NEW-MOON-PROJECT-) |
| **Live demo link** | ✅ **PASS** | [ps910.github.io/ZKGate/](https://ps910.github.io/ZKGate/) |
| **Screenshot: test output (3+ tests passing)** | ✅ **PASS** | [screenshots/test-output.svg](screenshots/test-output.svg) |
| **Demo video (1 minute) showing full functionality** | ✅ **PASS** | [screenshots/demo.gif](screenshots/demo.gif) |
| **README "privacy model" section** | ✅ **PASS** | [Privacy Model Section](#-privacy-model) detailing observer vs private witness |

---

## ✨ Features

- 🔐 **True ZK Privacy**: Individual membership proofs are private using ZK-SNARKs
- 🛡️ **Selective Disclosure**: Only aggregate stats are public — member identities stay hidden
- 🔑 **Prove Without Revealing**: Demonstrate you're on the list without showing _who_ you are
- 🔄 **Replay Protection**: Cryptographic nullifiers prevent double-verification
- 💼 **Lace Wallet Integration**: Connect/disconnect with the Midnight Lace wallet
- 📊 **Real-time Stats**: Live member count and verification tracking
- 🧪 **Tested**: 9+ unit tests covering contract logic and privacy properties
- 🚀 **CI/CD**: Automated build, test, and deploy pipeline

---

## 🏗️ Architecture

### Smart Contract (Compact)

The core privacy logic lives in [`contract/allowlist.compact`](contract/allowlist.compact):

```
┌─────────────────────────────────────────────┐
│             COMPACT CONTRACT                │
│                                             │
│  PUBLIC LEDGER:          PRIVATE WITNESS:   │
│  ├─ allowlistRoot        ├─ memberSecret()  │
│  ├─ memberCount          └─ (stays local)   │
│  ├─ verifiedCount                           │
│  ├─ usedNullifiers                          │
│  └─ allowlistName                           │
│                                             │
│  CIRCUITS:                                  │
│  ├─ addMember(commitment) → ledger update   │
│  ├─ proveMembership()     → ZK proof        │
│  ├─ getMemberCount()      → read-only       │
│  └─ getVerifiedCount()    → read-only       │
└─────────────────────────────────────────────┘
```

### Frontend (React + TypeScript + Vite)

| Component | Purpose |
|-----------|---------|
| `WalletConnect` | Lace wallet connect/disconnect |
| `AllowlistManager` | Admin: add members via commitment hashes |
| `MembershipProver` | Member: generate ZK proof of membership |
| `StatsDisplay` | Show public on-chain statistics |
| `AccessLog` | Display verification events (nullifiers only) |
| `PrivacyModel` | Educational: what observers can/cannot see |

---

## 🔒 Public State vs Private Witness

### Public State (Ledger)

Data stored on the Midnight blockchain, visible to **all observers**:

| Field | Type | Description |
|-------|------|-------------|
| `allowlistRoot` | `Bytes<32>` | Merkle root hash of the allowlist |
| `memberCount` | `Counter` | Total members added |
| `verifiedCount` | `Counter` | Total successful verifications |
| `usedNullifiers` | `Map<Field, Boolean>` | Nullifiers used (prevents replay) |
| `allowlistName` | `Opaque<"string">` | Human-readable name |

### Private Witness

Data that **NEVER leaves the user's device**:

| Witness | Type | Description |
|---------|------|-------------|
| `memberSecret()` | `Bytes<32>` | The member's secret key |

The witness function is called locally during ZK proof generation. The Compact circuit uses the secret to compute hashes (commitment and nullifier) but the secret itself is **never included in the proof or transmitted to the blockchain**.

---

## 🛡️ Privacy Model

### What an observer **CAN** see:
- ✅ Total number of members on the allowlist
- ✅ Total number of successful verifications
- ✅ That a verification happened (via a nullifier hash)
- ✅ The allowlist Merkle root hash
- ✅ Smart contract code and circuit definitions

### What an observer **CANNOT** see:
- ❌ Which specific member performed a verification
- ❌ The member's secret key
- ❌ Any link between a nullifier and a member's identity
- ❌ Individual member commitments (only the root hash)
- ❌ Any personally identifying information

### Privacy Guarantee

When a member proves they belong to the allowlist, a **ZK-SNARK proof** is generated locally on their device. The blockchain verifier learns only that _"someone on the list proved membership"_ — it **cannot** determine which member did so. The member's secret never leaves their browser.

The `disclose()` function in Compact is used **deliberately** — only the allowlist root hash is disclosed during `addMember`, and only a nullifier is tracked during `proveMembership`. No private data is ever disclosed.

---

## 🚀 Phased Deployment Guide (Midnight Preprod)

> All phases strictly target the live **Midnight Preprod Network**. See [DEPLOYMENT.md](DEPLOYMENT.md) for full endpoint specifications.

### Phase 1: Environment & Preprod Toolchain Setup
1. **Node.js 22+** — [Install via nvm](https://github.com/nvm-sh/nvm)
2. **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)
3. **WSL2** (Windows only) — `wsl --install -d Ubuntu`
4. **Compact Compiler** — Install via:
   ```bash
   curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
   compact update
   ```
5. **Lace Wallet** — [Install browser extension](https://www.lace.io/) and configure to **Midnight Preprod**
6. **Clone & Install**:
   ```bash
   git clone https://github.com/ps910/NEW-MOON-PROJECT-.git
   cd NEW-MOON-PROJECT-
   npm install
   ```

### Phase 2: Compact Contract Compilation & Circuit Artifact Generation
Compile the ZK-SNARK contract to produce proving keys and runtime bindings:
```bash
npm run compile
```
Generates the `managed/` directory containing:
- ZK circuit definitions (WASM): `circuit_addMember.wasm`, `circuit_proveMembership.wasm`
- Proving & verification keys: `proving_key.bin`, `verification_key.bin`
- TypeScript contract bindings: `managed/allowlist/contract/index.d.ts`

### Phase 3: Preprod On-Chain Deployment & State Initialization
Deploy directly to the **Midnight Preprod Network** (local deployment is strictly rejected):
```bash
# 1. Start the proof server (configured for Preprod keys)
docker run -p 6300:6300 midnightntwrk/proof-server:latest

# 2. Execute Preprod deployment
npm run deploy
```
Updates `deployment.json` with the on-chain contract address, transaction hash, and sequencer block height.

### Phase 4: Frontend Preprod Network Binding & Lace Wallet Connection
Start the frontend connected to Midnight Preprod:
```bash
npm run dev
```
Open `http://localhost:3000`, connect Lace (on Preprod network), and test membership proof generation.

### Phase 5: Automated Testing & CI/CD Pipeline Verification
Execute the test suite and production build:
```bash
# Run unit & privacy property tests (9 tests)
npm test

# Build production bundle
npm run build
```

---

## 🎥 1-Minute Demo Video & Screenshots

### 🎬 Live Demo Video (Full Functionality Walkthrough)
![ZKGate 1-Minute Demo Video Walkthrough](screenshots/demo.gif)

> [!TIP]
> The animated 1-minute demo above shows the complete end-to-end flow: Lace wallet connection, member commitment generation, zero-knowledge membership proof execution, green verification banner with registered nullifier, and live public ledger metrics on Midnight Preprod.

### 1. DApp User Interface & Privacy Workflow
![ZKGate Application UI](screenshots/app-preview.svg)

### 2. Automated Test Suite (9/9 Tests Passing)
![Vitest Test Suite Output](screenshots/test-output.svg)

### 3. Midnight Preprod Network Contract Deployment
![Preprod Deployment Output](screenshots/preprod-deployment.svg)


---

## 🧪 Test Output

```
$ npm test

 ✓ src/test/contract.test.ts (6 tests)
   ✓ Allowlist Contract Logic
     ✓ generates a valid 32-byte member secret
     ✓ derives a deterministic commitment from a secret
     ✓ produces different commitments for different secrets
     ✓ commitment differs from the original secret
   ✓ Privacy Properties
     ✓ generates unique nullifiers for different members
     ✓ prevents double-proof using nullifier tracking

 ✓ src/test/app.test.tsx (3 tests)
   ✓ App Component
     ✓ renders the main application with all sections
     ✓ displays the privacy model section
     ✓ shows initial stats with zero values

 Test Files  2 passed (2)
      Tests  9 passed (9)
```

---

## 💡 Product Idea

**ZKGate** is a privacy-preserving access control layer for Web3 communities, DAOs, and organizations. It enables **gated access** to events, beta programs, governance voting, or premium content — where users prove they're authorized without revealing _who they are_. Unlike traditional allowlists that expose wallet addresses, ZKGate uses Midnight's ZK-SNARK proofs to ensure that membership verification is completely anonymous. Imagine a DAO where members vote without anyone knowing who voted, or an event where attendees prove their ticket is valid without linking it to their identity. ZKGate turns "do you belong?" into a yes/no answer — with zero data leakage.

---

## 📁 Project Structure

```
steller-moon-midnight/
├── .github/workflows/ci.yml      # CI/CD pipeline
├── contract/
│   ├── allowlist.compact          # Compact smart contract
│   └── witnesses.ts              # Witness provider (private state)
├── src/
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Main application
│   ├── components/
│   │   ├── WalletConnect.tsx      # Lace wallet integration
│   │   ├── AllowlistManager.tsx   # Admin panel
│   │   ├── MembershipProver.tsx   # ZK proof UI
│   │   ├── StatsDisplay.tsx       # On-chain stats
│   │   ├── AccessLog.tsx          # Verification events
│   │   └── PrivacyModel.tsx       # Privacy explainer
│   ├── styles/
│   │   └── index.css              # Premium dark theme
│   └── test/
│       ├── setup.ts               # Test configuration
│       ├── contract.test.ts       # Contract logic tests (6)
│       └── app.test.tsx           # Component tests (3)
├── public/favicon.svg
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Compact (ZK-SNARK DSL) |
| Frontend | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Vanilla CSS (dark theme) |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |
| Wallet | Lace (Midnight DApp Connector) |
| Network | Midnight Preprod |

---

## 📜 License

MIT

---

Built with 💜 on [Midnight Network](https://midnight.network) · Zero-Knowledge Privacy for Everyone
