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

### D-008 — Executive luxury UI upgrade, WebGL2 liquid sculpture hero, and follow-up template engine
- Date: 2026-10-23
- Status: Confirmed
- Context: User requested an executive luxury visual upgrade with refined animations, a front showcase landing page (`/`) explaining all features and unique value propositions, Google SEO structured data, a collapsible desktop sidebar ("hide tombol samping"), a bespoke Relasy vector logo, luxury notifications, and an Active/Inactive Follow-up Text Template engine.
- Decision:
  1. **WebGL2 Liquid Sculpture Hero (`src/components/ui/liquid-sculpture-hero.tsx`)**: Integrated GPGPU particle simulation (~100k particles) sampling from a local CORS-safe SVG sculpture (`/sculpture-relasy.svg`) on both the Front Showcase (`/`) and the Executive Dashboard (`/ringkasan`).
  2. **Front Showcase & Google SEO (`src/app/page.tsx` & `src/app/layout.tsx`)**: Built a dedicated front landing page (`Halaman Muka`) as the first navigation item, showcasing all 6 modules, a strategic CRM comparison matrix, interactive live template simulation, and `SoftwareApplication` + `FAQPage` JSON-LD structured data.
  3. **Collapsible Sidebar (`src/components/layout/app-shell.tsx`)**: Added smooth desktop sidebar hide/show controls (`Sembunyikan menu samping` / `Tampilkan menu samping`) persisted in `localStorage`.
  4. **Follow-up Text Template Engine (`src/lib/followup-template.ts`, `/api/followup-template`)**: Added SQLite-backed `followup_templates` table per workspace with an `Aktif` / `Nonaktif` switch, 3 executive presets, and dynamic variable interpolation (`{nama}`, `{perusahaan}`, `{judul_tugas}`, `{tanggal}`). When active, scheduling or clicking `Follow-up` automatically generates the personalized message.
  5. **Bespoke Brand Emblem & Luxury Notifications (`src/components/ui/relasy-logo.tsx`, `src/components/ui/luxury-toast.tsx`)**: Replaced generic badges/alerts with an octagonal gold-and-sapphire vector emblem and obsidian glassmorphic notifications.
- Related files: `src/components/ui/liquid-sculpture-hero.tsx`, `src/components/ui/relasy-logo.tsx`, `src/components/ui/luxury-toast.tsx`, `src/lib/followup-template.ts`, `src/app/page.tsx`, `src/app/follow-up/page.tsx`

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

### D-011 — Standalone Front Landing Page, Logo-Triggered Sidebar, Global Dark/Light Theme, and Animated Login
- Date: 2026-10-23
- Status: Confirmed
- Context: User requested removing the sidebar/menu button and `Relasy > Halaman Muka` breadcrumb from `/`, replacing the `/` header with section navigation pills (`Beranda`, `Keunggulan`, `Modul`, `Template`, `Perbandingan`, `Panduan`) and a `Masuk` login button, routing post-login to `/dashboard`, removing `"Halaman Muka"` from the signed-in sidebar menu, making the `<RelasyLogo />` click toggle the sidebar/menu, adding animated button transitions (`framer-motion` `layoutId`), adding Dark/Light mode across all pages without button/font color clashes, and upgrading `/login` with the `DotMap` + `SignInCard` `framer-motion` design.
- Decision:
  1. Made `/` (`src/app/page.tsx`) a standalone showcase page with sticky section navigation pills (`layoutId="landing-section-pill"`), `<ThemeToggle />`, and `<Link href="/login">Masuk</Link>`.
  2. Added `/dashboard` (`src/app/dashboard/page.tsx`) as the primary post-login route while keeping `/ringkasan` working for backward compatibility.
  3. Removed `"Halaman Muka"` from `navigationItems` in `src/components/layout/nav-links.tsx` and added `framer-motion` `layoutId` active pills across navigation and segmented tabs.
  4. Wired `<RelasyLogo />` in `AppShell` to toggle the sidebar on desktop and open the menu drawer on mobile without a separate menu button.
  5. Added global `ThemeProvider` and `<ThemeToggle />` (`src/components/ui/theme-toggle.tsx`) with `html.dark` high-contrast styling in `src/app/globals.css`.
  6. Implemented `src/components/ui/travel-connect-signin-1.tsx` (`DotMap` + `SignInCard`) on `/login`, connected to `POST /api/auth/login` and redirecting to `/dashboard`.
- Related files: `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/login/page.tsx`, `src/components/ui/travel-connect-signin-1.tsx`, `src/components/ui/theme-toggle.tsx`, `src/components/layout/app-shell.tsx`, `src/components/layout/nav-links.tsx`

### D-012 — Finalized Official Relasy Brand Color Palette Migration
- Date: 2026-10-23
- Status: Confirmed
- Context: The visual identity of Relasy was finalized around four official brand colors (`#252927` Ink, `#F7F6F1` Warm White, `#635BCE` Indigo, `#E9E8FC` Soft Indigo) and four supporting UI colors (`#FFFFFF` card surface, `#E5E4DE` subtle borders, `#6F716D` secondary text, `#A8AAA4` disabled elements), while preserving the approved Relasy logo (`src/components/ui/relasy-logo.tsx`) unchanged and keeping semantic status colors (`emerald`, `amber`, `red`) strictly for operational states.
- Decision:
  1. Defined centralized CSS custom properties in `src/app/globals.css` (`--color-ink`, `--color-warm-white`, `--color-indigo`, `--color-soft-indigo`, `--color-surface`, `--color-border`, `--color-text-secondary`, `--color-disabled`) and Tailwind semantic tokens in `tailwind.config.ts`.
  2. Migrated all shared UI primitives (`Button`, `Input`, `Select`, `Card`, `Badge`, `StatCard`, `EmptyState`, `Dialog`, `LuxuryToast`, `ThemeToggle`, `LiquidSculptureHero`, `TravelConnectSignIn`) and layout shells (`AppShell`, `NavLinks`) to the official palette.
  3. Migrated all application routes (`/`, `/login`, `/dashboard`, `/ringkasan`, `/pelanggan`, `/pelanggan/[id]`, `/pipeline`, `/follow-up`, `/pengaturan`) and `public/sculpture-relasy.svg` to the official palette.
  4. Preserved `src/components/ui/relasy-logo.tsx` untouched.
- Related files: `tailwind.config.ts`, `src/app/globals.css`, `docs/design.md`, `src/components/ui/*`, `src/components/layout/*`, `src/app/*`

### D-014 — Official Relasy Logo Mark, Fixed Landing Top Bar, Custom Template Architecture, Memorable Comparison & Guide, Quiet Login Frame, and Follow-up Checkbox/Dark-Mode Fixes
- Date: 2026-10-23
- Status: Confirmed
- Context: User requested 12 targeted UI, logo, and interaction improvements based on live inspection screenshots:
  1. Elevate the landing page (`/`) typography, cards, and layout rhythm.
  2. Remove all action links (`Lihat Dashboard`, `Buka Pelanggan`, `Buka Pipeline`, `Buka Follow-up`, `Atur Template`, `Lihat Riwayat`, `Buka Dashboard`) from the Modul Aplikasi section (`#ekosistem-fitur`).
  3. Keep the landing page top navigation bar with the section Table of Contents permanently fixed at the top (`fixed top-0 inset-x-0 z-50`).
  4. Remove the simulated customer message preview from the Template Pesan section (`#simulasi-template`) and instead explain how users can create custom text templates (`custom template teks`) with dynamic variables (`{nama}`, `{perusahaan}`, `{judul_tugas}`, `{tanggal}`).
  5. Redesign the Comparison section (`#perbandingan-crm`) so the Relasy brand feels memorable and relatable (`"oh iya bener juga"`).
  6. Redesign the Panduan Penggunaan section (`#panduan-crm`) into a modern, architectural 3-step workflow blueprint.
  7. Remove the CRM logo and outer header chrome from `/login`, move the Light/Dark `ThemeToggle` inside the login card header, and leave the surrounding page edges quiet.
  8. Elevate the `/dashboard` (`/ringkasan`) UI with an executive operational header and financial/completion ledger strip.
  9. Fix the follow-up checkbox completion flow (`PUT /api/followups/[id]`, `Dialog` multi-instance `useEffect` handling, and high-contrast `.followup-checkbox` styling in Light and Dark modes).
  10. Redesign the `/follow-up` template bar, preset cards (fixing `.bg-[#E9E8FC]/70` dark-mode contrast), segmented tab bar, and task row action buttons.
  11. Apply `antislop` and `antislop-ui` rules across all modified views.
  12. Replace `RelasyLogo` (`src/components/ui/relasy-logo.tsx`) with the new official Relasy geometric lowercase `"r"` mark + lowercase `"relasy"` wordmark, optimized for both Light and Dark modes.
- Decision:
  1. Implemented the new official Relasy logo in `src/components/ui/relasy-logo.tsx` using the geometric lowercase `"r"` mark (`#635BCE` in light mode, `#7B74E8` in dark mode) and lowercase `"relasy"` wordmark (`#252927` in light mode, `#F7F6F1` in dark mode) without any enclosing dark box.
  2. Redesigned `src/app/page.tsx` and `src/components/ui/hero-dithering-card.tsx` with a `fixed top-0 inset-x-0 z-50` header bar, a 6-module Bento specification grid without action links, a Custom Template Architecture showcase without fake customer message previews, a relatable 4-case Comparison Matrix, and a 3-stage Workflow Blueprint guide.
  3. Simplified `src/app/login/page.tsx` and `src/components/ui/travel-connect-signin-1.tsx` to a single centered `SignInCard` with `<ThemeToggle />` integrated inside the card header and quiet surrounding edges.
  4. Hardened `PUT /api/followups/[id]` in `src/app/api/followups/[id]/route.ts` to safely parse `request.text()` without throwing `SyntaxError: Unexpected end of JSON input`, fixed `src/components/ui/dialog.tsx` `useEffect` lifecycle when multiple dialogs are mounted, and added `.followup-checkbox` and dark-mode opacity token rules in `src/app/globals.css`.
  5. Upgraded `src/app/ringkasan/page.tsx`, `src/components/ui/stat-card.tsx`, and `src/app/follow-up/page.tsx` with tactile switches, segmented tab bars, and cohesive action toolbars.
- Related files: `src/components/ui/relasy-logo.tsx`, `src/components/ui/hero-dithering-card.tsx`, `src/app/page.tsx`, `src/app/login/page.tsx`, `src/components/ui/travel-connect-signin-1.tsx`, `src/app/ringkasan/page.tsx`, `src/components/ui/stat-card.tsx`, `src/app/follow-up/page.tsx`, `src/app/api/followups/[id]/route.ts`, `src/components/ui/dialog.tsx`, `src/app/globals.css`

### D-013 — Dithering Hero CTA, Transparent Clickable Logo, Follow-up Completion Confirmation, Refined Scrollbars, and Customer CSV Import/Export
- Date: 2026-10-23
- Status: Confirmed
- Context: Refined the application UI, copywriting, and workflows to replace the homepage hero with the `@paper-design/shaders-react` Dithering CTA card in Indigo (`#635BCE`), keep clickable logo containers transparent, remove boilerplate demo credentials from public pages, require explicit confirmation before completing follow-up tasks, style slim accessible scrollbars, and add full Customer CSV Import and Export.
- Decision:
  1. Created `src/components/ui/hero-dithering-card.tsx` (`CTASection`) using `@paper-design/shaders-react` `Dithering` (`colorFront="#635BCE"`, `prefers-reduced-motion` support) and redesigned `src/app/page.tsx` sections with distinct layouts and direct Indonesian copywriting.
  2. Made all clickable `<RelasyLogo />` wrappers transparent across normal, hover, active, and focus states while preserving `src/components/ui/relasy-logo.tsx` untouched.
  3. Removed visible default demo-account credentials and demo-login boilerplate from `src/components/ui/travel-connect-signin-1.tsx`.
  4. Added an explicit confirmation dialog (`"Batalkan"` / `"Tandai Selesai"`) before marking any unfinished follow-up task as completed in `/follow-up`, `/dashboard` (`/ringkasan`), and `/pelanggan/[id]`.
  5. Added slim WebKit and Firefox scrollbar rules (`#C8C6BE` thumb, `#635BCE` hover) and calm `180ms–200ms` transitions in `src/app/globals.css`, `src/components/layout/nav-links.tsx`, and `src/components/layout/app-shell.tsx`.
  6. Implemented full Customer CSV Import and Export (`src/lib/customer-csv.ts`, `src/app/api/customers/import/route.ts`, `src/app/api/customers/export/route.ts`, and `src/app/pelanggan/page.tsx`) with delimiter auto-detection (`,` and `;`), UTF-8 BOM support, leading-zero phone preservation, column mapping, duplicate detection, explicit confirmation, and result reporting.
- Related files: `src/components/ui/hero-dithering-card.tsx`, `src/app/page.tsx`, `src/components/layout/app-shell.tsx`, `src/components/ui/travel-connect-signin-1.tsx`, `src/app/follow-up/page.tsx`, `src/app/ringkasan/page.tsx`, `src/app/pelanggan/page.tsx`, `src/lib/customer-csv.ts`, `src/app/api/customers/import/route.ts`, `src/app/api/customers/export/route.ts`

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
