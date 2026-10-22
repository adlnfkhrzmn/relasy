# Quality Gates and Completion Criteria

Every phase must pass its relevant gates before the agent advances. A failed gate means fix and retest; it does not mean stop to ask the user.

## Gate A — Requirement alignment

- Work matches the PRD and scope.
- No undeclared integration or unrelated feature has been added.
- Acceptance criteria for the phase are explicit and testable.

## Gate B — Code quality

Run available checks, such as:
- unit and integration tests
- type checking
- lint/format checks
- production build

Record exact commands and observed results. Do not fabricate missing tooling or claim a check ran if it did not.

## Gate C — Functional behavior

- Mutations persist and affected views refresh correctly.
- Forms validate invalid input and show understandable errors.
- Empty, loading, success, failure, disabled, and permission states are appropriate.
- Search and filters behave predictably.
- Browser refresh and navigation do not break the critical workflows.

## Gate D — Browser and visual verification

Where the UI can run locally:
- Start the app using the project's real scripts.
- Use Playwright or the installed webapp-testing skill where available.
- Inspect a screenshot and rendered DOM before acting on interactive elements.
- Exercise the critical user flows and verify the results.
- Check browser console errors and failed network requests.
- Review desktop and narrow/mobile widths, including overflow, sidebar/navigation, forms, modals, and data-heavy views.
- Every visible control must be tested or explicitly documented as a non-interactive element.

## Gate E — UX, accessibility, and copy

- User-facing Indonesian reads naturally and follows `docs/content-style-guide.md`.
- No “peladen cloud”, awkward literal translations, placeholder content, fake metrics, dead buttons, or misleading labels.
- Keyboard operation and focus states work for core controls.
- Inputs have labels; icon-only controls have accessible names.
- Contrast and reduced-motion behavior are considered.
- Layout works at common desktop, tablet, and mobile widths.

## Gate F — Security and data integrity

- Authorization checks cover relevant reads and writes.
- Invalid references and cross-account IDs are rejected.
- Secrets are not committed.
- No destructive schema reset is used as a migration shortcut.
- Error messages do not leak secrets or internal diagnostics.

## Gate G — Documentation and handoff

- Setup instructions work from a clean checkout to the extent practical.
- `.env.example` is accurate and contains no real secrets.
- Docs match implemented behavior.
- `docs/decision-log.md`, `docs/known-risks.md`, and `ops/working-state.md` are current.
- Include a concise evidence-backed phase report.

## Final release gate — required for completion

All Must Ship requirements and critical flows in `docs/PRD.md` and `qa/test-plan.md` are implemented and tested; production build succeeds; browser checks pass; no known unresolved blocker or critical/high-severity defect remains; copy audit is complete; setup documentation is tested; and the final report distinguishes verified results from limitations. If a check cannot run due to a real environment limitation, document it honestly and do not report the overall release as an unconditional PASS.
