# UP Process Plan — [System Name]

> **Vision Summary:** [Brief system description — 2 to 3 lines]
>
> **Current iteration:** 1 | **Start date:** [date]

---

## 🔵 Inception Phase

- [ ] **5W2H — Vision** → `up-5w2h` analysis before drafting → `docs/up/5w2h/5W2H-vision.md`
- [ ] **System Vision** → `/skill:up-vision` → `docs/up/01-vision.md`
- [ ] **5W2H — Requirements** → `up-5w2h` analysis before eliciting → `docs/up/5w2h/5W2H-requirements.md`
- [ ] **Requirements & Use Case Catalog** → `/skill:up-requirements` → `docs/up/02-*.md`

---

## 🟡 Elaboration Phase

- [ ] **5W2H — Use Cases** → `up-5w2h` analysis before expanding → `docs/up/5w2h/5W2H-use-cases.md`
- [ ] **Expanded Use Cases** → `/skill:up-use-cases` → `docs/up/03-use-cases/`
- [ ] **5W2H — Sequence Diagrams** → `up-5w2h` analysis before modeling → `docs/up/5w2h/5W2H-sequence-diagrams.md`
- [ ] **System Sequence Diagrams** → `/skill:up-sequence-diagrams` → `docs/up/04-dss/`
- [ ] **5W2H — Conceptual Model** → `up-5w2h` analysis before modeling → `docs/up/5w2h/5W2H-conceptual-model.md`
- [ ] **Conceptual Model** → `/skill:up-conceptual-model` → `docs/up/05-conceptual-model.md`
- [ ] **5W2H — Contracts** → `up-5w2h` analysis before specifying → `docs/up/5w2h/5W2H-contracts.md`
- [ ] **Operation Contracts** → `/skill:up-contracts` → `docs/up/06-contracts/`

---

## 🟠 Construction Phase

> ⚠️ **Tech Stack Gate:** Before any test, design class, or ORM decision is written, the technology stack must be LOCKED. The agent detects requester knowledge level from prior interactions and adapts its recommendation accordingly.

- [ ] **5W2H — Tech Stack** → `up-5w2h` analysis for stack selection → `docs/up/5w2h/5W2H-tech-stack.md`
- [ ] **Tech Stack Decision** → `/skill:up-tech-stack` → `docs/up/11-tech-stack.md` (⚠️ must be LOCKED before TDD)

> ⚠️ **TDD Gate:** The test battery uses the tool chain selected in `11-tech-stack.md`. No code or meta-code begins before tests are LOCKED.

- [ ] **5W2H — TDD** → `up-5w2h` analysis for test planning → `docs/up/5w2h/5W2H-tdd.md`
- [ ] **TDD Plan & Test Battery** → `/skill:up-tdd` → `docs/up/10-tdd-plan.md` + `docs/up/10-tests/`

> 🔍 **Design Patterns Gate:** Before writing the Design Class Diagram, research the most appropriate patterns for the system's specific problems using the design-patterns MCP server and internet research.

- [ ] **5W2H — Design Patterns** → `up-5w2h` analysis for pattern research → `docs/up/5w2h/5W2H-design-patterns.md`
- [ ] **Design Patterns Catalog** → `/skill:up-design-patterns` → `docs/up/12-design-patterns.md`
- [ ] **5W2H — Object Design** → `up-5w2h` analysis before designing → `docs/up/5w2h/5W2H-object-design.md`
- [ ] **Object Design / DCP** → `/skill:up-object-design` → `docs/up/07-dcp.md`
- [ ] **5W2H — Interface Design** → `up-5w2h` analysis before wireframing → `docs/up/5w2h/5W2H-interface-design.md`
- [ ] **Interface Design** → `/skill:up-interface-design` → `docs/up/08-interface-design.md`

> 🎨 **Design System Gate:** With agnostic wireframes complete, research and select a design system using specialized MCP tools (shadcn, radix, flyonui), then GENERATE the actual visual source code for all screens. Skipped for API-only systems.

- [ ] **5W2H — Design System** → `up-5w2h` analysis for visual design → `docs/up/5w2h/5W2H-design-system.md`
- [ ] **Design System Spec & Code Generation** → `/skill:up-design-system` → `docs/up/13-design-system.md` + `docs/up/13-ui-code/`
- [ ] **5W2H — Data Mapping** → `up-5w2h` analysis before mapping → `docs/up/5w2h/5W2H-data-mapping.md`
- [ ] **Data Model (ORM)** → `/skill:up-data-mapping` → `docs/up/09-data-model.md`

> 💻 **Implementation Gate:** All design artifacts complete. Now generate the FULL application code and ensure ALL TDD tests pass. Iteration protocol active: design gaps found must be resolved before proceeding.

- [ ] **5W2H — Implementation** → `up-5w2h` analysis for implementation strategy → `docs/up/5w2h/5W2H-implementation.md`
- [ ] **Implementation & Code Generation** → `/skill:up-implementation` → `docs/up/14-implementation/` (100% TDD green gate required)

---

## 🟢 Transition Phase

> 🚀 **Deploy Gate:** Implementation complete, all tests pass. Select target environment (homologation / pre-production / production) and deploy.

- [ ] **5W2H — Deploy** → `up-5w2h` analysis for deployment strategy → `docs/up/5w2h/5W2H-deploy.md`
- [ ] **Deploy to target environment** → `/skill:up-deploy` → `docs/up/15-deploy/` + running system
- [ ] **Post-deploy smoke tests** → health checks + primary UC verification
- [ ] **Defect resolution** → any post-deploy issues fixed and re-deployed
- [ ] **Vision alignment** → deployed system satisfies all items from `01-vision.md`

> 📚 **Documentation Gate:** With the system implemented and deployed, generate the full documentation bundle from authoritative artifacts and real execution evidence using MCP/CLI tools (for example, Mermaid diagrams rendered with `mmdc`).

- [ ] **5W2H — Documentation** → `up-5w2h` analysis for documentation generation → `docs/up/5w2h/5W2H-documentation.md`
- [ ] **Documentation Bundle Generation** → `/skill:up-documentation` → `docs/up/16-documentation/`

---

## 📊 Progress

| Phase | Total | Completed | % |
|------|-------|-----------|---|
| Inception | 4 | 0 | 0% |
| Elaboration | 8 | 0 | 0% |
| Construction | 18 | 0 | 0% |
| Transition | 7 | 0 | 0% |
| **Total** | **37** | **0** | **0%** |

> ℹ️ 5W2H analysis artifacts are saved in `docs/up/5w2h/`. Each analysis precedes and informs the corresponding UP artifact.
> 🔍 Design patterns researched via MCP server + internet before the DCD is written (`12-design-patterns.md` → `07-dcp.md`).
> 🎨 Design system researched via shadcn/radix/flyonui MCPs + internet; source code generated from agnostic wireframes.
> 💻 Implementation produces a FULLY FUNCTIONAL app with 100% TDD green gate; iteration protocol resolves design gaps.
> 🚀 Deployment requires explicit target environment selection; rollback protocol active; vision alignment verified.
> 📚 Documentation is generated from authoritative artifacts and runtime evidence; Mermaid diagrams should be rendered with `mmdc` (or equivalent) whenever available.

---

## 📝 Next Steps

1. [Describe next action]
2. [Describe next action]
