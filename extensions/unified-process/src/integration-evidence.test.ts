/**
 * @rf RF-IntegrationEvidence-Parse
 * @rf RF-IntegrationEvidence-ReadyGate
 * @rf RF-IntegrationEvidence-Format
 * @rnf RNF-IntegrationEvidence-ParserCorrectness
 */
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

const IMPLEMENTATION_DIR = 'docs/up/14-implementation';

async function writeSmokeLog(cwd: string, content: string): Promise<void> {
  await mkdir(join(cwd, IMPLEMENTATION_DIR), { recursive: true });
  await writeFile(join(cwd, SMOKE_LOG_RELATIVE_PATH), content, 'utf8');
}

describe('readIntegrationEvidence', () => {
  /**
   * @rf RF-IntegrationEvidence-Parse-Missing
   */
  it('returns missing status when smoke.log does not exist', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'missing');
    assert.equal(evidence.path, SMOKE_LOG_RELATIVE_PATH);
  });

  /**
   * @rf RF-IntegrationEvidence-Parse-Fields
   */
  it('parses exit code and timestamp from smoke.log', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    await writeSmokeLog(
      cwd,
      [
        '# UP smoke evidence',
        'timestamp: 2026-03-28T12:00:00Z',
        'exit_code: 0',
        'command: npm run test:smoke',
      ].join('\n')
    );

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.exitCode, 0);
    assert.equal(evidence.timestamp, '2026-03-28T12:00:00Z');
    assert.equal(evidence.command, 'npm run test:smoke');
  });

  /**
   * @rf RF-IntegrationEvidence-Parse-JSONL
   */
  it('parses JSONL smoke evidence with check type', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    await writeSmokeLog(
      cwd,
      JSON.stringify({
        check_type: 'tier1_integrated_e2e',
        timestamp: '2026-03-28T12:00:00Z',
        exit_code: 0,
        command: 'npm run test:e2e:integrated',
      }) + '\n'
    );

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.checkType, 'tier1_integrated_e2e');
    assert.equal(evidence.ready, false);
    assert.ok(evidence.missingCheckTypes?.includes('api_health'));
  });

  /**
   * @rf RF-IntegrationEvidence-ReadyGate
   */
  it('marks deploy readiness when all required check types pass', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    await writeSmokeLog(
      cwd,
      [
        {
          check_type: 'stack_up',
          timestamp: '2026-03-28T12:00:00Z',
          exit_code: 0,
          command: 'docker compose up -d',
        },
        {
          check_type: 'api_health',
          timestamp: '2026-03-28T12:01:00Z',
          exit_code: 0,
          command: 'curl -fsS http://localhost:3000/health',
        },
        {
          check_type: 'smoke',
          timestamp: '2026-03-28T12:02:00Z',
          exit_code: 0,
          command: 'npm run test:smoke',
        },
        {
          check_type: 'tier1_integrated_e2e',
          timestamp: '2026-03-28T12:03:00Z',
          exit_code: 0,
          command: 'npm run test:e2e:integrated',
        },
      ]
        .map((entry) => JSON.stringify(entry))
        .join('\n')
    );

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.ready, true);
    assert.deepEqual(evidence.missingCheckTypes, []);
  });

  /**
   * @rf RF-IntegrationEvidence-LatestBlock
   */
  it('uses the latest block when smoke.log has multiple entries', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    await writeSmokeLog(
      cwd,
      [
        'timestamp: 2026-01-01T00:00:00Z',
        'command: first',
        'exit_code: 1',
        '---',
        'timestamp: 2026-03-28T12:00:00Z',
        'command: second',
        'exit_code: 0',
      ].join('\n')
    );

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.command, 'second');
  });

  /**
   * @rf RF-IntegrationEvidence-Fail-Status
   */
  it('marks failed smoke when exit code is non-zero', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-'));
    await writeSmokeLog(cwd, 'exit_code: 1\n');

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'fail');
    assert.equal(evidence.exitCode, 1);
  });
});

describe('formatIntegrationVerificationStatus', () => {
  /**
   * @rf RF-IntegrationEvidence-Format-OK
   */
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

  /**
   * @rf RF-IntegrationEvidence-Format-Missing
   */
  it('formats missing status when no evidence exists', () => {
    const label = formatIntegrationVerificationStatus({
      status: 'missing',
      path: SMOKE_LOG_RELATIVE_PATH,
    });
    assert.match(label, /FAIL|MISSING/i);
  });

  /**
   * @rf RF-IntegrationEvidence-Format-Fail
   */
  it('RF-IntegrationEvidence-Format-Fail: formats fail status with exit code', () => {
    const label = formatIntegrationVerificationStatus({
      status: 'fail',
      path: SMOKE_LOG_RELATIVE_PATH,
      exitCode: 2,
    });
    assert.match(label, /FAIL/);
    assert.match(label, /exit 2/);
  });

  /**
   * @rf RF-IntegrationEvidence-Format-OK-DeployReady
   */
  it('RF-IntegrationEvidence-Format-OK-DeployReady: marks deploy-ready when ready flag is true', () => {
    const label = formatIntegrationVerificationStatus({
      status: 'ok',
      path: SMOKE_LOG_RELATIVE_PATH,
      exitCode: 0,
      timestamp: '2026-03-28T12:00:00Z',
      ready: true,
    });
    assert.match(label, /deploy-ready checks complete/i);
  });
});

describe('readIntegrationEvidence — malformed input tolerance', () => {
  /**
   * @rf RF-IntegrationEvidence-MalformedJsonlSkipped
   */
  it('RF-IntegrationEvidence-MalformedJsonlSkipped: skips malformed JSONL lines and parses the valid ones', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-malformed-'));
    await writeSmokeLog(
      cwd,
      [
        'this is not valid json at all',
        JSON.stringify({
          check_type: 'smoke',
          timestamp: '2026-03-28T12:00:00Z',
          exit_code: 0,
          command: 'npm test',
        }),
        '{ broken: json',
      ].join('\n')
    );

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.command, 'npm test');
  });

  /**
   * @rf RF-IntegrationEvidence-EmptyFile
   */
  it('RF-IntegrationEvidence-EmptyFile: empty smoke.log returns fail status (file exists but no successful checks)', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-empty-'));
    await writeSmokeLog(cwd, '');
    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'fail');
    assert.equal(evidence.path, SMOKE_LOG_RELATIVE_PATH);
  });

  /**
   * @rf RF-IntegrationEvidence-LegacyMissingField
   */
  it('RF-IntegrationEvidence-LegacyMissingField: legacy block missing timestamp parses with empty timestamp', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-legacy-'));
    // Legacy block without timestamp; exit_code and command only.
    await writeSmokeLog(
      cwd,
      ['exit_code: 0', 'command: legacy-cmd'].join('\n')
    );

    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.status, 'ok');
    assert.equal(evidence.command, 'legacy-cmd');
    assert.equal(evidence.timestamp, '');
  });

  /**
   * @rf RF-IntegrationEvidence-ReadyGatePartialCoverage
   */
  it('RF-IntegrationEvidence-ReadyGatePartialCoverage: missingCheckTypes lists the absent check types', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-evidence-partial-'));
    await writeSmokeLog(
      cwd,
      JSON.stringify({
        check_type: 'smoke',
        timestamp: '2026-03-28T12:00:00Z',
        exit_code: 0,
        command: 'npm test',
      }) + '\n'
    );
    const evidence = await readIntegrationEvidence(cwd);
    assert.equal(evidence.ready, false);
    assert.ok(evidence.missingCheckTypes?.length === 3);
    assert.ok(evidence.missingCheckTypes?.includes('stack_up'));
    assert.ok(evidence.missingCheckTypes?.includes('api_health'));
    assert.ok(evidence.missingCheckTypes?.includes('tier1_integrated_e2e'));
  });
});
