# Implementation Plan — [System Name]

> **Tech Stack:** `docs/up/11-tech-stack.md`
> **DCD:** `docs/up/07-dcp.md`
> **Contracts:** `docs/up/06-contracts/`
> **TDD Plan:** `docs/up/10-tdd-plan.md`
> **Design Patterns:** `docs/up/12-design-patterns.md`
> **Design System:** `docs/up/13-ui-code/`
> **Date:** [date] | **Target completeness:** [MVP / Complete / Production-ready]

---

## Pre-Implementation Artifact Verification

| Artifact | Available? | Consistent? | Notes |
|---|---|---|---|
| `11-tech-stack.md` (LOCKED) | ✅/❌ | ✅/❌ | |
| `07-dcp.md` | ✅/❌ | ✅/❌ | |
| `06-contracts/*.md` | ✅/❌ | ✅/❌ | |
| `09-data-model.md` | ✅/❌ | ✅/❌ | |
| `10-tdd-plan.md` (LOCKED) | ✅/❌ | ✅/❌ | |
| `10-tests/*.md` | ✅/❌ | ✅/❌ | |
| `12-design-patterns.md` | ✅/❌ | ✅/❌ | |
| `13-ui-code/` | ✅/❌ | ✅/❌ | |
| `08-interface-design.md` | ✅/❌ | ✅/❌ | |

---

## System Operations Implementation Checklist

| Operation | Contract | Tests | Status | Notes |
|---|---|---|---|---|
| [operationName] | `CONTRACT-[name].md` | [N] tests | ⬜/🟡/✅/❌ | |

---

## DCD Classes Implementation Checklist

| Class | Attributes | Methods | ORM Entity | Status |
|---|---|---|---|---|
| [ClassName] | [N] | [N] | ✅/❌ | ⬜/🟡/✅/❌ |

---

## Test Suite Progress

| Test Type | Total | Passing | Failing | Skipped |
|---|---|---|---|---|
| Unit | [N] | [N] | [N] | [N] |
| Integration | [N] | [N] | [N] | [N] |
| Component | [N] | [N] | [N] | [N] |
| Frontend/UI | [N] | [N] | [N] | [N] |
| E2E | [N] | [N] | [N] | [N] |
| Performance | [N] | [N] | [N] | [N] |
| Security | [N] | [N] | [N] | [N] |
| Accessibility | [N] | [N] | [N] | [N] |
| **TOTAL** | **[N]** | **[N]** | **[N]** | **[N]** |

---

## Iteration Log

| # | Failing Test | Failure Category | Design Gap Found | Artifact Updated | Status |
|---|---|---|---|---|---|
| 1 | [test ID] | Code Bug / Design Gap | [artifact + description] | [artifact path] | ✅ Resolved |

---

## Implementation Completeness Gate

- [ ] All unit tests PASS
- [ ] All integration tests PASS
- [ ] All E2E tests PASS
- [ ] All contract tests PASS
- [ ] All frontend/UI tests PASS
- [ ] Performance tests meet SLA thresholds
- [ ] Security tests: 0 critical/high findings
- [ ] Accessibility tests: WCAG [level] compliant
- [ ] Application starts with: `[start command]`
- [ ] All database migrations run cleanly
- [ ] All items from `01-vision.md` "system MUST" are implemented
- [ ] All FRs from `02-requirements.md` have passing tests
- [ ] All NFRs from `02-requirements.md` are validated

---

## Start Command Reference

```bash
# Local development
[start dev command]

# Production-like (docker)
docker-compose up

# Run all tests
[test command]

# Run specific test type
[unit test command]
[e2e test command]
```
