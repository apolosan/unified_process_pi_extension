/**
 * Unified Process (UP) Extension for pi coding agent
 *
 * Public package entrypoint for the Object-Oriented Unified Process extension.
 *
 * Registered commands:
 *   /up [vision]      - Start or resume the UP process
 *   /up-status        - Display the current process state
 *   /up-next          - Advance to the next activity
 *   /up-auto          - Toggle automatic stage transitions
 *   /up-artifacts     - List and browse generated artifacts
 *
 * Registered tools:
 *   up_save_artifact              - Save an artifact to docs/up/
 *   up_load_artifact              - Load an artifact from docs/up/
 *   up_update_state               - Update the UP state
 *   up_list_artifacts             - List generated artifacts
 *   up_record_integration_check   - Record smoke/integration evidence
 *   up_require_paths              - Validate required integration paths
 */

import type { ExtensionAPI, ExtensionContext } from '@mariozechner/pi-coding-agent';
import { registerTools } from './src/tools.ts';
import { registerCommands } from './src/commands.ts';
import { buildUPAgentContext } from './src/agent-context.ts';
import {
  formatIntegrationVerificationStatus,
  readIntegrationEvidence,
  type IntegrationEvidence,
} from './src/integration-evidence.ts';
import {
  clearRecommendedNextAction,
  getEffectiveNextCommand,
  getRecommendedNextCommand,
  restoreStateForProject,
  saveStateToProject,
  getStatusSummary,
  getNextActivity,
  type UPState,
} from './src/state.ts';
import {
  AUTO_MODE_ENTRY_TYPE,
  AUTO_TOGGLE_SHORTCUTS,
  buildUPSkillCommand,
  classifyRecommendation,
  compactReason,
  extractUPSkillName,
  formatRecommendedNextStatus,
  formatShortcutList,
  isAutoChainSkill,
  restoreAutoTransitionMode,
  type RecommendationClassification,
} from './src/auto-transition.ts';

type ActiveAutoTransition = {
  command: string;
  skillName: string;
  progressDetected: boolean;
};

function getIntegrationTone(status: IntegrationEvidence['status']): 'success' | 'warning' | 'muted' {
  if (status === 'ok') return 'success';
  if (status === 'fail') return 'warning';
  return 'muted';
}

function getIntegrationStatusLabel(status: IntegrationEvidence['status']): string {
  if (status === 'ok') return '✅ smoke';
  if (status === 'fail') return '⚠️ smoke';
  return '⏳ smoke';
}

export default function unifiedProcessExtension(pi: ExtensionAPI): void {
  let currentState: UPState | null = null;
  let autoTransitionEnabled = true;
  let activeAutoTransition: ActiveAutoTransition | null = null;
  let integrationEvidence: IntegrationEvidence | null = null;

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
  const isAutoTransitionEnabled = (): boolean => autoTransitionEnabled;
  const buildRecommendationWidgetLines = (ctx: ExtensionContext, state: UPState | null): string[] | undefined => {
    if (!state) return undefined;

    const explicitNext = state.recommendedNextCommand;
    if (!explicitNext) return undefined;

    const recommendation = classifyRecommendation(state, explicitNext);
    const theme = ctx.ui.theme;
    const header =
      theme.fg(recommendation.tone, `${recommendation.icon} ${recommendation.label}`) +
      ' ' +
      theme.fg('accent', explicitNext);

    const lines = [header];
    if (state.recommendedNextReason.trim()) {
      lines.push(theme.fg('muted', compactReason(state.recommendedNextReason)));
    }

    return lines;
  };
  const refreshIntegrationEvidence = async (cwd: string): Promise<void> => {
    integrationEvidence = await readIntegrationEvidence(cwd);
  };
  const buildIntegrationWidgetLines = (ctx: ExtensionContext): string[] | undefined => {
    if (!integrationEvidence) return undefined;
    const theme = ctx.ui.theme;
    const label = formatIntegrationVerificationStatus(integrationEvidence);
    return [theme.fg(getIntegrationTone(integrationEvidence.status), `🔌 ${label}`)];
  };
  const refreshUPUI = (ctx: ExtensionContext, state: UPState | null = currentState): void => {
    ctx.ui.setStatus('up:auto', autoTransitionEnabled ? '🤖 UP AUTO' : '🤖 UP MANUAL');
    ctx.ui.setStatus('up:next', formatRecommendedNextStatus(state));
    ctx.ui.setWidget('up:recommendation', buildRecommendationWidgetLines(ctx, state));
    ctx.ui.setWidget('up:integration', buildIntegrationWidgetLines(ctx));

    if (!state) return;
    ctx.ui.setStatus('up', getStatusSummary(state));
    if (integrationEvidence) {
      ctx.ui.setStatus('up:smoke', getIntegrationStatusLabel(integrationEvidence.status));
    }
  };
  const updateAutoTransitionUI = (ctx: ExtensionContext): void => {
    refreshUPUI(ctx);
  };
  const setAutoTransitionEnabled = (ctx: ExtensionContext, enabled: boolean): void => {
    autoTransitionEnabled = enabled;
    pi.appendEntry(AUTO_MODE_ENTRY_TYPE, { enabled });
    updateAutoTransitionUI(ctx);
  };
  const toggleAutoTransition = (ctx: ExtensionContext): boolean => {
    setAutoTransitionEnabled(ctx, !autoTransitionEnabled);
    return autoTransitionEnabled;
  };
  const dispatchUPCommand = (command: string, ctx: ExtensionContext, reason?: string): void => {
    if (reason) {
      ctx.ui.notify(`🤖 ${reason}: ${command}`, 'info');
    }

    if (ctx.isIdle()) {
      pi.sendUserMessage(command);
      return;
    }

    pi.sendUserMessage(command, { deliverAs: 'followUp' });
  };

  pi.on('session_start', async (_event, ctx) => {
    const entries = (ctx.sessionManager.getEntries() as any[]) ?? [];
    currentState = await restoreStateForProject(ctx.cwd, entries);
    autoTransitionEnabled = restoreAutoTransitionMode(entries);
    activeAutoTransition = null;
    await refreshIntegrationEvidence(ctx.cwd);
    refreshUPUI(ctx, currentState);

    if (!currentState) {
      if (autoTransitionEnabled) {
        ctx.ui.notify(
          `🤖 UP auto-transition restored: ON (${formatShortcutList()})`,
          'info'
        );
      }
      return;
    }

    await saveStateToProject(ctx.cwd, currentState);
    refreshUPUI(ctx, currentState);
    ctx.ui.notify(
      `📐 UP process restored: "${currentState.systemName}" [${currentState.currentPhase}]`,
      'info'
    );

    if (autoTransitionEnabled) {
      ctx.ui.notify(`🤖 UP auto-transition restored: ON (${formatShortcutList()})`, 'info');
    }
  });

  pi.on('before_agent_start', async (event, ctx) => {
    if (!currentState) return;

    await refreshIntegrationEvidence(ctx.cwd);
    refreshUPUI(ctx, currentState);

    let upContext = buildUPAgentContext(currentState, {
      autoTransitionEnabled,
    });

    // Quality Gate (RF-21) — inject a strict reminder during activities where
    // tests are being authored or applied. Acceptance: 0 mediocre tests +
    // 100% RF/RNF coverage before saving TDD or implementation artifacts.
    const nextActivity = getNextActivity(currentState);
    if (nextActivity === 'tdd' || nextActivity === 'implementation' || nextActivity === 'use-cases' || nextActivity === 'contracts') {
      upContext += [
        '',
        '--- Mandatory Quality Gate (RF-21) ---',
        'Before saving TDD plans (10-tdd-plan.md), test batteries (10-tests/*),',
        'or implementation artifacts, you MUST call up_test_quality_audit(mode="strict")',
        'and resolve every flagged P1/P2/coverage-gap violation.',
        'Acceptance: 0 mediocre tests, 0 uncovered RF, 0 uncovered RNF.',
        'If audit reports failures, rewrite the affected tests and re-audit',
        'before persisting any further artifact.',
      ].join('\n');
    }

    return { systemPrompt: event.systemPrompt + upContext };
  });

  pi.on('input', async (event) => {
    const skillName = extractUPSkillName(event.text);

    if (!autoTransitionEnabled || !skillName || !isAutoChainSkill(skillName)) {
      activeAutoTransition = null;
      return;
    }

    activeAutoTransition = {
      command: buildUPSkillCommand(skillName),
      skillName,
      progressDetected: false,
    };
  });

  pi.on('tool_execution_end', async (event, ctx) => {
    if (event.toolName === 'up_record_integration_check') {
      await refreshIntegrationEvidence(ctx.cwd);
    }

    if (
      event.toolName === 'up_save_artifact' ||
      event.toolName === 'up_update_state' ||
      event.toolName === 'up_record_integration_check'
    ) {
      refreshUPUI(ctx);
    }

    if (!activeAutoTransition || event.isError) return;
    if (event.toolName === 'up_save_artifact' || event.toolName === 'up_update_state') {
      activeAutoTransition.progressDetected = true;
    }
  });

  pi.on('agent_end', async (_event, ctx) => {
    if (!autoTransitionEnabled || !activeAutoTransition) return;

    const completedTransition = activeAutoTransition;
    activeAutoTransition = null;

    if (!completedTransition.progressDetected) {
      ctx.ui.notify(
        `🤖 UP auto-transition paused after ${completedTransition.command}: no UP artifact/state update was detected in the last step.`,
        'info'
      );
      return;
    }

    const state =
      getState() ??
      (await ensureState(ctx.cwd, (ctx.sessionManager?.getEntries?.() as any[]) ?? []));

    if (!state) return;

    const explicitNextCommand = getRecommendedNextCommand(state);
    if (explicitNextCommand) {
      if (explicitNextCommand === completedTransition.command) {
        ctx.ui.notify(
          `🤖 UP auto-transition paused: explicit next command ${explicitNextCommand} matches the command that just ran, which could create a blind loop.`,
          'warning'
        );
        return;
      }

      const clearedState = clearRecommendedNextAction(state);
      await commitState(ctx.cwd, clearedState);
      refreshUPUI(ctx, clearedState);
      dispatchUPCommand(
        explicitNextCommand,
        ctx,
        `UP auto-transition → explicit recommendation${state.recommendedNextReason ? ` (${state.recommendedNextReason})` : ''}`
      );
      return;
    }

    if (completedTransition.skillName === 'orchestrator') {
      const nextCommand = getEffectiveNextCommand(state);
      if (!nextCommand) {
        ctx.ui.notify('🤖 UP auto-transition: process completed.', 'success');
        return;
      }

      dispatchUPCommand(nextCommand, ctx, `UP auto-transition → ${nextCommand}`);
      return;
    }

    dispatchUPCommand('/skill:up-orchestrator', ctx, 'UP auto-transition → orchestrator');
  });

  for (const shortcut of AUTO_TOGGLE_SHORTCUTS) {
    pi.registerShortcut(shortcut, {
      description: 'Toggle UP automatic stage transitions',
      handler: async (ctx) => {
        const enabled = toggleAutoTransition(ctx);
        ctx.ui.notify(
          `🤖 UP auto-transition: ${enabled ? 'ON' : 'OFF'} (${formatShortcutList()})`,
          'info'
        );
      },
    });
  }

  registerTools(pi, getState, setState, ensureState, commitState, async (cwd) => {
    await refreshIntegrationEvidence(cwd);
  });
  registerCommands(
    pi,
    getState,
    setState,
    ensureState,
    commitState,
    isAutoTransitionEnabled,
    setAutoTransitionEnabled,
    toggleAutoTransition,
    dispatchUPCommand,
    refreshUPUI
  );
}
