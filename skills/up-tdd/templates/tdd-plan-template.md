# TDD Plan — [System Name]

> **Based on vision:** `docs/up/01-vision.md`
> **Requirements source:** `docs/up/02-requirements.md`
> **Contracts source:** `docs/up/06-contracts/`
> **5W2H Analysis:** `docs/up/5w2h/5W2H-tdd.md`
> **Plan date:** [date] | **Iteration:** [N]
> **Status:** DRAFT → APPROVED → LOCKED

---

## 1. Test Strategy Overview

### 1.1 System Under Test

| Attribute | Value |
|---|---|
| System name | [System name from vision] |
| Scope | [Bounded by the use cases in `02-use-case-list.md`] |
| Test coverage mandate | Requirements-driven: every use case flow, system operation, and OCL contract has at least one test |
| Test first principle | NO code or meta-code (DCP, ORM scripts, configuration) is written before this plan is LOCKED |
| Test immutability policy | Tests are immutable post-approval. Only two exceptions: inconsistency or approved requirement change |

### 1.2 Test Surface Inventory

| Artifact | Reviewed? | Test Contribution |
|---|---|---|
| `01-vision.md` | [ ] | Quality attributes, system boundaries |
| `02-requirements.md` | [ ] | Functional test categories, non-functional acceptance criteria |
| `02-use-case-list.md` | [ ] | Scenario groups (one group per UC) |
| `03-use-cases/*.md` | [ ] | Scenario flows (main, alternative, exception) |
| `04-system-operations.md` | [ ] | Contract test interfaces |
| `05-conceptual-model.md` | [ ] | Domain invariants |
| `06-contracts/*.md` | [ ] | Pre/post-condition test specifications |

### 1.3 Uncovered Gaps (from 5W2H)

> Document any requirement, behavior, or constraint that has no formal test surface below:

| Gap | Source | Decision |
|---|---|---|
| [Description of gap] | [Which artifact] | [Will be covered by / justified exclusion] |

---

## 2. Coverage Targets

| Metric | Target | Justification |
|---|---|---|
| Statement coverage | ≥ 90% | |
| Branch coverage | ≥ 85% | |
| Use case flow coverage | 100% | All flows are business commitments |
| Contract post-condition coverage | 100% | Contracts are formal specifications |
| Non-functional requirement coverage | 100% | Every NFR has a measurable test |
| E2E scenario coverage (main flows) | 100% | Production paths must always be validated |

---

## 3. Test Taxonomy

| Type | Count | Artifact Source | Status |
|---|---|---|---|
| Unit | [N] | Contracts, system operations | [ ] SPECIFIED |
| Integration | [N] | Sequence diagrams, system operations | [ ] SPECIFIED |
| Component | [N] | Use case groups | [ ] SPECIFIED |
| Frontend / UI | [N] | Interface design (`08-interface-design.md`) | [ ] SPECIFIED |
| End-to-End (E2E) | [N] | Use case main flows | [ ] SPECIFIED |
| Performance | [N] | NFRs: response time, throughput, concurrency | [ ] SPECIFIED |
| Load | [N] | NFRs: peak load scenarios | [ ] SPECIFIED |
| Stress | [N] | NFRs: beyond-peak scenarios | [ ] SPECIFIED |
| Security | [N] | Business rules, access control requirements | [ ] SPECIFIED |
| Accessibility | [N] | Usability NFRs (WCAG level: [A/AA/AAA]) | [ ] SPECIFIED |
| Regression | [N] | All use cases (permanent suite) | [ ] SPECIFIED |
| Smoke | [N] | Core use cases (highest priority) | [ ] SPECIFIED |
| Contract | [N] | System operations, integration points | [ ] SPECIFIED |
| Mutation | [N] | Unit-tested modules | [ ] SPECIFIED |
| Property-Based | [N] | Functions with broad input domains | [ ] SPECIFIED |
| Snapshot | [N] | Interface artifacts | [ ] SPECIFIED |
| **TOTAL** | **[N]** | | |

---

## 4. Test Naming Convention

```
TEST-[TYPE]-[CONTEXT]-[SEQ]
```

| Segment | Values | Example |
|---|---|---|
| TYPE | UNIT, INTG, COMP, UI, E2E, PERF, LOAD, STRESS, SEC, A11Y, REG, SMOKE, CTRCT, MUT, PROP, SNAP | `UNIT` |
| CONTEXT | UC[NN], OP-[operationName], NFR-[name] | `UC03`, `OP-createOrder`, `NFR-response-time` |
| SEQ | 001–999 | `001` |

**Full example:** `TEST-UNIT-OP-createOrder-001`

---

## 5. Test Data Strategy

| Approach | Used For | Notes |
|---|---|---|
| Static fixtures | Unit tests, component tests | Deterministic, version-controlled |
| Seeded database | Integration tests, E2E tests | Reset before each test run |
| Generated (property-based) | Property-based tests | Defined generators per type |
| Mocked external services | Integration tests with external deps | All external dependencies are mocked |

---

## 6. Test Environment Requirements

| Requirement | Value |
|---|---|
| Isolated environment | Yes — tests MUST NOT affect production data |
| Repeatable | Yes — same inputs → same results, always |
| Parallelizable | Yes — test types must be independent of each other |
| CI/CD integration | Required — test suite runs on every commit |
| Failure policy | **Zero tolerance** — any failing test blocks the pipeline |

---

## 7. Non-Functional Requirements Test Specifications

> Each non-functional requirement from `02-requirements.md` must have a measurable test below.

### 7.1 Performance

| Requirement | Acceptance Criterion | Test Type | Test ID |
|---|---|---|---|
| [NFR description] | Response time ≤ [X]ms at [P]th percentile under [N] concurrent users | PERF | TEST-PERF-[context]-001 |

### 7.2 Load

| Requirement | Acceptance Criterion | Test Type | Test ID |
|---|---|---|---|
| [NFR description] | System sustains [N] req/s for [duration] without error rate > [X]% | LOAD | TEST-LOAD-[context]-001 |

### 7.3 Security

| Requirement | Acceptance Criterion | Test Type | Test ID |
|---|---|---|---|
| Access control | Unauthorized requests return 403; no data exposed | SEC | TEST-SEC-access-001 |
| Input sanitization | All injection vectors (SQL, XSS, CSRF) produce safe responses | SEC | TEST-SEC-injection-001 |
| Session management | Sessions expire after [N] minutes of inactivity | SEC | TEST-SEC-session-001 |
| [Other NFR] | [Criterion] | SEC | TEST-SEC-[context]-001 |

### 7.4 Accessibility

| Requirement | Acceptance Criterion | Test Type | Test ID |
|---|---|---|---|
| WCAG [A/AA/AAA] | Zero WCAG violations at the specified level on all interface screens | A11Y | TEST-A11Y-[screen]-001 |

### 7.5 Reliability

| Requirement | Acceptance Criterion | Test Type | Test ID |
|---|---|---|---|
| [NFR description] | MTBF ≥ [N] hours; error recovery within [M] seconds | [type] | TEST-REG-reliability-001 |

---

## 8. Test Execution Order

```
1. Smoke tests       → Gate: if any smoke test fails, stop everything
2. Unit tests        → Gate: 100% pass required before integration
3. Integration tests → Gate: 100% pass required before component
4. Component tests   → Gate: 100% pass required before E2E
5. E2E tests         → Gate: 100% pass required before NFR tests
6. NFR tests         → (Performance, Load, Stress, Security, Accessibility — parallel)
7. Mutation tests    → Advisory: mutation score ≥ [X]% recommended
8. Regression suite  → Run on every commit post-stabilization
```

---

## 9. CI/CD Integration

| Stage | Tests Executed | Gate |
|---|---|---|
| Commit (pre-push) | Smoke + Unit | All pass |
| Pull Request | Smoke + Unit + Integration + Component | All pass |
| Merge to main | Full suite (except stress) | All pass |
| Release candidate | Full suite including stress | All pass, mutation score |
| Production deployment | Smoke only | All pass |

---

## 10. Immutability Log

> Record ALL changes to test specifications here. "We changed it because the code was different" is NOT a valid justification.

| Test ID | Change Date | Change Type | Justification | Approved By |
|---|---|---|---|---|
| — | — | — | — | — |

---

## 11. Stakeholder-Suggested Tests

> Tests suggested by product owners, domain experts, or other stakeholders.

| Suggested By | Date | Behavior to Test | Test ID | Status |
|---|---|---|---|---|
| [Role] | [date] | [Description of behavior] | [Assigned ID] | [ ] Specified |

---

## 12. Open Questions

> Questions from the 5W2H analysis that must be resolved before the test battery is locked.

| # | Question | From 5W2H | Owner | Resolved? |
|---|---|---|---|---|
| 1 | [Question] | [WHAT/WHY/WHO/WHEN/WHERE/HOW/HOW MUCH] | [Role] | [ ] |
