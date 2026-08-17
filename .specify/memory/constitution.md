<!--
Sync Impact Report
- Version change: (template, unversioned) → 1.0.0
- Rationale: Initial ratification. All template placeholders replaced with concrete
  project values; no prior principles existed to modify or remove.
- Modified principles: none (initial adoption)
- Added sections:
  - Core Principles (I. Spec-Driven Delivery, II. Simplicity & YAGNI,
    III. Test-First Quality, IV. User-Facing Clarity & Accessibility,
    V. Observability & Data Stewardship)
  - Technical Constraints
  - Development Workflow & Quality Gates
  - Governance
- Removed sections: none
- Templates reviewed (no edits required by this command; they read the constitution at runtime):
  - .specify/templates/plan-template.md ✅ Constitution Check gate present
  - .specify/templates/spec-template.md ✅ user-story / requirement structure compatible
  - .specify/templates/tasks-template.md ✅ test-first ordering compatible
  - .specify/templates/checklist-template.md ✅ no constitution-specific tokens
- Follow-up TODOs: none. Technology stack is intentionally not fixed here; it MUST be
  declared per feature in plan.md (see Technical Constraints) until the first plan is
  ratified, at which point an amendment MAY pin the stack.
-->

# Neighbourhood Tour Constitution

## Core Principles

### I. Spec-Driven Delivery
Every feature MUST begin as a written specification (`specs/<feature>/spec.md`) that
describes user-visible outcomes before any implementation planning or code is produced.
Specifications MUST be expressed in terms of user stories, acceptance scenarios, and
measurable success criteria; they MUST NOT prescribe technology, frameworks, or code
structure. Planning (`plan.md`) and task breakdown (`tasks.md`) MUST trace back to the
spec, and any work not covered by an approved spec MUST NOT be merged.

Rationale: The project is bootstrapped with Spec Kit; keeping the spec as the single
source of intent prevents scope drift and makes AI-assisted implementation verifiable.

### II. Simplicity & YAGNI
Start with the simplest design that satisfies the current spec. New abstractions,
services, layers, or dependencies MUST be justified by a concrete requirement in the
active spec, not by anticipated future needs. Each feature's plan MUST document any
added complexity in its Complexity Tracking table with the specific simpler alternative
that was rejected and why. Unjustified complexity MUST be removed before merge.

Rationale: A small project accrues maintenance cost fastest through speculative
generality; explicit justification keeps the codebase navigable and reviewable.

### III. Test-First Quality (NON-NEGOTIABLE)
For every user story, acceptance tests (contract, integration, or end-to-end as
appropriate) MUST be written and confirmed failing before the implementation that makes
them pass. Each user story MUST be independently testable and deliver a standalone,
demonstrable increment. A change MUST NOT be merged while any test in the affected area
fails, and bug fixes MUST include a regression test that reproduces the defect first.

Rationale: Red-Green-Refactor gives an objective definition of "done" for both humans
and AI agents and prevents silent regressions in a tour experience users rely on while
physically out in a neighbourhood.

### IV. User-Facing Clarity & Accessibility
All user-facing surfaces (screens, routes, CLI output, notifications, tour content) MUST
be understandable without insider knowledge, work on mobile-sized viewports where a UI
exists, and meet baseline accessibility (readable contrast, keyboard/screen-reader
operable controls, meaningful text alternatives for images and map markers). Errors
shown to users MUST state what happened and what the user can do next. Location, map,
and media features MUST degrade gracefully when permissions are denied or connectivity
is poor.

Rationale: A neighbourhood tour is consumed on the move, often outdoors, by people of
varied ability; clarity and resilience are core to the product, not polish.

### V. Observability & Data Stewardship
Every runtime component MUST emit structured logs for significant actions and failures,
sufficient to reconstruct what a user did and what the system decided without attaching
a debugger. Personal data — especially precise location, photos, and contact details —
MUST be collected only when a spec requirement demands it, MUST be documented in the
feature's data model, and MUST NOT be logged in plain form. Secrets and API keys MUST
never be committed to the repository.

Rationale: Tour features inherently touch location data; being deliberate about what is
recorded protects users and keeps debugging tractable.

## Technical Constraints

- Technology stack, language versions, and primary dependencies MUST be declared in each
  feature's `plan.md` Technical Context section. Until a stack is pinned by amendment,
  later features MUST reuse the stack chosen by the first ratified plan unless the spec
  gives a documented reason to diverge.
- The repository MUST remain runnable from a fresh clone using documented commands
  (`quickstart.md` per feature and/or a top-level README); undocumented manual setup
  steps are a defect.
- External services (maps, geocoding, storage, auth) MUST be accessed through a thin,
  replaceable boundary so that tests can run without network access.
- Configuration and secrets MUST come from environment variables or ignored local files,
  never from tracked source.
- Performance and offline expectations MUST be stated as measurable success criteria in
  the spec (e.g., "tour loads within 2 s on a mid-range phone over 4G") rather than
  assumed.

## Development Workflow & Quality Gates

- Workflow order for every feature: `/speckit-specify` → (`/speckit-clarify` as needed)
  → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`, with `/speckit-analyze`
  or `/speckit-checklist` run before implementation when the spec is non-trivial.
- Each `plan.md` MUST pass its Constitution Check gate against this document before
  Phase 0 research begins and again after Phase 1 design; violations MUST be resolved or
  justified in Complexity Tracking.
- Work MUST happen on a feature branch named for the feature; direct commits to the
  main branch are not permitted.
- A change is mergeable only when: tests for the touched user stories pass, no
  `[NEEDS CLARIFICATION]` markers remain in the spec, the quickstart still works, and
  the diff contains no secrets or unjustified new dependencies.
- Reviews (human or agent) MUST explicitly confirm compliance with Principles I–V;
  "looks good" without reference to the gates is not an approval.

## Governance

This constitution supersedes any other practice, template default, or ad-hoc convention
in this repository. Where a template or command conflicts with it, the constitution
wins and the template MUST be updated.

Amendment procedure: propose the change as an edit to this file with a Sync Impact
Report at the top, state the semantic version bump and its rationale, update any
dependent templates in the same change, and record the amendment date. Amendments take
effect when merged to the main branch.

Versioning policy: MAJOR for removing or redefining a principle in a backward-incompatible
way; MINOR for adding a principle or section or materially expanding guidance; PATCH for
clarifications and wording fixes that do not change obligations.

Compliance review: every `plan.md` Constitution Check and every code review MUST cite
this document. A periodic review (at minimum when a new feature is specified) MUST
confirm the principles still reflect how the project actually works; drift is resolved
by amendment, not by ignoring the rule.

**Version**: 1.0.0 | **Ratified**: 2026-08-17 | **Last Amended**: 2026-08-17
