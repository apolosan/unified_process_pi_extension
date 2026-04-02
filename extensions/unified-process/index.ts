/**
 * Unified Process (UP) Extension for pi coding agent
 *
 * Public package entrypoint for the Object-Oriented Unified Process extension.
 *
 * Registered commands:
 *   /up [vision]      - Start or resume the UP process
 *   /up-status        - Display the current process state
 *   /up-next          - Advance to the next activity
 *   /up-artifacts     - List and browse generated artifacts
 *
 * Registered tools:
 *   up_save_artifact  - Save an artifact to docs/up/
 *   up_load_artifact  - Load an artifact from docs/up/
 *   up_update_state   - Update the UP state
 *   up_list_artifacts - List generated artifacts
 */

import type { ExtensionAPI } from '@mariozechner/pi-coding-agent';
import { registerTools } from './src/tools.ts';
import { registerCommands } from './src/commands.ts';
import {
  restoreStateForProject,
  saveStateToProject,
  getStatusSummary,
  getNextActivity,
  type UPState,
} from './src/state.ts';

export default function unifiedProcessExtension(pi: ExtensionAPI): void {
  let currentState: UPState | null = null;

  const getState = (): UPState | null => currentState;
  const setState = (state: UPState): void => {
    currentState = state;
  };
  const ensureState = async (cwd: string, entries: any[] = []): Promise<UPState | null> => {
    if (currentState) return currentState;

    currentState = await restoreStateForProject(cwd, entries);
    if (currentState) {
      await saveStateToProject(cwd, currentState);
    }

    return currentState;
  };
  const commitState = async (cwd: string, state: UPState): Promise<void> => {
    currentState = state;
    await saveStateToProject(cwd, state);
    pi.appendEntry('up-state', state);
  };

  pi.on('session_start', async (_event, ctx) => {
    currentState = await restoreStateForProject(
      ctx.cwd,
      (ctx.sessionManager.getEntries() as any[]) ?? []
    );

    if (!currentState) return;

    await saveStateToProject(ctx.cwd, currentState);
    ctx.ui.setStatus('up', getStatusSummary(currentState));
    ctx.ui.notify(
      `📐 UP process restored: "${currentState.systemName}" [${currentState.currentPhase}]`,
      'info'
    );
  });

  pi.on('before_agent_start', async (event) => {
    if (!currentState) return;

    const next = getNextActivity(currentState);
    const artifactsList = currentState.artifacts.length
      ? currentState.artifacts
          .map((artifact) => `- ${artifact.path}: ${artifact.title} [${artifact.phase}]`)
          .join('\n')
      : '(no artifacts generated yet)';

    const upContext = [
      '',
      '## Unified Process (UP) Context',
      `**System:** ${currentState.systemName}`,
      `**Phase:** ${currentState.currentPhase} | **Iteration:** ${currentState.currentIteration}`,
      `**Next activity:** ${next ?? '✅ PROCESS COMPLETED'}`,
      `**Completed activities:** ${currentState.completedActivities.join(', ') || '(none)'}`,
      `**Generated artifacts (${currentState.artifacts.length}):**`,
      artifactsList,
      '',
      '**Available UP tools:** up_save_artifact, up_load_artifact, up_update_state, up_list_artifacts',
      '**Available UP skills:** /skill:up-orchestrator, /skill:up-5w2h (Step 0 for ALL activities),',
      '/skill:up-vision, /skill:up-requirements, /skill:up-use-cases, /skill:up-sequence-diagrams,',
      '/skill:up-conceptual-model, /skill:up-contracts,',
      '/skill:up-tech-stack (MANDATORY gate 1: stack locked after Contracts — detects requester tech level),',
      '/skill:up-tdd (MANDATORY gate 2: full test battery — uses tools from 11-tech-stack.md),',
      '/skill:up-design-patterns (gate 3: MCP design-patterns + internet research — patterns feed the DCD),',
      '/skill:up-object-design, /skill:up-interface-design,',
      '/skill:up-design-system (last design activity: shadcn/radix/flyonui MCPs — research + select + generate UI code),',
      '/skill:up-data-mapping,',
      '/skill:up-implementation (FINAL Construction: generate full application code; maintain 100% TDD green gate; iterate upstream on design gaps),',
      '/skill:up-deploy (FIRST Transition: deploy to homologation/pre-production/production with smoke tests and rollback),',
      '/skill:up-documentation (LAST Transition: generate full documentation set from UP artifacts, implementation, and deploy evidence using MCP/CLI tools such as mmdc),',
      '**IMPORTANT — Tech Stack:** collect tech signals throughout ALL phases (language/framework/infra mentions, team skills, domain constraints).',
      '**IMPORTANT — TDD Rules:** no implementation before the test battery is locked; tests are immutable unless a real artifact inconsistency is proven.',
      '**IMPORTANT — Iteration Protocol:** if implementation reveals a design gap, return to the appropriate upstream activity, regenerate downstream artifacts, then resume implementation.',
      '**IMPORTANT — Deployment Protocol:** never deploy to production without explicit requester approval. Default target is homologation.',
      '**IMPORTANT — Documentation Protocol:** final documentation should be generated from authoritative artifacts and real outputs; render Mermaid diagrams when possible.',
      '**IMPORTANT:** every activity must begin with a 5W2H analysis.',
      '',
    ].join('\n');

    return { systemPrompt: event.systemPrompt + upContext };
  });

  registerTools(pi, getState, setState, ensureState, commitState);
  registerCommands(pi, getState, setState, ensureState, commitState);
}
