/**
 * Unified Process (UP) Extension — Slash Commands Registration
 * Registers the 5 slash commands: /up, /up-status, /up-next, /up-auto, /up-artifacts
 */

import type { ExtensionAPI, ExtensionCommandContext } from '@mariozechner/pi-coding-agent';
import {
  clearRecommendedNextAction,
  createInitialState,
  getEffectiveNextCommand,
  getNextActivity,
  getRecommendedNextCommand,
  type UPState,
} from './state.ts';
import { deriveSystemNameFromVision, normalizeVisionText } from './system-name.ts';

function buildStartFollowUp(state: UPState): string {
  return [
    'Execute /skill:up-orchestrator to create or refresh the Unified Process master plan.',
    `Provisional system name candidate: "${state.systemName}"`,
    'MANDATORY FIRST STEP: read the COMPLETE system vision below, establish the canonical systemName for the project, and immediately persist it with up_update_state before generating or updating any artifact.',
    'MANDATORY ORCHESTRATION STEP: after deciding what should happen next, persist the exact recommendedNextCommand and recommendedNextReason with up_update_state before continuing.',
    'Use the COMPLETE system vision below as the authoritative baseline for scope, actors, requirements, constraints, and business rules.',
    '',
    'Complete system vision:',
    state.vision,
  ].join('\n');
}

function buildResumeFollowUp(state: UPState, next: ReturnType<typeof getNextActivity>): string {
  const recommendedNext = getRecommendedNextCommand(state);
  const resumeCommand = recommendedNext ?? '/skill:up-orchestrator';

  return [
    `Resume the Unified Process by executing ${resumeCommand}.`,
    `Current systemName: "${state.systemName}"`,
    'Before proceeding, validate whether the current systemName still matches the authoritative vision. If a better canonical name is evident, persist it immediately with up_update_state.',
    'Persist the next explicit orchestration decision with recommendedNextCommand and recommendedNextReason before continuing, especially if refinement of an upstream stage is required.',
    `Current phase: ${state.currentPhase}`,
    `Next activity: ${next ?? 'COMPLETED'}`,
    `Recommended next command: ${recommendedNext ?? '(none)'}`,
    ...(state.recommendedNextReason
      ? [`Recommendation rationale: ${state.recommendedNextReason}`]
      : []),
    `Known artifacts: ${state.artifacts.length}`,
    '',
    'Authoritative system vision:',
    state.vision || '(vision not stored in state)',
  ].join('\n');
}

function getNoStateMessage(): string {
  return 'No active or recoverable UP process found in this project. Use /up [system vision] to start one.';
}

function formatAutoMode(enabled: boolean): string {
  return enabled ? 'ON' : 'OFF';
}

async function consumeRecommendedNextCommandIfNeeded(
  ctx: ExtensionCommandContext,
  state: UPState,
  commitState: (cwd: string, state: UPState) => Promise<void>
): Promise<UPState> {
  if (!getRecommendedNextCommand(state)) return state;

  const cleared = clearRecommendedNextAction(state);
  await commitState(ctx.cwd, cleared);
  return cleared;
}

export function registerCommands(
  pi: ExtensionAPI,
  getState: () => UPState | null,
  _setState: (s: UPState) => void,
  ensureState: (cwd: string, entries?: any[]) => Promise<UPState | null>,
  commitState: (cwd: string, state: UPState) => Promise<void>,
  isAutoTransitionEnabled: () => boolean,
  setAutoTransitionEnabled: (ctx: ExtensionCommandContext, enabled: boolean) => void,
  toggleAutoTransition: (ctx: ExtensionCommandContext) => boolean,
  dispatchUPCommand: (command: string, ctx: ExtensionCommandContext, reason?: string) => void,
  refreshUPUI: (ctx: ExtensionCommandContext, state?: UPState | null) => void
): void {
  pi.registerCommand('up', {
    description: 'Start a new Unified Process or intelligently resume one from the current project.',
    handler: async (args, ctx) => {
      const visionFromArgs = normalizeVisionText(args);

      if (visionFromArgs) {
        const state = createInitialState(
          deriveSystemNameFromVision(visionFromArgs),
          visionFromArgs
        );
        await commitState(ctx.cwd, state);
        refreshUPUI(ctx, state);
        ctx.ui.notify(`🔄 UP process started: "${state.systemName}"`, 'success');
        if (isAutoTransitionEnabled()) {
          dispatchUPCommand('/skill:up-orchestrator', ctx, 'UP auto-transition started');
        } else {
          pi.sendUserMessage(buildStartFollowUp(state), { deliverAs: 'followUp' });
        }
        return;
      }

      const state =
        getState() ??
        (await ensureState(ctx.cwd, (ctx.sessionManager?.getEntries?.() as any[]) ?? []));

      if (state) {
        const next = getNextActivity(state);
        refreshUPUI(ctx, state);
        ctx.ui.notify(
          `📐 UP process resumed: "${state.systemName}"
Phase: ${state.currentPhase} | Iteration: ${state.currentIteration}
Next: ${next ?? 'COMPLETED'}
Artifacts found: ${state.artifacts.length}`,
          'info'
        );
        const effectiveResumeCommand = getEffectiveNextCommand(state) ?? '/skill:up-orchestrator';
        if (isAutoTransitionEnabled()) {
          if (getRecommendedNextCommand(state)) {
            const clearedState = await consumeRecommendedNextCommandIfNeeded(ctx, state, commitState);
            refreshUPUI(ctx, clearedState);
          }
          dispatchUPCommand(effectiveResumeCommand, ctx, 'UP auto-transition resumed');
        } else {
          pi.sendUserMessage(buildResumeFollowUp(state, next), { deliverAs: 'followUp' });
        }
        return;
      }

      const vision = await ctx.ui.input(
        'Unified Process OO',
        'Describe the system to be developed (System Vision):'
      );

      const normalizedVision = normalizeVisionText(vision ?? '');
      if (!normalizedVision) return;

      const newState = createInitialState(
        deriveSystemNameFromVision(normalizedVision),
        normalizedVision
      );
      await commitState(ctx.cwd, newState);
      refreshUPUI(ctx, newState);
      ctx.ui.notify(`🔄 UP process started: "${newState.systemName}"`, 'success');
      if (isAutoTransitionEnabled()) {
        dispatchUPCommand('/skill:up-orchestrator', ctx, 'UP auto-transition started');
      } else {
        pi.sendUserMessage(buildStartFollowUp(newState), { deliverAs: 'followUp' });
      }
    },
  });

  pi.registerCommand('up-status', {
    description: 'Display the current Unified Process state',
    handler: async (_args, ctx) => {
      const state =
        getState() ??
        (await ensureState(ctx.cwd, (ctx.sessionManager?.getEntries?.() as any[]) ?? []));

      if (!state) {
        ctx.ui.notify(getNoStateMessage(), 'warning');
        return;
      }

      const next = getNextActivity(state);
      const artifacts = state.artifacts.length
        ? state.artifacts.map((artifact) => `  • ${artifact.path}: ${artifact.title}`).join('\n')
        : '  (no artifacts generated yet)';

      const recommendedNext = getRecommendedNextCommand(state);
      const message = [
        `📋 Unified Process: "${state.systemName}"`,
        `Auto-transition: ${formatAutoMode(isAutoTransitionEnabled())}`,
        `Phase: ${state.currentPhase} | Iteration: ${state.currentIteration}`,
        `Completed activities: ${state.completedActivities.join(', ') || '(none)'}`,
        `Next activity: ${next ?? '✅ COMPLETED'}`,
        `Recommended next command: ${recommendedNext ?? '(none)'}`,
        ...(state.recommendedNextReason
          ? [`Recommendation rationale: ${state.recommendedNextReason}`]
          : []),
        `Generated artifacts (${state.artifacts.length}):`,
        artifacts,
      ].join('\n');

      refreshUPUI(ctx, state);
      ctx.ui.notify(message, 'info');
    },
  });

  pi.registerCommand('up-next', {
    description: 'Advance to the next Unified Process activity',
    handler: async (_args, ctx) => {
      const state =
        getState() ??
        (await ensureState(ctx.cwd, (ctx.sessionManager?.getEntries?.() as any[]) ?? []));

      if (!state) {
        ctx.ui.notify(getNoStateMessage(), 'warning');
        return;
      }

      const recommendedNext = getRecommendedNextCommand(state);
      const effectiveNextCommand = getEffectiveNextCommand(state);
      if (!effectiveNextCommand) {
        ctx.ui.notify('✅ Unified Process completed! All artifacts have been generated.', 'success');
        return;
      }

      refreshUPUI(ctx, state);
      ctx.ui.notify(
        `▶️ Starting UP activity: ${recommendedNext ?? effectiveNextCommand}`,
        'info'
      );
      if (isAutoTransitionEnabled()) {
        if (recommendedNext) {
          const clearedState = await consumeRecommendedNextCommandIfNeeded(ctx, state, commitState);
          refreshUPUI(ctx, clearedState);
        }
        dispatchUPCommand(effectiveNextCommand, ctx, `UP auto-transition → ${effectiveNextCommand}`);
      } else {
        pi.sendUserMessage(
          [
            `Execute the Unified Process next command: ${effectiveNextCommand}`,
            `System: "${state.systemName}"`,
            `Current phase: ${state.currentPhase}`,
            ...(recommendedNext ? [`Recommendation rationale: ${state.recommendedNextReason || '(not provided)'}`] : []),
          ].join('\n'),
          { deliverAs: 'followUp' }
        );
      }
    },
  });

  pi.registerCommand('up-auto', {
    description: 'Toggle automatic UP stage transitions (usage: /up-auto [on|off|status])',
    handler: async (args, ctx) => {
      const normalized = args.trim().toLowerCase();

      if (!normalized || normalized === 'toggle') {
        const enabled = toggleAutoTransition(ctx);
        ctx.ui.notify(`🤖 UP auto-transition: ${formatAutoMode(enabled)}`, 'info');
        return;
      }

      if (normalized === 'status') {
        ctx.ui.notify(`🤖 UP auto-transition: ${formatAutoMode(isAutoTransitionEnabled())}`, 'info');
        return;
      }

      if (normalized === 'on' || normalized === 'off') {
        const enabled = normalized === 'on';
        setAutoTransitionEnabled(ctx, enabled);
        ctx.ui.notify(`🤖 UP auto-transition: ${formatAutoMode(enabled)}`, 'info');
        return;
      }

      ctx.ui.notify('Usage: /up-auto [on|off|status]', 'warning');
    },
  });

  pi.registerCommand('up-artifacts', {
    description: 'List and browse generated UP artifacts',
    handler: async (_args, ctx) => {
      const state =
        getState() ??
        (await ensureState(ctx.cwd, (ctx.sessionManager?.getEntries?.() as any[]) ?? []));

      if (!state || !state.artifacts.length) {
        ctx.ui.notify('No UP artifacts generated yet. Use /up or /up-next to start the process.', 'info');
        return;
      }

      const items = state.artifacts
        .slice()
        .sort((a, b) => a.generated - b.generated)
        .map((artifact) => `${artifact.path} — ${artifact.title} [${artifact.phase}]`);

      const selected = await ctx.ui.select('UP Artifacts — Select one to view', items);
      if (!selected) return;

      const selectedPath = selected.split(' — ')[0];
      pi.sendUserMessage(`Read and display the full contents of the file: docs/up/${selectedPath}`, {
        deliverAs: 'followUp',
      });
    },
  });
}
