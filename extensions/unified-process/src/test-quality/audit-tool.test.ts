/**
 * Audit Tool — TDD test battery
 *
 * Validates the file-system glue that turns mediocre-detector + requirement-trace
 * into a single audit callable from the LLM via the `up_test_quality_audit`
 * tool.
 *
 * Naming convention: `it('RF-NN: <scenario> — <expected>', …)`.
 */

import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { runTestQualityAudit } from './audit-tool.ts';

async function makeProject(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'audit-tool-'));
  return dir;
}

async function writeRequirements(
  dir: string,
  content = '- **RF-01: alpha requirement**\n- **RNF-01: latency budget**\n',
  filename = '02-requirements.md',
): Promise<void> {
  const target = join(dir, 'docs', 'up', filename);
  const { mkdir } = await import('node:fs/promises');
  await mkdir(join(dir, 'docs', 'up'), { recursive: true });
  await writeFile(target, content, 'utf8');
}

describe('runTestQualityAudit — file discovery', () => {
  it('discovers test files matching the default glob and aggregates their issues', async () => {
    const dir = await makeProject();
    await writeRequirements(dir);
    await writeFile(
      join(dir, 'sample.test.ts'),
      `import { it } from 'node:test';
/**
 * @rf RF-01
 */
it('validates alpha', () => {
  assert.equal(1, 1);
});
`,
      'utf8',
    );
    await writeFile(
      join(dir, 'bad.test.ts'),
      `import { it } from 'node:test';
it('should work', () => {
  expect(vitest).toBeDefined();
});
`,
      'utf8',
    );

    const report = await runTestQualityAudit({ cwd: dir, mode: 'report' });
    assert.equal(report.totals.files, 2);
    assert.ok(report.issues.length >= 1, 'expected at least 1 issue from the bad file');
    assert.equal(report.coverage.coveredRf.length, 1);
    assert.equal(report.coverage.coveredRf[0]?.id, 'RF-01');
    assert.equal(report.coverage.uncoveredRnf[0]?.id, 'RNF-01');
  });

  it('RF-11..16: counts an unmarked test as uncovered (no @rf) without false positives', async () => {
    const dir = await makeProject();
    await writeRequirements(dir);
    await writeFile(
      join(dir, 'unmarked.test.ts'),
      `import { it } from 'node:test';
it('no markers here', () => {
  assert.equal(1, 1);
});
`,
      'utf8',
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'report' });
    assert.equal(report.totals.mediocre, 0, 'well-formed test must not be flagged');
    assert.equal(report.coverage.coveredRf.length, 0);
    assert.equal(report.coverage.uncoveredRf.length, 1);
  });

  it('throws EmptyRequirementsError when requirements file is absent in strict mode', async () => {
    const dir = await makeProject();
    // Deliberately skip writeRequirements.
    await assert.rejects(
      () => runTestQualityAudit({ cwd: dir, mode: 'strict' }),
      /empty requirements|no requirements file/i,
    );
  });

  it('uses custom requirementsFile override path', async () => {
    const dir = await makeProject();
    await writeFile(
      join(dir, 'alt-requirements.md'),
      '- **RF-77: alternate**\n',
      'utf8',
    );
    await writeFile(
      join(dir, 'sample.test.ts'),
      `import { it } from 'node:test';
/** @rf RF-77 */
it('c', () => { assert.equal(1, 1); });
`,
      'utf8',
    );
    const report = await runTestQualityAudit({
      cwd: dir,
      requirementsFile: 'alt-requirements.md',
      mode: 'report',
    });
    assert.equal(report.coverage.coveredRf[0]?.id, 'RF-77');
  });
});

describe('runTestQualityAudit — strict mode gate', () => {
  it('returns passed=false in strict mode when any mediocre issue exists', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: only one**\n');
    await writeFile(
      join(dir, 'bad.test.ts'),
      `import { it } from 'node:test';
it('should work', () => { expect(vitest).toBeDefined(); });
`,
      'utf8',
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'strict' });
    assert.equal(report.totals.mediocre, 1);
    assert.equal(report.passed, false);
  });

  it('returns passed=true in strict mode when no issues and full coverage', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    await writeFile(
      join(dir, 'good.test.ts'),
      `import { it } from 'node:test';
/** @rf RF-01 */
it('covers RF-01', () => { assert.equal(1, 1); });
`,
      'utf8',
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'strict' });
    assert.equal(report.totals.mediocre, 0);
    assert.equal(report.coverage.uncoveredRf.length, 0);
    assert.equal(report.passed, true);
  });
});
