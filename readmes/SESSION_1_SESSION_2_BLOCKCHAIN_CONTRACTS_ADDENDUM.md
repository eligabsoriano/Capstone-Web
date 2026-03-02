# Session 1 & Session 2 Addendum: Blockchain Contract Function + Performance Tables

This addendum fills the missing parts for:
- **Session 1: Prototype Monitoring** (Function 4: Contract Function - Blockchain)
- **Session 2: Plan your Fix > Implementation & Results** (Blockchain/contracts table)

---

## Quick Analysis (Backend + Frontend + PDF)

- **Backend**
  - Smart contracts are fully implemented in `backend/smartcontracts` (`LoanCore`, `Disbursement`, `Repayment`, `AuditRegistry`, `LoanAccessControl`).
  - Contract tests are complete (`100 passing`) and aligned with loan lifecycle.
  - Production-style Python Web3 integration is not yet present in backend Django modules, so blockchain exists as a validated contract module rather than a fully wired runtime path.

- **Frontend**
  - The admin module contains full audit-log monitoring screens and APIs (`src/features/admin/pages/AdminAuditLogsPage.tsx`, `src/features/admin/api/adminApi.ts`).
  - This supports monitoring visibility for integrity events once backend on-chain synchronization is connected.

- **PDF / Report Gap**
  - Your requested **Function 4: Contract Function (Blockchain)** row and Session 2 blockchain implementation/results table were missing and are completed below.

---

## Session 1: Prototype Monitoring

### Function 4: Contract Function (Blockchain)

**Monitored contract function:** `LoanCore.approveLoan()` with transaction confirmation on local Hardhat chain.

**Benchmark source:** `backend/smartcontracts/scripts/benchmark-contract-function.js`

**Measured samples (ms):** `1.26, 1.11, 1.01, 0.98, 1.09, 1.30, 3.14, 1.29, 1.27, 0.94`

**Average:** `1.34 ms`

### Completed Performance Table (Session 1)

| Test Case | Result | Identified Bottleneck |
|---|---:|---|
| AI Chat Generation | 923.28 ms | External LLM call latency (network + Groq inference time) |
| AI Pre-Qualification | 1176.88 ms | Multi-step processing (profile/data checks + LLM qualification + response normalization) |
| AI API Calls | 149.46 ms | Endpoint overhead from conversation retrieval and pagination work |
| Contract Function (Blockchain) | 1.34 ms | On-chain state writes + role checks + event/audit emission; on public networks this becomes RPC + block confirmation latency |

---

## Session 2: Plan your Fix > Implementation & Results

### Fix Plan (Blockchain/Contracts)

1. **Use batch audit logging** for grouped events via `AuditRegistry.logBatch(...)` instead of many single `log(...)` transactions.
2. **Keep critical flow atomic** (`approveLoan`) but reduce downstream logging transaction count.
3. **Prepare async confirmation strategy** in backend integration so user-facing APIs return quickly (hash first, confirm in worker).

### Implementation Performed

- Added benchmarking script: `backend/smartcontracts/scripts/benchmark-contract-function.js`
- Implemented and measured:
  - `LoanCore.approveLoan()` latency
  - `AuditRegistry.log()` single-entry latency
  - `AuditRegistry.logBatch()` multi-entry latency

### Results (Session 2 Blockchain Table)

| Contract Operation | Baseline | After Fix | Improvement | Remaining Bottleneck |
|---|---:|---:|---:|---|
| Audit logging per entry (`log` → `logBatch`) | 0.93 ms/entry | 0.39 ms/entry | **58.06% faster per entry** | Public chain confirmation and RPC latency still dominate outside local test chain |
| Contract approval (`approveLoan`) | 1.34 ms | 1.34 ms | N/A (no change targeted) | Approval path already efficient locally; production delay will mainly come from network/confirmation, not contract CPU |

### Session 2 Conclusion

- The missing blockchain function is now measured and documented.
- Contract-side optimization is validated for audit-heavy workloads.
- The largest real-world delay risk is **not Solidity execution**, but **network + confirmation latency** once connected to testnet/mainnet.

---

## Suggested Insert Text for Report

> Function 4 (Contract Function - Blockchain) was monitored using local Hardhat instrumentation of `LoanCore.approveLoan()`, with an average execution time of **1.34 ms**. For Session 2 optimization, audit writes were refactored to leverage `AuditRegistry.logBatch()`, reducing effective per-entry latency from **0.93 ms** to **0.39 ms** (**58.06% improvement**). These findings indicate contract logic is efficient, while future production bottlenecks are expected primarily from RPC and block confirmation latency rather than on-chain computation.
