---
name: up-implementation
description: Implementation skill for the Object-Oriented Unified Process. The FINAL Construction activity — takes all design artifacts (DCP, contracts, ORM mapping, TDD battery, design system, design patterns catalog) and generates a complete, fully-functional application codebase. Every TDD test must pass before this activity is complete. Includes a mandatory Iteration Protocol that returns to the appropriate design activity when a test failure reveals a design gap (not a code bug). Generates backend code (API, domain, infrastructure layers), integrates frontend (design system + real data), and produces runnable database migrations. The system produced is ready for deployment.
---

# Skill: up-implementation — Complete Application Code Generation

## 🔴 FUNDAMENTAL CONSTRAINT — MANDATORY

The Implementation phase **MUST** be **MANDATORILY** subdivided into **TWO ORDERED steps**:

### STEP 1: TDD — Test-Driven Development (FIRST)
> **Tests (source code) MUST be developed BEFORE any business rule code.**
>
> - Implement ALL unit, integration, and E2E tests as specified in `10-tests/*.md`
> - Implement ALL contract tests as specified in `06-contracts/*.md`
> - Implement ALL interface tests as specified in `08-interface-design.md`
> - **Tests MUST initially FAIL** (TDD Red Phase) — this is expected and correct

### STEP 2: Business Rules — Business Rule Implementation (AFTER)
> **Business rules MUST be developed AFTERWARD and submitted to TDD tests.**
>
> - Implement ALL business rules as specified in `06-contracts/*.md`
> - Implement ALL system operations as specified in `04-system-operations.md`
> - Implement ALL DCD classes as specified in `07-dcp.md`
> - **ALL business rules MUST satisfy the tests from Step 1**

### 🔑 NON-NEGOTIABLE RULES
1. **NOT ALLOWED** to develop business rules before tests
2. **NOT ALLOWED** to modify tests to "make pass" incorrect business rules
3. **BOTH steps MUST be in consonance with the ENTIRE UP development workflow**
4. **BOTH steps MUST satisfy ALL artifacts and ALL established requirements**
5. Step 1 (TDD) is a **PREREQUISITE** for Step 2 (Business Rules)

### 📁 DIRECTORY STRUCTURE CONVENTION
```
PROJECT_ROOT/                    ← Implementation artifacts go HERE (side by side with docs/)
│
├── src/ or app/               # Source code (backend/frontend)
│   ├── domain/                 # Domain layer
│   ├── application/            # Application layer
│   ├── infrastructure/          # Infrastructure layer
│   ├── api/ or controllers/     # API/Controller layer
│   └── ui/ or frontend/         # Frontend layer
│
├── tests/                      # All test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── migrations/ or db/         # Database migrations
│
├── docs/up/                    # System artifacts go HERE
│   ├── 01-vision.md
│   ├── 02-requirements.md
│   ├── 03-use-cases/
│   ├── 04-system-operations.md
│   ├── 05-conceptual-model.md
│   ├── 06-contracts/
│   ├── 07-dcp.md
│   ├── 08-interface-design.md
│   ├── 09-data-model.md
│   ├── 10-tdd-plan.md
│   ├── 10-tests/
│   ├── 11-tech-stack.md
│   ├── 12-design-patterns.md
│   └── 13-ui-code/
│
├── docs/up/14-implementation/ # ONLY documentation (logs, summaries)
│   ├── README.md
│   ├── ITERATION_LOG.md
│   └── DEFECT_LOG.md
│
├── package.json / pyproject.toml / pom.xml  # Project config
└── README.md

KEY: docs/up/ = System artifacts (design) | PROJECT_ROOT/ = Implementation artifacts (code)
```

---

## Objective

You are the **UP IMPLEMENTATION ENGINEER**. Your role is to transform every design artifact into a complete, fully-functional application that:

1. Implements every system operation defined in `docs/up/04-system-operations.md`
2. Satisfies every OCL post-condition in `docs/up/06-contracts/`
3. Passes every test in `docs/up/10-tests/` and `docs/up/10-tdd-plan.md` — **100% green, no exceptions**
4. Integrates the visual components from `docs/up/13-ui-code/` with real backend data
5. Runs locally with a single command
6. Is ready for deployment to the target environment

> **Primary rule:** The TDD test battery is the acceptance criteria. Code is DONE when ALL tests pass, not when the implementation looks complete. If a test cannot be made to pass by fixing code alone, the gap is in the design — trigger the Iteration Protocol.

---

## Step 0: 5W2H Analysis for Implementation (Mandatory)

### 1. WHAT — What is the minimum viable codebase that satisfies ALL contracts, passes ALL TDD tests, and runs in the chosen stack?
> Before writing a single line, enumerate every contract that must be implemented, every test that must pass, and every system operation that requires an endpoint. This is the implementation backlog. Nothing in this backlog is optional — every contract is a commitment made to the user.

### 2. WHY — Why might a complete and accurate set of design artifacts still produce a codebase that doesn't satisfy the original vision?
> Design artifacts describe behavior in the abstract. Implementation introduces concrete constraints: runtime performance, third-party library behavior, network latency, data volume, edge cases in business rules. Identify the top 5 areas where the abstract design is most likely to collide with concrete reality — and address those areas first.

### 3. WHO — Who is the "real user" of this codebase: the end user from the actors catalog, or the developer who will extend it?
> The actors in `docs/up/02-use-case-list.md` define what the system must do. The development team defines how maintainable the code must be. Identify the tension points where user-facing correctness and developer-facing maintainability conflict — and resolve them explicitly rather than letting implementation decisions drift.

### 4. WHEN — When during implementation is it appropriate to iterate back to a design activity vs. proceeding with a local code fix?
> This is the most critical judgment call in implementation. Establish the criteria NOW, before writing code: a test fails because the OCL post-condition is ambiguous → iterate. A test fails because a method has the wrong return type → fix locally. A use case flow produces behavior the user never requested → iterate. A variable name is wrong → fix locally. The boundary between design gap and code bug must be explicit.

### 5. WHERE — Where in the codebase are the highest-risk areas that must be implemented and tested first?
> Review `docs/up/06-contracts/*.md` for operations with complex cascade post-conditions. Review `docs/up/02-requirements.md` for high-risk NFRs. Review `docs/up/12-design-patterns.md` for patterns requiring careful integration. These high-risk areas must be implemented and tested FIRST — not last. Risk-first implementation prevents discovering fundamental problems only at 90% completion.

### 6. HOW — How will the implementation verify its own correctness continuously, not just at the end?
> Define the TDD execution order now: which tests run on every file save (unit), which run on every commit (unit + integration), which run before merge (full suite). Establish the "green gate" — no new feature is started until all existing tests are green. This prevents test debt accumulation that would make the final green-gate impossible to achieve.

### 7. HOW MUCH — How much implementation completeness is required before deployment?
> Three valid answers: (a) MVP — only the use cases explicitly marked as highest priority in `docs/up/02-requirements.md` are implemented; (b) Complete — all use cases implemented, all tests passing; (c) Production-ready — all use cases + all NFR benchmarks met. Ask the requester now — or default to **Complete** if no explicit guidance was given.

> **Output:** Save 5W2H to `docs/up/5w2h/5W2H-implementation.md`.

---

## Step 1: Pre-Implementation Artifact Verification

Before writing any code, verify ALL required artifacts are available and consistent:

```
REQUIRED ARTIFACTS (in docs/up/):
  ✓ docs/up/11-tech-stack.md (LOCKED) — language, framework, database, test tools confirmed
  ✓ docs/up/07-dcp.md — all DCD classes with methods, visibility, responsibilities
  ✓ docs/up/06-contracts/*.md — all system operations with pre/post-conditions
  ✓ docs/up/09-data-model.md — ORM mapping, table structure, relationships
  ✓ docs/up/10-tdd-plan.md (LOCKED) — test battery, coverage targets, tool chain
  ✓ docs/up/10-tests/*.md — all test specifications (unit, integration, e2e, etc.)
  ✓ docs/up/12-design-patterns.md — pattern catalog with implementation guidance
  ✓ docs/up/13-ui-code/ — design system components and tokens
  ✓ docs/up/08-interface-design.md — screen specs for frontend integration

CONSISTENCY CHECKS:
  ✓ Every system operation in docs/up/04-system-operations.md has a contract in docs/up/06-contracts/
  ✓ Every DCD class in docs/up/07-dcp.md maps to a table in docs/up/09-data-model.md
  ✓ Every contract has at least one test in docs/up/10-tests/
  ✓ Tech stack language matches the code in docs/up/13-ui-code/
```

If any check fails: run `/skill:up-orchestrator` to identify and regenerate the missing artifact before proceeding.

---

## Step 2: Implementation Architecture Setup

Based on `docs/up/11-tech-stack.md` and `docs/up/12-design-patterns.md`, establish the application structure in **PROJECT_ROOT/**:

```
PROJECT_ROOT/                          ← All implementation artifacts go HERE
│
├── src/ or app/                      # Source code (not inside docs/)
│   ├── domain/                        # DCD classes → domain layer
│   │   ├── entities/                 # Domain entities
│   │   ├── value-objects/            # Value objects
│   │   ├── services/                 # Domain services
│   │   └── [Entity].ts/py/java       # One file per DCD class
│   ├── application/                   # System operations → application services
│   │   ├── use-cases/                # Use case implementations
│   │   └── [OperationName].ts         # One file per system operation
│   ├── infrastructure/               # ORM entities, repositories, adapters
│   │   ├── persistence/              # ORM entities, repositories
│   │   ├── repositories/             # Repository implementations
│   │   └── external/                 # External service adapters
│   ├── api/ or controllers/         # API endpoints (REST/GraphQL/gRPC)
│   │   ├── routes/                   # One route file per use case group
│   │   ├── middleware/               # Auth, logging, etc.
│   │   └── dto/                     # Data transfer objects
│   └── ui/ or frontend/ or pages/   # Frontend source
│       ├── components/              # UI components
│       ├── screens/                  # Screen components
│       └── lib/                     # Utilities, API client
│
├── tests/                            # Test runner configuration (not inside docs/)
│   ├── unit/
│   │   ├── domain/
│   │   └── patterns/
│   ├── integration/
│   │   ├── database/
│   │   ├── application/
│   │   └── api/
│   ├── e2e/                          # Cypress/Playwright tests
│   └── setup.ts                     # Test environment setup
│
├── migrations/ or db/               # Database migrations
│   ├── 001_initial_schema.sql
│   └── seeds/
│
├── docs/up/                          # ONLY system artifacts (design)
│   ├── 01-vision.md
│   ├── 06-contracts/
│   ├── 07-dcp.md
│   └── ... (all other UP artifacts)
│
└── docs/up/14-implementation/       # ONLY documentation (logs, summaries)
    ├── README.md                     # Implementation summary
    ├── ITERATION_LOG.md             # Design gaps found
    └── DEFECT_LOG.md                # Code defects found
```

> **IMPORTANT:** Source code (`src/`, `tests/`, `migrations/`) is created in PROJECT_ROOT/. Only documentation and logs go in `docs/up/14-implementation/`.

---

## 🔴 STEP 1: TDD — Test-Driven Development (FIRST)

> **⚠️ FUNDAMENTAL RULE: Tests MUST be developed BEFORE any business rule code.**

### Step 3.1.1: Database Layer — TESTS FIRST (TDD Red Phase)

```
GIVEN the need to validate the database schema

WHEN ORM entities and migrations are generated

THEN the following tests MUST exist in PROJECT_ROOT/tests/ and MUST INITIALLY FAIL:
  → Database connectivity tests
  → Entity structure tests
  → Migration tests (up/down)
  → Schema constraint tests
```

Implement tests first in PROJECT_ROOT/:
```
PROJECT_ROOT/tests/integration/
├── database/
│   ├── entity-structure.test.ts   # ORM structure tests
│   ├── migration.test.ts          # Migration tests
│   └── connectivity.test.ts      # Connection tests
└── fixtures/
    └── test-data.ts               # Test data from docs/up/10-tests/*.md
```

**VERIFY:** Tests exist but FAIL (Red Phase ✅)

---

### Step 3.1.2: Domain Layer — TESTS FIRST (TDD Red Phase)

```
GIVEN the need to validate domain rules

WHEN domain tests are executed

THEN the following tests MUST exist in PROJECT_ROOT/tests/ and MUST INITIALLY FAIL:
  → Unit tests for each DOING method (execute, create, delegate)
  → Unit tests for each KNOWING method (get, calculate, find)
  → Class invariant tests
  → Applied design pattern tests
```

Implement tests first, based on `docs/up/07-dcp.md` and `docs/up/12-design-patterns.md`:
```
PROJECT_ROOT/tests/unit/
├── domain/
│   ├── [EntityName].test.ts       # Unit tests per DCD class
│   └── invariants.test.ts         # Invariant tests
└── patterns/
    ├── [PatternName].test.ts      # Tests for each applied pattern
    └── integration-patterns.test.ts
```

**VERIFY:** Tests exist but FAIL (Red Phase ✅)

---

### Step 3.1.3: Application Layer — TESTS FIRST (TDD Red Phase)

```
GIVEN the need to validate system operations

WHEN application tests are executed

THEN the following tests MUST exist in PROJECT_ROOT/tests/ and MUST INITIALLY FAIL:
  → Integration tests for each system operation
  → Transaction tests (Unit of Work)
  → Contract-defined exception tests
```

Implement tests first, based on `docs/up/04-system-operations.md` and `docs/up/06-contracts/`:
```
PROJECT_ROOT/tests/integration/
├── application/
│   ├── [OperationName].test.ts    # Tests per system operation
│   └── transaction.test.ts        # Transaction tests
```

**VERIFY:** Tests exist but FAIL (Red Phase ✅)

---

### Step 3.1.4: API Layer — TESTS FIRST (TDD Red Phase)

```
GIVEN the need to validate API endpoints

WHEN API tests are executed

THEN the following tests MUST exist in PROJECT_ROOT/tests/ and MUST INITIALLY FAIL:
  → Contract tests (request/response schema)
  → Authentication/authorization tests
  → Input validation tests
  → HTTP error code tests
```

Implement tests first, based on `docs/up/04-system-operations.md` and `docs/up/11-tech-stack.md`:
```
PROJECT_ROOT/tests/integration/
├── api/
│   ├── endpoints/
│   │   ├── [UseCaseGroup].test.ts  # Tests per use case group
│   │   └── [SpecificEndpoint].test.ts
│   ├── auth/
│   │   ├── authentication.test.ts
│   │   └── authorization.test.ts
│   └── validation/
│       └── input-validation.test.ts
```

**VERIFY:** Tests exist but FAIL (Red Phase ✅)

---

### Step 3.1.5: Frontend — TESTS FIRST (TDD Red Phase)

```
GIVEN the need to validate the user interface

WHEN frontend tests are executed

THEN the following tests MUST exist in PROJECT_ROOT/tests/ and MUST INITIALLY FAIL:
  → Screen rendering tests
  → Navigation between screens tests
  → API integration tests (with mock)
  → Component snapshot tests
```

Implement tests first, based on `docs/up/08-interface-design.md` and `docs/up/13-ui-code/`:
```
PROJECT_ROOT/tests/
├── frontend/
│   ├── screens/
│   │   ├── [ScreenName].test.tsx   # Tests per screen
│   │   └── navigation.test.tsx     # Navigation tests
│   ├── components/
│   │   └── [ComponentName].test.tsx
│   └── e2e/
│       └── [UseCaseFlow].test.ts  # E2E tests with Cypress/Playwright
```

**VERIFY:** Tests exist but FAIL (Red Phase ✅)

---

### Step 3.1.6: STEP 1 FINAL VERIFICATION (TDD)

```
STEP 1 (TDD) IS COMPLETE WHEN:
  ✅ ALL unit tests are implemented in PROJECT_ROOT/tests/
  ✅ ALL integration tests are implemented in PROJECT_ROOT/tests/
  ✅ ALL E2E tests are implemented in PROJECT_ROOT/tests/
  ✅ ALL contract tests are implemented in PROJECT_ROOT/tests/
  ✅ ALL interface tests are implemented in PROJECT_ROOT/tests/
  ✅ ALL tests FAIL (Red Phase — expected behavior)
  ✅ Business rule code has NOT been implemented yet in PROJECT_ROOT/src/

ONLY ADVANCE TO STEP 2 WHEN THIS VERIFICATION IS SATISFIED.
```

---

## 🟢 STEP 2: Business Rules — Implementation (AFTER)

> **⚠️ FUNDAMENTAL RULE: Business rules CAN ONLY be implemented AFTER Step 1 is complete.**

### Step 3.2.1: Database Layer — GREEN Phase (Implement Rules)

```
AGAIN, NOW THAT TESTS EXIST AND FAIL (Red Phase):

Implement code in PROJECT_ROOT/ that makes tests pass:
  → ORM entities/models for each table in PROJECT_ROOT/src/infrastructure/persistence/
  → Migration scripts in PROJECT_ROOT/migrations/
  → Execute migrations: validate correct schema
  → Seed test data

VERIFY: Connectivity and structure tests PASS (Green Phase ✅)
```

---

### Step 3.2.2: Domain Layer — GREEN Phase (Implement Rules)

```
NOW THAT TESTS EXIST AND FAIL (Red Phase):

For each class in the DCD (from `docs/up/07-dcp.md`):
  1. Implement class in PROJECT_ROOT/src/domain/ with all attributes (typed, with visibility)
  2. Implement all DOING methods (execute, create, delegate)
  3. Implement all KNOWING methods (get, calculate, find)
  4. Apply design patterns from `docs/up/12-design-patterns.md`

For each system operation (from `docs/up/06-contracts/*.md`):
  1. Implement pre-condition checks
  2. Implement each post-condition type:
     - Attribute modification: direct assignment with validation
     - Instance creation: factory or constructor call
     - Association creation: collection.add() or relationship.set()
     - Instance destruction: soft-delete or hard-delete per domain rules
     - Association destruction: collection.remove()
  3. Handle contract-defined exceptions

VERIFY: Domain unit tests PASS (Green Phase ✅)
```

---

### Step 3.2.3: Application Layer — GREEN Phase (Implement Rules)

```
NOW THAT TESTS EXIST AND FAIL (Red Phase):

For each system operation (from `docs/up/04-system-operations.md` + `docs/up/06-contracts/`):
  1. Create application service in PROJECT_ROOT/src/application/use-cases/
  2. Implement orchestration logic (call domain methods in correct order)
  3. Implement transaction boundaries (Unit of Work pattern if applied)
  4. Implement error handling and exception propagation

VERIFY: Application integration tests PASS (Green Phase ✅)
```

---

### Step 3.2.4: API Layer — GREEN Phase (Implement Rules)

```
NOW THAT TESTS EXIST AND FAIL (Red Phase):

For each system operation (from `docs/up/04-system-operations.md` + `docs/up/11-tech-stack.md`):
  1. Create endpoint in PROJECT_ROOT/src/api/ or PROJECT_ROOT/src/controllers/
  2. Map HTTP request → application service call
  3. Map application service response → HTTP response
  4. Implement authentication/authorization middleware

VERIFY: API tests PASS (Green Phase ✅)
```

---

### Step 3.2.5: Frontend Integration — GREEN Phase (Implement Rules)

```
NOW THAT TESTS EXIST AND FAIL (Red Phase):

For each screen in interface design (from `docs/up/13-ui-code/` + `docs/up/08-interface-design.md`):
  1. Copy/import component from `docs/up/13-ui-code/components/screens/[Screen].tsx` to PROJECT_ROOT/src/ui/
  2. Replace mock data with real API calls
  3. Connect form submissions to corresponding API endpoint
  4. Implement navigation flows from `docs/up/08-interface-design.md` flowchart
  5. Apply design tokens from `docs/up/13-ui-code/tokens/`

VERIFY: Frontend tests PASS (Green Phase ✅)
```

> ### 🎨 UI/UX DESIGN QUALITY GATE — MANDATORY (D1–D6)
>
> **During Frontend Integration, the agent MUST apply the following visual quality directives in addition to passing tests.**
> These are not decorative guidelines — they are rejection criteria. If the UI is functionally correct but visually mediocre, it is NOT done.
>
> **D1 — Component Mix (Discovery via MCP)**
> Source components from the correct layer, in this order:
> | Layer | MCP / Tool | Purpose |
> |-------|-----------|---------|
> | Structural | `shadcn_*` MCP tools | Buttons, inputs, cards, dialogs |
> | Effects | `magicuidesign-mcp`, `aceternityui` MCP tools | Backgrounds, glows, gradients, decorative |
> | Interactions | `reactbits` MCP tools | Micro-animations, hover states, transitions |
> | Icons | `lucide-icons` MCP tools | Icon set for UI consistency |
>
> **D2 — Dark Mode Sophistication (anchors — do not change)**
> The dark palette is the primary canvas. Derived from:
> - Background: `#030303` (base) → `#0a0a0a` → `#111111` → `#1a1a1a` (surface)
> - Borders: `rgba(255, 255, 255, 0.06)` subtle, `rgba(255, 255, 255, 0.12)` elevated
> - Glows: `rgba(147, 197, 253, 0.15)` blue, `rgba(167, 139, 250, 0.12)` purple
> - Text: `#FFFFFF` primary, `#a1a1aa` secondary, `#52525b` muted
>
> **D3 — Bento Grids**
> Layout MUST use modular grid composition (inspired by linear.app, plane.so). Nested cards with consistent inner padding. No uniform flat grids — variety in span (1×1, 2×1, 1×2, 2×2).
>
> **D4 — Micro-interactions (Framer Motion)**
> Every interactive element MUST have motion feedback:
> - Button press: scale(0.97) + opacity shift
> - Card hover: translateY(-2px) + shadow lift
> - Page transitions: fade + slide combinations
> - Loading states: skeleton pulse + shimmer
> - Staggered list entry: cascade delay on children
>
> **D5 — No Generic Fonts**
> Approved: `Geist Sans` (body), `Geist Mono` (code), `Clash Display` (headings)
> Rejected: `Roboto`, `Arial`, `Inter`, `Open Sans`, `Lato` — if any of these appear in the codebase, replace immediately.
>
> **D6 — Reject the Mediocre (quality gate — FINAL VERIFICATION)**
>
> Before marking Frontend Integration as complete, the agent MUST answer:
> > *"Does this UI look like something I'd show in a portfolio, or something I'd hide in a demo?"*
>
> If the answer is "hide": rewrite. Common Mediocrity Signals:
> - Flat white backgrounds with no depth or atmosphere
> - Uniform border-radius everywhere (everything 8px or 12px)
> - Single accent color used for everything
> - No hover states, no focus rings, no loading skeletons
> - Generic placeholder content (Lorem ipsum, "John Doe" in profiles)
>
> **MCP Reference — Component Discovery:**
> ```
> shadcn_get_project_registries()           → What shadcn components exist in project
> shadcn_search_items_in_registries(...)    → Find specific shadcn components
> magicuidesign_mcp_searchRegistryItems(...) → Search Magic UI registry
> aceternityui_search_components(...)       → Search Aceternity UI
> reactbits_search_components(...)           → Search ReactBits interactions
> lucide_icons_search_icons(...)            → Find icons by name/category
> ```

---

### Step 3.2.6: End-to-End Validation — GREEN Phase (Validate All)

```
NOW THAT ALL TESTS EXIST AND MOST SHOULD BE PASSING:

RUN ALL E2E TESTS from docs/up/10-tests/e2e-tests.md:
  For each main use case flow:
  1. Start the full application stack
  2. Execute user journey from login to completion
  3. Verify all post-conditions are met in the live database
  4. Verify all UI states match interface design
  5. Verify performance meets NFRs from docs/up/02-requirements.md

VERIFY: ALL E2E tests PASS (Green Phase ✅)
```

---

## Step 4: Iteration Protocol (MANDATORY)

When any test fails, determine the failure category before fixing:

### Category A: Code Bug (fix locally)
> The design artifact is correct, but the code doesn't implement it correctly.

**Signals:**
- Test expectation matches the contract post-condition
- The domain logic is correct but the code has a syntax/logic error
- A method returns the wrong type
- An off-by-one error, null pointer, or similar

**Action:** Fix the code in PROJECT_ROOT/. Document in `docs/up/14-implementation/DEFECT_LOG.md`. Re-run test. Never modify the test.

---

### Category B: Design Gap (iterate upstream)

> The code correctly implements what the artifact says, but the artifact is wrong or incomplete.

**Signals:**
- The test expectation reveals that the contract post-condition is ambiguous or incomplete
- Implementing a contract produces behavior the original use case never described
- A system operation cannot be implemented without information not present in any artifact
- A performance test cannot pass because the chosen architecture in `docs/up/07-dcp.md` is fundamentally wrong for the NFR

**Action:**

```
DESIGN GAP RESOLUTION PROTOCOL:

1. IDENTIFY the failing artifact:
   - Contract ambiguity → return to: /skill:up-contracts
   - Missing system operation → return to: /skill:up-sequence-diagrams
   - Wrong DCD structure → return to: /skill:up-object-design
   - Wrong domain concept → return to: /skill:up-conceptual-model
   - Wrong/incomplete use case → return to: /skill:up-use-cases
   - NFR impossible with current stack → return to: /skill:up-tech-stack
   - Missing pattern → return to: /skill:up-design-patterns
   - Missing visual component → return to: /skill:up-design-system

2. DOCUMENT the gap in docs/up/14-implementation/ITERATION_LOG.md:
   - Which test failed
   - Why it's a design gap (not a code bug)
   - Which artifact needs to change
   - What the change is

3. EXECUTE the upstream skill to fix the artifact (updates docs/up/)

4. REGENERATE all affected downstream artifacts:
   Example: if contracts change →
     - Regenerate: tdd (check if test specs need update)
     - Regenerate: object-design (if DCD structure needs updating)
     - Regenerate: design-patterns affected

5. RETURN to implementation and continue from the step that was failing
```

> **Critical rule:** No test may be modified to make it pass. If a test seems wrong, it is almost always because the artifact it validates is wrong. Fix the artifact, not the test.

---

## Step 5: Implementation Completeness Gate

Before declaring implementation complete, verify ALL of the following:

```
CODE COMPLETENESS (in PROJECT_ROOT/):
  ✓ Every system operation in docs/up/04-system-operations.md has an implementation in PROJECT_ROOT/src/
  ✓ Every DCD class in docs/up/07-dcp.md has a corresponding code class in PROJECT_ROOT/src/domain/
  ✓ Every ORM mapping in docs/up/09-data-model.md has a migration in PROJECT_ROOT/migrations/
  ✓ Every screen in docs/up/08-interface-design.md has a rendered route in PROJECT_ROOT/src/ui/

TEST COMPLETENESS (STEP 1):
  ✓ 100% of unit tests are implemented in PROJECT_ROOT/tests/
  ✓ 100% of integration tests are implemented in PROJECT_ROOT/tests/
  ✓ 100% of E2E tests are implemented in PROJECT_ROOT/tests/
  ✓ 100% of contract tests are implemented in PROJECT_ROOT/tests/
  ✓ 100% of frontend/UI tests are implemented in PROJECT_ROOT/tests/

GREEN (STEP 2):
  ✓ 100% of unit tests PASS
  ✓ 100% of integration tests PASS
  ✓ 100% of E2E tests PASS (main flows)
  ✓ 100% of contract tests PASS
  ✓ 100% of frontend/UI tests PASS
  ✓ Performance tests meet SLA thresholds from docs/up/02-requirements.md
  ✓ Security tests pass (0 critical/high findings)
  ✓ Accessibility tests pass (WCAG level as specified in NFRs)
  ✓ Mutation score ≥ target from docs/up/10-tdd-plan.md (if applicable)

RUNTIME COMPLETENESS:
  ✓ Application starts with: [single start command from docs/up/11-tech-stack.md]
  ✓ All database migrations run cleanly on a fresh database
  ✓ All API endpoints return correct responses (verified by contract tests)
  ✓ Frontend renders all screens without errors
  ✓ No linting errors / type errors in the project

VISION ALIGNMENT:
  ✓ Load docs/up/01-vision.md → verify each "system MUST" item is implemented and testable
  ✓ Load docs/up/02-requirements.md → verify each FR has an implementation and each NFR is validated
  ✓ If any item is not implemented: return to the appropriate activity or document as deferred
```

---

## Step 6: Save the Artifacts

```
DOCUMENTATION ARTIFACTS (go to docs/up/14-implementation/):
up_save_artifact(
  path: "14-implementation/README.md",
  title: "Implementation Summary — [System Name]",
  content: [summary of what was built, how to run it, test results],
  phase: "construction",
  activity: "implementation"
)

up_save_artifact(
  path: "14-implementation/ITERATION_LOG.md",
  title: "Iteration Log — Design Gaps Found During Implementation",
  content: [list of all design gaps found and resolved],
  phase: "construction",
  activity: "implementation"
)

up_save_artifact(
  path: "14-implementation/DEFECT_LOG.md",
  title: "Defect Log — Code Bugs Found During Implementation",
  content: [list of all code defects found and fixed],
  phase: "construction",
  activity: "implementation"
)

// NOTE: Source code files (PROJECT_ROOT/src/*.ts, PROJECT_ROOT/tests/*.ts, etc.)
// are generated directly in the project directory, NOT as UP artifacts.

up_update_state(updates: '{"completedActivities":[...,"implementation"],"currentPhase":"transition"}')
```

---

## Reference Template

- `templates/implementation-plan-template.md` — Implementation progress tracker

---

## Summary: Directory Convention

| Location | Contents | Example |
|----------|----------|---------|
| `PROJECT_ROOT/` | Implementation artifacts (code, tests, migrations) | `src/`, `tests/`, `migrations/` |
| `docs/up/` | System artifacts (design, requirements, contracts) | `07-dcp.md`, `06-contracts/` |

> **Key Insight:** `docs/up/` contains WHAT the system must do (design). `PROJECT_ROOT/` contains HOW it is built (implementation).
