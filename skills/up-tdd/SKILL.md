---
name: up-tdd
description: "Mandatory TDD (Test-Driven Development) skill for the Construction and Transition phases of the Unified Process. Generates a comprehensive, requirements-driven test battery BEFORE any code or meta-code is written. Uses 5W2H to uncover test surface completeness. All test types are covered: unit, integration, frontend, e2e, performance, security, accessibility, regression, smoke, contract, mutation, property-based, and snapshot. Tests are immutable except on confirmed inconsistency or approved requirement change."
---

# Skill: up-tdd — TDD Test Battery for UP Construction & Transition

## Objective

You are the **TDD ANALYST** for the Unified Process. Your exclusive mission is to produce a **complete, exhaustive, requirements-driven test battery** BEFORE any code (or meta-code such as DCP, ORM scripts, or configuration) is written.

Tests are the contract between the requirement specifications and the implementation. They are **immutable** — not a living document to be updated whenever the code drifts. They are the **law that code must obey**.

---

## The Five Iron Rules of TDD in the UP Context

| # | Rule | Consequence of Violation |
|---|---|---|
| 1 | **Tests first, code never before** | Code written before tests is untestable by definition and invalidates the TDD contract |
| 2 | **Tests validate requirements, not implementations** | A test coupled to an implementation detail is worthless — it will pass even when the requirement is broken |
| 3 | **Tests are immutable** | Changing a test to make it pass hides a defect or signals a real requirement change (which requires approval) |
| 4 | **All test types must be covered** | Partial test coverage creates a false sense of security worse than no test plan at all |
| 5 | **Non-functional requirements are testable** | "The system must be fast" is not a test. "Response time ≤ 200ms for 95th percentile under 500 concurrent users" is |

---

## Step 0: 5W2H Analysis for Test Planning (Mandatory)

Before writing a single test case, apply the 5W2H framework to surface hidden test surface, gaps, and risks.

Ask and document answers to ALL seven questions:

### 1. WHAT — What behaviors does the system formally guarantee vs. merely implement?
> Dig into every Use Case, Contract, and OCL post-condition. For each one, ask: "Is there a test that would FAIL today if this behavior were removed?" If not, the behavior is unprotected and may silently disappear during refactoring.

### 2. WHY — Why do some requirements systematically resist being expressed as automated, failing tests?
> Some requirements feel too "fuzzy" to test: "the system must be user-friendly", "the UI must be responsive", "the process must be secure". The reason is not that they are untestable — it is that no one has defined their measurable acceptance criteria yet. Find these and force a definition.

### 3. WHO — Who holds the authority to certify that a test failure is a real defect vs. an outdated expectation?
> Identify the approval process for test mutation. If no one "owns" the test battery, tests will be modified silently to pass failing code. Establish now: which stakeholder role must approve any change to a test specification?

### 4. WHEN — When does a passing test become a false assurance?
> A test passes today. Under what future conditions will it silently become irrelevant? Identify all temporal assumptions embedded in the test data, test state, test environment, or acceptance criteria — before they silently expire.

### 5. WHERE — Where in the architecture will unit/integration boundaries be ambiguous enough to produce contradictory test coverage claims?
> Draw the system layers from the DCP (if available) or the Conceptual Model. For every boundary between layers, ask: "Can both the unit test and the integration test for this boundary pass while the actual feature is broken?" If yes, the boundary is a coverage gap.

### 6. HOW — How will each non-functional requirement be expressed as an executable, initially-failing test?
> Take every non-functional requirement from `docs/up/02-requirements.md`. For each one, write the measurable acceptance criterion and the test type that will verify it. Performance → load test with SLA threshold. Security → penetration/scan test with zero-finding criterion. Accessibility → WCAG compliance audit. Reliability → mean-time-between-failures target. Usability → task completion rate under time limit.

### 7. HOW MUCH — How much of the system's correctness rests on tacit knowledge that no current test captures?
> Survey everyone who contributed to the use cases, contracts, and conceptual model. Ask: "What would make you say 'the system is broken' that you haven't written down anywhere?" These answers are the most important tests to write — and the hardest to surface without this question.

> **Output:** Save the 5W2H analysis to `docs/up/5w2h/5W2H-tdd.md` using `up_save_artifact` before proceeding.

---

## Step 1: Inventory the Test Surface

Load and review all completed artifacts:

| Artifact | What it contributes to the test surface |
|---|---|
| `01-vision.md` | System boundaries, key stakeholder expectations, quality attributes |
| `02-requirements.md` | Functional requirements (each = test category), non-functional (each = measurable criterion) |
| `02-use-case-list.md` | Full list of use cases = full list of scenario groups |
| `03-use-cases/*.md` | Main flows, alternative flows, exception flows — each = a test scenario |
| `04-dss/*.md` | System operation signatures = unit/integration test interfaces |
| `04-system-operations.md` | Complete list of system operations = contract test targets |
| `05-conceptual-model.md` | Concepts with attributes/relationships = domain model invariant tests |
| `06-contracts/*.md` | Pre/post-conditions per operation = the most precise test specifications |
| `06-contracts-summary.md` | Cross-operation consistency constraints = integration test dependencies |

> **Rule:** Every Use Case flow, every system operation, and every OCL contract **must have at least one test case**. Gaps must be documented and justified.

---

## Step 2: Define the Test Strategy

### 2.1 Test Types Required (ALL must be addressed)

| Type | Purpose | Source in UP Artifacts |
|---|---|---|
| **Unit** | Isolate a single class/method; validate one contract post-condition | Contracts, DCP methods |
| **Integration** | Validate collaboration between two or more classes/modules | System operations, sequence diagrams |
| **Component** | Test a self-contained domain component (e.g., Order subsystem) | Use case groups |
| **Frontend / UI** | Validate interface behavior: navigation, form validation, feedback | Interface design (`08-interface-design.md`) |
| **End-to-End (E2E)** | Simulate complete user journey from first interaction to outcome | Main flow of each use case |
| **Performance** | Validate SLAs: response time, throughput, concurrency | Non-functional requirements |
| **Load** | Verify behavior under expected peak load | Non-functional requirements |
| **Stress** | Find breaking point under beyond-peak load | Non-functional requirements |
| **Security** | Validate access control, input sanitization, session management | Business rules, security requirements |
| **Accessibility** | Validate WCAG compliance level (A, AA, AAA) | Usability requirements |
| **Regression** | Detect breakage of existing features when new code is added | All use cases (permanent suite) |
| **Smoke** | Minimal sanity check that critical paths are alive after deployment | Core use cases (highest priority) |
| **Contract** | Validate API/interface contracts between components | System operations, integration points |
| **Mutation** | Verify that tests detect code defects (kill all mutants) | Any unit-tested module |
| **Property-Based** | Generate random inputs to find edge cases | Any function with a broad input domain |
| **Snapshot** | Capture and lock UI or output structure against unintended changes | Interface artifacts |

> **Mandatory minimum:** Unit, Integration, E2E, and one non-functional type (performance, security, or accessibility) must be present for EVERY system. The others must be justified as "not applicable" if excluded.

### 2.2 Coverage Targets

Define coverage targets **before writing tests**, not after running them:

| Target | Minimum | Recommended |
|---|---|---|
| Statement coverage | 80% | 95% |
| Branch coverage | 75% | 90% |
| Use case flow coverage | 100% | 100% |
| Contract post-condition coverage | 100% | 100% |
| Non-functional requirement coverage | 100% | 100% |
| E2E scenario coverage (main flows) | 100% | 100% |

---

## Step 3: Write the TDD Plan

Use the template at `templates/tdd-plan-template.md` to create `docs/up/10-tdd-plan.md`.

The TDD Plan must include:
- Test strategy overview
- Test surface inventory (all artifacts reviewed)
- Coverage targets
- Test taxonomy with counts per type
- Test naming convention
- Test data strategy (static fixtures vs. generated vs. seeded)
- Test environment requirements
- Test execution order and CI/CD integration
- Immutability policy and change approval process
- Stakeholder-suggested tests log

---

## Step 4: Write the Test Battery

For each test case, use the structure in `templates/test-battery-template.md`:

```
TEST-[TYPE]-[UC/OP]-[SEQ]
```

Examples:
- `TEST-UNIT-createOrder-001` — Unit test for createOrder operation
- `TEST-E2E-UC03-PlaceOrder-001` — E2E test for UC03 main flow
- `TEST-PERF-checkout-001` — Performance test for checkout scenario

Each test case must specify:
- **ID** and **Name**
- **Type** (unit / integration / e2e / etc.)
- **Source** (which Use Case, Contract, or Requirement it validates)
- **Given** (preconditions and test data)
- **When** (action performed)
- **Then** (expected outcome — must match the contract post-condition or requirement criterion)
- **Immutability note** (what would justify changing this test)

---

## Step 5: Stakeholder-Suggested Tests Protocol

The requester (product owner, domain expert, or stakeholder) MAY suggest tests. This is acceptable and valuable when:
- The suggestion is within the project scope
- The behavior being tested is not already covered
- The test can be expressed in Given/When/Then format

Document all stakeholder-suggested tests in a dedicated section of the TDD plan, with:
- Suggested by: [role]
- Rationale: why this behavior matters to the business
- Test case ID: assigned and tracked like any other test

> **Important:** Stakeholder-suggested tests are subject to the same immutability rules as all other tests.

---

## Step 6: Test Immutability Enforcement

Tests are **immutable** after approval. The only two exceptions:

| Exception | Trigger | Required Action |
|---|---|---|
| **Inconsistency** | The test specification contains a logical contradiction or references a non-existent system operation | Document the inconsistency → notify the artifact owner → fix the source artifact → update the test with approval |
| **Requirement Change** | A stakeholder formally approves a change to a use case, contract, or non-functional requirement | Document the change in `docs/up/02-requirements.md` → reference the change in the test → update with full justification |

> **Forbidden:** Changing a test because "the code is different now" — this is the exact scenario tests are designed to detect.

---

## Step 7: Save the Artifacts

Save all TDD artifacts using `up_save_artifact` and `up_update_state`:

```
docs/up/5w2h/5W2H-tdd.md          # 5W2H analysis for testing
docs/up/10-tdd-plan.md             # Master TDD plan
docs/up/10-tests/                  # Individual test battery files
  ├── unit-tests.md                # All unit test specifications
  ├── integration-tests.md         # All integration test specifications
  ├── e2e-tests.md                 # All E2E test specifications
  ├── frontend-tests.md            # All frontend/UI test specifications
  ├── performance-tests.md         # All performance test specifications
  ├── security-tests.md            # All security test specifications
  ├── accessibility-tests.md       # All accessibility test specifications
  └── stakeholder-tests.md         # Stakeholder-suggested tests
```

---

## TDD and the UP Activity Flow

```
contracts → [TDD: write full test battery] → object-design → interface-design
                      ↑                             ↓
              Tests define what                  Code written
              must be true after                 to make tests
              implementation                     pass (RED→GREEN)
```

**Construction phase:** Write tests based on contracts and use cases. Then design (DCP) objects to satisfy those tests.

**Implementation phase:** Execute the battery continuously while the system is being built. Any failure is either a code defect or evidence of an upstream design gap.

**Transition phase:** After deployment, execute smoke tests and environment-specific verification against the deployed system. The full battery must already be green before `/skill:up-deploy` begins.

---

## Reference Artifacts

- `templates/tdd-plan-template.md` — Master TDD plan template
- `templates/test-battery-template.md` — Individual test suite template
