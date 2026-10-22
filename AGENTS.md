# Antigravity Instructions — Relasy

## Mission

Build Relasy as a complete, reliable, polished CRM web application by following this project blueprint. Work autonomously in small, verifiable phases until every required phase and release gate is complete. Do not stop to ask the user for routine confirmation or permission to continue to the next phase.

## Read first

Before changing anything, read:
- `README.md`
- `docs/product-brief.md`
- `docs/PRD.md`
- `docs/scope.md`
- `docs/design.md`
- `docs/content-style-guide.md`
- `docs/information-architecture.md`
- `docs/user-flows.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/security-privacy.md`
- `docs/quality-gates.md`
- `docs/implementation-roadmap.md`
- `docs/decision-log.md`
- `docs/known-risks.md`
- `qa/test-plan.md`
- `ops/working-state.md`

Also inspect available project files, package manifests, scripts, installed skills, and existing implementation before acting. Preserve good existing work. Do not overwrite or delete files blindly. If this is an existing repository, establish its current state first and adapt the plan safely.

## Skill handling

Use the supplied skills when present and relevant:
- `obra/superpowers`: systematic planning, incremental implementation, TDD, debugging, review, and verification.
- `miqdadbadjuber/anti-slop`: prevent generic UI, filler text, fake data claims, needless decoration, and low-quality code comments. Apply its building/during mode when available; do not stop to ask which mode.
- `akitaonrails/ai-memory`: preserve useful project context and session handoffs if properly installed and available. Do not claim it is installed if it is not.
- `anthropics/skills/frontend-design`: use for intentional, distinctive UI design and implementation.
- `anthropics/skills/webapp-testing`: use for browser-level validation with Playwright where available. Follow the skill's own directions and inspect rendered pages before interacting.

First discover which skills are actually available in this Antigravity environment. Do not assume a GitHub URL means a skill is installed. Never spend a whole phase installing optional skills if the environment cannot support them; record what is unavailable and proceed using the requirements in this blueprint.

These skills are helpers, not replacements for the source-of-truth documents. If a skill normally pauses for human approval, adapt the workflow to continue autonomously in this project unless a genuine safety, privacy, destructive-action, or external-cost decision requires user input.

## Autonomous work loop

For every phase in `docs/implementation-roadmap.md`:

1. Read the phase requirements and dependencies.
2. Inspect the actual workspace, relevant code, tests, and current app behavior.
3. Write or update a short phase plan in `ops/working-state.md` before a significant implementation step.
4. Implement a small coherent slice; prefer tests before implementation when practical.
5. Run the relevant unit, integration, type, lint, build, and browser tests available in the project.
6. Start the app and inspect the rendered UI when a browser UI exists. Exercise real controls and verify visible outcomes, not just the absence of console errors.
7. Review the changes against the requirements and look for regressions, security flaws, accessibility issues, poor UI copy, responsiveness problems, and unnecessary complexity.
8. Fix all issues found that are within scope. Repeat checks after fixes.
9. Update documentation, decision log, known risks, and working state with evidence and remaining limitations.
10. Decide whether the phase exit criteria are truly met. If not, fix and retest. If yes, advance to the next phase automatically.

Never report a command as passed unless it was actually run and its result was inspected. Never claim a browser check, test, or build passed based only on static reasoning. Keep logs concise but preserve the command, outcome, and relevant evidence.

## Autonomous decision rules

Make sensible low-risk implementation decisions without asking. Prefer the simplest design that satisfies the product requirements. When there are multiple reasonable choices, compare them briefly, choose the most maintainable option, and record the rationale in `docs/decision-log.md`.

Do not stop for ordinary design choices, routine bug fixes, refactors, dependency updates that are necessary and safe, or moving from one completed phase to the next.

Stop and request input only if continuing would require an irreversible destructive action on user data, access to secrets/accounts that have not been supplied, a new paid external service or material unapproved cost, a legal/business decision that cannot safely be inferred, or a conflict that makes the requirements impossible to satisfy. Before stopping, complete all safe independent work and clearly state the precise blocker. This exception should be rare.

## Product boundaries

- Product name: Relasy.
- Product type: standalone CRM web application for small businesses.
- Initial release scope: Level 1 CRM without WhatsApp API integration.
- Do not implement WhatsApp API, WhatsApp Web automation, unofficial WhatsApp libraries, message scraping, inbox synchronization, or automatic message sending.
- A plain `wa.me` link may be considered only as a simple manual convenience, with no claims of synchronization. Keep it optional and do not make the rest of the CRM depend on it.
- Do not add payments, subscriptions, AI features, or third-party integrations unless the blueprint is updated with a clear requirement.
- Do not invent product requirements from dashboard mockups or sample data.

## Indonesian UI copy — mandatory

All user-facing UI text, validation messages, empty states, tooltips, notifications, onboarding, and sample content must follow `docs/content-style-guide.md`.

Use natural, contemporary Indonesian. Do not translate technical terms literally or mechanically. Preserve established terms when they sound normal to the intended users. “Server”, “database”, “dashboard”, “login”, “logout”, “cloud”, “browser”, “website”, “backup”, “follow-up”, “pipeline”, and “tim” are allowed when contextually appropriate. “Peladen cloud” is prohibited. Avoid forced formal language, stilted translations, random English-Indonesian mixing, and long explanatory UI text.

Before release, search all user-facing strings and review them manually. Check spelling, consistency, capitalization, placeholders, singular/plural usage, and the naturalness of each phrase. Ensure UI copy is not generated dynamically in inconsistent styles.

## Design quality

Follow `docs/design.md` and use the frontend-design and anti-slop skills when available. Build a coherent, distinctive product, not a generic dashboard template. Do not add gradients, charts, decorative icons, badges, animation, cards, or empty metric widgets without a functional reason. Use realistic and clearly identified demo data only where needed; never fake real business analytics.

Every visible interactive control must do what its label implies. If a control is not implemented, do not present it as a working control. Provide proper loading, empty, success, error, and disabled states where applicable.

## Engineering quality and safety

- Preserve the user's existing work and inspect `git status` before potentially destructive changes.
- Never expose secrets in source code, logs, screenshots, or documentation. Use environment variables for credentials and provide `.env.example` with placeholders only.
- Use migrations or safe schema changes rather than destructive production-data resets.
- Validate inputs on the server as well as in the UI.
- Enforce ownership/tenant boundaries on all data access if the app supports multiple user accounts.
- Prefer accessible semantic HTML, keyboard support, clear focus states, correct labels, and responsive layouts.
- Do not suppress errors merely to make tests pass.
- Avoid unnecessary comments; write comments only when they explain a non-obvious reason.
- Do not add dependencies without checking that the current stack cannot reasonably meet the need.

## Definition of completion

The project is complete only when all required phases are marked complete in `ops/working-state.md`, core user flows are tested, the production build succeeds, browser-level checks cover the critical journeys, major accessibility and responsive issues are addressed, user-facing Indonesian copy has been audited, documentation matches the actual implementation, and `docs/quality-gates.md` has an evidence-backed PASS report. A pretty screenshot or successful build by itself is not completion.

At the end of each session, leave `ops/working-state.md` ready for the next session, including current phase, completed tasks, test commands/results, issues fixed, unresolved limitations, and the exact next action. If all phases are complete, run a final audit instead of inventing new features.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->
