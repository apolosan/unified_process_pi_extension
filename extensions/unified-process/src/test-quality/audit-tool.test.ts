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
import { fileURLToPath } from 'node:url';
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

  // @rf RF-11..16
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

  // @rnf RNF-06
  it('throws EmptyRequirementsError when requirements file is absent in strict mode', async () => {
    const dir = await makeProject();
    // Deliberately skip writeRequirements.
    await assert.rejects(
      () => runTestQualityAudit({ cwd: dir, mode: 'strict' }),
      /empty requirements|no requirements file/i,
    );
  });

  // @rf RF-43
  // @rnf RNF-05
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

describe('runTestQualityAudit — surface coverage gate', () => {
  async function writeUseCase(dir: string, flows = ['## Main Flow']): Promise<void> {
    const { mkdir } = await import('node:fs/promises');
    await mkdir(join(dir, 'docs', 'up', '03-use-cases'), { recursive: true });
    await writeFile(
      join(dir, 'docs', 'up', '03-use-cases', 'UC-03-manage-order.md'),
      `# Use Case: Manage Order

> **ID:** UC-03 | **Stereotype:** \`<<CRUD>>\`

${flows.join('\n\n')}

1. The user performs the operation.
`,
      'utf8',
    );
  }

  /**
   * @rf RF-30
   * @rnf RNF-07
   */
  it('fails strict mode when a use-case flow has no test claiming it', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    await writeUseCase(dir);
    await writeFile(
      join(dir, 'thin.test.ts'),
      `import { it } from 'node:test';
/** @rf RF-01 */
it('covers RF-01 only', () => { assert.equal(1, 1); });
`,
      'utf8',
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'strict' });
    assert.ok(report.surface.items.length >= 2, 'the use case and its flow are expected surface items');
    assert.ok(report.surface.uncovered.length >= 1);
    assert.equal(report.passed, false);
  });

  /**
   * @rf RF-31
   * @rnf RNF-07
   */
  it('passes strict mode when every surface item is claimed by a well-formed test', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    await writeUseCase(dir);
    await writeFile(
      join(dir, 'full.test.ts'),
      `import { it } from 'node:test';
/**
 * @rf RF-01
 * @surface UC-03, UC-03-MAIN
 */
it('covers the use case and its main flow', () => { assert.equal(1, 1); });
`,
      'utf8',
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'strict' });
    assert.equal(report.surface.uncovered.length, 0);
    assert.equal(report.passed, true);
  });

  /**
   * @rf RF-32
   * @rnf RNF-08
   */
  it('reports surface totals in report mode without gating the result', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    await writeUseCase(dir);
    const report = await runTestQualityAudit({ cwd: dir, mode: 'report' });
    assert.ok(report.surface.items.length >= 1);
    assert.equal(report.surface.expectedMinCases, report.surface.items.length);
    assert.equal(report.passed, true);
  });

  /**
   * @rf RF-33
   * @rnf RNF-08
   */
  it('does not accept a mediocre test as surface coverage', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    await writeUseCase(dir);
    await writeFile(
      join(dir, 'mediocre.test.ts'),
      `import { it } from 'node:test';
/**
 * @rf RF-01
 * @surface UC-03, UC-03-MAIN
 */
it('should work', () => { expect(result).toBeTruthy(); });
`,
      'utf8',
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'report' });
    assert.ok(report.totals.mediocre >= 1);
    assert.ok(
      report.surface.uncovered.length >= 1,
      'a mediocre claim must not count as coverage',
    );
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

describe('runTestQualityAudit — UP artifacts feed the surface axis', () => {
  async function writeArtifact(dir: string, relative: string, content: string): Promise<void> {
    const { mkdir } = await import('node:fs/promises');
    const { dirname } = await import('node:path');
    await mkdir(dirname(join(dir, relative)), { recursive: true });
    await writeFile(join(dir, relative), content, 'utf8');
  }

  /**
   * @rf RF-41
   * @rnf RNF-09
   */
  it('RF-41: derives operation items from the system-operations list', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    await writeArtifact(
      dir,
      'docs/up/04-system-operations.md',
      `# System Operations List

| # | Operation | Parameters | Return | Origin |
|---|---|---|---|---|
| 1 | \`startPurchase(customerId)\` | customerId: ID | Order | UC-03 step 1 |
`,
    );
    await writeFile(
      join(dir, 'purchase.test.ts'),
      `import { it } from 'node:test';
/**
 * @rf RF-01
 * @surface OP-STARTPURCHASE
 */
it('starts the purchase', () => { assert.equal(1, 1); });
`,
      'utf8',
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'report' });
    const op = report.surface.items.find((s) => s.id === 'OP-STARTPURCHASE');
    assert.ok(op, 'the operation must be part of the expected surface');
    assert.equal(op.kind, 'operation');
    assert.equal(report.surface.uncovered.length, 0);
  });

  /**
   * @rf RF-42
   * @rnf RNF-09
   */
  it('RF-42: a surface item justified as excluded in the plan is not reported as uncovered', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    await writeArtifact(
      dir,
      'docs/up/03-use-cases/UC-03-manage-order.md',
      `# Use Case: Manage Order

> **ID:** UC-03

## Main Flow

1. The user manages the order.

## Variant 2a: Pay by card

2a.1. The system charges the card.
`,
    );
    await writeArtifact(
      dir,
      'docs/up/10-tdd-plan.md',
      `# TDD Plan

### 1.3 Uncovered Gaps

| Gap | Source | Decision |
|---|---|---|
| Card gateway | UC-03-VARIANT-2A | Justified exclusion: vendor sandbox unavailable |
`,
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'report' });
    assert.ok(
      report.surface.uncovered.every((s) => s.id !== 'UC-03-VARIANT-2A'),
      'the justified exclusion must not be reported as uncovered',
    );
    assert.equal(report.surface.exempted.length, 1);
    assert.equal(report.totals.exemptedSurface, 1);
  });

  /**
   * @rf RF-43
   * @rnf RNF-09
   */
  it('RF-43: the plan taxonomy replaces the default type matrix', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    await writeArtifact(
      dir,
      'docs/up/10-tdd-plan.md',
      `# TDD Plan

## 3. Test Taxonomy

| Type | Count | Artifact Source | Status |
|---|---|---|---|
| Unit | 3 | Contracts | SPECIFIED |
`,
    );
    await writeFile(
      join(dir, 'unit.test.ts'),
      `import { it } from 'node:test';
/**
 * @rf RF-01
 * @type UNIT
 */
it('covers the alpha requirement', () => { assert.equal(1, 1); });
`,
      'utf8',
    );
    const report = await runTestQualityAudit({ cwd: dir, mode: 'strict' });
    assert.deepEqual(report.surface.types.missingMandatory, []);
    assert.equal(report.surface.types.satisfied, true);
    assert.equal(report.surface.types.shortfall.length, 1);
    assert.equal(report.surface.types.shortfall[0]?.planned, 3);
    assert.equal(report.surface.types.shortfall[0]?.actual, 1);
  });

  /**
   * @rf RF-44
   * @rnf RNF-09
   */
  it('RF-44: scope=extensions scans only the extensions directory', async () => {
    const dir = await makeProject();
    await writeRequirements(dir, '- **RF-01: alpha**\n');
    const { mkdir } = await import('node:fs/promises');
    await mkdir(join(dir, 'extensions'), { recursive: true });
    await writeFile(
      join(dir, 'extensions', 'inside.test.ts'),
      `import { it } from 'node:test';
/** @rf RF-01 */
it('inside extensions', () => { assert.equal(1, 1); });
`,
      'utf8',
    );
    await writeFile(
      join(dir, 'outside.test.ts'),
      `import { it } from 'node:test';
it('outside extensions', () => { assert.equal(1, 1); });
`,
      'utf8',
    );
    const scoped = await runTestQualityAudit({ cwd: dir, mode: 'report', scope: 'extensions' });
    assert.equal(scoped.totals.files, 1);
    const full = await runTestQualityAudit({ cwd: dir, mode: 'report' });
    assert.equal(full.totals.files, 2);
  });
});

describe('runTestQualityAudit — RNF-02 self-validation of the project battery', () => {
  /**
   * @rf RF-44
   * @rnf RNF-02
   */
  it('RNF-02: finds no mediocre test and no uncovered requirement in the project own battery', async () => {
    const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
    const report = await runTestQualityAudit({
      cwd: repoRoot,
      mode: 'report',
      requirementsFile: 'extensions/unified-process/src/test-quality/REQUIREMENTS.md',
    });
    assert.equal(report.totals.mediocre, 0, `unexpected mediocre issues: ${report.issues.map((i) => `${i.file}:${i.line}`).join(', ')}`);
    assert.deepEqual(report.coverage.uncoveredRf.map((r) => r.id), []);
    assert.deepEqual(report.coverage.uncoveredRnf.map((r) => r.id), []);
  });
});
