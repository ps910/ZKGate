# ShroudWar — Build Spec (Midnight Level 4)

Status: design doc for implementation. Everything here is a concrete default, not a locked spec — flagged items in §14 need a decision before/while coding.

## 0. TL;DR

On-chain fog-of-war 1v1 strategy game on Midnight. Dark Forest's core loop (hidden positions, move/scout/combat, reveal-on-contact) rebuilt using Midnight's native private-state + `disclose()` model instead of Dark Forest's years of custom SNARK circuitry. Level 4 = one working 1v1 slice: fixed grid, shielded unit positions, move + scout + combat, no economy.

## 1. Core Thesis

- Dark Forest hides positions by hand-building bespoke ZK circuits — that engineering cost is *why* nobody has cloned it despite obvious demand.
- Midnight makes "private state, selectively disclosed" a first-class language feature (Compact's `witness` + `disclose()` + commitment primitives), so the hard part of Dark Forest becomes close to Midnight's default use case.
- ShroudWar is the smallest legible proof of that claim: a playable board where nothing about an opponent's units is visible except at the moment of contact.

## 2. Scope Boundary

| In scope — Level 4 | Deferred — Level 5–6 |
|---|---|
| Small fixed grid (single board, 2 players) | Larger / procedurally sized grids |
| Shielded unit positions (commitment-based) | Resource economy, production, fleets |
| Move action, ZK-validated | Multiple concurrent matches / matchmaking |
| Scout action (occupancy query, challenge–response) | Ranking, spectator mode |
| Combat resolution on proximity, reveal-on-contact | Real player base / live competitive matches |
| Win condition: eliminate all opposing units | Cosmetics, unit variety, tech trees |

## 3. MVP Game Parameters (defaults — tune freely)

| Parameter | Default | Notes |
|---|---|---|
| Grid | 10 × 10 | Coordinates `Uint<8>`, 0-indexed |
| Units per player | 4 | Symmetric, identical stats for L4 |
| Move speed | 2 (Chebyshev) | Max `dx` and `dy` per move |
| Combat range | 1 (adjacent, incl. diagonal) | Contact trigger radius |
| Scout response window | 3 actions | Measured in the contract's own action counter, not wall-clock (see §14) |
| Combat resolution | Mutual destruction on confirmed contact | Simplest provable rule for L4; see §14 for alternatives |
| Win condition | Opponent has 0 units alive | |

## 4. Core Loop

1. **Setup** — both players register N units, each committing a starting position.
2. **Active phase**, repeated:
   - Either player **moves** a unit (ZK-proves the move is legal without revealing position).
   - Either player **scouts** a cell → opponent must respond within the window, revealing only a boolean (occupied / not), never the actual position.
   - Either player **claims combat** against a specific opposing unit at a claimed cell → that unit's owner must respond; if the claim is true, both units' positions are disclosed and the units are destroyed.
3. **End** — first player to lose all units loses; ledger records `winner`.

## 5. Why This Is Buildable on Midnight (vs. Dark Forest)

| Dark Forest | ShroudWar on Midnight |
|---|---|
| Custom SNARK circuits hand-built for years to hide coordinates | `witness` functions keep position off-chain by construction |
| Bespoke commit/reveal cryptography per-project | `persistentCommit<T>` / `persistentHash<T>` from `CompactStandardLibrary` |
| No compiler-enforced privacy boundary — leaks are a manual audit problem | Compact's `disclose()` is mandatory and compiler-checked: any witness-derived value written to the ledger, returned from an exported circuit, or passed cross-contract *must* be wrapped in `disclose()`, or compilation fails |
| Proof generation logic mixed into app code | Proof generation is a first-class language target (`compact compile` emits circuits + TS bindings automatically) |

## 6. System Architecture

```
┌────────────────────────┐        ┌─────────────────────────┐
│  Player A client (web) │        │  Player B client (web)  │
│  - React UI             │        │  - React UI              │
│  - Local private store  │◄──────►│  - Local private store   │
│    (positions + salts,  │  P2P/  │    (positions + salts,   │
│     IndexedDB, never    │  none  │     IndexedDB)           │
│     leaves device)      │ needed │                          │
│  - Midnight.js SDK       │        │  - Midnight.js SDK        │
│  - Lace wallet connector │        │  - Lace wallet connector  │
└──────────┬──────────────┘        └───────────┬──────────────┘
           │  proof requests                    │
           ▼                                    ▼
   ┌──────────────┐                     ┌──────────────┐
   │ Proof server │                     │ Proof server │
   └──────┬───────┘                     └──────┬───────┘
          │  proven tx                          │  proven tx
          ▼                                     ▼
   ┌────────────────────────────────────────────────┐
   │              Midnight ledger (contract)          │
   │  public: commitments, challenge/claim records,   │
   │          alive flags, phase, winner              │
   └────────────────────────────────────────────────┘
                        ▲
                        │ read via indexer
                 ┌──────┴──────┐
                 │   Indexer   │  (contract state → both clients)
                 └─────────────┘
```

No direct client-to-client channel is required — both players only ever talk to the ledger. Scouting/combat "challenges" are how one player triggers a *response obligation* on the other without ever contacting them off-chain.

## 7. Data Model

| Field | Layer | Type | Purpose |
|---|---|---|---|
| `phase` | ledger (public) | `Uint<8>` | 0 setup / 1 active / 2 ended |
| `gridSize` | ledger (public) | `Uint<8>` | Board dimension (10) |
| `moveSpeed` | ledger (public) | `Uint<8>` | Max Chebyshev distance per move (2) |
| `combatRange` | ledger (public) | `Uint<8>` | Mutual destruction radius (1) |
| `scoutWindow` | ledger (public) | `Uint<32>` | Action counter timeout (3) |
| `players` | ledger (public) | `Vector<2, Bytes<32>>` | Public keys of the two players |
| `unitCommitments` | ledger (public) | `Map<Bytes<32>, Bytes<32>>` | `unitId → persistentCommit(Position, salt)` |
| `unitAlive` | ledger (public) | `Map<Bytes<32>, Boolean>` | Elimination state |
| `scoutChallenges` | ledger (public) | `Map<Bytes<32>, ScoutChallenge>` | Open/resolved scout queries |
| `scoutResults` | ledger (public) | `Map<Bytes<32>, Boolean>` | Revealed occupancy booleans only |
| `combatClaims` | ledger (public) | `Map<Bytes<32>, CombatClaim>` | Open/resolved combat claims |
| `actionCount` | ledger (public) | `Counter` | Drives response-window deadlines |
| `winner` | ledger (public) | `Bytes<32>` | Set once a player is eliminated |
| unit position | **witness / private** | `Position { x: Uint<8>, y: Uint<8> }` | Never leaves the owning client |
| unit salt | **witness / private** | `Bytes<32>` | Commitment randomness, rotated every move |

Nothing about a unit's location, count of surviving units at a glance, or movement pattern is ever written to the ledger — only commitments, and only booleans/positions that a challenge-response forces open.

---

## 8. Phased Build Plan & Definition of Done (DoD)

- **Phase 0 — Toolchain & Preprod Access**: Toolchain configured for Midnight Preprod.
- **Phase 1 — Contract Skeleton & First Address**: `initGame` and core ledger state deployed on Preprod.
- **Phase 2 — Unit Registration**: Private witness position commitments via `persistentCommit<Position>`.
- **Phase 3 — Move**: ZK movement circuit with Chebyshev distance check (`absDiff <= moveSpeed`).
- **Phase 4 — Scout**: Challenge/response circuit disclosing only binary `occupied`.
- **Phase 5 — Combat**: Proximity combat claims and mutual destruction on hit.
- **Phase 6 — Timeouts & Forfeits**: Deadline handling driven by `actionCount`.
- **Phase 7 — Win Condition**: Elimination tracking and `winner` declaration.
- **Phase 8 — Frontend**: 10x10 Fog-of-War UI connected to Preprod contract.
- **Phase 9 — Full Match Regression**: End-to-end verified match on Preprod.
- **Phase 10 — Docs & Submission**: Comprehensive README, CI/CD, test suite, and demo video script.
