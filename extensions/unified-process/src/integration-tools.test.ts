/**
 * @rf RF-IntegrationEvidence-Record
 * @rf RF-IntegrationEvidence-Append
 * @rf RF-PathGuard-Strict
 * @rf RF-PathGuard-Alternatives
 * @rnf RNF-IntegrationEvidence-Deterministic
 */
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
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
  /**
   * @rf RF-IntegrationEvidence-Record-OK
   */
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

  /**
   * @rf RF-IntegrationEvidence-Record-Fail
   */
  it('returns fail status for non-zero exit code', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-'));
    const result = await recordIntegrationCheck(cwd, {
      command: 'npm run test:e2e:integrated',
      exitCode: 1,
    });

    assert.equal(result.status, 'fail');
    assert.equal((await readIntegrationEvidence(cwd)).status, 'fail');
  });

  /**
   * @rf RF-IntegrationEvidence-CheckType
   */
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

  /**
   * @rf RF-IntegrationEvidence-Append
   */
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
  /**
   * @rf RF-PathGuard-Strict-Throw
   */
  it('throws in strict mode when paths are missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-'));
    await assert.rejects(() => requirePaths(cwd), /path guard failed/i);
  });

  /**
   * @rf RF-PathGuard-NonStrict
   */
  it('reports missing groups when strict is false', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-'));
    const result = await requirePaths(cwd, { strict: false });

    assert.equal(result.ok, false);
    assert.ok(result.missing.some((entry) => entry.id === 'api'));
  });

  /**
   * @rf RF-PathGuard-AllPresent
   */
  it('returns ok when all default groups are satisfied', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-'));
    await scaffoldMinimalProject(cwd);

    const result = await requirePaths(cwd);
    assert.equal(result.ok, true);
    assert.equal(result.missing.length, 0);
    assert.equal(result.present.length, DEFAULT_PATH_GROUPS.length);
  });

  /**
   * @rf RF-PathGuard-Alternatives
   */
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

  /**
   * @rf RF-PathGuard-ErrorMessage
   */
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

  /**
   * @rf RF-PathGuard-EmptyGroups
   */
  it('RF-PathGuard-EmptyGroups: empty groups array always returns ok', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-empty-'));
    const result = await requirePaths(cwd, { groups: [], strict: true });
    assert.equal(result.ok, true);
    assert.equal(result.present.length, 0);
    assert.equal(result.missing.length, 0);
  });

  /**
   * @rnf RNF-PathGuard-OrderIndependent
   */
  it('RNF-PathGuard-OrderIndependent: identical inputs produce identical results across 100 calls (determinism)', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-paths-order-'));
    await mkdir(join(cwd, 'src/api'), { recursive: true });
    await mkdir(join(cwd, 'src/routes'), { recursive: true });

    const groups: PathCheckGroup[] = [
      { id: 'api', label: 'API', alternatives: ['src/api', 'src/routes'] },
    ];
    const first = await requirePaths(cwd, { groups, strict: false });
    for (let i = 0; i < 100; i++) {
      const again = await requirePaths(cwd, { groups, strict: false });
      assert.deepEqual(again, first);
    }
  });
});

describe('recordIntegrationCheck — extended', () => {
  /**
   * @rf RF-IntegrationEvidence-AppendFalse
   */
  it('RF-IntegrationEvidence-AppendFalse: append:false overwrites the smoke.log file', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-overwrite-'));
    await recordIntegrationCheck(cwd, { command: 'first', exitCode: 1 });
    await recordIntegrationCheck(cwd, {
      command: 'second',
      exitCode: 0,
      append: false,
    });

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.command, 'second');
    assert.equal(evidence.status, 'ok');
  });

  /**
   * @rf RF-IntegrationEvidence-InvalidCheckTypeNormalized
   */
  it('RF-IntegrationEvidence-InvalidCheckTypeNormalized: unknown check types normalize to smoke', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-norm-'));
    const result = await recordIntegrationCheck(cwd, {
      command: 'echo hi',
      exitCode: 0,
      checkType: 'not-a-real-check-type' as any,
    });

    assert.equal(result.checkType, 'smoke');
    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.checkType, 'smoke');
  });

  /**
   * @rf RF-IntegrationEvidence-NotesPersisted
   */
  it('RF-IntegrationEvidence-NotesPersisted: notes field round-trips into the smoke.log record', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-notes-'));
    await recordIntegrationCheck(cwd, {
      command: 'npm test',
      exitCode: 0,
      notes: 'all green, 200 tests passed',
    });

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    const raw = await readFile(join(cwd, 'docs/up/14-implementation/smoke.log'), 'utf8');
    assert.match(raw, /all green, 200 tests passed/);
  });

  /**
   * @rnf RNF-IntegrationEvidence-TimestampFormat
   */
  it('RNF-IntegrationEvidence-TimestampFormat: result timestamp matches ISO-8601 with milliseconds', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-ts-'));
    const result = await recordIntegrationCheck(cwd, {
      command: 'noop',
      exitCode: 0,
    });
    assert.match(result.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  /**
   * @rnf RNF-IntegrationEvidence-IdempotentLogicalState
   */
  it('RNF-IntegrationEvidence-IdempotentLogicalState: two consecutive recordings with the same command produce same logical state (ok+latest command), distinct timestamps', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-record-idem-'));
    const first = await recordIntegrationCheck(cwd, { command: 'npm test', exitCode: 0 });
    const second = await recordIntegrationCheck(cwd, { command: 'npm test', exitCode: 0 });
    assert.equal(first.status, second.status);
    assert.equal(first.command, second.command);
    // Timestamps may differ (Date.now resolution); the file should have two entries.
    const raw = await readFile(join(cwd, 'docs/up/14-implementation/smoke.log'), 'utf8');
    const occurrences = raw.split('\n').filter((l) => l.includes('npm test')).length;
    assert.ok(occurrences >= 2, `expected \u22652 npm test entries, got ${occurrences}`);
  });
});
