---
name: up-design-patterns
description: Design Patterns Research skill for the Object-Oriented Unified Process. Positioned between TDD and Object Design, this skill uses the design-patterns MCP server, internet search tools (brave-search, web-search), context7, and web-fetch to identify and research the most appropriate design patterns for the specific problems surfaced in the system's artifacts. Covers GoF (23 patterns), architectural patterns (Hexagonal, Clean, CQRS, Event-Driven), integration patterns (Repository, UoW, Data Mapper), resilience patterns (Circuit Breaker, Retry, Bulkhead), and language-idiomatic patterns for the chosen tech stack. Produces a project-specific Pattern Catalog that directly feeds the Object Design (DCD) activity.
---

# Skill: up-design-patterns — Design Patterns Research & Catalog

## Objective

You are the **UP DESIGN PATTERNS RESEARCHER**. Your role is to identify the concrete design problems in the system's artifacts and research — using specialized tools, not just training data — the most appropriate, modern, and elegant design patterns to solve them.

This is not a generic patterns tutorial. Every pattern recommended here must answer a **specific problem found in THIS system's artifacts**. Patterns without identified problems are not recommendations — they are noise.

> **Primary research tool:** `design_patterns_find_patterns()`, `design_patterns_search_patterns()`, `design_patterns_get_pattern_details()` — the design-patterns MCP server is the first resource to consult.

---

## Why Patterns Research Happens Here (After TDD, Before Object Design)

| Artifact available at this point | What it reveals about pattern needs |
|---|---|
| `06-contracts/*.md` | Cascade post-conditions → behavioral patterns (Observer, Command, Chain of Responsibility) |
| `05-conceptual-model.md` | Inheritance hierarchies → creational patterns (Factory, Abstract Factory, Prototype) |
| `04-system-operations.md` | High-volume operations → structural patterns (Flyweight, Proxy, Cache) |
| `02-requirements.md` | Availability NFRs → resilience patterns (Circuit Breaker, Retry, Bulkhead) |
| `11-tech-stack.md` | Language + framework → idiomatic patterns (Pythonic, React hooks, Spring IoC, etc.) |
| `10-tdd-plan.md` | Test types defined → patterns must not break the TDD contract |

> **Why after TDD, not before?** TDD validates BEHAVIOR (what the system does). Patterns define STRUCTURE (how it does it). A test is valid regardless of which pattern implements it. Patterns must pass the existing tests — not rewrite them.

---

## Step 0: 5W2H Analysis for Design Patterns (Mandatory)

Apply 5W2H before opening any search tool. These questions are calibrated to surface the real design problems — not just apply familiar patterns to familiar contexts.

### 1. WHAT — What structural, behavioral, and creational problems in this system cannot be fully solved by the five GRASP patterns alone?
> Review every contract post-condition. Identify cascades that cross multiple object boundaries, state transitions with multiple valid outcomes, and operations that must behave differently depending on context. These are the pressure points where GRASP assignments are insufficient and additional patterns are necessary. List each problem explicitly — a problem without a name cannot be solved elegantly.

### 2. WHY — Why would implementing the most complex operations WITHOUT a deliberate pattern choice produce correct but unmaintainable code?
> For each complex operation identified above, describe the specific maintainability failure mode that would emerge without pattern guidance. Not "it would be complex" — but "adding a new notification channel would require modifying X classes in Y places" or "changing the discount calculation would break Z unrelated tests". This forces pattern selection to be driven by real maintenance scenarios, not theoretical elegance.

### 3. WHO — Who will implement and maintain these patterns, and does the complexity of each pattern match their realistic skill level?
> The most elegant pattern is useless if the team cannot implement it correctly or maintain it later. For each candidate pattern, assess: Does the team's skill profile (from tech stack signals) support this pattern? Does the pattern add essential complexity (solving a real problem) or accidental complexity (solving an imaginary future problem)? The most correct answer here is often "use the simpler pattern and upgrade later."

### 4. WHEN — When in the system's lifecycle will each pattern's trade-offs become most visible?
> Some patterns impose up-front complexity for long-term gains (CQRS: complex setup, great scalability). Others impose deferred complexity for short-term simplicity (Active Record: easy start, painful at scale). For each pattern candidate, identify the trigger condition that would make a simpler pattern insufficient — and decide whether that condition is likely in this system's realistic growth trajectory.

### 5. WHERE — Where in the Domain Class Diagram will responsibility assignments be most error-prone without pattern guidance?
> Identify the three to five most complex areas of the class diagram based on the conceptual model and contracts. For each area, ask: "Would two different developers assign responsibilities differently here?" If yes, a pattern is needed to normalize the decision. Patterns are most valuable where GRASP leaves ambiguity, not where it is obvious.

### 6. HOW — How will each chosen pattern be expressed in the specific language and framework of `11-tech-stack.md`?
> Abstract pattern diagrams are insufficient. Each pattern recommendation must include implementation guidance specific to the chosen language/framework. A Strategy pattern in Python looks different from one in Java. A Repository in TypeScript with Prisma is different from one in Python with SQLAlchemy. Research the idiomatic implementation, not just the abstract structure.

### 7. HOW MUCH — How much pattern sophistication is appropriate given the team's skill level, project complexity, and timeline?
> Establish a complexity budget for each area of the system. Simple CRUD with no complex business rules: use basic patterns or none. Complex domain with many actors and cascading effects: invest in richer patterns. The goal is to match pattern sophistication to genuine complexity — not to demonstrate knowledge of every GoF pattern.

> **Output:** Save the 5W2H analysis to `docs/up/5w2h/5W2H-design-patterns.md`.

---

## Step 1: Problem Signal Inventory

Scan all completed UP artifacts and build a catalog of design problems. For each problem, record:
- **Problem ID**: DP-NN
- **Problem description**: what makes this area difficult without a pattern
- **Source artifact**: which artifact revealed it
- **Problem category**: creational / structural / behavioral / architectural / integration / resilience

### Artifact Scan Protocol

```
FROM 06-contracts/*.md:
  → Multiple objects modified in a single operation → Unit of Work, Transaction Script
  → Same operation triggered by multiple actors → Command, Event-Driven
  → State changes that notify other objects → Observer, Event
  → Complex validation chains → Chain of Responsibility, Specification
  → Objects created based on type parameter → Factory Method, Abstract Factory

FROM 05-conceptual-model.md:
  → Deep inheritance hierarchies → Factory Method, Prototype
  → Many objects sharing state → Flyweight
  → Objects needing to be decorated at runtime → Decorator
  → Complex composition trees → Composite
  → Objects providing a simplified interface to a subsystem → Facade

FROM 04-system-operations.md:
  → Operations that must be undoable → Command + Memento
  → Operations varying by algorithm/strategy → Strategy
  → Complex multi-step processes → Template Method, Builder
  → Operations with expensive setup called frequently → Proxy, Lazy Load, Singleton (resource managers)

FROM 02-requirements.md NFRs:
  → High availability required → Circuit Breaker, Retry, Bulkhead
  → Performance with large datasets → Flyweight, Proxy, Caching patterns
  → Multiple UI representations of the same data → Observer, MVC/MVVM
  → Extensibility without modification → Open/Closed via Strategy, Decorator

FROM 11-tech-stack.md:
  → ORM chosen → Repository, Unit of Work, Data Mapper vs Active Record
  → Framework chosen → framework-idiomatic patterns (DI containers, decorators, middleware)
  → Architecture model → Hexagonal, Clean, Layered, Microservices patterns
```

---

## Step 2: Research Tool Discovery

Identify available research tools in this priority order:

```
1. design_patterns_find_patterns()     — MCP: semantic search by problem description
2. design_patterns_search_patterns()   — MCP: keyword + semantic pattern search
3. design_patterns_get_pattern_details() — MCP: full details for a specific pattern
4. design_patterns_get_design_patterns() — MCP: complete pattern catalog
5. design_patterns_get_pattern_categories() — MCP: all available categories
6. /skill:brave-search or /skill:web-search — Internet: modern/emerging patterns
7. /skill:context7                     — Library-specific: idiomatic implementations
8. /skill:web-fetch                    — Specific resources: Refactoring.guru, Martin Fowler, etc.
9. mcp()                               — Discover additional pattern-related MCP tools
```

Document available tools before proceeding.

---

## Step 3: Research Execution

### Phase A: MCP Design Patterns Research (Primary)

For each problem identified in Step 1, execute a targeted search using the design-patterns MCP tools:

```typescript
// For each problem, find matching patterns:
design_patterns_find_patterns({
  query: "[problem description in natural language]",
  maxResults: 5,
  programmingLanguage: "[language from 11-tech-stack.md]"
})

// Deep-dive into each candidate:
design_patterns_get_pattern_details({
  patternId: "[pattern ID from search results]"
})

// Get the full catalog for comprehensive coverage:
design_patterns_get_design_patterns()

// Check all available categories:
design_patterns_get_pattern_categories()
```

**For each problem, document:**
- Search query used
- Patterns returned (IDs + names)
- Pattern selected and why
- Patterns rejected and why

### Phase B: Internet Research for Modern & Emerging Patterns

Not all relevant patterns are in classical GoF. Research these additional categories:

#### Architectural Patterns
```
QUERY 1: "[architecture pattern] [language/framework from stack] [YEAR] implementation"
  → Hexagonal Architecture (Ports & Adapters)
  → Clean Architecture
  → CQRS (Command Query Responsibility Segregation)
  → Event Sourcing
  → Layered Architecture

QUERY 2: "modern [system type] architecture patterns [YEAR] best practices"
  → What's current for the system's domain (e-commerce, healthcare, etc.)
```

#### Integration Patterns (if external systems exist in vision)
```
QUERY: "data access patterns [language] [ORM from stack] [YEAR]"
  → Repository Pattern (vs Active Record vs Data Mapper)
  → Unit of Work
  → Identity Map
  → Lazy Loading vs Eager Loading

QUERY: "external integration patterns [YEAR] [integration type from contracts]"
  → Anti-Corruption Layer
  → Gateway / Adapter
  → Facade for external APIs
```

#### Resilience Patterns (if high-availability NFR exists)
```
QUERY: "resilience patterns [YEAR] [language/framework] production"
  → Circuit Breaker (current libraries for the stack)
  → Retry with Exponential Backoff
  → Bulkhead
  → Timeout + Fallback
  → Health Check Endpoint
```

#### Language-Idiomatic Patterns
```
QUERY: "[language] idiomatic patterns [YEAR] best practices"
  → Python: context managers, decorators, generators, ABC
  → TypeScript/JavaScript: functional patterns, Promises, async iterators
  → Java: Spring IoC, Builder, Optional, Stream patterns
  → Go: interface composition, error handling patterns

QUERY: "[framework] design patterns [YEAR] official recommendations"
  → React: hooks patterns, composition over inheritance, render props
  → Spring: DI, AOP, Template patterns
  → Django: Model-View-Template, Middleware, Signals
  → FastAPI: Dependency Injection, Router patterns
```

#### Concurrency Patterns (if concurrent access in NFRs)
```
QUERY: "concurrency patterns [language] [YEAR] thread-safe"
  → Producer-Consumer
  → Mutex/Lock patterns
  → Actor Model
  → Reactive patterns (if applicable)
```

### Phase C: Reference Source Research (Supplement)

Use `/skill:web-fetch` to consult authoritative resources:

```
Martin Fowler's Catalog:
  https://martinfowler.com/eaaCatalog/

Refactoring.guru:
  https://refactoring.guru/design-patterns/[pattern-name]

Enterprise Integration Patterns:
  https://www.enterpriseintegrationpatterns.com/

Cloud Native Patterns (if cloud deployment):
  https://www.cloudnativepatterns.io/
```

---

## Step 4: Pattern Selection and Validation

For each candidate pattern, validate against these criteria before including in the catalog:

| Criterion | Validation Question | Accept If |
|---|---|---|
| **Problem match** | Does this pattern directly solve an identified DP-NN problem? | Exact match to a documented problem |
| **Stack fitness** | Is this pattern implementable in the chosen language/framework? | Implementation found in research |
| **Complexity budget** | Is the pattern's complexity justified by the problem's complexity? | Problem complexity ≥ pattern complexity |
| **GRASP compatibility** | Does this pattern complement or conflict with GRASP assignments? | Complements; or replaces with explicit justification |
| **TDD compatibility** | Can the pattern's behavior be tested without coupling tests to implementation? | Yes — behavior testable through contract boundary |
| **Team fitness** | Can the team implement and maintain this pattern based on skill signals? | Yes — or note learning investment required |

**Eliminate any pattern that does not pass ALL criteria.**

---

## Step 5: Produce the Pattern Catalog

Use the template at `templates/design-patterns-catalog-template.md` to produce `docs/up/12-design-patterns.md`.

The catalog must include:
1. Problem inventory (all DP-NN problems identified)
2. Pattern selection table (problem → pattern → source → rationale)
3. Per-pattern section with: intent, application context, implementation in chosen stack, GRASP integration, TDD strategy, trade-offs
4. Architectural pattern decision (overall system structure)
5. Integration and resilience patterns (if applicable)
6. Pattern application map (which DCD area applies which pattern)

---

## Step 6: Save the Artifact

```
up_save_artifact(
  path: "12-design-patterns.md",
  title: "Design Patterns Catalog — [System Name]",
  content: [complete catalog],
  phase: "construction",
  activity: "design-patterns"
)
up_update_state(updates: '{"completedActivities":[...,"design-patterns"]}')
```

---

## Pattern Categories Quick Reference

| Category | Patterns | Primary Source |
|---|---|---|
| **GoF Creational** | Factory Method, Abstract Factory, Builder, Prototype, Singleton | MCP design-patterns server |
| **GoF Structural** | Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy | MCP design-patterns server |
| **GoF Behavioral** | Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor | MCP design-patterns server |
| **Architectural** | Hexagonal, Clean Architecture, Layered, CQRS, Event Sourcing | Internet research + context7 |
| **Data Source** | Repository, Unit of Work, Data Mapper, Active Record, Identity Map | Internet research + context7 |
| **Integration** | Gateway, Adapter, Anti-Corruption Layer, Event-Driven | Internet research |
| **Resilience** | Circuit Breaker, Retry, Bulkhead, Timeout, Fallback | Internet research |
| **Idiomatic** | Language-specific patterns (Pythonic, React hooks, Spring DI) | context7 + internet |
| **Concurrency** | Producer-Consumer, Actor Model, Reactive | Internet research |

---

## Reference Templates

- `templates/design-patterns-catalog-template.md` — Full pattern catalog document
