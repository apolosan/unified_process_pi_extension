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

function getNoStateMessage(): string {
  return 'No active or recoverable UP process found in this project. Use /up [system vision] to start one.';
}

export function registerCommands(
  pi: ExtensionAPI,
  getState: () => UPState | null,
  _setState: (s: UPState) => void,
  ensureState: (cwd: string, entries?: any[]) => Promise<UPState | null>,
  commitState: (cwd: string, state: UPState) => Promise<void>
): void {
  pi.registerCommand('up', {
    description: 'Start a new Unified Process or intelligently resume one from the current project.',
    handler: async (args, ctx) => {
      const trimmed = args.trim();

      if (trimmed) {
        const state = createInitialState(deriveSystemName(trimmed), trimmed);
        await commitState(ctx.cwd, state);
        ctx.ui.setStatus('up', getStatusSummary(state));
        ctx.ui.notify(`🔄 UP process started: "${state.systemName}"`, 'success');
        pi.sendUserMessage(
          `Execute /skill:up-orchestrator to create or refresh the Unified Process master plan for the system: ${state.systemName}`,
          { deliverAs: 'followUp' }
        );
        return;
      }

      const state =
        getState() ??
        (await ensureState(ctx.cwd, (ctx.sessionManager?.getEntries?.() as any[]) ?? []));

      if (state) {
        const next = getNextActivity(state);
        ctx.ui.setStatus('up', getStatusSummary(state));
        ctx.ui.notify(
          `📐 UP process resumed: "${state.systemName}"
Phase: ${state.currentPhase} | Iteration: ${state.currentIteration}
Next: ${next ?? 'COMPLETED'}
Artifacts found: ${state.artifacts.length}`,
          'info'
        );
        pi.sendUserMessage(
          `Resume the Unified Process by executing /skill:up-orchestrator.
System: "${state.systemName}"
Current phase: ${state.currentPhase}
Next activity: ${next ?? 'COMPLETED'}
Known artifacts: ${state.artifacts.length}`,
          { deliverAs: 'followUp' }
        );
        return;
      }

      const vision = await ctx.ui.input(
        'Unified Process OO',
        'Describe the system to be developed (System Vision):'
      );

      if (!vision?.trim()) return;

      const newState = createInitialState(deriveSystemName(vision), vision);
      await commitState(ctx.cwd, newState);
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

      const message = [
        `📋 Unified Process: "${state.systemName}"`,
        `Phase: ${state.currentPhase} | Iteration: ${state.currentIteration}`,
        `Completed activities: ${state.completedActivities.join(', ') || '(none)'}`,
        `Next activity: ${next ?? '✅ COMPLETED'}`,
        `Generated artifacts (${state.artifacts.length}):`,
        artifacts,
      ].join('\n');

      ctx.ui.setStatus('up', getStatusSummary(state));
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

      const next = getNextActivity(state);
      if (!next) {
        ctx.ui.notify('✅ Unified Process completed! All artifacts have been generated.', 'success');
        return;
      }

      ctx.ui.setStatus('up', getStatusSummary(state));
      ctx.ui.notify(`▶️ Starting UP activity: ${next}`, 'info');
      pi.sendUserMessage(
        `Execute the Unified Process skill for activity "${next}".
Use the command: /skill:up-${next}
System: "${state.systemName}"
Current phase: ${state.currentPhase}`,
        { deliverAs: 'followUp' }
      );
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
