---
name: up-implementation
description: Implementation skill for the Object-Oriented Unified Process. The FINAL Construction activity — takes all design artifacts (DCP, contracts, ORM mapping, TDD battery, design system, design patterns catalog) and generates a complete, fully-functional application codebase. Every TDD test must pass before this activity is complete. Includes a mandatory Iteration Protocol that returns to the appropriate design activity when a test failure reveals a design gap (not a code bug). Generates backend code (API, domain, infrastructure layers), integrates frontend (design system + real data), and produces runnable database migrations. The system produced is ready for deployment.
---

# Skill: up-implementation — Complete Application Code Generation

## Objective

You are the **UP IMPLEMENTATION ENGINEER**. Your role is to transform every design artifact into a complete, fully-functional application that:

1. Implements every system operation defined in `04-system-operations.md`
2. Satisfies every OCL post-condition in `06-contracts/`
3. Passes every test in `10-tests/` and `10-tdd-plan.md` — **100% green, no exceptions**
4. Integrates the visual components from `13-ui-code/` with real backend data
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
> The actors in `02-use-case-list.md` define what the system must do. The development team defines how maintainable the code must be. Identify the tension points where user-facing correctness and developer-facing maintainability conflict — and resolve them explicitly rather than letting implementation decisions drift.

### 4. WHEN — When during implementation is it appropriate to iterate back to a design activity vs. proceeding with a local code fix?
> This is the most critical judgment call in implementation. Establish the criteria NOW, before writing code: a test fails because the OCL post-condition is ambiguous → iterate. A test fails because a method has the wrong return type → fix locally. A use case flow produces behavior the user never requested → iterate. A variable name is wrong → fix locally. The boundary between design gap and code bug must be explicit.

### 5. WHERE — Where in the codebase are the highest-risk areas that must be implemented and tested first?
> Review `06-contracts/*.md` for operations with complex cascade post-conditions. Review `02-requirements.md` for high-risk NFRs. Review `12-design-patterns.md` for patterns requiring careful integration. These high-risk areas must be implemented and tested FIRST — not last. Risk-first implementation prevents discovering fundamental problems only at 90% completion.

### 6. HOW — How will the implementation verify its own correctness continuously, not just at the end?
> Define the TDD execution order now: which tests run on every file save (unit), which run on every commit (unit + integration), which run before merge (full suite). Establish the "green gate" — no new feature is started until all existing tests are green. This prevents test debt accumulation that would make the final green-gate impossible to achieve.

### 7. HOW MUCH — How much implementation completeness is required before deployment?
> Three valid answers: (a) MVP — only the use cases explicitly marked as highest priority in `02-requirements.md` are implemented; (b) Complete — all use cases implemented, all tests passing; (c) Production-ready — all use cases + all NFR benchmarks met. Ask the requester now — or default to **Complete** if no explicit guidance was given.

> **Output:** Save 5W2H to `docs/up/5w2h/5W2H-implementation.md`.

---

## Step 1: Pre-Implementation Artifact Verification

Before writing any code, verify ALL required artifacts are available and consistent:

```
REQUIRED ARTIFACTS:
  ✓ 11-tech-stack.md (LOCKED) — language, framework, database, test tools confirmed
  ✓ 07-dcp.md — all DCD classes with methods, visibility, responsibilities
  ✓ 06-contracts/*.md — all system operations with pre/post-conditions
  ✓ 09-data-model.md — ORM mapping, table structure, relationships
  ✓ 10-tdd-plan.md (LOCKED) — test battery, coverage targets, tool chain
  ✓ 10-tests/*.md — all test specifications (unit, integration, e2e, etc.)
  ✓ 12-design-patterns.md — pattern catalog with implementation guidance
  ✓ 13-ui-code/ — design system components and tokens
  ✓ 08-interface-design.md — screen specs for frontend integration

CONSISTENCY CHECKS:
  ✓ Every system operation in 04-system-operations.md has a contract in 06-contracts/
  ✓ Every DCD class in 07-dcp.md maps to a table in 09-data-model.md
  ✓ Every contract has at least one test in 10-tests/
  ✓ Tech stack language matches the code in 13-ui-code/
```

If any check fails: run `/skill:up-orchestrator` to identify and regenerate the missing artifact before proceeding.

---

## Step 2: Implementation Architecture Setup

Based on `11-tech-stack.md` and `12-design-patterns.md`, establish the application structure:

```
docs/up/14-implementation/
├── backend/
│   ├── domain/                    # DCD classes → domain layer
│   │   ├── [Entity].ts/py/java    # One file per DCD class
│   │   └── ...
│   ├── application/               # System operations → application services
│   │   ├── [OperationName].ts     # One file per system operation
│   │   └── ...
│   ├── infrastructure/            # ORM entities, repositories, adapters
│   │   ├── repositories/          # Repository implementations from design-patterns
│   │   ├── migrations/            # Database migrations from ORM mapping
│   │   └── ...
│   └── api/                       # API endpoints (REST/GraphQL/gRPC)
│       ├── routes/                # One route file per use case group
│       └── ...
├── frontend/
│   ├── pages/ or app/             # Routes from interface-design flowchart
│   ├── components/                # From 13-ui-code/ components/
│   └── lib/
│       └── api.ts                 # API client connecting frontend to backend
└── tests/                         # Test runner configuration
    └── setup.ts                   # Test environment setup from 11-tech-stack.md
```

---

## Step 3: Implementation Order (Risk-First)

Implement in this order — highest risk and highest dependency first:

### 3.1 Database Layer (Foundation)
```
FROM 09-data-model.md:
  1. Generate ORM entities/models for each table
  2. Generate migration scripts
  3. Run migrations: validate schema is correct
  4. Seed test data fixtures from 10-tests/*.md

TESTS TO PASS AFTER THIS STEP:
  → All integration tests that test database connectivity
  → All unit tests that test entity structure
```

### 3.2 Domain Layer (Core Logic)
```
FROM 07-dcp.md:
  For each class in the DCD:
  1. Implement class with all attributes (typed, with visibility)
  2. Implement all DOING methods (execute, create, delegate)
  3. Implement all KNOWING methods (get, calculate, find)
  4. Apply design patterns from 12-design-patterns.md (Strategy, Observer, etc.)

FROM 06-contracts/*.md:
  For each system operation:
  1. Implement the pre-condition checks
  2. Implement each post-condition type:
     - Attribute modification: direct assignment with validation
     - Instance creation: factory or constructor call
     - Association creation: collection.add() or relationship.set()
     - Instance destruction: soft-delete or hard-delete per domain rules
     - Association destruction: collection.remove()
  3. Handle exceptions defined in the contract

TESTS TO PASS AFTER THIS STEP:
  → All unit tests in 10-tests/unit-tests.md
  → All component tests in 10-tests/ (if applicable)
```

### 3.3 Application Layer (Use Case Orchestration)
```
FROM 04-system-operations.md + 06-contracts/:
  For each system operation:
  1. Create application service method signature
  2. Implement orchestration logic (call domain methods in correct order)
  3. Implement transaction boundaries (Unit of Work pattern if applied)
  4. Implement error handling and exception propagation

TESTS TO PASS AFTER THIS STEP:
  → All integration tests in 10-tests/integration-tests.md
```

### 3.4 API Layer (Interface to Clients)
```
FROM 04-system-operations.md + 11-tech-stack.md:
  For each system operation:
  1. Create endpoint: method, path, request schema, response schema
  2. Map HTTP/gRPC request → application service call
  3. Map application service response → HTTP/gRPC response
  4. Implement authentication/authorization middleware from security layer tokens

TESTS TO PASS AFTER THIS STEP:
  → All contract tests in 10-tests/
  → All security tests (auth/authz scenarios)
```

### 3.5 Frontend Integration
```
FROM 13-ui-code/ + 08-interface-design.md:
  For each screen in the interface design:
  1. Copy/import component from 13-ui-code/components/screens/[Screen].tsx
  2. Replace mock data with real API calls (using 14-implementation/frontend/lib/api.ts)
  3. Connect form submissions to the corresponding API endpoint
  4. Implement navigation flows from 08-interface-design.md flowchart
  5. Apply design tokens from 13-ui-code/tokens/ to ensure visual consistency

TESTS TO PASS AFTER THIS STEP:
  → All frontend/UI tests in 10-tests/frontend-tests.md
  → All snapshot tests
```

### 3.6 End-to-End Validation
```
RUN ALL E2E TESTS from 10-tests/e2e-tests.md:
  For each main use case flow:
  1. Start the full application stack
  2. Execute the user journey from login to completion
  3. Verify all post-conditions are met in the live database
  4. Verify all UI states match the interface design
  5. Verify performance meets NFRs from 02-requirements.md

TESTS TO PASS AFTER THIS STEP:
  → All e2e tests
  → All performance tests (if environment supports load generation)
  → All accessibility tests (WCAG automated audit)
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

**Action:** Fix the code. Document in `14-implementation/DEFECT_LOG.md`. Re-run test. Never modify the test.

---

### Category B: Design Gap (iterate upstream)

> The code correctly implements what the artifact says, but the artifact is wrong or incomplete.

**Signals:**
- The test expectation reveals that the contract post-condition is ambiguous or incomplete
- Implementing a contract produces behavior the original use case never described
- A system operation cannot be implemented without information not present in any artifact
- A performance test cannot pass because the chosen architecture in `07-dcp.md` is fundamentally wrong for the NFR

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

3. EXECUTE the upstream skill to fix the artifact

4. REGENERATE all affected downstream artifacts:
   Example: if contracts change →
     - Regenerate: tdd (check if test specs need update — rare but possible if the
       contract's observable behavior fundamentally changed)
     - Regenerate: object-design (if DCD structure needs updating)
     - Regenerate: any design-patterns that reference the changed contract

5. RETURN to implementation and continue from the step that was failing
```

> **Critical rule:** No test may be modified to make it pass. If a test seems wrong, it is almost always because the artifact it validates is wrong. Fix the artifact, not the test. The only exception: if the test specification contains a logical contradiction that makes it physically impossible to pass — document this as an inconsistency and apply the Immutability Log protocol from `10-tdd-plan.md`.

---

## Step 5: Implementation Completeness Gate

Before declaring implementation complete, verify ALL of the following:

```
CODE COMPLETENESS:
  ✓ Every system operation in 04-system-operations.md has an implementation
  ✓ Every DCD class in 07-dcp.md has a corresponding code class
  ✓ Every ORM mapping in 09-data-model.md has a migration
  ✓ Every screen in 08-interface-design.md has a rendered route

TEST COMPLETENESS:
  ✓ 100% of unit tests PASS
  ✓ 100% of integration tests PASS
  ✓ 100% of E2E tests PASS (main flows)
  ✓ 100% of contract tests PASS
  ✓ 100% of frontend/UI tests PASS
  ✓ Performance tests meet SLA thresholds from 02-requirements.md
  ✓ Security tests pass (0 critical/high findings)
  ✓ Accessibility tests pass (WCAG level as specified in NFRs)
  ✓ Mutation score ≥ target from 10-tdd-plan.md (if applicable)

RUNTIME COMPLETENESS:
  ✓ Application starts with: [single start command from 11-tech-stack.md]
  ✓ All database migrations run cleanly on a fresh database
  ✓ All API endpoints return correct responses (verified by contract tests)
  ✓ Frontend renders all screens without errors
  ✓ No linting errors / type errors in the project

VISION ALIGNMENT:
  ✓ Load 01-vision.md → verify each "system MUST" item is implemented and testable
  ✓ Load 02-requirements.md → verify each FR has an implementation and each NFR is validated
  ✓ If any item is not implemented: return to the appropriate activity or document as deferred
```

---

## Step 6: Save the Artifacts

```
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

// For each generated source file:
up_save_artifact(
  path: "14-implementation/[layer]/[filename]",
  title: "Source: [filename]",
  content: [generated source code],
  phase: "construction",
  activity: "implementation"
)

up_update_state(updates: '{"completedActivities":[...,"implementation"],"currentPhase":"construction"}')
```

---

## Reference Template

- `templates/implementation-plan-template.md` — Implementation progress tracker
