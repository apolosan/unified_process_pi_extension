import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { readIntegrationEvidence } from './integration-evidence.ts';
import {
  DEFAULT_PATH_GROUPS,
  buildStrictErrorMessage,
  recordIntegrationCheck,
  requirePaths,
  type PathCheckGroup,
} from './integration-tools.ts';

async function scaffoldMinimalProject(cwd: string): Promise<void> {
  await mkdir(join(cwd, 'src/api'), { recursive: true });
  await mkdir(join(cwd, 'tests/e2e'), { recursive: true });
  await mkdir(join(cwd, 'docs/up/14-implementation'), { recursive: true });
  await writeFile(join(cwd, '.env.example'), 'PORT=3000\n', 'utf8');
  await writeFile(join(cwd, 'docs/up/04-system-operations.md'), '# Ops\n', 'utf8');
  await writeFile(join(cwd, 'docs/up/12b-integration-matrix.md'), '# Matrix\n', 'utf8');
}

describe('recordIntegrationCheck', () => {
  it('writes smoke.log and returns ok status for exit code 0', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-'));
    const result = await recordIntegrationCheck(cwd, {
      command: 'npm run test:smoke',
      exitCode: 0,
      notes: 'all green',
    });

    assert.equal(result.status, 'ok');
    assert.equal(result.checkType, 'smoke');
    assert.equal(result.exitCode, 0);
    assert.match(result.timestamp, /^\d{4}-\d{2}-\d{2}T/);

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.command, 'npm run test:smoke');
  });

  it('returns fail status for non-zero exit code', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-'));
    const result = await recordIntegrationCheck(cwd, {
      command: 'npm run test:e2e:integrated',
      exitCode: 1,
    });

    assert.equal(result.status, 'fail');
    assert.equal((await readIntegrationEvidence(cwd)).status, 'fail');
  });

  it('records structured check type evidence', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-'));
    const result = await recordIntegrationCheck(cwd, {
      checkType: 'api_health',
      command: 'curl -fsS http://localhost:3000/health',
      exitCode: 0,
    });

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(result.checkType, 'api_health');
    assert.equal(evidence.checkType, 'api_health');
    assert.equal(evidence.checks?.api_health?.exitCode, 0);
  });

  it('appends a new block when append is true', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-'));
    await recordIntegrationCheck(cwd, { command: 'first', exitCode: 1 });
    await recordIntegrationCheck(cwd, { command: 'second', exitCode: 0, append: true });

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.command, 'second');
  });
});

describe('requirePaths', () => {
  it('throws in strict mode when paths are missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-'));
    await assert.rejects(() => requirePaths(cwd), /path guard failed/i);
  });

  it('reports missing groups when strict is false', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-'));
    const result = await requirePaths(cwd, { strict: false });

    assert.equal(result.ok, false);
    assert.ok(result.missing.some((entry) => entry.id === 'api'));
  });

  it('returns ok when all default groups are satisfied', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-'));
    await scaffoldMinimalProject(cwd);

    const result = await requirePaths(cwd);
    assert.equal(result.ok, true);
    assert.equal(result.missing.length, 0);
    assert.equal(result.present.length, DEFAULT_PATH_GROUPS.length);
  });

  it('accepts app/api as API surface alternative', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-'));
    await mkdir(join(cwd, 'app/api'), { recursive: true });

    const groups: PathCheckGroup[] = [
      { id: 'api', label: 'API', alternatives: ['src/api', 'app/api'] },
    ];
    const result = await requirePaths(cwd, { groups, strict: false });
    assert.equal(result.ok, true);
    assert.equal(result.present[0]?.matched, 'app/api');
  });

  it('buildStrictErrorMessage lists remediation hints', () => {
    const message = buildStrictErrorMessage({
      ok: false,
      present: [],
      missing: [
        {
          id: 'api',
          label: 'HTTP API surface',
          alternatives: ['src/api', 'app/api'],
        },
      ],
    });
    assert.match(message, /src\/api/);
    assert.match(message, /Remediation/i);
  });
});
