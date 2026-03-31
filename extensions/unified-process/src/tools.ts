/**
 * Unified Process (UP) Extension — Custom Tools Registration
 * Registers the custom tools available to the LLM.
 */

import { Type } from '@sinclair/typebox';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { ExtensionAPI } from '@mariozechner/pi-coding-agent';
import type { UPState, UPArtifact } from './state.ts';
import { applyStateUpdates } from './state.ts';

export function registerTools(
  pi: ExtensionAPI,
  getState: () => UPState | null,
  setState: (s: UPState) => void
): void {
  pi.registerTool({
    name: 'up_save_artifact',
    label: 'UP Save Artifact',
    description:
      'Saves a Unified Process artifact to docs/up/<path>. Use after generating each UP artifact (vision, requirements, use cases, etc.).',
    promptSnippet: 'Save a generated UP artifact to docs/up/',
    parameters: Type.Object({
      path: Type.String({
        description:
          'Relative path inside docs/up/ (e.g., 01-vision.md, 03-use-cases/UC-01-buy.md)',
      }),
      title: Type.String({
        description:
          'Human-readable artifact title (e.g., System Vision Document, UC-01 Buy Book)',
      }),
      content: Type.String({ description: 'Complete markdown content of the artifact' }),
      phase: Type.String({
        description: 'UP phase: inception | elaboration | construction | transition',
      }),
      activity: Type.String({
        description:
          'UP activity: vision | requirements | use-cases | sequence-diagrams | conceptual-model | contracts | tech-stack | tdd | design-patterns | object-design | interface-design | design-system | implementation | deploy | documentation | data-mapping',
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const absolutePath = join(ctx.cwd, 'docs', 'up', params.path);
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, params.content, 'utf8');

      const state = getState();
      if (state) {
        const artifact: UPArtifact = {
          path: params.path,
          phase: params.phase as any,
          activity: params.activity as any,
          title: params.title,
          generated: Date.now(),
        };

        const nextState = applyStateUpdates(state, {
          artifacts: [
            ...state.artifacts.filter((existing) => existing.path !== params.path),
            artifact,
          ],
        });

        setState(nextState);
        pi.appendEntry('up-state', nextState);
      }

      return {
        content: [{ type: 'text', text: `Artifact saved: docs/up/${params.path}` }],
        details: { path: params.path, title: params.title },
      };
    },
  });

  pi.registerTool({
    name: 'up_load_artifact',
    label: 'UP Load Artifact',
    description: 'Loads the content of a UP artifact from docs/up/<path>.',
    promptSnippet: 'Load a UP artifact from docs/up/',
    parameters: Type.Object({
      path: Type.String({ description: 'Relative path inside docs/up/ (e.g., 01-vision.md)' }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const absolutePath = join(ctx.cwd, 'docs', 'up', params.path);
      const content = await readFile(absolutePath, 'utf8');
      return {
        content: [{ type: 'text', text: content }],
        details: { path: params.path },
      };
    },
  });

  pi.registerTool({
    name: 'up_update_state',
    label: 'UP Update State',
    description:
      'Updates the Unified Process state. Use to mark activities as completed or change the current phase.',
    promptSnippet: 'Update UP state (phase, completed activities)',
    parameters: Type.Object({
      updates: Type.String({
        description:
          'JSON string with the fields to update. Example: {"completedActivities":["vision","requirements"],"currentPhase":"elaboration"}',
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const state = getState();
      if (!state) throw new Error('No active UP process. Use /up [vision] to start one.');

      const updates = JSON.parse(params.updates);
      const nextState = applyStateUpdates(state, updates);
      setState(nextState);
      pi.appendEntry('up-state', nextState);

      return {
        content: [
          {
            type: 'text',
            text: `UP state updated. Phase: ${nextState.currentPhase}, Completed: ${nextState.completedActivities.join(', ') || '(none)'}`,
          },
        ],
        details: { state: nextState },
      };
    },
  });

  pi.registerTool({
    name: 'up_list_artifacts',
    label: 'UP List Artifacts',
    description: 'Lists UP artifacts generated in this session, optionally filtered by phase.',
    promptSnippet: 'List generated UP artifacts',
    parameters: Type.Object({
      phase: Type.Optional(
        Type.String({ description: 'Filter by phase: inception | elaboration | construction | transition' })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const state = getState();
      if (!state) {
        return {
          content: [{ type: 'text', text: 'No active UP process.' }],
          details: {},
        };
      }

      const artifacts = params.phase
        ? state.artifacts.filter((artifact) => artifact.phase === params.phase)
        : state.artifacts;

      if (!artifacts.length) {
        return {
          content: [{ type: 'text', text: '(no artifacts generated yet)' }],
          details: { artifacts: [] },
        };
      }

      const list = artifacts
        .sort((a, b) => a.generated - b.generated)
        .map((artifact) => `- ${artifact.path}: ${artifact.title} [${artifact.phase}]`)
        .join('\n');

      return {
        content: [{ type: 'text', text: list }],
        details: { artifacts },
      };
    },
  });
}
