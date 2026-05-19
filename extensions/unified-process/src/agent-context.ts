/**
 * Agent context builder — Template Method for UP system prompt sections.
 * Composes stable UP context blocks and injects integration checklist (AC4).
 */

import {
  getNextActivity,
  getRecommendedNextCommand,
  type UPState,
} from './state.ts';

export const INTEGRATION_CHECKLIST_MARKER = 'Integration Checklist';
export const INTEGRATION_MATRIX_PATH = '12b-integration-matrix.md';

const IMPLEMENTATION_READY_ACTIVITIES = new Set([
  'data-mapping',
  'implementation',
  'deploy',
  'documentation',
]);

export interface BuildUPAgentContextOptions {
  autoTransitionEnabled: boolean;
}

export function hasIntegrationMatrixArtifact(state: UPState): boolean {
  return state.artifacts.some(
    (artifact) =>
      artifact.path === INTEGRATION_MATRIX_PATH ||
      artifact.path.endsWith(`/${INTEGRATION_MATRIX_PATH}`)
  );
}

export function buildIntegrationChecklistBlock(): string {
  return [
    `## ${INTEGRATION_CHECKLIST_MARKER} (Mandatory before Implementation Done)`,
    '',
    'Before declaring implementation complete or deploy-ready, document and execute:',
    '',
    '1. [ ] **Stack up** — document the command to bring up the application stack (e.g. `docker compose up -d`) and run it',
    '2. [ ] **API health** — verify health endpoint returns success (e.g. `curl -fsS http://localhost:PORT/health`)',
    '3. [ ] **Smoke run** — run project smoke command (e.g. `npm run test:smoke`)',
    '4. [ ] **Tier 1 integrated e2e** — full stack, real endpoints (e.g. `npm run test:e2e:integrated`)',
    '5. [ ] **Evidence** — append commands, exit codes, and timestamps to `docs/up/14-implementation/smoke.log`',
    '',
    '**Evidence format (smoke.log):**',
    '```',
    'timestamp: <ISO-8601>',
    'command: <exact command>',
    'exit_code: <0 on success>',
    '```',
    '',
    '**Rules:**',
    '- Mock-only or contract-only green tests do **not** satisfy implementation done — Tier 1 integrated e2e is required for P0 flows.',
    '- D1–D6 visual quality evaluation begins **only after** Tier 1 e2e passes.',
    '- Deploy readiness requires smoke.log with `exit_code: 0`.',
    '',
    `Maintain traceability in \`docs/up/${INTEGRATION_MATRIX_PATH}\` (UC ↔ operation ↔ endpoint ↔ UI screen).`,
    '',
  ].join('\n');
}

function buildMatrixReminder(state: UPState): string {
  const next = getNextActivity(state);
  const needsMatrix =
    !hasIntegrationMatrixArtifact(state) &&
    (next === 'implementation' ||
      state.completedActivities.includes('implementation') ||
      IMPLEMENTATION_READY_ACTIVITIES.has(next ?? ''));

  if (!needsMatrix) return '';

  return [
    '**Integration matrix:** `docs/up/12b-integration-matrix.md` is missing — create or update it before wiring UI to API.',
    '',
  ].join('\n');
}

export function buildUPAgentContext(
  state: UPState,
  options: BuildUPAgentContextOptions
): string {
  const next = getNextActivity(state);
  const artifactsList = state.artifacts.length
    ? state.artifacts
        .map((artifact) => `- ${artifact.path}: ${artifact.title} [${artifact.phase}]`)
        .join('\n')
    : '(no artifacts generated yet)';

  const explicitNext = getRecommendedNextCommand(state);

  return [
    '',
    '## Unified Process (UP) Context',
    `**System:** ${state.systemName}`,
    '**Authoritative system vision:**',
    state.vision || '(not provided)',
    '',
    `**Automatic transition mode:** ${
      options.autoTransitionEnabled
        ? 'ENABLED — do not ask the user to invoke the next UP command manually when a stage is completed; the extension will continue the flow.'
        : 'DISABLED — recommend the next UP command to the user as usual.'
    }`,
    `**Explicit recommended next command:** ${explicitNext ?? '(none)'}`,
    ...(state.recommendedNextReason
      ? [`**Recommendation rationale:** ${state.recommendedNextReason}`]
      : []),
    `**Phase:** ${state.currentPhase} | **Iteration:** ${state.currentIteration}`,
    `**Next activity:** ${next ?? '✅ PROCESS COMPLETED'}`,
    `**Completed activities:** ${state.completedActivities.join(', ') || '(none)'}`,
    `**Generated artifacts (${state.artifacts.length}):**`,
    artifactsList,
    '',
    buildMatrixReminder(state),
    buildIntegrationChecklistBlock(),
    '**Available UP tools:** up_save_artifact, up_load_artifact, up_update_state, up_list_artifacts, up_record_integration_check, up_require_paths',
    '**Available UP skills:** /skill:up-orchestrator, /skill:up-5w2h (Step 0 for ALL activities),',
    '/skill:up-vision, /skill:up-requirements, /skill:up-use-cases, /skill:up-sequence-diagrams,',
    '/skill:up-conceptual-model, /skill:up-contracts,',
    '/skill:up-tech-stack (MANDATORY gate 1: stack locked after Contracts — detects requester tech level),',
    '/skill:up-tdd (MANDATORY gate 2: full test battery — uses tools from 11-tech-stack.md),',
    '/skill:up-design-patterns (gate 3: MCP design-patterns + internet research — patterns feed the DCD),',
    '/skill:up-object-design, /skill:up-interface-design,',
    '/skill:up-design-system (last design activity: shadcn/radix/flyonui MCPs — research + select + generate UI code),',
    '/skill:up-data-mapping,',
    '/skill:up-implementation (FINAL Construction: generate full application code in PROJECT_ROOT/src/; maintain 100% TDD green gate; Tier 1 integrated e2e before D1–D6),',
    '/skill:up-deploy (FIRST Transition: deploy with smoke tests and rollback; requires smoke.log evidence),',
    '/skill:up-documentation (LAST Transition: generate full documentation set from UP artifacts, implementation, and deploy evidence using MCP/CLI tools such as mmdc),',
    '**IMPORTANT — System Naming Protocol:** when a process starts or resumes, read the authoritative vision first and persist the canonical systemName with up_update_state if the current name is provisional, truncated, or improvable.',
    '**IMPORTANT — Next Action Protocol:** when /skill:up-orchestrator decides what must happen next, it should persist `recommendedNextCommand` and `recommendedNextReason` with up_update_state before saving/updating the process plan. Use this explicit recommendation for refinement loops, upstream returns, and non-linear iteration.',
    '**IMPORTANT — Tech Stack:** collect tech signals throughout ALL phases (language/framework/infra mentions, team skills, domain constraints).',
    '**IMPORTANT — TDD Rules:** no implementation before the test battery is locked; tests are immutable unless a real artifact inconsistency is proven.',
    '**IMPORTANT — Iteration Protocol:** if implementation reveals a design gap, return to the appropriate upstream activity, regenerate downstream artifacts, then resume implementation.',
    '**IMPORTANT — Deployment Protocol:** never deploy to production without explicit requester approval. Default target is homologation. Do not declare deploy-ready without smoke.log exit_code 0.',
    '**IMPORTANT — Documentation Protocol:** final documentation should be generated from authoritative artifacts and real outputs; render Mermaid diagrams when possible.',
    '**IMPORTANT:** every activity must begin with a 5W2H analysis.',
    '',
  ].join('\n');
}
