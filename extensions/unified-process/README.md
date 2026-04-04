# Unified Process (UP) Extension for pi

> A pi coding agent extension that implements the complete Object-Oriented Unified Process (UP), generating all analysis and design artifacts from a System Vision provided by the user.

---

## What It Is

The `unified-process` extension turns pi into an **OO development environment guided by the Unified Process (UP)**. From a simple system description (System Vision), it orchestrates a set of specialized skills to generate all OO analysis and design artifacts.

**Based on**: *Analysis and Design of Object-Oriented Information Systems* — covering chapters on Use Cases, Sequence Diagrams, Conceptual Modeling, OCL Contracts, Object Design (GRASP), Interfaces, and ORM Mapping.

---

## Installation

This extension is shipped as part of the public pi package rooted at this repository.

Recommended install:
```bash
pi install npm:@apolosan/unified-process
```

Alternative GitHub install:
```bash
pi install git:github.com/apolosan/unified_process_pi_extension
```

Canonical public package paths:
- `extensions/unified-process/`
- `skills/up-*/`

---

## Commands

| Command | Description |
|---|---|
| `/up [system vision]` | Starts a new UP process with the provided vision. The full text after `/up` is preserved as the authoritative vision, the initial system name is heuristically derived from the whole prompt, and the orchestrator must canonically refine/persist `systemName` after reading the full vision. |
| `/up` | Intelligently resumes an existing UP process from session state, project state, or `docs/up/` artifacts; if found, it re-invokes the orchestrator |
| `/up-status` | Displays the full state: phase, iteration, activities, artifacts, and auto-transition mode |
| `/up-next` | Advances to the next pending UP activity |
| `/up-auto [on\|off\|status]` | Toggles or inspects automatic UP stage transitions |
| `/up-artifacts` | Lists and browses the generated artifacts |

---

## Unified Process Skills

| Skill | UP Phase | Generated Artifacts |
|---|---|---|
| `/skill:up-orchestrator` | All | `docs/up/00-process-plan.md` |
| `/skill:up-5w2h` | All (Step 0) | `docs/up/5w2h/5W2H-[activity].md` |
| `/skill:up-vision` | Inception | `docs/up/01-vision.md` |
| `/skill:up-requirements` | Inception | `docs/up/02-requirements.md`, `docs/up/02-use-case-list.md` |
| `/skill:up-use-cases` | Elaboration | `docs/up/03-use-cases/UC-NN-name.md` (one per UC) |
| `/skill:up-sequence-diagrams` | Elaboration | `docs/up/04-dss/DSS-NN.md`, `docs/up/04-system-operations.md` |
| `/skill:up-conceptual-model` | Elaboration | `docs/up/05-conceptual-model.md` |
| `/skill:up-contracts` | Elaboration | `docs/up/06-contracts/CONTRACT-op.md`, `docs/up/06-contracts-summary.md` |
| `/skill:up-tech-stack` ⚠️ | **Construction (gate 1)** | `docs/up/11-tech-research.md`, `docs/up/11-tech-stack.md` |
| `/skill:up-tdd` ⚠️ | **Construction (gate 2)** | `docs/up/10-tdd-plan.md`, `docs/up/10-tests/` |
| `/skill:up-design-patterns` 🔍 | **Construction (gate 3)** | `docs/up/12-design-patterns.md` |
| `/skill:up-object-design` | Construction | `docs/up/07-dcp.md`, `docs/up/07-design-sequences/` |
| `/skill:up-interface-design` | Construction | `docs/up/08-interface-design.md` |
| `/skill:up-design-system` 🎨 | **Construction (design finalization)** | `docs/up/13-design-system.md`, `docs/up/13-ui-code/` |
| `/skill:up-data-mapping` | Construction | `docs/up/09-data-model.md` |
| `/skill:up-implementation` 💻 | **Construction (final)** | `docs/up/14-implementation/` |
| `/skill:up-deploy` 🚀 | **Transition (first activity)** | `docs/up/15-deploy/` |
| `/skill:up-documentation` 📚 | **Transition (final activity)** | `docs/up/16-documentation/` |

> ⚠️ `/skill:up-tech-stack` is **Construction gate 1**: stack is locked here based on all Elaboration artifacts. Detects requester tech level passively.
> ⚠️ `/skill:up-tdd` is **Construction gate 2**: test battery uses tools from `11-tech-stack.md`. No implementation before tests.
> 🔍 `/skill:up-design-patterns` is **Construction gate 3**: patterns researched via MCP server + internet before the DCD is drawn.
> 💻 `/skill:up-implementation` is the **final Construction activity**: generates the full application, keeps the TDD battery green, and triggers upstream iteration when design gaps are discovered.
> 🚀 `/skill:up-deploy` is the **first Transition activity**: deploys to homologation, pre-production, or production depending on requester criteria and approval.
> 📚 `/skill:up-documentation` is the **final Transition activity**: consolidates all artifacts into a full documentation set using MCP/CLI tooling and rendered outputs such as Mermaid diagrams via `mmdc` when available.

---

## Complete Usage Flow

### Quick Start

```
/up Online Bookstore E-Commerce System
```

pi will start the process, preserve the complete prompt as the authoritative System Vision, derive an initial system name from the whole request, and automatically invoke `/skill:up-orchestrator`, which must validate and persist the canonical `systemName` after reading the full vision.

### Automatic Transition Mode

Use `/up-auto on` to enable automatic progression, or toggle it with any of these shortcuts:

- `CTRL+SHIFT+Y`
- `CTRL+SHIFT+N`
- `CTRL+SHIFT+T`

When automatic transition mode is enabled:
- `/up` starts/resumes the process and immediately dispatches `/skill:up-orchestrator`
- the orchestrator should persist the explicit next action in state using `recommendedNextCommand` and `recommendedNextReason`
- after a state-changing UP skill finishes, the extension follows that explicit recommendation first; if none exists, it falls back to the linear next `/skill:up-[activity]`
- this allows refinement-aware loops such as returning from implementation to contracts, object design, or requirements when the orchestrator decides an upstream revision is necessary
- the agent should stop asking the user to manually invoke the next UP command unless the flow pauses because no UP artifact/state update was detected or because an explicit next command would create a blind self-loop
- the footer/status area shows the effective next command in real time; an explicit orchestrator recommendation is marked with `★`
- when an explicit recommendation exists, a compact widget above the editor shows the recommended command and its rationale
- the widget now varies by recommendation type, distinguishing forward progression, upstream refinement, non-linear jumps, coordination/orchestrator returns, and risk-aware recommendations

### Manual Step-by-Step Flow

```
/up Online Bookstore E-Commerce System
/up-status                          # view current state
/skill:up-orchestrator              # create the master process plan
/skill:up-vision                    # draft the System Vision document
/skill:up-requirements              # capture requirements and use cases
/skill:up-use-cases                 # expand use cases
/skill:up-sequence-diagrams         # create SSD and list system operations
/skill:up-conceptual-model          # build the conceptual model (Mermaid)
/skill:up-contracts                 # write OCL contracts for each operation
/skill:up-tech-stack                # lock the stack using current-source research
/skill:up-tdd                       # write and lock the full test battery
/skill:up-design-patterns           # research patterns before object design
/skill:up-object-design             # design classes (DCP) with GRASP patterns
/skill:up-interface-design          # technology-agnostic interface design
/skill:up-design-system             # research/select/generate the frontend design system
/skill:up-data-mapping              # ORM mapping
/skill:up-implementation            # generate the full working application
/skill:up-deploy                    # deploy to homologation / pre-prod / production
/skill:up-documentation             # generate the complete final documentation bundle
/up-status                          # review final artifacts, deployment outputs, and documentation bundle
```

### Auto-Advance

```
/up-next    # advances to the next uncompleted activity
```

---

## Generated Artifact Structure

```
docs/up/
├── 00-process-plan.md          # Master plan (37 items)
├── 01-vision.md                # System Vision Document
├── 02-requirements.md          # Functional/Non-functional requirements, Business Rules
├── 02-use-case-list.md         # Use Case catalog with Mermaid diagram
├── 03-use-cases/
│   ├── UC-01-name.md           # Expanded CRUD use case
│   ├── UC-02-name.md           # Expanded report use case
│   └── UC-03-name.md           # Expanded functional use case
├── 04-dss/
│   └── DSS-UC03-name.md        # System Sequence Diagram
├── 04-system-operations.md     # List of system operations with params
├── 05-conceptual-model.md      # Conceptual Model (Mermaid classDiagram)
├── 06-contracts/
│   └── CONTRACT-createOrder.md # System operation contract (OCL informal)
├── 06-contracts-summary.md     # Summary of all contracts
├── 11-tech-research.md 🔍    # Technology Research Report (current sources, CVEs, benchmarks)
├── 11-tech-stack.md  ⚠️         # Tech Stack Decision (LOCKED before TDD)
├── 10-tdd-plan.md  ⚠️          # TDD Plan (LOCKED before any downstream construction design or implementation begins)
├── 10-tests/                   # Test battery (immutable post-approval)
│   ├── unit-tests.md           # Unit test specifications
│   ├── integration-tests.md    # Integration test specifications
│   ├── e2e-tests.md            # End-to-End test specifications
│   ├── frontend-tests.md       # Frontend/UI test specifications
│   ├── performance-tests.md    # Performance test specifications
│   ├── security-tests.md       # Security test specifications
│   ├── accessibility-tests.md  # Accessibility test specifications
│   └── stakeholder-tests.md    # Stakeholder-suggested tests
├── 12-design-patterns.md 🔍  # Design Patterns Catalog (MCP + internet research, feeds DCD)
├── 13-design-system.md 🎨  # Design System Spec (MCP-researched: shadcn/radix/flyonui)
├── 13-ui-code/            # Generated source code for the visual layer
│   ├── design-tokens.css  # All CSS custom properties
│   ├── design-tokens.ts   # TypeScript token exports
│   ├── components/        # Generated UI components
│   ├── screens/           # One file per screen from interface design
│   ├── install-commands.sh # shadcn/flyonui CLI install commands
│   └── README.md          # Setup and usage documentation
├── 14-implementation/     # Complete generated application code + iteration logs
│   ├── backend/           # Domain, application, infrastructure, API
│   ├── frontend/          # Integrated UI with real data
│   ├── tests/             # Runtime test setup/configuration
│   ├── ITERATION_LOG.md   # Design-gap iteration history
│   └── README.md          # How to run, test, and validate the system
├── 15-deploy/             # Deployment configuration and reports
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── ci-cd/
│   ├── DEPLOYMENT_REPORT.md
│   └── INCIDENT_LOG.md
├── 16-documentation/      # Final documentation bundle generated from all authoritative artifacts
│   ├── README.md          # Documentation index
│   ├── EXECUTIVE-SUMMARY.md
│   ├── TRACEABILITY-MATRIX.md
│   ├── diagrams/          # Mermaid rendered SVG/PNG outputs
│   ├── user/
│   ├── developer/
│   ├── operations/
│   └── release/
├── 07-dcp.md                   # DCP (Mermaid classDiagram with GRASP)
├── 07-design-sequences/
│   └── SEQ-createOrder.md      # Design sequence diagram
├── 08-interface-design.md      # Interface Design (Mermaid flowchart)
└── 09-data-model.md            # ORM Mapping
```

---

## Example System Vision

To test the extension, use a vision like:

```
/up Inventory Control System for Small Businesses. The system must allow
employees to register product inflows and outflows, manage suppliers and
customers, and enable managers to view movement reports and low-stock alerts.
It should support multiple simultaneous users.
```

---

## Key Features

- ✅ **Technology-agnostic analysis** — all artifacts from Inception through Elaboration are independent of tech
- ✅ **Tech stack detection** — agent passively collects tech signals throughout the process; adapts to 4 requester knowledge levels
- ✅ **Object-oriented** — strictly follows OO principles and GRASP patterns
- ✅ **5W2H-driven** — every activity begins with structured brainstorming to surface hidden knowledge
- ✅ **TDD-first** — complete test battery written before ANY code or meta-code; tests are immutable post-approval
- ✅ **All test types** — unit, integration, component, frontend, e2e, performance, load, stress, security, accessibility, regression, smoke, contract, mutation, property-based, snapshot
- ✅ **Design patterns** — researched via specialized MCP + internet before DCD is drawn
- ✅ **Design system generator** — researches (shadcn/radix/flyonui MCPs + internet), selects, and generates real visual source code
- ✅ **Full implementation stage** — transforms all UP artifacts into a complete runnable application
- ✅ **Deployment stage** — prepares and deploys the system to homologation, pre-production, or production
- ✅ **Documentation stage** — compiles stakeholder, user, developer, operator, and release documentation from authoritative artifacts and runtime evidence
- ✅ **Iterative by protocol** — if implementation or documentation exposes a design gap, the agent loops back to the correct upstream activity
- ✅ **Persistent state** — process resumable across pi sessions via session history, `.pi/unified-process/state.json`, and project artifact recovery
- ✅ **Mermaid diagrams** — all diagrams in renderable Markdown format
- ✅ **Standardized templates** — consistent structure for all UP artifacts

---

## Unified Process Phases

```
Inception → Elaboration → Construction → Transition
    |             |                    |                               |
  Vision       UCs + SSD           [Tech Stack]                    [Deploy]
  Reqs.        Model               [TDD Gate]                      Smoke Tests
               Contracts           [Patterns]                      Rollback / Promote
                                   DCP + ORM                       Vision Alignment
                                   Interfaces                      [Documentation]
                                   [Design System + UI Code]       Render diagrams (mmdc)
                                   [Implementation]                Traceability bundle
                                   ↺ Iterate upstream on design gaps
```
