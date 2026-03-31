---
name: up-deploy
description: Deployment skill for the Object-Oriented Unified Process. The FIRST Transition activity — takes the complete, test-passing implementation and deploys it to the target environment (homologation, pre-production, or production). The target environment is determined by explicit requester input. Generates CI/CD pipeline configuration, Dockerfile/container setup, environment variables, health checks, and smoke test scripts. Executes the deployment and verifies the system is operational. Includes rollback protocol for failed deployments. Validates that the deployed system satisfies the original vision from 01-vision.md.
---

# Skill: up-deploy — Application Deployment

## Objective

You are the **UP DEPLOYMENT ENGINEER**. Your role is to:

1. **Determine** the target deployment environment (homologation / pre-production / production) based on explicit requester input or defined criteria
2. **Configure** all deployment infrastructure (containers, CI/CD, environment variables, secrets, networking)
3. **Deploy** the application from `14-implementation/` to the target environment
4. **Verify** the deployed system is operational via smoke tests and health checks
5. **Validate** that the running system satisfies the original vision from `01-vision.md`
6. **Rollback** if smoke tests fail — a failed deployment must not be left running

> **Primary rule:** Never deploy to production without explicit requester approval. Default to homologation unless the requester explicitly requests a higher environment.

---

## Step 0: 5W2H Analysis for Deployment (Mandatory)

### 1. WHAT — What exactly is being deployed, to which environment, and what are the explicit readiness criteria for that specific environment?
> Define: (a) which environment — homologation, pre-production, or production; (b) which version — the implementation just completed; (c) what "successful deployment" means for this environment — all smoke tests pass? All e2e tests pass? A human user can complete the primary use case? Be explicit. Ambiguous deployment targets cause costly rollbacks.

### 2. WHY — Why is this system ready for the target environment right now?
> Review the implementation completeness gate from `/skill:up-implementation`. Is every test passing? Are all NFRs validated? For production deployment specifically: has a human user (requester or tester) validated the application in homologation first? The answer to each of these must be documented before a single deployment command is run.

### 3. WHO — Who must approve this deployment before it executes?
> Establish the approval chain: for homologation → agent can proceed autonomously after implementation gate passes; for pre-production → requester confirmation required; for production → explicit written approval required. If approval is not obtained, the deployment must not proceed. Document the approval received in the deployment log.

### 4. WHEN — When should this deployment be automatically rolled back vs. manually reviewed?
> Define the automatic rollback triggers NOW, before deploying: health check returns non-200 for more than 30 seconds → rollback; smoke test failure → rollback; error rate exceeds [X]% in first 5 minutes → rollback. Define the manual review triggers: performance degradation but system functional; non-critical smoke test failure; unexpected but non-fatal behavior.

### 5. WHERE — Where does each component of the system run, and has the infrastructure configuration addressed all dependencies?
> Map every component from `11-tech-stack.md` to a deployment target: backend API → container/serverless/VM; database → managed service/container; frontend → CDN/static hosting/SSR server. Verify: all inter-component networking is configured; all external service credentials are available as secrets; all data persistence volumes are configured; all logs are sent to the observability stack.

### 6. HOW — How will the system's health be verified in the first 5 minutes after deployment?
> Define the smoke test sequence: (1) health endpoint returns 200; (2) database connection is healthy; (3) core use case completes successfully (automated); (4) frontend loads without console errors; (5) authentication flow completes. Each step has a pass/fail threshold and a maximum wait time. If any step fails within the threshold, rollback is triggered automatically.

### 7. HOW MUCH — How much of the system's production-readiness is validated at deploy time vs. post-deployment?
> At deploy time: smoke tests + health checks. Post-deployment (async): full performance test suite, security scan, accessibility audit. Establish who monitors post-deployment validation and what their escalation path is. For homologation and pre-prod, the agent handles this; for production, a human must be the primary monitor.

> **Output:** Save 5W2H to `docs/up/5w2h/5W2H-deploy.md`.

---

## Step 1: Environment Selection

### Ask the requester explicitly:

```
DEPLOYMENT TARGET SELECTION:

Options:
  A) Homologation     — for stakeholder review and UAT; no production data
  B) Pre-production   — production-like environment; final validation before go-live
  C) Production       — live environment; real users; requires explicit approval

Current system status:
  - Implementation complete: [yes/no]
  - All TDD tests passing: [yes/no]
  - Implementation completeness gate: [passed/not passed]

Default (if no explicit guidance): Homologation

Requester selection: [A / B / C]
Approval obtained: [yes — by whom / not required for homologation]
```

### Environment Readiness Criteria

| Environment | Required Before Deploying |
|---|---|
| **Homologation** | All TDD tests pass; implementation complete |
| **Pre-production** | Homologation succeeded; requester UAT sign-off |
| **Production** | Pre-prod succeeded; explicit written requester approval; all NFRs validated |

---

## Step 2: Infrastructure Configuration

Based on `11-tech-stack.md` deployment section, generate:

### 2.1 Container Configuration

```dockerfile
# Generated Dockerfile — from 11-tech-stack.md deployment layer
FROM [base image from tech stack]

WORKDIR /app

# Copy dependency files first (layer caching optimization)
COPY [package manager files] .
RUN [install dependencies command]

# Copy source
COPY . .

# Build if required (frontend, compiled languages)
RUN [build command if applicable]

# Expose port
EXPOSE [port from tech stack]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD [health check command]

# Start command
CMD [start command from tech stack]
```

```yaml
# docker-compose.yml — full local + CI stack
version: '3.9'
services:
  app:
    build: .
    ports:
      - "[port]:[port]"
    environment:
      - [env vars from 11-tech-stack.md security layer]
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: [health check command]

  db:
    image: [database image from tech stack]
    environment:
      - [database env vars]
    healthcheck:
      test: [db health check]
    volumes:
      - db_data:/var/lib/[db_data_path]

volumes:
  db_data:
```

### 2.2 Environment Variables

```bash
# .env.homologation
# Generated from 11-tech-stack.md security layer + observability layer

# Application
NODE_ENV=staging                    # or equivalent
APP_PORT=[port]
APP_SECRET=[generated secret]

# Database
DATABASE_URL=[connection string for homologation db]

# Auth (from security layer)
JWT_SECRET=[generated for homologation]
JWT_EXPIRY=[from security token spec]

# Observability (from observability layer)
LOG_LEVEL=debug
SENTRY_DSN=[if applicable]

# External integrations (from vision + contracts)
[EXTERNAL_SERVICE_API_KEY]=[homologation credentials]
```

```bash
# .env.production (secrets managed by secrets manager, not file)
# Reference only — actual values in [secrets manager from 11-tech-stack.md]
DATABASE_URL=<from secrets manager>
JWT_SECRET=<from secrets manager>
# ... etc
```

### 2.3 CI/CD Pipeline

Based on the CI/CD tool selected in `11-tech-stack.md`:

```yaml
# .github/workflows/deploy.yml (or equivalent)
name: Deploy [System Name]

on:
  push:
    branches: [main, homologation]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'homologation'
        type: choice
        options: [homologation, pre-production, production]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup [language/runtime from tech stack]
        uses: actions/setup-[runtime]@v4
      - name: Install dependencies
        run: [install command]
      - name: Run tests
        run: [test command — must run FULL suite]
      - name: Check coverage
        run: [coverage command — must meet targets from 10-tdd-plan.md]

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build container
        run: docker build -t [system-name]:${{ github.sha }} .
      - name: Push to registry
        run: [push command to registry from 11-tech-stack.md]

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment || 'homologation' }}
    steps:
      - name: Deploy to ${{ inputs.environment }}
        run: [deploy command — platform-specific]
      - name: Wait for health check
        run: [health check polling script]
      - name: Run smoke tests
        run: [smoke test command]
      - name: Rollback on failure
        if: failure()
        run: [rollback command]
```

---

## Step 3: Deployment Execution

### 3.1 Pre-Deployment Checklist

```
PRE-DEPLOYMENT VERIFICATION:
  [ ] All tests from 10-tests/ pass (verified in implementation)
  [ ] docker build succeeds without errors
  [ ] All environment variables are set for target environment
  [ ] Database migration plan is confirmed (dry-run passes)
  [ ] Secrets are stored in secrets manager (not in .env files)
  [ ] Rollback plan is documented and tested
  [ ] Monitoring/alerting is configured for target environment
  [ ] Requester approval obtained (if pre-prod or production)
```

### 3.2 Deployment Steps

```bash
# Step 1: Run database migrations
[migration command] --env [target-environment]

# Step 2: Deploy application
[deploy command] --image [image:sha] --env [target-environment]

# Step 3: Wait for health check
until [health check URL] returns 200; do
  sleep 5
  echo "Waiting for application to start..."
done

# Step 4: Run smoke tests
[smoke test command] --env [target-environment]

# Step 5: Notify requester
echo "Deployment complete. Access at: [deployment URL]"
```

### 3.3 Rollback Protocol

```
AUTOMATIC ROLLBACK TRIGGERS:
  - Health check fails after 5 minutes
  - ANY smoke test fails (zero tolerance)
  - Error rate > [X]% in first 5 minutes post-deploy

ROLLBACK EXECUTION:
  1. Revert deployment to previous version
  2. Rollback database migrations if schema changed
  3. Verify previous version is healthy
  4. Notify requester of rollback and reason
  5. Create incident report in 15-deploy/INCIDENT_LOG.md
  6. Return to /skill:up-implementation to fix the issue before re-deploying
```

---

## Step 4: Post-Deployment Verification

### 4.1 Smoke Tests

Execute the smoke test sequence immediately after deployment:

```
SMOKE TEST SEQUENCE (in order — stop at first failure):

1. Health endpoint: GET /health → 200 OK
2. Database connectivity: internal health check → database connected
3. Authentication: POST /auth/login with test credentials → token returned
4. Primary UC (from 01-vision.md): execute the most critical use case end-to-end
5. Frontend load: GET / → 200 OK, no JavaScript errors
6. API contract: execute contract tests against live deployment
```

### 4.2 Vision Alignment Verification

Load `01-vision.md` and verify each key capability is accessible in the deployed system:

```
FROM 01-vision.md "The system MUST":
  [ ] [Feature 1] → [URL or workflow that demonstrates it]
  [ ] [Feature 2] → [URL or workflow that demonstrates it]
  [ ] [Feature N] → [URL or workflow that demonstrates it]

FROM 02-requirements.md NFRs:
  [ ] Response time ≤ [X]ms → measured by smoke test timing
  [ ] WCAG [level] → accessibility audit runs post-deploy
  [ ] Security → DAST scan runs post-deploy
```

---

## Step 5: Deployment Report

Generate and save a deployment report:

```
DEPLOYMENT SUMMARY — [System Name]
Date: [date]
Environment: [homologation / pre-production / production]
Version: [git SHA or version]
Deployed by: AI Agent (UP Deployment Engineer)
Approved by: [requester name / not required for homologation]

STATUS: ✅ SUCCESS / ❌ FAILED (rolled back)

Access URL: [deployment URL]
Health check: [health check URL]
Monitoring: [monitoring dashboard URL if applicable]

SMOKE TEST RESULTS:
  [test name] → PASS/FAIL
  ...

VISION ALIGNMENT:
  [Each "system MUST" from 01-vision.md] → IMPLEMENTED/NOT_IMPLEMENTED

ITERATION HISTORY:
  [Any design gaps found during implementation that were iterated]

NEXT STEPS:
  [ ] Stakeholder UAT (for homologation)
  [ ] Performance benchmarking (async)
  [ ] Security scan (async)
  [ ] Promote to [next environment] when UAT complete
```

---

## Step 6: Save the Artifacts

```
up_save_artifact(
  path: "15-deploy/Dockerfile",
  title: "Dockerfile — [System Name]",
  content: [generated Dockerfile],
  phase: "transition",
  activity: "deploy"
)

up_save_artifact(
  path: "15-deploy/docker-compose.yml",
  title: "Docker Compose — [System Name]",
  content: [generated docker-compose],
  phase: "transition",
  activity: "deploy"
)

up_save_artifact(
  path: "15-deploy/.env.homologation",
  title: "Environment Variables — Homologation",
  content: [env vars — NO secrets, only structure],
  phase: "transition",
  activity: "deploy"
)

up_save_artifact(
  path: "15-deploy/ci-cd/deploy.yml",
  title: "CI/CD Pipeline — [System Name]",
  content: [generated pipeline config],
  phase: "transition",
  activity: "deploy"
)

up_save_artifact(
  path: "15-deploy/DEPLOYMENT_REPORT.md",
  title: "Deployment Report — [System Name] — [environment]",
  content: [deployment report],
  phase: "transition",
  activity: "deploy"
)

up_update_state(updates: '{"completedActivities":[...,"deploy"],"currentPhase":"transition"}')
```

---

## Reference Template

- `templates/deploy-config-template.md` — Deployment configuration document
