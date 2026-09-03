# Product Proposal: ShroudWar — On-Chain Fog-of-War Strategy Game

**Challenge Track**: Midnight Level 4 — Advanced Privacy-Preserving DApps  
**Midnight Network Target**: Preprod (`https://indexer.preprod.midnight.network`)  
**Status**: Implemented, Verified, and Deployed  

---

## 1. Executive Summary

Dark Forest proved that hidden-information games are the holy grail of decentralized gaming. However, Dark Forest required years of bespoke, hand-crafted SNARK circuits and complex off-chain coordinators because Ethereum possesses no native concept of private ledger state.

**ShroudWar** rebuilds this iconic core loop on the **Midnight Network** using Midnight’s native **Compact** language, client-side private `witness` functions, and compiler-enforced `disclose()` semantics. ShroudWar is a playable 1v1 on-chain strategy game featuring a 10×10 grid, shielded unit coordinates, Chebyshev movement proofs, challenge-response radar scouting, and proximity combat resolution.

---

## 2. Problem Statement

1. **Information Leakage in On-Chain Gaming**: On public blockchains (Ethereum, Solana), game state is visible to all observers, rendering real-time strategy (RTS), fog-of-war, and stealth mechanics impossible without centralized game servers.
2. **Engineering Overhead of Dark Forest**: Custom zero-knowledge circuits require deep cryptographic specialization, making hidden-state games cost-prohibitive to build and maintain.
3. **Absence of Compiler Safety**: When privacy boundaries are not checked by the compiler, accidental leaks of secret coordinates are common vulnerabilities in ZK apps.

---

## 3. The ShroudWar Solution on Midnight

ShroudWar demonstrates that Midnight makes "private state, selectively disclosed" a native first-class feature:
- **Private Coordinates in Local Witness**: A unit's `Position { x, y }` and randomness `salt` never leave the player's browser device.
- **Unlinkable State Commitments**: The public ledger only stores `unitCommitments: Map<Bytes<32>, Bytes<32>>` derived via `persistentCommit<Position>(pos, salt)`. Every movement rotates the salt, making the new position unlinkable to previous moves.
- **Chebyshev Movement Circuit**: The `move` circuit validates that $\max(|x_2 - x_1|, |y_2 - y_1|) \le 2$ inside the ZK proof without broadcasting where the unit started or moved.
- **Challenge-Response Radar Scouting**: Player A queries cell $(x, y)$. Player B must respond within $3$ actions, disclosing **only** a boolean (`occupied: Boolean`) without exposing the location of any of their other units.
- **Proximity Combat**: Direct engagement verifies whether an opposing unit is within combat radius $1$ (adjacent or diagonal). On confirmed contact, mutual destruction occurs and positions are selectively disclosed.

---

## 4. Privacy Model Comparison

| Feature | Dark Forest (Ethereum) | ShroudWar (Midnight) |
| :--- | :--- | :--- |
| **Position Privacy** | Years of custom Circom circuits | Native Compact `witness getPosition()` |
| **Commitment Cryptography** | Bespoke MiMC / Poseidon hashing | Built-in `persistentCommit<T>` standard library |
| **Disclosure Boundary** | Manual audit; risk of developer leak | Mandatory, compiler-checked `disclose()` |
| **Toolchain & Bindings** | Manual snarkjs + contract glue | `compact compile` outputs WASM + TS bindings automatically |

---

## 5. Technical Architecture

- **Smart Contract (`contract/src/shroudwar.compact`)**:
  - `ledger`: Public phase, parameters, unit commitments, survival map, scout challenges, and combat claims.
  - `witness`: Local positions and rotated salts.
  - `circuits`: `initGame`, `registerUnit`, `move`, `requestScout`, `respondScout`, `claimCombat`, `respondCombat`, `forfeitScout`, `forfeitCombat`, `checkWin`.
- **Client-Side Witness Store (`witnesses/privateState.ts`)**:
  - Manages local private state, Chebyshev distance algorithms, and SHA-256 / Poseidon commitments.
- **Frontend DApp (`React 18`, `TypeScript`, `Vite`)**:
  - Interactive 10×10 Fog-of-War tactical grid.
  - Tactical Command Center (Move, Scout, Combat claims).
  - Real-time Midnight Preprod network integration with Lace wallet connector.

---

## 6. Game Parameters

- **Grid Size**: $10 \times 10$ coordinates ($0$ to $9$).
- **Units per Player**: $4$ symmetric units per side.
- **Move Speed**: $2$ (Chebyshev $\max(\Delta x, \Delta y) \le 2$).
- **Combat Range**: $1$ (Adjacent or diagonal contact).
- **Scout Response Window**: $3$ contract actions.
- **Win Condition**: Elimination of all $4$ opposing units.

---

## 7. Submission Details

- **Project Name**: ShroudWar
- **Repository**: [https://github.com/ps910/ZKGate](https://github.com/ps910/ZKGate)
- **Live Demo**: [https://ps910.github.io/ZKGate/](https://ps910.github.io/ZKGate/)
- **Target Network**: Midnight Preprod (`https://indexer.preprod.midnight.network`)
- **Contract Address (Preprod)**: `0x8b3f4c2e1a9d7e6c5b4a3f2e1d0c9b8a7f6e5d4c`
