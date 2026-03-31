# Test Battery — [System Name] — [Test Type]

> **TDD Plan:** `docs/up/10-tdd-plan.md`
> **Test type:** [UNIT / INTEGRATION / COMPONENT / UI / E2E / PERF / LOAD / STRESS / SEC / A11Y / REG / SMOKE]
> **Source artifacts:** [list the artifacts that specified these tests]
> **Locked:** [ ] — tests below MUST NOT be modified without documenting in the Immutability Log

---

## Test Suite Overview

| Attribute | Value |
|---|---|
| Suite ID | SUITE-[TYPE]-[CONTEXT] |
| Test type | [Type] |
| Use case / operation scope | [UC-NN or OP-name] |
| Requirement source | [Functional Req ID or NFR ID] |
| Number of test cases | [N] |
| Setup required | [Describe test environment prerequisites] |
| Teardown required | [Describe cleanup after tests run] |

---

## Test Cases

### TEST-[TYPE]-[CONTEXT]-001

| Field | Value |
|---|---|
| **ID** | TEST-[TYPE]-[CONTEXT]-001 |
| **Name** | [Human-readable description of what is being tested] |
| **Type** | [Unit / Integration / E2E / etc.] |
| **Source** | [UC-NN Step X / Contract: OP-operationName post-condition 1 / NFR: response-time] |
| **Priority** | [Critical / High / Medium / Low] |
| **Immutability note** | This test may only change if [specific condition] is officially approved |

**Given** (Preconditions):
```
- [State of the system / test data / environment condition]
- [State of the system / test data / environment condition]
```

**When** (Action):
```
- [The action performed by the actor or the system call made]
```

**Then** (Expected Outcome):
```
- [Observable result 1 — maps directly to a contract post-condition or NFR criterion]
- [Observable result 2]
- [Observable result N]
```

**Negative case (if applicable):**
- Given: [invalid or boundary input]
- When: same action
- Then: [expected error / rejection / boundary behavior]

---

### TEST-[TYPE]-[CONTEXT]-002

| Field | Value |
|---|---|
| **ID** | TEST-[TYPE]-[CONTEXT]-002 |
| **Name** | [Description] |
| **Type** | [Type] |
| **Source** | [Source] |
| **Priority** | [Priority] |
| **Immutability note** | [Condition for change] |

**Given:**
```
- [Precondition]
```

**When:**
```
- [Action]
```

**Then:**
```
- [Expected outcome]
```

---

<!-- Repeat the TEST-[ID] block for every test case in this suite -->

---

## Alternative Flows and Exception Cases

> For each use case alternative or exception flow, there must be a dedicated test case.

| Flow | Test ID | Description |
|---|---|---|
| Alternative flow [N] | TEST-[TYPE]-[CONTEXT]-[SEQ] | [What makes this flow different] |
| Exception: [name] | TEST-[TYPE]-[CONTEXT]-[SEQ] | [What triggers this exception and expected system response] |

---

## Boundary Conditions

> Identify and test all boundary values — these are the most common sources of production defects.

| Condition | Value | Test ID |
|---|---|---|
| Minimum valid input | [value] | TEST-[TYPE]-[CONTEXT]-[SEQ] |
| Maximum valid input | [value] | TEST-[TYPE]-[CONTEXT]-[SEQ] |
| Just below minimum | [value] | TEST-[TYPE]-[CONTEXT]-[SEQ] |
| Just above maximum | [value] | TEST-[TYPE]-[CONTEXT]-[SEQ] |
| Empty / null input | null / "" | TEST-[TYPE]-[CONTEXT]-[SEQ] |
| Concurrent execution | [N simultaneous calls] | TEST-[TYPE]-[CONTEXT]-[SEQ] |

---

## Domain Invariants Under Test

> List the conceptual model invariants that these tests validate.

| Invariant | Concept | Test ID |
|---|---|---|
| [Description of invariant from conceptual model] | [Concept name] | TEST-[TYPE]-[CONTEXT]-[SEQ] |

---

## Test Data Fixtures

```
# Static test data used by this suite
# Format: [identifier]: [value description]

VALID_[ENTITY]:
  [attribute]: [value]
  [attribute]: [value]

INVALID_[ENTITY]:
  [attribute]: [value]   # triggers: [validation rule]
```

---

## Dependencies and Mocks

| Dependency | Type | Test Double | Notes |
|---|---|---|---|
| [External service / class / module] | [Stub / Mock / Fake / Spy] | [Mock name] | [What behavior is simulated] |

---

## Pass/Fail Summary

> To be filled in AFTER test execution (Transition phase), not before.

| Test ID | Result | Notes |
|---|---|---|
| TEST-[TYPE]-[CONTEXT]-001 | [ ] PASS / [ ] FAIL | |

---

## Defect Log

> If a test fails during Transition, record the defect here. DO NOT modify the test — investigate and fix the code.

| Test ID | Failure Date | Defect Description | Root Cause | Resolved? |
|---|---|---|---|---|
| — | — | — | — | — |
