/**
 * Integration evidence reader — reads project-local smoke.log for deploy readiness gates.
 * Strategy: parse lightweight key/value lines produced by UP smoke scripts.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const SMOKE_LOG_RELATIVE_PATH = 'docs/up/14-implementation/smoke.log';

export type IntegrationEvidenceStatus = 'ok' | 'fail' | 'missing';

export interface IntegrationEvidence {
  status: IntegrationEvidenceStatus;
  path: string;
  exitCode?: number;
  timestamp?: string;
  command?: string;
}

function parseSmokeLog(content: string): Pick<IntegrationEvidence, 'exitCode' | 'timestamp' | 'command'> {
  const blocks = content
    .split(/\n---\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  const latestBlock = blocks.length ? blocks[blocks.length - 1] : content;
  const result: Pick<IntegrationEvidence, 'exitCode' | 'timestamp' | 'command'> = {};

  for (const line of latestBlock.split(/\r?\n/)) {
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

  return result;
}

export async function readIntegrationEvidence(cwd: string): Promise<IntegrationEvidence> {
  const path = SMOKE_LOG_RELATIVE_PATH;
  const absolutePath = join(cwd, path);

  try {
    const raw = await readFile(absolutePath, 'utf8');
    const parsed = parseSmokeLog(raw);
    const exitCode = parsed.exitCode ?? 1;
    const status: IntegrationEvidenceStatus = exitCode === 0 ? 'ok' : 'fail';

    return {
      status,
      path,
      ...parsed,
      exitCode,
    };
  } catch {
    return { status: 'missing', path };
  }
}

export function formatIntegrationVerificationStatus(evidence: IntegrationEvidence): string {
  if (evidence.status === 'ok') {
    const when = evidence.timestamp ? ` @ ${evidence.timestamp}` : '';
    return `last integrated verification: OK${when}`;
  }

  if (evidence.status === 'fail') {
    const code = evidence.exitCode ?? '?';
    return `last integrated verification: FAIL (exit ${code})`;
  }

  return 'last integrated verification: MISSING (create docs/up/14-implementation/smoke.log)';
}
