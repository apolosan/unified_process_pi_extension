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
 *   up_save_artifact  - Save an artifact to docs/up/
 *   up_load_artifact  - Load an artifact from docs/up/
 *   up_update_state   - Update the UP state
 *   up_list_artifacts - List generated artifacts
 */

import type { ExtensionAPI, ExtensionContext } from '@mariozechner/pi-coding-agent';
import { registerTools } from './src/tools.ts';
import { registerCommands } from './src/commands.ts';
import {
  ACTIVITY_ORDER,
  clearRecommendedNextAction,
  getEffectiveNextCommand,
  getRecommendedNextCommand,
  restoreStateForProject,
  saveStateToProject,
  getStatusSummary,
  getNextActivity,
  type UPState,
} from './src/state.ts';

const AUTO_MODE_ENTRY_TYPE = 'up-auto-mode';
const AUTO_TOGGLE_SHORTCUTS = ['ctrl+shift+y', 'ctrl+shift+n', 'ctrl+shift+t'] as const;

type ActiveAutoTransition = {
  command: string;
  skillName: string;
  progressDetected: boolean;
};

function restoreAutoTransitionMode(entries: any[]): boolean {
  const autoEntries = entries.filter(
    (entry) => entry.type === 'custom' && entry.customType === AUTO_MODE_ENTRY_TYPE
  );

  if (!autoEntries.length) return false;
  return Boolean(autoEntries[autoEntries.length - 1]?.data?.enabled);
}

function extractUPSkillName(text: string): string | null {
  const match = text.trim().match(/^\/skill:up-([a-z-]+)\b/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function buildUPSkillCommand(skillName: string): string {
  return `/skill:up-${skillName}`;
}

function extractActivityFromUPCommand(command: string): string | null {
  const match = command.match(/^\/skill:up-([a-z-]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function isAutoChainSkill(skillName: string): boolean {
  return skillName === 'orchestrator' || ACTIVITY_ORDER.includes(skillName as (typeof ACTIVITY_ORDER)[number]);
}

function formatShortcutList(): string {
  return AUTO_TOGGLE_SHORTCUTS.map((shortcut) => shortcut.toUpperCase()).join(' | ');
}

export default function unifiedProcessExtension(pi: ExtensionAPI): void {
  let currentState: UPState | null = null;
  let autoTransitionEnabled = false;
  let activeAutoTransition: ActiveAutoTransition | null = null;

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
  const formatRecommendedNextStatus = (state: UPState | null): string => {
    if (!state) return '➡️ no-process';

    const explicitNext = getRecommendedNextCommand(state);
    const effectiveNext = getEffectiveNextCommand(state);
    if (!effectiveNext) return '➡️ DONE';

    return explicitNext ? `➡️ ${explicitNext} ★` : `➡️ ${effectiveNext}`;
  };
  const compactReason = (reason: string, maxLength = 120): string => {
    const normalized = reason.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 1)}…`;
  };
  const classifyRecommendation = (state: UPState, explicitNext: string) => {
    const reason = state.recommendedNextReason.toLowerCase();
    const riskSignals = /(risk|risco|critical|crítico|critico|danger|blocker|blocked|falha|failure|gap|inconsist|unsafe)/i;
    if (riskSignals.test(reason)) {
      return { icon: '⚠', label: 'UP risk-aware recommendation', tone: 'warning' as const };
    }

    if (explicitNext === '/skill:up-orchestrator') {
      return { icon: '⟳', label: 'UP coordination recommendation', tone: 'accent' as const };
    }

    if (explicitNext === '/up-next') {
      return { icon: '▶', label: 'UP forward recommendation', tone: 'success' as const };
    }

    const linearNext = getNextActivity(state);
    const linearIndex = linearNext ? ACTIVITY_ORDER.indexOf(linearNext) : -1;
    const explicitActivity = extractActivityFromUPCommand(explicitNext);
    const explicitIndex = explicitActivity ? ACTIVITY_ORDER.indexOf(explicitActivity as (typeof ACTIVITY_ORDER)[number]) : -1;

    if (explicitNext === getEffectiveNextCommand(clearRecommendedNextAction(state))) {
      return { icon: '▶', label: 'UP forward recommendation', tone: 'success' as const };
    }

    if (explicitIndex >= 0 && linearIndex >= 0 && explicitIndex < linearIndex) {
      return { icon: '↩', label: 'UP upstream refinement', tone: 'warning' as const };
    }

    if (explicitIndex >= 0 && linearIndex >= 0 && explicitIndex > linearIndex) {
      return { icon: '⇢', label: 'UP non-linear jump', tone: 'accent' as const };
    }

    return { icon: '★', label: 'UP explicit recommendation', tone: 'accent' as const };
  };
  const buildRecommendationWidgetLines = (ctx: ExtensionContext, state: UPState | null): string[] | undefined => {
    if (!state) return undefined;

    const explicitNext = getRecommendedNextCommand(state);
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
  const refreshUPUI = (ctx: ExtensionContext, state: UPState | null = currentState): void => {
    ctx.ui.setStatus('up:auto', autoTransitionEnabled ? '🤖 UP AUTO' : '🤖 UP MANUAL');
    ctx.ui.setStatus('up:next', formatRecommendedNextStatus(state));
    ctx.ui.setWidget('up:recommendation', buildRecommendationWidgetLines(ctx, state));

    if (!state) return;
    ctx.ui.setStatus('up', getStatusSummary(state));
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
      '**Authoritative system vision:**',
      currentState.vision || '(not provided)',
      '',
      `**Automatic transition mode:** ${autoTransitionEnabled ? 'ENABLED — do not ask the user to invoke the next UP command manually when a stage is completed; the extension will continue the flow.' : 'DISABLED — recommend the next UP command to the user as usual.'}`,
      `**Explicit recommended next command:** ${getRecommendedNextCommand(currentState) ?? '(none)'}`,
      ...(currentState.recommendedNextReason
        ? [`**Recommendation rationale:** ${currentState.recommendedNextReason}`]
        : []),
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
      '**IMPORTANT — System Naming Protocol:** when a process starts or resumes, read the authoritative vision first and persist the canonical systemName with up_update_state if the current name is provisional, truncated, or improvable.',
      '**IMPORTANT — Next Action Protocol:** when /skill:up-orchestrator decides what must happen next, it should persist `recommendedNextCommand` and `recommendedNextReason` with up_update_state before saving/updating the process plan. Use this explicit recommendation for refinement loops, upstream returns, and non-linear iteration.',
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
    if (event.toolName === 'up_save_artifact' || event.toolName === 'up_update_state') {
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

  registerTools(pi, getState, setState, ensureState, commitState);
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
