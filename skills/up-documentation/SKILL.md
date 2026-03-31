---
name: up-documentation
description: "Final documentation skill for the Object-Oriented Unified Process. The LAST Transition activity — consolidates all UP artifacts, implementation outputs, and deployment evidence into a complete documentation set for users, developers, operators, and stakeholders. Must use MCP tools, CLI tools, and renderers such as mermaid-cli (mmdc) whenever available to generate rendered diagrams, indexes, traceability matrices, architecture guides, API guides, operations manuals, and user documentation from the artifacts produced throughout the process."
---

# Skill: up-documentation — Final Documentation Generation

## Objective

You are the **UP DOCUMENTATION ENGINEER**. Your role is to transform the entire UP execution trail into a complete, publishable, auditable documentation set.

This is the **LAST activity of the Transition phase**.

You must generate documentation for four audiences:

1. **Stakeholders** — what was delivered, why it satisfies the original vision, and where the evidence is
2. **End users** — how to use the system in day-to-day workflows
3. **Developers** — architecture, design rationale, code structure, contracts, and extension points
4. **Operators / DevOps / Support** — deployment topology, environment configuration, health checks, troubleshooting, rollback, and observability

> **Primary rule:** Do not write summary-only documentation. Generate documentation directly from the authoritative UP artifacts, implementation outputs, and deployment reports. Documentation must be evidence-based, traceable, and synchronized with the actual system that was built and deployed.

> **Tooling rule:** You MUST use available MCP tools, CLI tools, and renderers whenever appropriate. For diagrams written in Mermaid, use a CLI such as `mmdc` (Mermaid CLI) to render `.mmd`/Markdown Mermaid blocks into SVG or PNG artifacts whenever the tool is available.

---

## Step 0: 5W2H Analysis for Documentation (Mandatory)

### 1. WHAT — What documentation set is actually required for this system to be usable, maintainable, operable, and auditable?
> A README is not enough. Enumerate the minimum complete documentation set: executive summary, traceability matrix, architecture guide, API guide, user guide, deployment/operations guide, troubleshooting, rendered diagrams, and release summary. Identify which artifacts are mandatory for this system type (API-only, UI-heavy, internal enterprise app, regulated system, etc.).

### 2. WHY — Why can documentation generated only from memory or summarization be dangerous?
> Because it drifts from reality. Every important claim in the documentation must be backed by an authoritative artifact: requirements, contracts, DCP, design patterns, generated source code, deployment report, test evidence, or runtime health evidence. Identify the highest-risk areas where undocumented assumptions would cause operational, maintenance, or user-facing failures.

### 3. WHO — Who will consume each documentation artifact, and what action must they be able to perform after reading it?
> Separate audiences explicitly: stakeholder, user, developer, operator, auditor. For each audience, define the concrete action the documentation must enable. Example: the operator must be able to restart the system safely; the developer must be able to add a new use case without violating contracts; the user must be able to complete the core workflow without training.

### 4. WHEN — When should documentation trigger iteration back to earlier activities instead of merely describing the current state?
> If documentation reveals contradictions, missing artifacts, broken traceability, undocumented endpoints, undocumented deployment steps, or diagrams that do not match implementation reality, do not paper over the issue. Trigger iteration to the relevant upstream activity, fix the source artifact, then regenerate documentation. Documentation is a validation layer, not a cosmetic final step.

### 5. WHERE — Where is each piece of documentation stored, rendered, and consumed?
> Define the full documentation topology now: markdown source files in `docs/up/16-documentation/`, rendered diagrams in `docs/up/16-documentation/diagrams/`, operation checklists in `docs/up/16-documentation/operations/`, user docs in `docs/up/16-documentation/user/`, developer docs in `docs/up/16-documentation/developer/`, and release/deployment evidence in `docs/up/16-documentation/release/`. Every output must have a clear consumer and path.

### 6. HOW — How will the documentation be generated from authoritative artifacts using MCP and CLI tools?
> Define the generation pipeline explicitly: read UP artifacts, extract structured information, consolidate it into documentation templates, render Mermaid diagrams using `mmdc` when available, validate internal links, generate indexes and traceability matrices, and cross-check runtime/deployment evidence against the written guides. Documentation generation is an engineering pipeline, not a manual essay.

### 7. HOW MUCH — How much documentation completeness is required before the project is considered truly finished?
> Three acceptable levels: (a) operationally sufficient — enough to run and support the system; (b) delivery-complete — enough for stakeholders, users, developers, and operators; (c) audit-ready — full traceability, rendered evidence, deployment proof, and release notes. Default to **delivery-complete**, and upgrade to **audit-ready** when the requester or project context implies compliance, long-lived maintenance, or multi-team handoff.

> **Output:** Save 5W2H to `docs/up/5w2h/5W2H-documentation.md`.

---

## Step 1: Source Artifact Inventory

Before generating anything, load and inventory the authoritative sources:

```
REQUIRED SOURCES:
  ✓ 00-process-plan.md
  ✓ 01-vision.md
  ✓ 02-requirements.md
  ✓ 02-use-case-list.md
  ✓ 03-use-cases/
  ✓ 04-dss/
  ✓ 04-system-operations.md
  ✓ 05-conceptual-model.md
  ✓ 06-contracts/
  ✓ 07-dcp.md
  ✓ 07-design-sequences/
  ✓ 08-interface-design.md
  ✓ 09-data-model.md
  ✓ 10-tdd-plan.md
  ✓ 10-tests/
  ✓ 11-tech-research.md
  ✓ 11-tech-stack.md
  ✓ 12-design-patterns.md
  ✓ 13-design-system.md (if UI exists)
  ✓ 13-ui-code/ (if UI exists)
  ✓ 14-implementation/
  ✓ 15-deploy/
```

If any required artifact is missing, inconsistent, or stale relative to implementation reality, do not silently continue. Trigger the appropriate upstream activity and regenerate before documenting.

---

## Step 2: Documentation Generation Strategy

Generate the final documentation bundle under:

```
docs/up/16-documentation/
├── README.md                      # Documentation index / navigation hub
├── EXECUTIVE-SUMMARY.md           # Stakeholder-facing delivery summary
├── TRACEABILITY-MATRIX.md         # Vision → requirements → UCs → operations → contracts → tests → code → deploy
├── diagrams/
│   ├── conceptual-model.svg
│   ├── dcp.svg
│   ├── ssd-*.svg
│   ├── design-sequence-*.svg
│   └── interface-flow.svg
├── user/
│   ├── USER-GUIDE.md
│   ├── CORE-WORKFLOWS.md
│   └── FAQ.md
├── developer/
│   ├── ARCHITECTURE.md
│   ├── DOMAIN-MODEL.md
│   ├── API-GUIDE.md
│   ├── DATA-MODEL.md
│   ├── TEST-STRATEGY.md
│   └── EXTENSION-POINTS.md
├── operations/
│   ├── DEPLOYMENT-GUIDE.md
│   ├── ENVIRONMENTS.md
│   ├── RUNBOOK.md
│   ├── TROUBLESHOOTING.md
│   ├── OBSERVABILITY.md
│   └── ROLLBACK.md
└── release/
    ├── RELEASE-NOTES.md
    ├── DEPLOYMENT-EVIDENCE.md
    └── KNOWN-LIMITATIONS.md
```

---

## Step 3: Mandatory Use of MCP / CLI / Renderers

Use the best available tooling to transform artifacts into consumable documentation.

### 3.1 Diagram Rendering

For every Mermaid artifact generated during UP:
- `05-conceptual-model.md`
- `07-dcp.md`
- `04-dss/*.md`
- `07-design-sequences/*.md`
- `08-interface-design.md`

Extract Mermaid blocks and render them using CLI tooling.

**Preferred command:**

```bash
mmdc -i input.mmd -o output.svg -t neutral -b transparent
```

If `mmdc` is not available:
1. Check if it can be run via `npx @mermaid-js/mermaid-cli`
2. If still unavailable, document the limitation explicitly in `16-documentation/release/KNOWN-LIMITATIONS.md`
3. Keep the Mermaid source embedded in the markdown so the docs remain usable

### 3.2 API and Runtime Evidence

Use CLI/MCP tools to collect evidence from the implemented/deployed system when available:
- API route enumeration from generated source or framework tooling
- Health check output
- Test summary output
- Deployment report summary
- Environment structure (without leaking secrets)

### 3.3 Documentation Validation

Use CLI/MCP tools to validate:
- internal links
- file existence referenced in indexes
- rendered diagram outputs
- consistency between docs and generated source tree

> **Critical rule:** The documentation activity is not complete until the documentation references real files, real evidence, and real rendered outputs wherever possible.

---

## Step 4: Documentation Artifacts to Generate

### 4.1 Executive Summary

Generate `EXECUTIVE-SUMMARY.md` containing:
- system purpose from `01-vision.md`
- scope delivered vs. requested
- target users / actors
- final deployment environment
- implementation and deployment status
- major constraints, trade-offs, and deferred items
- links to proof artifacts

### 4.2 Traceability Matrix

Generate `TRACEABILITY-MATRIX.md` mapping:

```
Vision item
  → Requirement(s)
  → Use case(s)
  → System operation(s)
  → Contract(s)
  → Test case(s)
  → Implementation module(s)
  → Deployment/runtime verification
```

This is mandatory. If any chain breaks, trigger iteration upstream.

### 4.3 User Documentation

Generate:
- `user/USER-GUIDE.md` — overview, login/access, roles, navigation
- `user/CORE-WORKFLOWS.md` — one section per main use case
- `user/FAQ.md` — expected errors, edge cases, help guidance

For UI systems, documentation must reflect the actual screens generated in `13-ui-code/` and integrated in `14-implementation/frontend/`.

### 4.4 Developer Documentation

Generate:
- `developer/ARCHITECTURE.md` — layers, patterns, boundaries, dependencies
- `developer/DOMAIN-MODEL.md` — concepts from conceptual model + DCP alignment
- `developer/API-GUIDE.md` — system operations mapped to real endpoints/interfaces
- `developer/DATA-MODEL.md` — tables/entities/relationships/migrations
- `developer/TEST-STRATEGY.md` — TDD battery structure and execution guidance
- `developer/EXTENSION-POINTS.md` — safe change points, how to add new capabilities

### 4.5 Operations Documentation

Generate:
- `operations/DEPLOYMENT-GUIDE.md`
- `operations/ENVIRONMENTS.md`
- `operations/RUNBOOK.md`
- `operations/TROUBLESHOOTING.md`
- `operations/OBSERVABILITY.md`
- `operations/ROLLBACK.md`

These must be grounded in `15-deploy/` outputs and the deployed runtime behavior.

### 4.6 Release Documentation

Generate:
- `release/RELEASE-NOTES.md`
- `release/DEPLOYMENT-EVIDENCE.md`
- `release/KNOWN-LIMITATIONS.md`

---

## Step 5: Iteration Protocol for Documentation

If documentation generation reveals inconsistencies, classify them before acting.

### Category A: Documentation Gap (fix inside documentation)
Examples:
- missing section in the generated guide
- weak explanation of a valid architecture decision
- missing index links
- FAQ incomplete although artifacts are sufficient

**Action:** Improve the documentation output.

### Category B: Source Artifact Gap (iterate upstream)
Examples:
- a use case has no implementation evidence
- an endpoint exists in code but has no contract/test traceability
- deployment instructions omit a real required step discovered during deploy
- the conceptual model or DCP diagram does not match generated code reality
- the UI guide references screens that do not exist in the integrated app

**Action:**
1. Log the gap in `16-documentation/release/KNOWN-LIMITATIONS.md` or a temporary `DOCUMENTATION_GAP_LOG.md`
2. Return to the relevant upstream activity
3. Fix the source artifact or implementation/deployment output
4. Regenerate documentation

> **Rule:** Documentation must never normalize contradictions. If the documentation step finds a contradiction, that is evidence of unfinished work.

---

## Step 6: Completeness Gate

Documentation is complete only if ALL items below are true:

```
STRUCTURE:
  ✓ Documentation index exists
  ✓ Stakeholder, user, developer, operations, and release docs exist
  ✓ Rendered diagrams exist where tooling is available

TRACEABILITY:
  ✓ Every core vision item maps to requirements, UCs, operations, tests, code, and deploy evidence
  ✓ No broken traceability chain for any mandatory feature

ACCURACY:
  ✓ Deployment guide matches real deploy outputs
  ✓ API guide matches actual implemented endpoints/interfaces
  ✓ User guide matches real screens / flows / behaviors
  ✓ Architecture guide matches actual code structure and patterns used

EVIDENCE:
  ✓ Test evidence summarized from 10-tests/ and implementation results
  ✓ Deployment evidence summarized from 15-deploy/
  ✓ Mermaid diagrams rendered to SVG/PNG when tooling is available

NAVIGATION:
  ✓ README index links to every generated section
  ✓ Internal references point to existing files
```

---

## Step 7: Save the Artifacts

Use `up_save_artifact` to persist the documentation bundle, including at minimum:

```text
16-documentation/README.md
16-documentation/EXECUTIVE-SUMMARY.md
16-documentation/TRACEABILITY-MATRIX.md
16-documentation/user/USER-GUIDE.md
16-documentation/developer/ARCHITECTURE.md
16-documentation/developer/API-GUIDE.md
16-documentation/operations/DEPLOYMENT-GUIDE.md
16-documentation/operations/RUNBOOK.md
16-documentation/release/RELEASE-NOTES.md
16-documentation/release/DEPLOYMENT-EVIDENCE.md
```

For rendered diagrams and non-markdown outputs, save the source metadata and reference the generated file paths in the documentation index.

Finally:

```text
up_update_state(updates: '{"completedActivities":[...,"documentation"],"currentPhase":"transition"}')
```

---

## Reference Template

- `templates/documentation-bundle-template.md` — Documentation bundle checklist and structure
