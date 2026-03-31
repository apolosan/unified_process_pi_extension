# Deployment Configuration — [System Name]

> **Target Environment:** [Homologation / Pre-Production / Production]
> **Implementation Source:** `docs/up/14-implementation/`
> **Tech Stack:** `docs/up/11-tech-stack.md`
> **Date:** [date] | **Approved by:** [requester / not required]

---

## Environment Decision

| Attribute | Value |
|---|---|
| **Target environment** | [Homologation / Pre-Production / Production] |
| **Reason** | [Why this environment was selected] |
| **Approval** | [Explicit requester approval / Autonomous (homologation)] |
| **Readiness criteria met** | ✅ Yes / ❌ No — [list unmet criteria] |

---

## Infrastructure Map

| Component | Type | Deployment Target | Image/Version |
|---|---|---|---|
| Backend API | [Container/Serverless/VM] | [platform] | [image:tag] |
| Frontend | [CDN/SSR/Static] | [platform] | [version] |
| Database | [Managed/Container] | [platform] | [version] |
| Cache | [Managed/Container/N/A] | [platform] | [version] |
| Message Queue | [type/N/A] | [platform] | [version] |

---

## Environment Variables Structure

> ⚠️ This document shows variable NAMES only. Actual values are stored in the secrets manager.

```bash
# Application
NODE_ENV=[staging|production]
APP_PORT=[port]
APP_URL=[deployment URL]

# Database
DATABASE_URL=<secrets manager>

# Authentication
JWT_SECRET=<secrets manager>
JWT_EXPIRY=[value]

# Observability
LOG_LEVEL=[debug|info|warn|error]
SENTRY_DSN=<secrets manager>

# External integrations
[SERVICE_API_KEY]=<secrets manager>
```

---

## Smoke Test Suite

| Test | Expected Result | Timeout | Action on Fail |
|---|---|---|---|
| GET /health | 200 OK | 30s | Rollback |
| Database connectivity | Connected | 10s | Rollback |
| POST /auth/login | Token returned | 5s | Rollback |
| Primary use case E2E | Success | 30s | Rollback |
| GET / (frontend) | 200 OK, no errors | 10s | Rollback |

---

## Rollback Plan

| Trigger | Threshold | Automatic? | Rollback Steps |
|---|---|---|---|
| Health check fails | >5 min | ✅ Yes | Revert image, rollback migrations |
| Any smoke test fails | 1 failure | ✅ Yes | Revert image, rollback migrations |
| Error rate spike | >[X]% | ✅ Yes | Revert image |
| Performance degradation | >[X]% slower | ❌ Manual | Investigate first |

---

## Deployment Report

- **Status:** ✅ SUCCESS / ❌ FAILED (rolled back)
- **Access URL:** [deployment URL]
- **Health URL:** [health check URL]
- **Deployed at:** [timestamp]
- **Version:** [git SHA]

### Smoke Test Results

| Test | Result | Duration |
|---|---|---|
| Health check | ✅/❌ | [Xms] |
| Database | ✅/❌ | [Xms] |
| Authentication | ✅/❌ | [Xms] |
| Primary UC | ✅/❌ | [Xms] |
| Frontend load | ✅/❌ | [Xms] |

### Vision Alignment

| "System MUST" (from 01-vision.md) | Status |
|---|---|
| [Feature 1] | ✅ Verified / ❌ Not working |

### Next Steps

- [ ] Stakeholder UAT (homologation) or sign-off
- [ ] Async: Performance benchmarking
- [ ] Async: Security scan
- [ ] Promote to next environment: [environment]
