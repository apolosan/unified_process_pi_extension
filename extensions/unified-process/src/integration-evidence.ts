/**
 * Integration evidence reader — reads project-local smoke.log for deploy readiness gates.
 * Supports structured JSONL records and legacy key/value smoke logs.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const SMOKE_LOG_RELATIVE_PATH = 'docs/up/14-implementation/smoke.log';
export const INTEGRATION_CHECK_TYPES = [
  'stack_up',
  'api_health',
  'smoke',
  'tier1_integrated_e2e',
] as const;

export type IntegrationEvidenceStatus = 'ok' | 'fail' | 'missing';
export type IntegrationCheckType = (typeof INTEGRATION_CHECK_TYPES)[number];

export interface IntegrationEvidence {
  status: IntegrationEvidenceStatus;
  path: string;
  checkType?: IntegrationCheckType;
  exitCode?: number;
  timestamp?: string;
  command?: string;
  checks?: Partial<Record<IntegrationCheckType, IntegrationEvidenceEntry>>;
  ready?: boolean;
  missingCheckTypes?: IntegrationCheckType[];
}

export interface IntegrationEvidenceEntry {
  checkType: IntegrationCheckType;
  exitCode: number;
  timestamp: string;
  command: string;
  notes?: string;
}

export function normalizeIntegrationCheckType(checkType: unknown): IntegrationCheckType {
  return INTEGRATION_CHECK_TYPES.includes(checkType as IntegrationCheckType)
    ? (checkType as IntegrationCheckType)
    : 'smoke';
}

function parseJsonLine(line: string): IntegrationEvidenceEntry | null {
  if (!line.trim().startsWith('{')) return null;

  try {
    const parsed = JSON.parse(line) as Record<string, unknown>;
    if (typeof parsed.command !== 'string' || typeof parsed.timestamp !== 'string') return null;

    const exitCode = Number(parsed.exit_code);
    if (!Number.isFinite(exitCode)) return null;

    return {
      checkType: normalizeIntegrationCheckType(parsed.check_type),
      command: parsed.command,
      exitCode,
      timestamp: parsed.timestamp,
      notes: typeof parsed.notes === 'string' ? parsed.notes : undefined,
    };
  } catch {
    return null;
  }
}

function parseLegacyBlock(
  block: string
): Pick<IntegrationEvidenceEntry, 'exitCode' | 'timestamp' | 'command'> | null {
  const result: Pick<IntegrationEvidenceEntry, 'exitCode' | 'timestamp' | 'command'> = {};

  for (const line of block.split(/\r?\n/)) {
    const exitMatch = line.match(/^exit_code:\s*(-?\d+)/i);
    if (exitMatch) {
      result.exitCode = Number(exitMatch[1]);
      continue;
    }

    const timestampMatch = line.match(/^timestamp:\s*(.+)$/i);
    if (timestampMatch) {
      result.timestamp = timestampMatch[1].trim();
      continue;
    }

    const commandMatch = line.match(/^command:\s*(.+)$/i);
    if (commandMatch) {
      result.command = commandMatch[1].trim();
    }
  }

  return result.exitCode === undefined ? null : result;
}

function parseSmokeLog(content: string): IntegrationEvidenceEntry[] {
  const jsonEntries = content
    .split(/\r?\n/)
    .map(parseJsonLine)
    .filter((entry): entry is IntegrationEvidenceEntry => Boolean(entry));

  if (jsonEntries.length) return jsonEntries;

  const blocks = content
    .split(/\n---\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  return blocks
    .map(parseLegacyBlock)
    .filter((entry): entry is Pick<IntegrationEvidenceEntry, 'exitCode' | 'timestamp' | 'command'> =>
      Boolean(entry)
    )
    .map((entry) => ({
      checkType: 'smoke',
      exitCode: entry.exitCode,
      timestamp: entry.timestamp ?? '',
      command: entry.command ?? '',
    }));
}

export async function readIntegrationEvidence(cwd: string): Promise<IntegrationEvidence> {
  const path = SMOKE_LOG_RELATIVE_PATH;
  const absolutePath = join(cwd, path);

  try {
    const raw = await readFile(absolutePath, 'utf8');
    const entries = parseSmokeLog(raw);
    const checks: Partial<Record<IntegrationCheckType, IntegrationEvidenceEntry>> = {};
    for (const entry of entries) {
      checks[entry.checkType] = entry;
    }

    const latest = entries[entries.length - 1];
    const exitCode = latest?.exitCode ?? 1;
    const status: IntegrationEvidenceStatus = exitCode === 0 ? 'ok' : 'fail';
    const missingCheckTypes = INTEGRATION_CHECK_TYPES.filter(
      (checkType) => checks[checkType]?.exitCode !== 0
    );

    return {
      status,
      path,
      checkType: latest?.checkType,
      timestamp: latest?.timestamp,
      command: latest?.command,
      exitCode,
      checks,
      ready: missingCheckTypes.length === 0,
      missingCheckTypes,
    };
  } catch {
    return { status: 'missing', path, ready: false, missingCheckTypes: [...INTEGRATION_CHECK_TYPES] };
  }
}

export function formatIntegrationVerificationStatus(evidence: IntegrationEvidence): string {
  if (evidence.status === 'ok') {
    const when = evidence.timestamp ? ` @ ${evidence.timestamp}` : '';
    const readiness = evidence.ready ? 'deploy-ready checks complete' : 'deploy-ready checks incomplete';
    return `last integrated verification: OK${when} (${readiness})`;
  }

  if (evidence.status === 'fail') {
    const code = evidence.exitCode ?? '?';
    return `last integrated verification: FAIL (exit ${code})`;
  }

  return 'last integrated verification: MISSING (create docs/up/14-implementation/smoke.log)';
}
