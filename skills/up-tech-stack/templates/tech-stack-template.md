# Technology Stack Decision — [System Name]

> **Based on:** All UP artifacts from `docs/up/01-vision.md` through `docs/up/06-contracts/`
> **Research Report:** `docs/up/11-tech-research.md` — all decisions below are backed by verified, current sources
> **5W2H Analysis:** `docs/up/5w2h/5W2H-tech-stack.md`
> **Iteration:** [N] | **Date:** [date]
> **Status:** DRAFT → REVIEWED → **LOCKED** ⚠️ (required before TDD begins)

---

## 1. Signal Summary

### 1.1 Technology Signals Found

| Signal | Source Artifact | Type | Implication |
|---|---|---|---|
| [e.g., "must run offline on tablets"] | `01-vision.md` | Hard constraint | Frontend must be installable; PWA or native |
| [e.g., "response < 200ms at P95"] | `02-requirements.md` | NFR discriminator | Eliminates interpreted scripting for hot paths |
| [e.g., "integrate with existing ERP via REST"] | `01-vision.md` | Integration constraint | API layer is required; REST client needed |
| [e.g., no tech signals found] | all artifacts | Absence | L0 mode: full recommendation provided |

### 1.2 Requester Knowledge Level

| | |
|---|---|
| **Assessed level** | L0 — Non-technical / L1 — Semi-technical / L2 — Partial stack / L3 — Full stack |
| **Evidence** | [What was observed in the conversation / artifacts] |
| **Operation mode** | Decide / Recommend / Guide / Validate |

---

## 2. Discriminating Requirements

> These are the NFRs and constraints that eliminated or mandated specific technology choices.

| Requirement | Value | Constraint it Creates |
|---|---|---|
| Performance | [e.g., ≤ 200ms P95 at 500 concurrent users] | Statically-typed runtime or async I/O model preferred |
| Availability | [e.g., 99.9% uptime] | Managed cloud deployment with health checks + auto-restart |
| Security | [e.g., OWASP Top 10 compliance] | Security-hardened framework; no deprecated auth libraries |
| Accessibility | [e.g., WCAG AA] | Frontend framework with accessible component library |
| Deployment | [e.g., on-premises only] | No managed cloud services; containerized monolith |
| Team | [e.g., 2 developers, Python background] | Avoid operationally complex stacks |

---

## 3. Layer-by-Layer Technology Decision

### Layer 1: Backend Language & Runtime

| | |
|---|---|
| **Decision** | [Language + runtime version] |
| **Justification** | [Why this language fits the NFRs, team, and domain] |
| **Ruled out** | [What was considered and why not chosen] |

### Layer 2: Backend Framework

| | |
|---|---|
| **Decision** | [Framework name + version] |
| **Justification** | [Fit with REST/GraphQL/gRPC decision; security track record; ecosystem] |
| **API style** | REST / GraphQL / gRPC / tRPC |
| **Ruled out** | [Alternatives considered] |

### Layer 3: Frontend Paradigm

| | |
|---|---|
| **Decision** | SPA / SSR / MPA / Native Mobile / PWA / None (API-only) |
| **Justification** | [Based on interface design, accessibility NFRs, device targets] |
| **Device targets** | Web / iOS / Android / Desktop / All |
| **Ruled out** | [Alternatives considered] |

### Layer 4: Frontend Framework (if applicable)

| | |
|---|---|
| **Decision** | [Framework name + version, or N/A] |
| **Justification** | [Component model, routing, accessibility, team familiarity] |
| **Ruled out** | [Alternatives considered] |

### Layer 5: Primary Database

| | |
|---|---|
| **Decision** | [Database name + version] |
| **Type** | Relational / Document / Graph / Time-series / Key-value |
| **Justification** | [Data model shape, ACID requirements, query patterns from contracts] |
| **Ruled out** | [Alternatives considered] |

### Layer 6: Secondary Storage (if applicable)

| Purpose | Technology | Justification |
|---|---|---|
| Cache | [e.g., Redis, Memcached, N/A] | [Why / not needed] |
| Search | [e.g., Elasticsearch, Typesense, N/A] | [Why / not needed] |
| Blob storage | [e.g., S3-compatible, N/A] | [Why / not needed] |
| Message queue | [e.g., RabbitMQ, Kafka, N/A] | [Why / not needed] |

### Layer 7: ⭐ Testing Tool Chain (Required for TDD)

> These tools will be referenced in every TDD test specification. They must be locked before TDD begins.

| Test Type | Tool | Version | Notes |
|---|---|---|---|
| **Unit** | [e.g., pytest / Jest / JUnit] | [version] | Primary unit testing framework |
| **Integration** | [e.g., Testcontainers + pytest] | [version] | DB test harness |
| **Component** | [e.g., pytest + factory_boy] | [version] | Domain component testing |
| **Frontend / UI** | [e.g., Testing Library + Vitest] | [version] | Component interaction tests |
| **End-to-End** | [e.g., Playwright] | [version] | Browser automation |
| **Performance** | [e.g., k6] | [version] | Load and stress tests |
| **Security** | [e.g., OWASP ZAP + Snyk] | [version] | DAST + SAST scanning |
| **Accessibility** | [e.g., axe-core + Playwright] | [version] | WCAG audit automation |
| **Mutation** | [e.g., Stryker / mutmut / PITest] | [version] | Mutation testing |
| **Contract** | [e.g., Pact / N/A] | [version] | Consumer-driven contract tests |
| **Snapshot** | [e.g., Jest snapshots / Percy] | [version] | UI regression snapshots |
| **CI/CD pipeline** | [e.g., GitHub Actions] | [version] | Test execution orchestration |

### Layer 8: Deployment & Infrastructure

| | |
|---|---|
| **Deployment model** | Containerized monolith / Microservices / Serverless / On-prem VM / Managed PaaS |
| **Platform** | [e.g., AWS / GCP / Azure / On-prem / Bare metal] |
| **Container runtime** | [e.g., Docker + Kubernetes / Docker Compose / N/A] |
| **Justification** | [Based on team operational capacity, vision constraints, cost] |

### Layer 9: Integration Layer (if applicable)

| | |
|---|---|
| **External integrations** | [List of external systems from vision] |
| **Integration style** | REST client / SDK / Message broker / Webhook / N/A |
| **API gateway** | [e.g., Kong / AWS API Gateway / N/A] |

### Layer 10: Security Layer

| Concern | Technology | Notes |
|---|---|---|
| **Authentication** | [e.g., JWT + bcrypt / OAuth2 / SAML] | [Justification based on security NFRs] |
| **Authorization** | [e.g., RBAC library / custom middleware] | [Role model from actors in UC catalog] |
| **Input validation** | [e.g., Pydantic / Zod / Bean Validation] | [Critical for injection prevention] |
| **Secrets management** | [e.g., HashiCorp Vault / AWS Secrets Manager / .env] | [Based on deployment model] |
| **TLS/encryption** | [e.g., Let's Encrypt / AWS ACM / self-signed internal] | |

### Layer 11: Observability

| Concern | Technology | Notes |
|---|---|---|
| **Logging** | [e.g., structlog + CloudWatch / ELK Stack] | [JSON structured logs] |
| **Metrics** | [e.g., Prometheus + Grafana / Datadog] | [Based on deployment model] |
| **Distributed tracing** | [e.g., OpenTelemetry / Jaeger / N/A] | [Only needed with distributed deployment] |
| **Error tracking** | [e.g., Sentry / Rollbar / N/A] | |

---

## 4. Compatibility Analysis

> Confirm that all layer choices work together without conflicts.

| Pair | Compatible? | Notes |
|---|---|---|
| Backend language ↔ testing framework | ✅ / ⚠️ | [Confirmation] |
| Database ↔ ORM/driver | ✅ / ⚠️ | [Confirmation] |
| Frontend framework ↔ accessibility tools | ✅ / ⚠️ | [Confirmation] |
| Deployment model ↔ database hosting | ✅ / ⚠️ | [Confirmation] |
| Security layer ↔ backend framework | ✅ / ⚠️ | [Confirmation] |

---

## 5. Alternatives Considered (for L1/L2 Requesters)

| Layer | Alternative | Why Not Chosen |
|---|---|---|
| Backend | [Alternative language/framework] | [Specific reason related to this system] |
| Database | [Alternative database] | [Specific reason related to data model] |
| Frontend | [Alternative approach] | [Specific reason related to requirements] |

---

## 6. Open Items

> Any decision that still requires requester input before this document can be locked.

| # | Question | Layer | Urgency | Default if No Answer |
|---|---|---|---|---|
| 1 | [e.g., "Do you have a preferred cloud provider?"] | Infrastructure | High | AWS (largest ecosystem) |
| 2 | [e.g., "Must the system support mobile devices?"] | Frontend | High | Web-only assumed |

---

## 7. Final Stack Summary

> Quick reference for all downstream work (TDD, Object Design, Data Mapping).

```
Backend:     [Language] [version] + [Framework] [version]
Frontend:    [Framework] [version] + [Paradigm] / N/A
Database:    [Primary DB] + [Secondary if any]
Test runner: [Unit] + [E2E] + [Perf] + [Security] + [A11Y]
Deploy:      [Platform] + [Container/model]
Auth:        [Auth strategy]
CI/CD:       [Pipeline tool]
```

---

## 8. Approval

- [ ] Requester has reviewed and approved this tech stack
- [ ] All Open Items resolved or default accepted
- [ ] Status set to **LOCKED**
- [ ] TDD plan can now reference specific testing tools

> ⚠️ This document must be LOCKED before `/skill:up-tdd` is executed. The TDD plan's testing tool chain section must reference the tools selected in Layer 7 above.
