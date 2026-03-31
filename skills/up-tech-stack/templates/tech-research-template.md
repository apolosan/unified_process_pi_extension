# Technology Research Report — [System Name]

> **Research date:** [date] | **Performed by:** AI Agent (UP Technology Advisor)
> **Research scope:** [which layers were prioritized and why — based on discriminating NFRs]
> **Status:** IN PROGRESS → COMPLETE → Feeds into `docs/up/11-tech-stack.md`

---

## Research Tool Inventory

| Tool | Available? | Used For |
|---|---|---|
| `/skill:brave-search` | ✅ / ❌ | [Primary search — recent news, benchmarks, CVEs] |
| `/skill:web-search` | ✅ / ❌ | [Fallback search] |
| `/skill:web-fetch` | ✅ / ❌ | [Specific URLs — changelogs, CVE pages, release notes] |
| `/skill:context7` | ✅ / ❌ | [Library docs — API references, versioning] |
| MCP / CLI tools | [list or N/A] | [GitHub API, npm stats, PyPI, Maven, etc.] |
| **Fallback mode active?** | YES / NO | If YES: all recommendations are tagged `⚠️ [TRAINING DATA]` |

---

## Research Priority Map

| Layer | Priority | Reason | Target Sources |
|---|---|---|---|
| 1. Backend Language | 🔴/🟠/🟡/🟢 | [NFR or domain reason] | [N] |
| 2. Backend Framework | 🔴/🟠/🟡/🟢 | | |
| 3. Frontend Paradigm | 🔴/🟠/🟡/🟢 | | |
| 4. Frontend Framework | 🔴/🟠/🟡/🟢 | | |
| 5. Primary Database | 🔴/🟠/🟡/🟢 | | |
| 6. Secondary Storage | 🔴/🟠/🟡/🟢 | | |
| 7. Testing Toolchain | 🔴 Critical (always) | TDD requires current tool knowledge | 2+ per type |
| 8. Deployment | 🔴/🟠/🟡/🟢 | | |
| 9. Integration | 🔴/🟠/🟡/🟢 | | |
| 10. Security Layer | 🔴/🟠/🟡/🟢 | | |
| 11. Observability | 🔴/🟠/🟡/🟢 | | |

---

## Executive Research Summary

| Layer | Primary Candidate | Research Verdict | Flags |
|---|---|---|---|
| 1. Backend Language | [candidate] | ✅ Confirmed / ⚠️ Revised / 🚨 Issue | [any flag] |
| 2. Backend Framework | [candidate] | | |
| 3. Frontend Paradigm | [candidate] | | |
| 4. Frontend Framework | [candidate] | | |
| 5. Primary Database | [candidate] | | |
| 6. Secondary Storage | [candidate] | | |
| 7. Unit Test Framework | [candidate] | | |
| 7. E2E Test Framework | [candidate] | | |
| 7. Load Test Tool | [candidate] | | |
| 7. Security Test Tool | [candidate] | | |
| 7. Accessibility Tool | [candidate] | | |
| 7. Mutation Test Tool | [candidate] | | |
| 8. Deployment Platform | [candidate] | | |
| 9. Integration Layer | [candidate] | | |
| 10. Auth Framework | [candidate] | | |
| 11. Observability Stack | [candidate] | | |

---

## Unexpected Findings Log

| # | Technology | Finding Type | Details | Action Taken |
|---|---|---|---|---|
| 1 | [tech] | Deprecation / CVE / New Discovery / Standard Update | [description, CVE ID, or new tool name] | [replaced with X / patched to version Y / incorporated] |

---

## Detailed Research Log

### Layer 1 & 2: Backend Language & Framework

#### Query 1 (State of the Art)
**Query:** `[exact query text]`
**Tool used:** [brave-search / web-search / context7 / web-fetch]
**Source URL:** [url]
**Date accessed:** [date]
**Key finding:** [what was discovered — specific versions, rankings, trends]
**Recency:** ✅ Recent (< 12 months) / ⚠️ Stale (> 12 months)
**Decision impact:** [how this confirms, modifies, or overrides the initial candidate]

#### Query 2 (Candidate Validation)
**Query:** `[exact query text]`
**Tool used:** [tool]
**Source URL:** [url]
**Date accessed:** [date]
**Key finding:** [latest version, release date, notable changes]
**Security status:** ✅ No active CVEs / 🚨 CVE-[ID] found — [status]
**Decision impact:** [confirms / raises concern / replaces candidate]

#### Query 3 (Security & Maintenance)
**Query:** `[exact query text]`
**Tool used:** [tool]
**Source:** [url]
**Key finding:** [CVE status, last commit date, maintainer activity]
**Evaluation:**
- Latest stable release: [version] ([date])
- GitHub commits (last 6 months): [active / sparse / none]
- Known CVEs: [none / CVE-ID list]

#### Query 4 (Comparative Fitness)
**Query:** `[exact query text]`
**Tool used:** [tool]
**Source:** [url]
**Key finding:** [how candidate compares to alternatives for this system's specific NFRs]
**Decision impact:** [confirms primary candidate / recommends alternative]

**Layer 1 & 2 Research Conclusion:**
```
Candidate confirmed: [yes/no]
Final recommendation: [technology + version]
Research-backed justification: [summary of findings that support this choice]
```

---

### Layer 3 & 4: Frontend Paradigm & Framework

[Same structure as Layer 1 & 2]

**WCAG Status Note (from accessibility query):**
> Current WCAG version in force: [2.1 / 2.2 / 3.0-draft]
> Notable recent changes: [what changed since training data]
> Impact on framework choice: [which frameworks have better built-in accessibility support]

---

### Layer 5: Primary Database

[Same query structure]

**Database Layer Research Conclusion:**
```
Candidate confirmed: [yes/no]
Final recommendation: [database + version]
Compliance note: [any GDPR/LGPD/HIPAA findings]
Research-backed justification: [summary]
```

---

### Layer 6: Secondary Storage

[Same structure — skip if N/A]

---

### ⭐ Layer 7: TDD Testing Toolchain (Detailed Research)

> This section is the most critical and must be completed regardless of other layers' priority.

#### 7.1 Unit Testing

**Query:** `[language] unit testing framework [YEAR] comparison`
**Tool used:** [tool] | **Source:** [url] | **Date:** [date]

| Framework | Latest Version | Release Date | Maintenance | Notes |
|---|---|---|---|---|
| [candidate] | [version] | [date] | ✅ Active / ⚠️ Stale | [key features, limitations] |
| [alternative] | [version] | [date] | [status] | [why considered/rejected] |

**Unit testing conclusion:** `[selected framework + version]` — [justification based on findings]

---

#### 7.2 Integration Testing

**Query:** `integration testing [language] [YEAR]`
**Source:** [url] | **Date:** [date]

| Tool | Version | DB Support | Notes |
|---|---|---|---|
| Testcontainers [language] | [version] | [databases] | [findings] |
| [other candidate] | [version] | | |

**Integration testing conclusion:** `[selected tools]`

---

#### 7.3 E2E & Browser Automation

**Query:** `end-to-end testing [YEAR] playwright cypress comparison`
**Source:** [url] | **Date:** [date]

| Tool | Version | Browsers | Flakiness | Notes |
|---|---|---|---|---|
| Playwright | [version] | All major | Low | [findings] |
| Cypress | [version] | [list] | Medium | [findings] |
| [other] | [version] | | | |

**Visual regression research:**
**Query:** `visual regression testing [YEAR] tools`
**Finding:** [Percy / Chromatic / Applitools / other — current state]

**E2E conclusion:** `[selected tool + version]` — [justification]

---

#### 7.4 Performance & Load Testing

**Query:** `load testing tools [YEAR] k6 locust jmeter comparison`
**Source:** [url] | **Date:** [date]

| Tool | Version | Scripting | Cloud Execution | Notes |
|---|---|---|---|---|
| k6 | [version] | JavaScript | [k6 Cloud status] | [findings] |
| Locust | [version] | Python | Self-hosted | [findings] |
| [other] | [version] | | | |

**Performance testing conclusion:** `[selected tool + version]` — [justification]

---

#### 7.5 Security Testing (SAST / DAST / SCA)

**DAST research:**
**Query:** `DAST tools [YEAR] OWASP ZAP open source`
**Source:** [url] | **Date:** [date]
**Finding:** [current OWASP ZAP status, new alternatives discovered]

**SAST research:**
**Query:** `SAST [language] [YEAR] static analysis`
**Source:** [url] | **Date:** [date]
**Finding:** [Semgrep, SonarQube, CodeQL — current state]

**SCA/Supply chain research:**
**Query:** `SCA supply chain security [YEAR] Snyk Trivy SBOM`
**Source:** [url] | **Date:** [date]
**Finding:** [SBOM requirements, new tools]

| Tool | Type | Version | CVE DB Updated | Notes |
|---|---|---|---|---|
| [DAST candidate] | DAST | [version] | [last update] | [findings] |
| [SAST candidate] | SAST | [version] | [last update] | [findings] |
| [SCA candidate] | SCA | [version] | [last update] | [findings] |

**Security testing conclusion:** `[toolchain]` — [justification]

---

#### 7.6 Accessibility Testing

**WCAG Status Research:**
**Query:** `WCAG 2.2 WCAG 3.0 [YEAR] status testing implications`
**Source:** [url] | **Date:** [date]

**Current WCAG landscape:**
> - WCAG 2.2 status: [adopted / pending / changes from 2.1]
> - WCAG 3.0 status: [draft stage / expected adoption date]
> - Recommended compliance target: [WCAG version + level]

**Query:** `automated accessibility testing [YEAR] axe-core lighthouse pa11y`
**Source:** [url] | **Date:** [date]

| Tool | WCAG Coverage | Integration | Version | Notes |
|---|---|---|---|---|
| axe-core | [% WCAG 2.2] | Playwright/Cypress | [version] | [findings] |
| Lighthouse | [% coverage] | Chrome/CI | [version] | [findings] |
| Pa11y | [% coverage] | CLI/CI | [version] | [findings] |

**Accessibility testing conclusion:** `[toolchain]` targeting `[WCAG version + level]` — [justification]

---

#### 7.7 Mutation Testing

**Query:** `mutation testing [language] [YEAR]`
**Source:** [url] | **Date:** [date]

| Tool | Language | Version | Performance | Notes |
|---|---|---|---|---|
| StrykerJS | JS/TS | [version] | [speed] | [findings] |
| mutmut | Python | [version] | [speed] | [findings] |
| PITest | Java | [version] | [speed] | [findings] |
| [other] | [lang] | [version] | | |

**Mutation testing conclusion:** `[selected tool]` — [justification]

---

#### 7.8 Property-Based & Fuzz Testing

**Query:** `property-based testing [language] [YEAR]`
**Source:** [url] | **Date:** [date]
**Finding:** [fast-check / hypothesis / QuickCheck — current state and maturity]

**Property testing conclusion:** `[tool if applicable / N/A with justification]`

---

#### 7.9 AI-Assisted Testing (Emerging Paradigm Assessment)

**Query:** `AI test generation [YEAR] tools production readiness`
**Source:** [url] | **Date:** [date]

| Tool | Maturity | Capability | Notes |
|---|---|---|---|
| [AI testing tool] | [Alpha/Beta/GA] | [what it can do] | [findings from research] |

**AI-assisted testing assessment:**
> **Maturity verdict:** [Ready for production use / Experimental — supplement only / Not recommended]
> **Recommendation:** [adopt / evaluate / monitor / skip]
> **Rationale:** [based on research findings]

---

#### 7.10 Contract Testing

**Query:** `consumer-driven contract testing [YEAR] Pact alternatives`
**Source:** [url] | **Date:** [date]
**Finding:** [current state of Pact, new alternatives]

**Contract testing conclusion:** `[tool if applicable / N/A with justification]`

---

#### 7.11 CI/CD Test Orchestration

**Query:** `CI/CD [YEAR] comparison GitHub Actions GitLab Jenkins Buildkite`
**Source:** [url] | **Date:** [date]

| Platform | Version/Date | Free Tier | Test Parallelization | Notes |
|---|---|---|---|---|
| GitHub Actions | [year] | [limits] | ✅/❌ | [findings] |
| GitLab CI | [year] | [limits] | ✅/❌ | [findings] |
| [other] | | | | |

**CI/CD conclusion:** `[platform]` — [justification based on research + deployment constraints]

---

#### Layer 7 TDD Toolchain Summary

| Test Type | Selected Tool | Version | Source Date | Confidence |
|---|---|---|---|---|
| Unit | [tool] | [version] | [date] | ✅ High / ⚠️ Medium |
| Integration | [tool] | [version] | [date] | |
| Component | [tool] | [version] | [date] | |
| Frontend/UI | [tool] | [version] | [date] | |
| E2E | [tool] | [version] | [date] | |
| Performance | [tool] | [version] | [date] | |
| Load | [tool] | [version] | [date] | |
| Security DAST | [tool] | [version] | [date] | |
| Security SAST | [tool] | [version] | [date] | |
| Accessibility | [tool] | [version] | [date] | |
| Mutation | [tool] | [version] | [date] | |
| Property-Based | [tool / N/A] | [version] | [date] | |
| Contract | [tool / N/A] | [version] | [date] | |
| Snapshot | [tool / N/A] | [version] | [date] | |
| CI/CD | [platform] | [version] | [date] | |

---

### Layers 8–11: Infrastructure, Integration, Security, Observability

[Same research structure per layer — query + source + finding + conclusion]

---

## Security Assessment Summary

| Technology | CVEs Checked? | Status | Action |
|---|---|---|---|
| [tech] | ✅ Yes / ❌ No | ✅ Clear / 🚨 CVE-[ID] active | [no action / upgrade to version X / replaced with Y] |

---

## Technologies Eliminated by Research

| Technology | Training Data Status | Research Finding | Replacement |
|---|---|---|---|
| [tech] | Recommended | Deprecated [date] / CVE-[ID] / Superseded by [X] | [replacement selected] |

---

## Technologies Discovered by Research (Not in Training Data)

| Technology | Discovered Via | Maturity | Relevance | Decision |
|---|---|---|---|---|
| [tech] | [query + source] | [Alpha/Beta/GA] | [which layer / NFR] | [Adopted / Monitoring / Evaluated but rejected] |

---

## Research Completeness Checklist

- [ ] All 11 layers researched with at least 1 source from last 24 months
- [ ] All 🔴 Critical layers researched with 3+ current sources
- [ ] Every TDD test type has at least 1 dedicated current source
- [ ] Security CVE status verified for all primary candidates
- [ ] No `🚨 SECURITY RISK` flagged without an approved secure alternative
- [ ] No `⚠️ POTENTIALLY STALE` without investigation of the cause
- [ ] All Unexpected Findings resolved
- [ ] WCAG current version confirmed and compliance target set
- [ ] AI-assisted testing assessed for current maturity
