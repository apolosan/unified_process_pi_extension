/**
 * Handoff Tool — TDD test battery
 *
 * Validates the file-system wrapper around `generateHandoffMarkdown` that
 * writes the actual handoff document to disk and reports the resulting path.
 *
 * Naming convention: `it('RF-NN: <scenario> — <expected>', …)`.
 */

import assert from 'node:assert/strict';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  writeHandoffDocument,
  type WriteHandoffInput,
} from './handoff-tool.ts';
import type { AuditReport } from './audit-tool.ts';
import type { UPState } from '../state.ts';

async function setupProject(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'handoff-tool-'));
  await mkdir(join(dir, 'docs', 'up'), { recursive: true });
  return dir;
}

function fakeState(overrides: Partial<UPState> = {}): UPState {
  return {
    systemName: 'TestSys',
    vision: '',
    currentPhase: 'elaboration',
    currentIteration: 1,
    completedActivities: ['vision', 'requirements'],
    artifacts: [],
    recommendedNextCommand: '/skill:up-tdd',
    recommendedNextReason: '',
    lastUpdated: 0,
    ...overrides,
  };
}

function fakeAudit(overrides: Partial<AuditReport> = {}): AuditReport {
  return {
    mode: 'strict',
    cwd: '/tmp/example',
    requirementsFile: 'docs/up/02-requirements.md',
    totals: { files: 0, tests: 0, mediocre: 0, uncoveredRf: 0, uncoveredRnf: 0 },
    issues: [],
    coverage: {
      requirements: [],
      tests: [],
      coveredRf: [],
      coveredRnf: [],
      uncoveredRf: [],
      uncoveredRnf: [],
    },
    passed: true,
    ...overrides,
  };
}

async function writeSmokeLog(projectDir: string, content: string): Promise<void> {
  const smokeDir = join(projectDir, 'docs', 'up', '14-implementation');
  await mkdir(smokeDir, { recursive: true });
  await writeFile(join(smokeDir, 'smoke.log'), content, 'utf8');
}

describe('writeHandoffDocument — RF-12 file-write gate', () => {
  it('writes a HANDOFF-iter-N-*.md file under docs/up/15-handoff and returns its path', async () => {
    const dir = await setupProject();
    const result = await writeHandoffDocument({
      cwd: dir,
      state: fakeState(),
      auditReport: fakeAudit(),
      outputDir: 'docs/up/15-handoff',
      timestamp: '2026-03-28T10:00:00.000Z',
    });
    assert.equal(result.filename, 'HANDOFF-iter-1-2026-03-28T10-00-00.000Z.md');
    assert.ok(result.path.endsWith(result.filename));
    assert.ok(result.bytes > 0);
    const all = await readdir(join(dir, 'docs', 'up', '15-handoff'));
    assert.ok(all.includes(result.filename));
    await rm(dir, { recursive: true, force: true });
  });

  it('returns a `warnings` array when smoke.log is missing', async () => {
    const dir = await setupProject();
    const result = await writeHandoffDocument({
      cwd: dir,
      state: fakeState(),
      auditReport: fakeAudit(),
      outputDir: 'docs/up/15-handoff',
      timestamp: '2026-03-28T10:00:00.000Z',
    });
    assert.ok(
      result.warnings.some((w) => /smoke\.log/.test(w)),
      'warning must mention missing smoke.log',
    );
    await rm(dir, { recursive: true, force: true });
  });

  it('does not raise when smoke.log exists with valid entries', async () => {
    const dir = await setupProject();
    await writeSmokeLog(
      dir,
      `timestamp: 2026-03-28T09:00:00Z
command: npm run test:smoke
exit_code: 0

`,
    );
    const result = await writeHandoffDocument({
      cwd: dir,
      state: fakeState(),
      auditReport: fakeAudit(),
      outputDir: 'docs/up/15-handoff',
      timestamp: '2026-03-28T10:00:00.000Z',
    });
    assert.equal(result.warnings.length, 0);
    const content = await readFile(result.path, 'utf8');
    assert.match(content, /Last Integration Evidence/);
    assert.match(content, /npm run test:smoke/);
    await rm(dir, { recursive: true, force: true });
  });

  it('writes a deterministic filename for a given iteration + timestamp', async () => {
    const dir = await setupProject();
    const input: WriteHandoffInput = {
      cwd: dir,
      state: fakeState({ currentIteration: 4 }),
      auditReport: fakeAudit(),
      outputDir: 'docs/up/15-handoff',
      timestamp: '2026-04-01T08:30:00.000Z',
    };
    const first = await writeHandoffDocument(input);
    const second = await writeHandoffDocument(input);
    assert.equal(first.path, second.path);
    await rm(dir, { recursive: true, force: true });
  });
});

describe('writeHandoffDocument — RF-19 smoke.log parsing', () => {
  it('parses latest 5 entries with command + exit code + timestamp into the markdown body', async () => {
    const dir = await setupProject();
    const blocks: string[] = [];
    for (let i = 0; i < 8; i++) {
      blocks.push(
        `timestamp: 2026-03-28T09:0${i}:00Z\ncommand: cmd-${i}\nexit_code: ${i === 7 ? 1 : 0}\n`,
      );
    }
    await writeSmokeLog(dir, blocks.join('\n'));

    const result = await writeHandoffDocument({
      cwd: dir,
      state: fakeState(),
      auditReport: fakeAudit(),
      outputDir: 'docs/up/15-handoff',
      timestamp: '2026-03-28T10:00:00.000Z',
    });
    const content = await readFile(result.path, 'utf8');
    assert.match(content, /test:smoke|cmd-7/);
    assert.match(content, /exit_code: 1/);
    await rm(dir, { recursive: true, force: true });
  });
});
