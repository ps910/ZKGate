# Product Proposal: ZKGate — Private Allowlist Access

**Selected Track**: Privacy-Preserving Access Control & Identity  
**Midnight Network Target**: Preprod / Preview  
**Status**: Ready for Submission & Approval  

---

## 1. Executive Summary

Traditional blockchain allowlists and token-gating solutions force users to connect public wallet addresses that link their on-chain identity, financial net worth, and historical transactions directly to the gating service.

**ZKGate** solves this fundamental privacy flaw using Midnight's hybrid ledger and Zero-Knowledge (ZK) proofs. Members prove that their private credentials correspond to an authorized entry in an on-chain commitment set **without revealing which address or secret is theirs**, preventing wallet tracking, profiling, and doxxing.

---

## 2. Problem Statement

1. **Public Doxxing in Token-Gating**: In Web3 today (Discord roles, NFT mints, DAO voting, exclusive dApps), proving membership requires signing a message with a public wallet address. Observers can trace the user's holdings, previous transactions, and entire balance.
2. **Replay & Sybil Vulnerabilities**: Naive off-chain signature schemes risk replay attacks across multiple services without on-chain finality.
3. **Regulatory & Compliance Friction**: Organizations cannot securely offer whitelisted access to sensitive resources (investor portals, employee access, beta groups) on public blockchains without breaching privacy regulations like GDPR.

---

## 3. The Solution: ZKGate on Midnight

ZKGate leverages Midnight's domain-specific smart contract language (**Compact**):
- **Commitments on Public Ledger**: When an admin admits an authorized user, a cryptographic commitment $C = \mathcal{H}(\text{secret} \parallel \text{salt})$ is appended to the public ledger.
- **Private Witness Circuit**: When the user requests access, their browser runs a private circuit with the secret and salt as confidential witness inputs.
- **ZK Proof Submission**: The user submits a zero-knowledge proof along with a single-use session nullifier $N = \mathcal{H}(\text{secret} \parallel \text{sessionNonce})$.
- **Verification on Midnight**: The Midnight consensus engine verifies the proof against the public commitment root and confirms the nullifier is unused. Access is granted without learning the user's identity.

---

## 4. Privacy Model & Trust Assumptions

| Dimension | Public to Observers & Ledger | Kept Private in Local Witness |
| :--- | :--- | :--- |
| **Identity** | None (no address or name revealed) | User secret key & salt |
| **Membership Proof** | Cryptographic ZK proof validity | Which specific commitment belongs to prover |
| **Allowlist State** | Total count & public commitment hashes | Plaintext identity or contact of members |
| **Replay Prevention** | Single-use nullifiers per proof event | Unlinkable to prover's identity or other proofs |

---

## 5. Technical Architecture

- **Smart Contract (`contract/allowlist.compact`)**:
  - `ledger`: State maps for commitments, registered nullifiers, and member counter.
  - `witness`: Local private secret and salt.
  - `circuits`: `addMember` (admin) and `proveMembership` (user).
- **TypeScript Runtime & Client SDK (`@midnight-ntwrk/compact-runtime`, `@midnight-ntwrk/dapp-connector-api`)**:
  - Browser-side proof generation using Midnight Proof Server.
  - Lace Wallet connector integration for Midnight Preprod.
- **Frontend DApp (`React 18`, `TypeScript`, `Vite`)**:
  - Dark luxury theme with responsive mobile/desktop UI.
  - Real-time proof generation status and on-chain verification display.

---

## 6. Target Audience & Commercial Use Cases

1. **Private DAO Governance**: Allowlisted voters prove eligibility without exposing how many governance tokens they hold or which vote belongs to them.
2. **Confidential NFT & Token Whitelists**: Early supporters participate in exclusive drops without having their whale wallets targeted by phishing attacks.
3. **Enterprise Whistleblowing & Employee Verification**: Corporate portals verify that a claimant is an active employee without knowing their individual employee ID.
4. **Accredited Investor Portals**: Compliance with KYC/AML allowlists where individual investor identities remain strictly confidential.

---

## 7. Development Roadmap

- **Phase 1 (Completed)**:
  - Toolchain setup (Compact, Docker, Midnight Proof Server, Node 22).
  - Compact contract written, verified, and test suite written (9 passing tests).
  - Deployment configuration and deployment to Midnight Preprod.
  - React DApp with Lace wallet connector and fallback simulation.
- **Phase 2 (Next Cycle)**:
  - Merkle tree commitment accumulation for scaling to $100,000+$ members.
  - Multi-tenant allowlists with role-based access control.
  - Integration with Midnight Testnet/Mainnet releases.

---

## 8. Team & Submission Details

- **Project Name**: ZKGate (Private Allowlist Access)
- **Repository**: [ps910/NEW-MOON-PROJECT-](https://github.com/ps910/NEW-MOON-PROJECT-)
- **Live Demo**: [https://ps910.github.io/NEW-MOON-PROJECT-/](https://ps910.github.io/NEW-MOON-PROJECT-/)
- **Target Network**: Midnight Preprod (`https://indexer.preprod.midnight.network`)
