import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  formatIntegrationVerificationStatus,
  readIntegrationEvidence,
  SMOKE_LOG_RELATIVE_PATH,
} from './integration-evidence.ts';

describe('readIntegrationEvidence', () => {
  it('returns missing status when smoke.log does not exist', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'missing');
    assert.equal(evidence.path, SMOKE_LOG_RELATIVE_PATH);
  });

  it('parses exit code and timestamp from smoke.log', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    const logPath = join(cwd, SMOKE_LOG_RELATIVE_PATH);
    await mkdir(join(cwd, 'docs/up/14-implementation'), { recursive: true });
    await writeFile(
      logPath,
      [
        '# UP smoke evidence',
        'timestamp: 2026-03-28T12:00:00Z',
        'exit_code: 0',
        'command: npm run test:smoke',
      ].join('\n'),
      'utf8'
    );

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.exitCode, 0);
    assert.equal(evidence.timestamp, '2026-03-28T12:00:00Z');
    assert.equal(evidence.command, 'npm run test:smoke');
  });

  it('uses the latest block when smoke.log has multiple entries', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    const logPath = join(cwd, SMOKE_LOG_RELATIVE_PATH);
    await mkdir(join(cwd, 'docs/up/14-implementation'), { recursive: true });
    await writeFile(
      logPath,
      ['timestamp: 2026-01-01T00:00:00Z', 'command: first', 'exit_code: 1', '---', 'timestamp: 2026-03-28T12:00:00Z', 'command: second', 'exit_code: 0'].join(
        '\n'
      ),
      'utf8'
    );

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.command, 'second');
  });

  it('marks failed smoke when exit code is non-zero', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    const logPath = join(cwd, SMOKE_LOG_RELATIVE_PATH);
    await mkdir(join(cwd, 'docs/up/14-implementation'), { recursive: true });
    await writeFile(logPath, 'exit_code: 1\n', 'utf8');

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'fail');
    assert.equal(evidence.exitCode, 1);
  });
});

describe('formatIntegrationVerificationStatus', () => {
  it('formats OK status with timestamp', () => {
    const label = formatIntegrationVerificationStatus({
      status: 'ok',
      path: SMOKE_LOG_RELATIVE_PATH,
      exitCode: 0,
      timestamp: '2026-03-28T12:00:00Z',
    });
    assert.match(label, /OK/);
    assert.match(label, /2026-03-28/);
  });

  it('formats missing status when no evidence exists', () => {
    const label = formatIntegrationVerificationStatus({
      status: 'missing',
      path: SMOKE_LOG_RELATIVE_PATH,
    });
    assert.match(label, /FAIL|MISSING/i);
  });
});
