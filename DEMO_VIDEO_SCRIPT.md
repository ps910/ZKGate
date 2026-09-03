# 🎬 ShroudWar — 1-Minute Demo Video Script & Walkthrough

This document outlines the 60-second video presentation demonstrating full functionality of **ShroudWar: On-Chain Fog-of-War Strategy Game** deployed on Midnight Preprod.

---

## ⏱️ Timeline Breakdown (Total: 60 Seconds)

| Timestamp | Visual Action on Screen | Spoken Narration | Key Takeaway |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:10** | Show ShroudWar dark space UI, 10x10 Fog-of-War grid, top navigation with **"MIDNIGHT PREPROD"** badge and contract address `0x8b3f...5d4c`. | *"Welcome to ShroudWar. Dark Forest proved that fog-of-war strategy is the ultimate test of on-chain gaming, but required years of custom ZK circuits. On Midnight, privacy is a first-class native feature."* | Introduction & Midnight Preprod network status. |
| **0:10 – 0:25** | Click **"Connect Lace Wallet"**. Select `unit_a_0` on grid, highlight legal move cells (Chebyshev $\le 2$). Click cell (2, 3) and click **"Prove & Execute Move"**. Green banner appears: *Move verified on Midnight Preprod*. | *"Here, our unit coordinates are stored exclusively in our local browser witness. When we move, our Compact circuit generates a ZK proof that Chebyshev distance is at most 2. The commitment updates on Preprod, but coordinates are never disclosed."* | ZK-proven movement & salt rotation on Preprod. |
| **0:25 – 0:40** | Click cell (7, 7) in the deep fog. In Tactical Command Center, click **"Broadcast Scout Challenge"**. The radar ping 📡 appears on cell (7, 7) and scout log shows `OCCUPIED`. | *"Next, we scout cell (7, 7). An on-chain ScoutChallenge forces the opponent to respond within 3 actions. The circuit discloses only a boolean: occupied or clear — zero coordinates are leaked."* | Challenge-response scouting with binary disclosure. |
| **0:40 – 0:50** | Under **"Claim Combat"**, select `unit_b_0` at cell (7, 7). Click **"Engage Combat Claim"**. Direct hit explosion animation 💥 appears; opponent alive count drops from 4 to 3! | *"We now engage combat against the detected unit. Proximity range 1 confirms a contact, triggering on-chain mutual destruction on Midnight Preprod."* | Proximity combat resolution on-chain. |
| **0:50 – 1:00** | Flash terminal showing **20 passing tests (3 test files)** across contract logic, Chebyshev math, scout booleans, and UI. Show GitHub CI/CD pipeline badge. | *"All 20 tests pass in CI/CD, and the contract is live on Midnight Preprod. This is ShroudWar on Midnight."* | Quality assurance & Level 4 completion. |

---

## 🎙️ Recording Instructions

1. **Resolution**: 1920x1080 (16:9).
2. **Setup**: Run `npm run preview` or open the live deployment at [https://ps910.github.io/ZKGate/](https://ps910.github.io/ZKGate/).
3. **Pacing**: Crisp, authoritative narration at ~130 words per minute.
4. **Link**: Insert video URL into `README.md` under the Demo Video section.
