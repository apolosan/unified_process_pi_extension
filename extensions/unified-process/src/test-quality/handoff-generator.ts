/**
 * Handoff Generator — produces the markdown document the orchestrator writes
 * when a UP iteration cannot deliver its full deliverable set.
 *
 * The generator is a pure function over a `HandoffInput`. The tool wrapper
 * (`handoff-tool.ts`) is responsible for IO: reading smoke.log, building the
 * input, writing the file to `docs/up/15-handoff/`.
 */

import type { Requirement } from './requirement-trace.ts';
import { ACTIVITY_ORDER, type UPActivity, type UPPhase } from '../state.ts';

export interface SmokeLogEntry {
  timestamp: string;
  command: string;
  exitCode: number;
  checkType?: string;
}

export interface HandoffInput {
  systemName: string;
  phase: UPPhase;
  iteration: number;
  completedActivities: UPActivity[];
  /** Optional map of activity → reason for marking as `partial`. */
  partialActivities?: Partial<Record<UPActivity, string>>;
  recommendedNext: string | null;
  recommendedReason: string;
  smokeLogEntries: SmokeLogEntry[];
  audit: {
    total: number;
    mediocre: number;
    uncoveredRf: number;
    uncoveredRnf: number;
  };
  uncovered: Requirement[];
  outputDir: string;
  timestamp: string;
  /** Optional git branch / session id included as recovery pointers. */
  recoveryPointers?: {
    branch?: string;
    sessionId?: string;
    lastArtifactPath?: string;
  };
}

const MAX_SMOKE_ENTRIES = 5;
const MAX_OUTPUT_BYTES = 32 * 1024;

export function generateHandoffMarkdown(input: HandoffInput): string {
  const sections: string[] = [];
  sections.push(buildHeader(input));
  sections.push(buildSystemIdentity(input));
  sections.push(buildCompletionTable(input));
  sections.push(buildUncoveredSection(input.uncovered));
  sections.push(buildSmokeSection(input.smokeLogEntries));
  sections.push(buildResumeInstructions(input));
  sections.push(buildRecoveryPointers(input.recoveryPointers));

  const md = sections.filter((s) => s.length > 0).join('\n\n');
  if (md.length > MAX_OUTPUT_BYTES) {
    return md.slice(0, MAX_OUTPUT_BYTES) + '\n\n…(truncated to fit 32 KB)…';
  }
  return md;
}

export function buildHandoffFilename(iteration: number, isoTimestamp: string): string {
  const safeStamp = isoTimestamp.replace(/:/g, '-');
  return `HANDOFF-iter-${iteration}-${safeStamp}.md`;
}

function buildHeader(input: HandoffInput): string {
  return `# Handoff — Iteration ${input.iteration} → ${input.iteration + 1}`;
}

function buildSystemIdentity(input: HandoffInput): string {
  const lines = [
    '## 1. System Identity',
    `- **name:** ${input.systemName}`,
    `- **phase:** ${input.phase}`,
    `- **last updated:** ${input.timestamp}`,
    `- **recommended next:** ${input.recommendedNext ?? '(none)'}`,
  ];
  if (input.recommendedReason) {
    lines.push(`- **reason:** ${input.recommendedReason}`);
  }
  return lines.join('\n');
}

function buildCompletionTable(input: HandoffInput): string {
  const completed = new Set(input.completedActivities);
  const partial = input.partialActivities ?? {};
  const lines: string[] = [
    '## 2. Completion Status',
    '',
    '| Activity | Status | Artifact |',
    '| --- | --- | --- |',
  ];

  for (const activity of ACTIVITY_ORDER) {
    if (partial[activity]) {
      lines.push(`| ${activity} | ⚠ partial | ${partial[activity]} |`);
    } else if (completed.has(activity)) {
      lines.push(`| ${activity} | ✅ done | — |`);
    } else {
      lines.push(`| ${activity} | ❌ not started | — |`);
    }
  }
  return lines.join('\n');
}

function buildUncoveredSection(uncovered: Requirement[]): string {
  if (uncovered.length === 0) return '';
  const lines: string[] = [
    '## 3. Uncovered Requirements',
    `Total uncovered: ${uncovered.length}`,
    '',
  ];
  for (const req of uncovered) {
    lines.push(`- ${req.id} (${req.type}): ${req.title}`);
  }
  return lines.join('\n');
}

function buildSmokeSection(entries: SmokeLogEntry[]): string {
  if (entries.length === 0) return '';
  const recent = entries.slice(-MAX_SMOKE_ENTRIES);
  const lines = ['## 4. Last Integration Evidence'];
  for (const entry of recent) {
    lines.push(
      `- ${entry.timestamp} | exit_code: ${entry.exitCode} | ${entry.checkType ?? 'smoke'} | \`${entry.command}\``,
    );
  }
  return lines.join('\n');
}

function buildResumeInstructions(input: HandoffInput): string {
  const lines: string[] = [
    '## 6. Resume Instructions',
    `1. Open the project at the existing working directory.`,
    `2. Run \`/up\` — the orchestrator detects the incomplete state and proposes this same handoff.`,
    `3. Run \`up_test_quality_audit\` (strict mode) and resolve every flagged issue.`,
    `4. Run \`up_record_integration_check\` after each smoke run.`,
  ];
  if (input.recommendedNext) {
    lines.push(`5. Execute \`${input.recommendedNext}\`.`);
  }
  return lines.join('\n');
}

function buildRecoveryPointers(pointers?: HandoffInput['recoveryPointers']): string {
  if (!pointers) return '';
  const lines: string[] = ['## 7. Recovery Pointers'];
  if (pointers.branch) lines.push(`- **branch:** ${pointers.branch}`);
  if (pointers.sessionId) lines.push(`- **session id:** ${pointers.sessionId}`);
  if (pointers.lastArtifactPath) lines.push(`- **last artifact:** ${pointers.lastArtifactPath}`);
  if (lines.length === 1) return '';
  return lines.join('\n');
}
