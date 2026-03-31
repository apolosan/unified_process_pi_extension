# Design Patterns Catalog — [System Name]

> **Source artifacts:** `docs/up/06-contracts/`, `docs/up/05-conceptual-model.md`, `docs/up/04-system-operations.md`
> **Tech Stack Reference:** `docs/up/11-tech-stack.md`
> **TDD Plan Reference:** `docs/up/10-tdd-plan.md`
> **5W2H Analysis:** `docs/up/5w2h/5W2H-design-patterns.md`
> **Date:** [date] | **Iteration:** [N]
> **Status:** RESEARCH COMPLETE → REVIEWED → FEEDS into `docs/up/07-dcp.md`

---

## 1. Design Problem Inventory

> Every pattern in this catalog solves a specific problem identified below. Patterns without a corresponding problem are not included.

| ID | Problem Description | Source Artifact | Category | Severity |
|---|---|---|---|---|
| DP-01 | [e.g., Multiple actors trigger the same operation; must decouple invoker from executor] | `04-system-operations.md` | Behavioral | High |
| DP-02 | [e.g., Object creation depends on type parameter at runtime] | `05-conceptual-model.md` | Creational | Medium |
| DP-03 | [e.g., N-N cascade post-conditions must notify many objects when one changes state] | `06-contracts/CONTRACT-*.md` | Behavioral | High |
| DP-04 | [e.g., Same algorithm implemented differently by multiple client types] | `03-use-cases/*.md` | Behavioral | Medium |
| DP-05 | [e.g., System requires ≥ 99.9% uptime — external service failures must be isolated] | `02-requirements.md` | Resilience | Critical |
| DP-06 | [e.g., Data access must be abstracted from persistence layer for testability] | `11-tech-stack.md` | Integration | High |

---

## 2. Pattern Selection Summary

| Problem ID | Selected Pattern | Category | Source of Research | Alternatives Rejected |
|---|---|---|---|---|
| DP-01 | [Pattern Name] | [GoF/Arch/Integration/Resilience] | MCP design-patterns + [search source] | [Alternative] — reason |
| DP-02 | [Pattern Name] | | | |
| DP-03 | [Pattern Name] | | | |
| DP-04 | [Pattern Name] | | | |
| DP-05 | [Pattern Name] | | | |
| DP-06 | [Pattern Name] | | | |

---

## 3. Architectural Pattern Decision

### Selected Architecture: [Pattern Name]

> **Research source:** [MCP query / search URL / web-fetch URL]

| | |
|---|---|
| **Pattern** | [e.g., Hexagonal Architecture / Clean Architecture / Layered Architecture] |
| **Justification** | [Why this architecture fits the system's NFRs, scale, and tech stack] |
| **Layer structure** | [Describe the layers: Domain / Application / Infrastructure / UI] |
| **Dependency rule** | [Which direction dependencies must flow] |
| **Tech stack fit** | [How the chosen framework implements this architecture] |
| **Alternative considered** | [What else was researched and why rejected] |

**Architecture Diagram:**
```
[Layer N] ──depends on──> [Layer N-1] ──depends on──> [Layer N-2]
[UI/Presentation]  →  [Application Services]  →  [Domain]
                   ↓
            [Infrastructure / Persistence]
```

---

## 4. GoF Pattern Details

---

### Pattern: [Pattern Name] (solves DP-NN)

**MCP Research:**
```
Query: design_patterns_find_patterns({ query: "[problem description]" })
Pattern ID returned: [ID]
Pattern name: [Name]
Category: [Creational / Structural / Behavioral]
```

**Intent:**
> [One-sentence intent from research, not training data]

**Problem in This System:**
> [Specific reference to DP-NN: describe the exact scenario from the artifacts]

**When to Apply (in this system):**
- [Specific class or method from the conceptual model or contracts where this pattern applies]
- [Trigger condition: when does this pattern activate?]

**Implementation in [Language/Framework from Stack]:**

```[language]
# [Pattern Name] — idiomatic implementation in [language]
# Sourced from: [URL or context7 result]

[implementation skeleton — interfaces, abstract classes, or function signatures]
[IMPORTANT: language-idiomatic, not abstract GoF diagram]
```

**GRASP Integration:**
| GRASP Pattern | Relationship |
|---|---|
| Information Expert | [How this pattern relates to IE assignments] |
| Creator | [If pattern affects object creation] |
| Controller | [If pattern affects operation coordination] |

**TDD Strategy (from `10-tdd-plan.md`):**
```
# How to test this pattern without coupling to implementation:
Unit test: [test the behavior through the interface/contract, not the implementation class]
Mock strategy: [which dependencies to mock and why]
Test boundary: [what to assert — observable behavior, not internal structure]
```

**Trade-offs:**
| Benefit | Cost |
|---|---|
| [Specific benefit for this system] | [Specific cost / complexity introduced] |

**Do NOT use this pattern if:**
- [Specific condition that would make a simpler approach better]

---

### Pattern: [Pattern Name] (solves DP-NN)

[Repeat the above structure for each selected pattern]

---

## 5. Integration Patterns (Data Access)

### Data Access Pattern: [Repository / Data Mapper / Active Record]

**Problem:** DP-NN — [data access problem description]

**Research:**
```
Query: design_patterns_find_patterns({ query: "data access abstraction testability ORM" })
Supplemented by: /skill:context7 → "[ORM from stack] repository pattern"
Source URL: [url]
```

**Chosen pattern:** [Repository / Data Mapper / Active Record]

**Justification:**
> [Why this data access pattern fits the system's complexity and the chosen ORM]

| Approach | When to Use | Fits This System? |
|---|---|---|
| Active Record | Simple CRUD, tight coupling to DB is acceptable | [Yes/No — why] |
| Data Mapper | Complex domain, strict separation of domain and persistence | [Yes/No — why] |
| Repository | Testable data access, ORM-agnostic domain | [Yes/No — why] |

**Implementation in [ORM/Stack]:**
```[language]
# Repository implementation in [language] + [ORM]
# Sourced from: [URL]

[interface definition]
[concrete implementation skeleton]
```

**Unit of Work (if applicable):**
```[language]
# Unit of Work implementation — coordinates multiple repository operations
[implementation skeleton]
```

---

## 6. Resilience Patterns (if availability NFR exists)

### Resilience Pattern: [Circuit Breaker / Retry / Bulkhead]

**NFR Source:** `02-requirements.md` — [NFR-NN: availability/reliability requirement]

**Research:**
```
Query: /skill:brave-search → "circuit breaker [language/framework] [YEAR] production library"
Source URL: [url]
Library found: [library name + version]
```

| Pattern | Problem It Solves | Library in Stack | Applied Where |
|---|---|---|---|
| Circuit Breaker | Prevents cascade failures when external service is down | [library] | [class/operation] |
| Retry | Handles transient failures with exponential backoff | [library] | [class/operation] |
| Bulkhead | Isolates failures in one component from propagating | [library] | [class/operation] |
| Timeout | Prevents indefinite blocking on slow operations | [library] | [class/operation] |

**Implementation:**
```[language]
# Sourced from: [URL]
[resilience pattern implementation]
```

---

## 7. Idiomatic Patterns for [Language/Framework]

> Patterns specific to the chosen language/framework that were discovered through research.

**Research:**
```
Query: /skill:context7 → "[language] idiomatic patterns [specific area]"
Query: /skill:brave-search → "[language] [framework] design patterns [YEAR] best practices"
Sources: [list URLs]
```

| Idiomatic Pattern | Language Feature | Applied Where | Source |
|---|---|---|---|
| [e.g., Context Manager] | [e.g., Python `with` statement] | [class/operation] | [URL] |
| [e.g., Dependency Injection] | [e.g., Spring @Autowired / FastAPI Depends] | [class] | [URL] |
| [e.g., Decorator] | [e.g., Python @decorator syntax] | [method] | [URL] |

---

## 8. Pattern Application Map

> Maps each pattern to the specific area of the Design Class Diagram (DCD) where it will be applied. This is the bridge between this catalog and `docs/up/07-dcp.md`.

| DCD Area / Class | Pattern Applied | Pattern Role | Notes |
|---|---|---|---|
| [e.g., `OrderService` (Controller)] | Command | Encapsulates each system operation as a command object | Allows undo, logging, queueing |
| [e.g., `DiscountCalculator`] | Strategy | Multiple discount algorithms switchable at runtime | |
| [e.g., `OrderRepository`] | Repository + Unit of Work | Abstracts persistence, coordinates transactions | |
| [e.g., `ExternalPaymentService`] | Circuit Breaker + Adapter | Isolates external payment API; normalizes interface | |
| [e.g., Object creation in `OrderFactory`] | Factory Method | Decouples Order subtype creation from controller | |

---

## 9. Patterns NOT Applied (Considered and Rejected)

> Documents the research process and ensures future developers understand why certain patterns were not chosen.

| Pattern | Problem Considered For | Rejection Reason |
|---|---|---|
| [Pattern] | [DP-NN] | [Too complex for problem scale / Not idiomatic for stack / Problem better solved by simpler approach] |
| [Pattern] | [DP-NN] | |

---

## 10. New Patterns Discovered by Research

> Patterns not in the agent's training data that were found through research.

| Pattern Name | Discovered Via | Maturity | Applied? | Decision |
|---|---|---|---|---|
| [e.g., Outbox Pattern] | brave-search: "reliable event publishing [YEAR]" | Stable | [Yes/No] | [Reason] |

---

## 11. Research Evidence Log

| Pattern Selected | MCP Query Used | Internet Query Used | Source URL | Date |
|---|---|---|---|---|
| [Pattern] | `design_patterns_find_patterns({query: "..."})` | [search query] | [url] | [date] |

---

## 12. Handoff to Object Design

> Key decisions that `up-object-design` must incorporate.

- [ ] Architectural pattern [Name] defines the layer structure of the DCD
- [ ] All DP-NN patterns listed in Section 4 must appear as stereotypes or notes in the DCD
- [ ] Repository interfaces in Section 5 define the persistence boundary
- [ ] Resilience patterns in Section 6 apply at the service boundary layer
- [ ] Idiomatic patterns in Section 7 define class/method conventions

> ✅ When this catalog is complete, execute `/skill:up-object-design` — pass this document as context.
