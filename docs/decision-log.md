# Decision Log — Relasy

Record meaningful decisions in reverse chronological order. Use the format below for each new entry.

## Confirmed product decisions

### D-001 — Product name
- Status: Confirmed
- Decision: The product name is Relasy.
- Rationale: Selected by the product owner during product discovery.

### D-002 — Initial product type
- Status: Confirmed
- Decision: Relasy is a Level 1 standalone CRM without WhatsApp API integration.
- Rationale: Keep the first release focused on customer management and sales workflow without the complexity and dependency of a direct messaging integration.

### D-003 — WhatsApp boundary
- Status: Confirmed
- Decision: Do not implement WhatsApp API integration, unofficial WhatsApp clients, scraping, message synchronization, or automatic sending/receiving. A plain manual `wa.me` link is optional, not a requirement.
- Rationale: The CRM must deliver value independently.

### D-004 — Development workflow
- Status: Confirmed
- Decision: Antigravity should execute the roadmap incrementally and autonomously, verifying each phase and automatically continuing when its exit gate passes. It should not request routine approvals.
- Rationale: Avoid repeated user checkpoints while preserving quality and safety.

### D-009 — Ergonomic Mobile Navigation, Anti-Slop Copy Hygiene & Accessible Dialog Dismissal
- Date: 2026-10-23
- Status: Confirmed
- Context: Phase 8 UX refinement, responsive touch ergonomics, and accessibility compliance.
- Decision:
  1. Guaranteed thumb-friendly tap targets $\ge 44\text{px}$ on mobile viewports for all navigation, actions, and interactive buttons (`min-h-[44px]` and `touch-target`).
  2. Enforced strict anti-slop copy rules: zero em dashes (`—`) in UI copy across all routes and metadata, replaced with colons, hyphens, or natural parenthetical phrases.
  3. Dialog accessibility: keyboard Enter triggers actions, Tab focuses interactive elements with visible focus rings, and Escape dismisses open modals cleanly with zero DOM leakage.
  4. Made `/pengaturan` fully functional with persistent updates via `PATCH /api/auth/me` to SQLite rather than a dead or purely cosmetic UI mock.
- Rationale: Eliminates generic AI decoration, ensures WCAG AA compliance, and guarantees that every visible control does what its label implies.
- Related files: `src/components/layout/app-shell.tsx`, `src/app/pengaturan/page.tsx`, `tests-e2e/ux-accessibility.spec.ts`

### D-008 — Live Database Dashboard Architecture & Cross-Feature Workflows
- Date: 2026-10-23
- Status: Confirmed
- Context: Phase 7 implementation of business summary metrics and cross-feature workflows.
- Decision:
  1. Build dashboard metrics (`/api/dashboard`) purely from real-time database queries against persisted SQLite records (`getDashboardMetrics(workspaceId, refDate)`).
  2. Forbid hardcoded production-looking analytics or fake progress charts.
  3. Wire direct filter links from metric cards to target lists (`/pelanggan`, `/pipeline`, `/follow-up?tab=today`, `/follow-up?tab=overdue`).
  4. Allow one-click task completion directly on the dashboard with live UI recalculation.
- Rationale: Small business owners need reliable, authentic visibility into their sales and follow-up activities without confusing fictional data.
- Related files: `src/app/api/dashboard/route.ts`, `src/app/ringkasan/page.tsx`, `src/lib/db/repositories/dashboard.repo.ts`, `tests-e2e/dashboard-flow.spec.ts`

### D-007 — Core architecture and technology stack
- Date: 2026-10-23
- Status: Confirmed
- Context: Selection of technology stack, tenancy model, persistence, validation, and testing strategy for Relasy Phase 1.
- Decision:
  1. **Framework**: Next.js 15 (App Router) with React 19, TypeScript, and Tailwind CSS. Provides a unified, single-port full-stack architecture with typed server-side routes/actions, fast server rendering, and zero-configuration production builds.
  2. **Persistence**: Embedded SQLite using Node 24 native `node:sqlite` (DatabaseSync). Zero external native compilation or binary dependencies on Windows, lightning-fast synchronous operations, ACID transactions, and deterministic single-file database (`data/relasy.db` in app or test directory).
  3. **Tenancy & Auth**: Account and Workspace model. Authentication via email + secure hashed password (using `bcryptjs`/WebCrypto), session token stored in HTTP-only, secure, SameSite=Lax cookie. Every domain entity (`Customer`, `Opportunity`, `Activity`, `FollowUp`) is strictly scoped by `workspace_id`. All server data access functions require a verified `workspace_id` parameter.
  4. **Data Lifecycle & Domain Rules**:
     - Pipeline stages: `Baru` (New), `Dihubungi` (Contacted), `Negosiasi` (In Negotiation), `Berhasil` (Won), `Tidak berhasil` (Lost).
     - Task status: `Belum selesai` (Pending), `Selesai` (Completed). Views: `Hari ini`, `Mendatang`, `Terlambat`, `Selesai`.
     - Activity types: `Catatan`, `Telepon`, `Pertemuan`, `Pesan manual`, `Lainnya`.
     - Monetary values: Integer cents/units (IDR stored as whole Rupiah integer, formatted cleanly as `Rp X.XXX.XXX`), preventing any floating-point rounding defects.
     - Archive policy: Soft-archive with `archived_at` timestamp. Archived customers retain all historical links but are filtered out of active lists by default.
     - Date/Time: Stored in ISO 8601 UTC strings. Client timezone (default Asia/Jakarta UTC+7) evaluated for day boundaries.
  5. **Testing Strategy**: Vitest for unit & integration testing of domain logic, schema constraints, and cross-workspace security boundaries. Playwright for end-to-end browser workflows.
- Alternatives considered:
  - Vite SPA + Express: More complex multi-process setup in development and deployment.
  - PostgreSQL / MySQL: Requires external server daemon or cloud credentials, violating self-contained local reproducibility.
- Rationale: Fully self-contained, robust, type-safe, reproducible across developer environments, and strictly fulfills PRD requirements.
- Related files: `docs/PRD.md`, `docs/architecture.md`, `docs/data-model.md`, `ops/working-state.md`

### D-006 — Workspace baseline and runtime findings
- Date: 2026-10-23
- Status: Confirmed
- Context: Phase 0 reconnaissance of the Relasy workspace.
- Decision: 
  1. Acknowledge this is a greenfield project (no existing application codebase at root).
  2. The workspace includes toolcheckouts (`anti-slop/`, `superpowers/`), `.agents/skills/` (antislop skills installed), and project blueprint documents (`docs/`, `ops/`, `qa/`).
  3. Git repository initialized locally to track work safely.
  4. Runtime discovered: Node v24.15.0, npm/npx 11.12.1, Python 3.14.4. Crucial: on Windows PowerShell, PowerShell ExecutionPolicy blocks unsigned `.ps1` scripts, so CLI tools must be called with `.cmd` extension (e.g. `npm.cmd`, `npx.cmd`).
  5. Skills confirmed active: `superpowers` (built-in plugins), `anti-slop` (mode: during via session override), `ai-memory` (MCP server operational on project Relasy).
- Alternatives considered: None; these are factual environment baselines.
- Rationale: Ensures safe and uninterrupted execution without script execution failures.
- Related files: `ops/working-state.md`, `AGENTS.md`

### D-005 — UI language quality
- Status: Confirmed
- Decision: User-facing interface copy uses natural contemporary Indonesian and preserves established technical terms when appropriate. “Peladen cloud” is prohibited.
- Rationale: The product must not sound like machine-translated software.

## Decision entry template

### D-XXX — Short title
- Date:
- Status: Proposed / Confirmed / Superseded
- Context:
- Decision:
- Alternatives considered:
- Rationale:
- Consequences:
- Related files:
