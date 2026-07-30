/**
 * Unified Process (UP) Extension — Custom Tools Registration
 * Registers the custom tools available to the LLM.
 */

import { Type } from '@sinclair/typebox';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ExtensionAPI } from '@mariozechner/pi-coding-agent';
import type { UPArtifact, UPState } from './state.ts';
import { recordIntegrationCheck, requirePaths } from './integration-tools.ts';
import { applyStateUpdates, inferArtifactMetadata } from './state.ts';
import { parseStateUpdates, resolveArtifactPath } from './tool-validation.ts';
import { runTestQualityAudit } from './test-quality/audit-tool.ts';
import { writeHandoffDocument } from './test-quality/handoff-tool.ts';

export function registerTools(
  pi: ExtensionAPI,
  getState: () => UPState | null,
  _setState: (s: UPState) => void,
  ensureState: (cwd: string, entries?: any[]) => Promise<UPState | null>,
  commitState: (cwd: string, state: UPState) => Promise<void>,
  onIntegrationEvidenceChanged?: (cwd: string) => Promise<void>
): void {
  pi.registerTool({
    name: 'up_save_artifact',
    label: 'UP Save Artifact',
    description:
      'Saves a Unified Process artifact to docs/up/<path>. Missing title/phase/activity are inferred from the artifact path when possible.',
    promptSnippet: 'Save a generated UP artifact to docs/up/',
    parameters: Type.Object({
      path: Type.String({
        description:
          'Relative path inside docs/up/ (e.g., 01-vision.md, 03-use-cases/UC-01-buy.md)',
      }),
      title: Type.Optional(
        Type.String({
          description:
            'Optional human-readable artifact title. If omitted, the extension infers one from the path.',
        })
      ),
      content: Type.String({ description: 'Complete markdown content of the artifact' }),
      phase: Type.Optional(
        Type.String({
          description:
            'Optional UP phase: inception | elaboration | construction | transition. Inferred from the path when omitted.',
        })
      ),
      activity: Type.Optional(
        Type.String({
          description:
            'Optional UP activity. Inferred from the path when omitted. Supports vision, requirements, use-cases, sequence-diagrams, conceptual-model, contracts, tech-stack, tdd, design-patterns, object-design, interface-design, design-system, data-mapping, implementation, deploy, documentation, orchestrator.',
        })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const { absolutePath, artifactPath } = resolveArtifactPath(ctx.cwd, params.path);
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, params.content, 'utf8');

      const inferred = inferArtifactMetadata(artifactPath);
      const artifact: UPArtifact = {
        path: artifactPath,
        phase: (params.phase as UPArtifact['phase'] | undefined) ?? inferred?.phase ?? 'inception',
        activity:
          (params.activity as UPArtifact['activity'] | undefined) ?? inferred?.activity ?? 'unknown',
        title: params.title ?? inferred?.title ?? artifactPath,
        generated: Date.now(),
      };

      const state = getState() ?? (await ensureState(ctx.cwd));
      if (state) {
        const nextState = applyStateUpdates(state, {
          artifacts: [
            ...state.artifacts.filter((existing) => existing.path !== artifact.path),
            artifact,
          ],
          completedActivities: inferred?.completedActivity ? [inferred.completedActivity] : [],
        });

        await commitState(ctx.cwd, nextState);
      }

      return {
        content: [{ type: 'text', text: `Artifact saved: docs/up/${artifact.path}` }],
        details: { path: artifact.path, title: artifact.title, inferred },
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
      const { absolutePath, artifactPath } = resolveArtifactPath(ctx.cwd, params.path);
      const content = await readFile(absolutePath, 'utf8');
      return {
        content: [{ type: 'text', text: content }],
        details: { path: artifactPath },
      };
    },
  });

  pi.registerTool({
    name: 'up_update_state',
    label: 'UP Update State',
    description:
      'Updates the Unified Process state. Use to mark activities as completed or persist the explicit next command chosen by the orchestrator for refinement-aware transitions.',
    promptSnippet: 'Update UP state (completed activities, recommended next command)',
    parameters: Type.Object({
      updates: Type.String({
        description:
          'JSON string with supported fields. Examples: {"completedActivities":["vision","requirements"]} or {"recommendedNextCommand":"/skill:up-contracts","recommendedNextReason":"Implementation revealed a contract gap that must be refined before proceeding."}',
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const state = getState() ?? (await ensureState(ctx.cwd));
      if (!state) throw new Error('No active or recoverable UP process. Use /up [vision] to start one.');

      const updates = parseStateUpdates(params.updates);
      const nextState = applyStateUpdates(state, updates);
      await commitState(ctx.cwd, nextState);

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
    description: 'Lists UP artifacts generated in this project, optionally filtered by phase.',
    promptSnippet: 'List generated UP artifacts',
    parameters: Type.Object({
      phase: Type.Optional(
        Type.String({ description: 'Filter by phase: inception | elaboration | construction | transition' })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const state = getState() ?? (await ensureState(ctx.cwd));
      if (!state) {
        return {
          content: [{ type: 'text', text: 'No active or recoverable UP process.' }],
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
        .slice()
        .sort((a, b) => a.generated - b.generated)
        .map((artifact) => `- ${artifact.path}: ${artifact.title} [${artifact.phase}]`)
        .join('\n');

      return {
        content: [{ type: 'text', text: list }],
        details: { artifacts },
      };
    },
  });

  pi.registerTool({
    name: 'up_record_integration_check',
    label: 'UP Record Integration Check',
    description:
      'Records integration/smoke verification evidence (command, exit code, timestamp) in docs/up/14-implementation/smoke.log. Does not run commands — execute the command separately, then record the result.',
    promptSnippet: 'Record smoke/integration check evidence to smoke.log',
    parameters: Type.Object({
      command: Type.String({
        description: 'Exact command that was executed (e.g. npm run test:smoke)',
      }),
      checkType: Type.Optional(
        Type.String({
          description:
            'Structured check type: stack_up | api_health | smoke | tier1_integrated_e2e. Defaults to smoke for backwards compatibility.',
        })
      ),
      exitCode: Type.Number({
        description: 'Process exit code (0 = success)',
      }),
      notes: Type.Optional(
        Type.String({ description: 'Optional one-line summary of the run' })
      ),
      append: Type.Optional(
        Type.Boolean({
          description: 'Append to smoke.log (default true). Set false to replace the log.',
        })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const result = await recordIntegrationCheck(ctx.cwd, {
        checkType: params.checkType as any,
        command: params.command,
        exitCode: params.exitCode,
        notes: params.notes,
        append: params.append,
      });

      await onIntegrationEvidenceChanged?.(ctx.cwd);

      const summary = [
        `Integration evidence recorded: ${result.path}`,
        `status: ${result.status}`,
        `check_type: ${result.checkType}`,
        `exit_code: ${result.exitCode}`,
        `timestamp: ${result.timestamp}`,
        `command: ${result.command}`,
        ...(result.notes ? [`notes: ${result.notes}`] : []),
      ].join('\n');

      return {
        content: [{ type: 'text', text: summary }],
        details: result,
      };
    },
  });

  pi.registerTool({
    name: 'up_require_paths',
    label: 'UP Require Paths',
    description:
      'Validates that key integration files exist (API surface, tests, .env.example, integration matrix, system operations). Fails by default when paths are missing.',
    promptSnippet: 'Verify required integration paths exist before implementation/deploy',
    parameters: Type.Object({
      paths: Type.Optional(
        Type.Array(Type.String(), {
          description:
            'Optional flat list of required paths. When omitted, uses default path groups with alternatives (src/api|app/api, tests/e2e|tests/integration, etc.).',
        })
      ),
      strict: Type.Optional(
        Type.Boolean({
          description: 'When true (default), fail if any required path/group is missing.',
        })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const groups = params.paths?.length
        ? params.paths.map((path, index) => ({
            id: `custom-${index}`,
            label: path,
            alternatives: [path],
          }))
        : undefined;

      const result = await requirePaths(ctx.cwd, {
        groups,
        strict: params.strict,
      });

      const lines = [
        result.ok ? 'All required integration paths are present.' : 'Some required paths are missing.',
        '',
        'Present:',
        ...(result.present.length
          ? result.present.map((entry) => `- ${entry.label}: \`${entry.matched}\``)
          : ['- (none)']),
        '',
        'Missing:',
        ...(result.missing.length
          ? result.missing.map(
              (entry) =>
                `- ${entry.label}: expected one of ${entry.alternatives.map((p) => `\`${p}\``).join(', ')}`
            )
          : ['- (none)']),
      ];

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
        details: result,
      };
    },
  });

  pi.registerTool({
    name: 'up_test_quality_audit',
    label: 'UP Test Quality Audit',
    description:
      'Audits test files against P1 (mediocre patterns) and P2 (RF/RNF traceability). Returns totals, issue list, and coverage gaps. Use mode=strict before saving TDD artifacts or during TDD phase to enforce 100% RF/RNF coverage with no mediocre tests.',
    promptSnippet: 'Run static analysis on test files for P1/P2 violations',
    parameters: Type.Object({
      mode: Type.Optional(
        Type.String({
          description: 'report (default) | strict — strict returns passed=false when any P1 or coverage gap exists',
        })
      ),
      requirementsFile: Type.Optional(
        Type.String({
          description: 'Override path for the requirements document. Defaults to docs/up/02-requirements.md.',
        })
      ),
      scope: Type.Optional(
        Type.String({
          description: 'project (default — scans cwd) | extensions (scans cwd/extensions only)',
        })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const mode = (params.mode === 'strict' ? 'strict' : 'report') as 'report' | 'strict';
      const report = await runTestQualityAudit({
        cwd: ctx.cwd,
        mode,
        requirementsFile: params.requirementsFile,
      });
      const lines = [
        `Audit (${report.mode}) — passed: ${report.passed ? 'yes' : 'no'}`,
        `Files scanned: ${report.totals.files}`,
        `Tests: ${report.totals.tests}`,
        `Mediocre issues: ${report.totals.mediocre}`,
        `Uncovered RF: ${report.totals.uncoveredRf}`,
        `Uncovered RNF: ${report.totals.uncoveredRnf}`,
        '',
        ...(report.totals.mediocre
          ? [
              'Issues:',
              ...report.issues.slice(0, 50).map(
                (i) => `  [${i.type}] ${i.file}:${i.line}  ${i.testName} — ${i.message}`,
              ),
            ]
          : []),
        '',
        ...(report.coverage.uncoveredRf.length
          ? [
              'Uncovered RF:',
              ...report.coverage.uncoveredRf.map((r) => `  ${r.id}: ${r.title}`),
            ]
          : []),
        '',
        ...(report.coverage.uncoveredRnf.length
          ? [
              'Uncovered RNF:',
              ...report.coverage.uncoveredRnf.map((r) => `  ${r.id}: ${r.title}`),
            ]
          : []),
      ];
      return {
        content: [{ type: 'text', text: lines.join('\n') }],
        details: report,
      };
    },
  });

  pi.registerTool({
    name: 'up_generate_handoff',
    label: 'UP Generate Handoff',
    description:
      'Generates a handoff document under docs/up/15-handoff/ that encodes the current UP state, audit summary, last 5 smoke.log entries, and numbered resume instructions. Use when a UP iteration cannot deliver the full deliverable set so the next iteration can resume without context loss.',
    promptSnippet: 'Write handoff doc capturing incomplete UP iteration state',
    parameters: Type.Object({
      iteration: Type.Optional(
        Type.Number({
          description: 'Override the iteration number. Default: state.currentIteration.',
        })
      ),
      outputDir: Type.Optional(
        Type.String({ description: 'Override output directory. Default: docs/up/15-handoff' })
      ),
      timestamp: Type.Optional(
        Type.String({
          description: 'ISO timestamp for deterministic filenames. Default: new Date().toISOString()',
        })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const state = getState() ?? (await ensureState(ctx.cwd));
      if (!state) {
        return {
          content: [
            { type: 'text', text: 'No active or recoverable UP process. Use /up [vision] to start one.' },
          ],
          details: { skipped: true },
        };
      }

      const auditReport = await runTestQualityAudit({ cwd: ctx.cwd, mode: 'report' });

      const result = await writeHandoffDocument({
        cwd: ctx.cwd,
        state:
          params.iteration !== undefined
            ? { ...state, currentIteration: params.iteration }
            : state,
        auditReport,
        outputDir: params.outputDir,
        timestamp: params.timestamp,
      });

      const summary = [
        `Handoff document written: ${result.path}`,
        `Bytes: ${result.bytes}`,
        `Iteration: ${state.currentIteration}`,
        ...(result.warnings.length ? ['Warnings:', ...result.warnings.map((w) => `  - ${w}`)] : []),
      ].join('\n');

      return {
        content: [{ type: 'text', text: summary }],
        details: result,
      };
    },
  });
}
