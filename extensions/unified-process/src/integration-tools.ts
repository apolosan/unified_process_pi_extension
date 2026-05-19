/**
 * Integration tools — Command (record evidence) + Specification (require paths).
 */

import { access, appendFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SMOKE_LOG_RELATIVE_PATH, type IntegrationEvidenceStatus } from './integration-evidence.ts';

export interface PathCheckGroup {
  id: string;
  label: string;
  alternatives: string[];
}

export interface PathCheckPresent {
  id: string;
  label: string;
  matched: string;
}

export interface PathCheckMissing {
  id: string;
  label: string;
  alternatives: string[];
}

export interface RequirePathsResult {
  ok: boolean;
  present: PathCheckPresent[];
  missing: PathCheckMissing[];
}

export interface RecordIntegrationCheckInput {
  command: string;
  exitCode: number;
  notes?: string;
  append?: boolean;
}

export interface RecordIntegrationCheckResult {
  path: string;
  status: IntegrationEvidenceStatus;
  exitCode: number;
  timestamp: string;
  command: string;
  notes?: string;
}

export const DEFAULT_PATH_GROUPS: PathCheckGroup[] = [
  {
    id: 'api',
    label: 'HTTP API surface',
    alternatives: ['src/api', 'src/routes', 'src/controllers', 'app/api'],
  },
  {
    id: 'tests',
    label: 'Executable integration/e2e tests',
    alternatives: ['tests/e2e', 'tests/integration'],
  },
  {
    id: 'env',
    label: 'Environment contract',
    alternatives: ['.env.example'],
  },
  {
    id: 'matrix',
    label: 'Integration traceability matrix',
    alternatives: ['docs/up/12b-integration-matrix.md'],
  },
  {
    id: 'operations',
    label: 'System operations catalog',
    alternatives: ['docs/up/04-system-operations.md'],
  },
];

async function exists(cwd: string, relativePath: string): Promise<boolean> {
  try {
    await access(join(cwd, relativePath));
    return true;
  } catch {
    return false;
  }
}

function formatSmokeBlock(input: RecordIntegrationCheckInput, timestamp: string): string {
  const lines = [
    `timestamp: ${timestamp}`,
    `command: ${input.command}`,
    `exit_code: ${input.exitCode}`,
  ];
  if (input.notes?.trim()) {
    lines.push(`notes: ${input.notes.trim()}`);
  }
  return `${lines.join('\n')}\n`;
}

export async function recordIntegrationCheck(
  cwd: string,
  input: RecordIntegrationCheckInput
): Promise<RecordIntegrationCheckResult> {
  const timestamp = new Date().toISOString();
  const block = formatSmokeBlock(input, timestamp);
  const absolutePath = join(cwd, SMOKE_LOG_RELATIVE_PATH);
  const append = input.append ?? true;

  await mkdir(join(cwd, 'docs/up/14-implementation'), { recursive: true });

  if (append) {
    try {
      await access(absolutePath);
      await appendFile(absolutePath, `\n---\n${block}`, 'utf8');
    } catch {
      await writeFile(absolutePath, block, 'utf8');
    }
  } else {
    await writeFile(absolutePath, block, 'utf8');
  }

  const status: IntegrationEvidenceStatus = input.exitCode === 0 ? 'ok' : 'fail';

  return {
    path: SMOKE_LOG_RELATIVE_PATH,
    status,
    exitCode: input.exitCode,
    timestamp,
    command: input.command,
    notes: input.notes,
  };
}

export async function requirePaths(
  cwd: string,
  options: { groups?: PathCheckGroup[]; strict?: boolean } = {}
): Promise<RequirePathsResult> {
  const groups = options.groups ?? DEFAULT_PATH_GROUPS;
  const present: PathCheckPresent[] = [];
  const missing: PathCheckMissing[] = [];

  for (const group of groups) {
    let matched: string | null = null;
    for (const candidate of group.alternatives) {
      if (await exists(cwd, candidate)) {
        matched = candidate;
        break;
      }
    }

    if (matched) {
      present.push({ id: group.id, label: group.label, matched });
    } else {
      missing.push({
        id: group.id,
        label: group.label,
        alternatives: group.alternatives,
      });
    }
  }

  const result: RequirePathsResult = {
    ok: missing.length === 0,
    present,
    missing,
  };

  const strict = options.strict ?? true;
  if (strict && !result.ok) {
    throw new Error(buildStrictErrorMessage(result));
  }

  return result;
}

export function buildStrictErrorMessage(result: RequirePathsResult): string {
  const lines = [
    'UP path guard failed — required integration paths are missing.',
    '',
    'Missing:',
    ...result.missing.map(
      (entry) =>
        `- ${entry.label} (${entry.id}): expected one of ${entry.alternatives.map((p) => `\`${p}\``).join(', ')}`
    ),
    '',
    'Remediation:',
    '- Create API routes under PROJECT_ROOT/src/api/ (or app/api/)',
    '- Add tests under PROJECT_ROOT/tests/e2e/ or tests/integration/',
    '- Document env vars in .env.example',
    '- Generate docs/up/12b-integration-matrix.md and docs/up/04-system-operations.md via UP skills',
  ];
  return lines.join('\n');
}
