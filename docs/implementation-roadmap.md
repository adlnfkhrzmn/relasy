# Autonomous Implementation Roadmap — Relasy

The agent must complete these phases in order. Phase boundaries are review gates, not user-approval checkpoints. Continue automatically when a phase passes. Keep the increments small and test after each meaningful change.

## Phase 0 — Workspace reconnaissance and baseline

Tasks:
- Inspect workspace, version-control state, current files, runtime, installed packages, skills, available test/browser tools, and existing app behavior.
- Preserve existing work; do not replace an existing project with a fresh scaffold without a reason.
- Determine whether this is a new or existing app.
- Identify installation/runtime constraints and establish a baseline of tests/build if available.
- Check the supplied skills and their supported installation/activation paths. Do not assume they are loaded.

Deliverables:
- Update `ops/working-state.md` with environment, repository condition, baseline checks, skill availability, and next action.
- Record important stack or workspace observations in `docs/decision-log.md`.

Exit gate:
- Workspace state is known, no potentially destructive action is pending, and a safe implementation approach is selected.

## Phase 1 — Requirements and architecture validation

Tasks:
- Cross-check the PRD, scope, user flows, information architecture, and data model for contradictions.
- Choose a suitable stack if none exists. Prefer a simple maintainable web app with durable persistence and testable behavior.
- Decide authentication/ownership model suitable for a real hosted CRM; explicitly document any local-only prototype limitations.
- Define initial stages, task status transitions, date/time behavior, currency handling if values are included, and archive policy.
- Add an Architecture Decision Record in `docs/decision-log.md` for meaningful choices.

Deliverables:
- Concrete stack and architecture decision.
- Implementation checklist and test plan aligned with the actual environment.

Exit gate:
- No unresolved product ambiguity that blocks core flows; data ownership and persistence approach are explicit.

## Phase 2 — Design system and app shell

Tasks:
- Apply `docs/design.md` and the frontend-design and anti-slop skills when available.
- Choose concrete visual tokens, type scale, layout grid, navigation behavior, and reusable components.
- Build the app shell, routing/navigation, typography, surfaces, forms, buttons, feedback patterns, and responsive navigation.
- Create meaningful first-use/empty states without fake metrics or fake real data.
- Audit copy from the first screen and add reusable copy patterns where practical.

Deliverables:
- Running app shell and a small design system.
- Screenshots or browser evidence at desktop and narrow/mobile widths.

Exit gate:
- Navigation works; layout is coherent and responsive; no visual placeholder masquerades as a feature; main UI copy passes language review.

## Phase 3 — Data foundation and access safety

Tasks:
- Set up persistence, environment configuration, migrations, validation conventions, and data-access boundaries.
- Implement the selected access model and record ownership rules.
- Add seed/demo data only through an explicit development-only mechanism, if useful.
- Add tests for schema constraints and access boundaries.
- Verify data survives refresh and application restart in the intended environment.

Deliverables:
- Reproducible local setup, migrations/schema, and safe data layer.

Exit gate:
- Core entities persist; ownership checks are tested; no secrets are in source; migration/setup commands work.

## Phase 4 — Customer management

Tasks:
- Implement customer list, search, filters that are actually supported, create, detail, edit, and archive/restore behavior.
- Provide form validation, feedback, empty states, and error handling.
- Ensure customer detail can later host activity, opportunities, and follow-ups without a redesign.

Deliverables:
- Complete customer CRUD/archive flow with tests.

Exit gate:
- Customer creation, reading, editing, search, and archive behavior pass automated and browser tests; strings pass copy review.

## Phase 5 — Sales pipeline and opportunities

Tasks:
- Implement opportunities linked to customers, stage changes, optional value/date fields, and a usable board/list experience.
- Ensure stage transitions persist and dashboard data can derive from them.
- Provide an accessible alternative to drag-and-drop if drag-and-drop exists.
- Make won/lost outcomes unambiguous and avoid financial/accounting claims.

Deliverables:
- Working pipeline and opportunity detail/edit experience.

Exit gate:
- Creating, editing, and moving opportunities works; values/filters and totals are consistent; key flows pass tests.

## Phase 6 — Activity history and follow-up tasks

Tasks:
- Implement dated customer/opportunity activity entries.
- Implement follow-up create/edit, related records, due-date handling, today/upcoming/overdue/completed views, complete/reopen, and reschedule actions.
- Define and test timezone handling and overdue calculations.
- Ensure activity/task views link naturally to customer context.

Deliverables:
- Working activity timeline and follow-up workflow.

Exit gate:
- Activity order, task status changes, due/overdue behavior, and associated record links pass tests including date boundary cases.

## Phase 7 — Dashboard and cross-feature workflows

Tasks:
- Build dashboard summaries from persisted data and clearly defined date periods.
- Provide links from summaries to their source lists/filters.
- Verify all related counts update after customer/opportunity/task mutations.
- Test the real end-to-end paths: create customer → create opportunity → record activity → schedule follow-up → complete follow-up → see dashboard update.

Deliverables:
- Dashboard with meaningful zero states and coherent cross-feature updates.

Exit gate:
- Metrics agree with source records and no hard-coded production-looking metric remains.

## Phase 8 — UX refinement and responsive/accessibility pass

Tasks:
- Inspect all routes at desktop, tablet, and mobile sizes.
- Fix layout overflow, dense tables/boards, navigation problems, focus, keyboard behavior, accessible names, and contrast issues.
- Review every interaction for loading, error, success, disabled, empty, and destructive-action states.
- Remove redundant copy, decorative noise, dead controls, unused components, and unneeded dependencies.
- Run anti-slop delivery checks where available.

Deliverables:
- Consistent polished product across supported screen sizes.

Exit gate:
- No major responsive, keyboard, or UX defects remain in core flows; every control shown as interactive has a real behavior.

## Phase 9 — Full verification and hardening

Tasks:
- Run all unit/integration tests, lint, typecheck, production build, and Playwright/browser scenarios.
- Review security/privacy rules and test account/workspace isolation where relevant.
- Review error handling, data integrity, date/time behavior, and destructive actions.
- Fix issues by severity, then rerun affected and full relevant checks.
- Audit every user-facing string for natural Indonesian, especially technical terms and error states.
- Check setup from a clean state and verify all docs.

Deliverables:
- Evidence-backed report for every quality gate.
- Updated known risks and limitations.

Exit gate:
- All release gates pass, or any environment limitation is explicitly documented with an honest release status.

## Phase 10 — Final release review and handoff

Tasks:
- Review the implementation against each Must Ship requirement and acceptance criterion.
- Inspect the final live local app and record representative screenshots or equivalent evidence.
- Ensure README setup steps and environment variables reflect the actual project.
- Report what is implemented, exact verification commands/results, any limitations, and how to run the app.
- Update `ops/working-state.md` to mark all completed phases and state the final verified status.
- Do not add speculative features during final review. Fix defects, not scope.

Exit gate:
- `docs/quality-gates.md` final release gate is completed with evidence and no misleading PASS claims.

## Recovery loop when a phase fails

Do not abandon the project or advance with a failing gate. Identify the smallest reproducible failing case, inspect logs and runtime state, make a focused fix, add/regress a test, rerun the failed check, and then rerun the broader relevant suite. Record repeated failures and the chosen fix in `docs/decision-log.md` or `docs/known-risks.md`.
