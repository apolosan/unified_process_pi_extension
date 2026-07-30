/**
 * Handoff Tool — file-system wrapper around `generateHandoffMarkdown`.
 *
 * Reads the latest smoke.log entries, composes the HandoffInput, emits the
 * markdown, and writes it under the project's `docs/up/15-handoff/`
 * directory. Stays free of the pi extension runtime so it can be exercised
 * by `node:test` and reused outside the agent loop.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import type { AuditReport } from './audit-tool.ts';
import {
  buildHandoffFilename,
  generateHandoffMarkdown,
  type HandoffInput,
  type SmokeLogEntry,
} from './handoff-generator.ts';
import type { UPState } from '../state.ts';

export interface WriteHandoffInput {
  cwd: string;
  state: UPState;
  auditReport: AuditReport;
  outputDir?: string;
  timestamp?: string;
  recoveryPointers?: HandoffInput['recoveryPointers'];
}

export interface WriteHandoffResult {
  path: string;
  filename: string;
  bytes: number;
  warnings: string[];
}

const DEFAULT_OUTPUT_DIR = 'docs/up/15-handoff';
const SMOKE_LOG_REL = 'docs/up/14-implementation/smoke.log';
const SMOKE_LOG_MAX_ENTRIES = 50;

export async function writeHandoffDocument(
  input: WriteHandoffInput,
): Promise<WriteHandoffResult> {
  const warnings: string[] = [];
  const outputRel = input.outputDir ?? DEFAULT_OUTPUT_DIR;
  const outputAbs = isAbsolute(outputRel) ? outputRel : join(input.cwd, outputRel);
  await mkdir(outputAbs, { recursive: true });

  const timestamp = input.timestamp ?? new Date().toISOString();
  const filename = buildHandoffFilename(input.state.currentIteration, timestamp);
  const absPath = join(outputAbs, filename);

  const smokeEntries = await loadSmokeLog(input.cwd, warnings);
  const handoffInput = composeHandoffInput(input, smokeEntries);

  const markdown = generateHandoffMarkdown(handoffInput);
  await writeFile(absPath, markdown, 'utf8');

  return {
    path: absPath,
    filename,
    bytes: Buffer.byteLength(markdown, 'utf8'),
    warnings,
  };
}

function composeHandoffInput(
  input: WriteHandoffInput,
  smokeLogEntries: SmokeLogEntry[],
): HandoffInput {
  const a = input.auditReport;
  return {
    systemName: input.state.systemName,
    phase: input.state.currentPhase,
    iteration: input.state.currentIteration,
    completedActivities: input.state.completedActivities,
    recommendedNext: input.state.recommendedNextCommand,
    recommendedReason: input.state.recommendedNextReason,
    smokeLogEntries,
    audit: {
      total: a.totals.tests,
      mediocre: a.totals.mediocre,
      uncoveredRf: a.totals.uncoveredRf,
      uncoveredRnf: a.totals.uncoveredRnf,
    },
    uncovered: [
      ...a.coverage.uncoveredRf,
      ...a.coverage.uncoveredRnf,
    ],
    outputDir: input.outputDir ?? DEFAULT_OUTPUT_DIR,
    timestamp: input.timestamp ?? new Date().toISOString(),
    recoveryPointers: input.recoveryPointers,
  };
}

async function loadSmokeLog(
  cwd: string,
  warnings: string[],
): Promise<SmokeLogEntry[]> {
  const absSmokeLog = join(cwd, SMOKE_LOG_REL);
  let raw: string;
  try {
    raw = await readFile(absSmokeLog, 'utf8');
  } catch {
    warnings.push(`smoke.log not found at ${SMOKE_LOG_REL} (cwd=${cwd})`);
    return [];
  }

  const entries: SmokeLogEntry[] = [];
  for (const block of splitBlocks(raw)) {
    const entry = parseBlock(block);
    if (entry) entries.push(entry);
    if (entries.length >= SMOKE_LOG_MAX_ENTRIES) break;
  }
  return entries;
}

function splitBlocks(content: string): string[] {
  // Each block is separated by one or more blank lines.
  return content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

function parseBlock(block: string): SmokeLogEntry | null {
  const fields = new Map<string, string>();
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_]+)\s*:\s*(.*)$/);
    if (match && match[1] && match[2] !== undefined) {
      fields.set(match[1].trim().toLowerCase(), match[2].trim());
    }
  }
  const timestamp = fields.get('timestamp');
  const command = fields.get('command');
  const exitRaw = fields.get('exit_code');
  if (!timestamp || !command || exitRaw === undefined) return null;
  const exitCode = Number.parseInt(exitRaw, 10);
  if (Number.isNaN(exitCode)) return null;
  const checkType = fields.get('check_type');
  return checkType !== undefined
    ? { timestamp, command, exitCode, checkType }
    : { timestamp, command, exitCode };
}
