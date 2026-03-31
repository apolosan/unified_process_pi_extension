/**
 * Unified Process (UP) Extension — Slash Commands Registration
 * Registers the 4 slash commands: /up, /up-status, /up-next, /up-artifacts
 */

import type { ExtensionAPI } from '@mariozechner/pi-coding-agent';
import {
  createInitialState,
  getNextActivity,
  getStatusSummary,
  type UPState,
} from './state.ts';

function deriveSystemName(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ');
}

export function registerCommands(
  pi: ExtensionAPI,
  getState: () => UPState | null,
  setState: (s: UPState) => void
): void {
  pi.registerCommand('up', {
    description: 'Start or resume the Unified Process. Usage: /up [system vision]',
    handler: async (args, ctx) => {
      const trimmed = args.trim();

      if (trimmed) {
        const state = createInitialState(deriveSystemName(trimmed), trimmed);
        setState(state);
        pi.appendEntry('up-state', state);
        ctx.ui.setStatus('up', getStatusSummary(state));
        ctx.ui.notify(`🔄 UP process started: "${state.systemName}"`, 'success');
        pi.sendUserMessage(
          `Execute /skill:up-orchestrator to create the Unified Process master plan for the system: ${state.systemName}`,
          { deliverAs: 'followUp' }
        );
        return;
      }

      const state = getState();
      if (state) {
        const next = getNextActivity(state);
        ctx.ui.notify(
          `UP Active: "${state.systemName}"\nPhase: ${state.currentPhase} | Iteration: ${state.currentIteration}\nNext: ${next ?? 'COMPLETED'}\nUse /up-status for details, /up-next to advance.`,
          'info'
        );
        return;
      }

      const vision = await ctx.ui.input(
        'Unified Process OO',
        'Describe the system to be developed (System Vision):'
      );

      if (!vision?.trim()) return;

      const newState = createInitialState(deriveSystemName(vision), vision);
      setState(newState);
      pi.appendEntry('up-state', newState);
      ctx.ui.setStatus('up', getStatusSummary(newState));
      ctx.ui.notify(`🔄 UP process started: "${newState.systemName}"`, 'success');
      pi.sendUserMessage(
        `Execute /skill:up-orchestrator to start the Unified Process with the vision: ${vision}`,
        { deliverAs: 'followUp' }
      );
    },
  });

  pi.registerCommand('up-status', {
    description: 'Display the current Unified Process state',
    handler: async (_args, ctx) => {
      const state = getState();
      if (!state) {
        ctx.ui.notify('No active UP process. Use /up [system vision] to start one.', 'warning');
        return;
      }

      const next = getNextActivity(state);
      const artifacts = state.artifacts.length
        ? state.artifacts.map((artifact) => `  • ${artifact.path}: ${artifact.title}`).join('\n')
        : '  (no artifacts generated yet)';

      const message = [
        `📋 Unified Process: "${state.systemName}"`,
        `Phase: ${state.currentPhase} | Iteration: ${state.currentIteration}`,
        `Completed activities: ${state.completedActivities.join(', ') || '(none)'}`,
        `Next activity: ${next ?? '✅ COMPLETED'}`,
        `Generated artifacts (${state.artifacts.length}):`,
        artifacts,
      ].join('\n');

      ctx.ui.notify(message, 'info');
    },
  });

  pi.registerCommand('up-next', {
    description: 'Advance to the next Unified Process activity',
    handler: async (_args, ctx) => {
      const state = getState();
      if (!state) {
        ctx.ui.notify('No active UP process. Use /up [system vision] to start one.', 'warning');
        return;
      }

      const next = getNextActivity(state);
      if (!next) {
        ctx.ui.notify('✅ Unified Process completed! All artifacts have been generated.', 'success');
        return;
      }

      ctx.ui.notify(`▶️ Starting UP activity: ${next}`, 'info');
      pi.sendUserMessage(
        `Execute the Unified Process skill for activity "${next}".\nUse the command: /skill:up-${next}\nSystem: "${state.systemName}"\nCurrent phase: ${state.currentPhase}`,
        { deliverAs: 'followUp' }
      );
    },
  });

  pi.registerCommand('up-artifacts', {
    description: 'List and browse generated UP artifacts',
    handler: async (_args, ctx) => {
      const state = getState();
      if (!state || !state.artifacts.length) {
        ctx.ui.notify('No UP artifacts generated yet. Use /up-next to start the process.', 'info');
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
