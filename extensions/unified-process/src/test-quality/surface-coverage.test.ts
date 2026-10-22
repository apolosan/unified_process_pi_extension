/**
 * Surface-Coverage — TDD test battery
 *
 * Validates the "extent" axis of the UP test-quality enforcement: the expected
 * test surface is derived from UP artifacts (use cases and their flows,
 * contracts and their post-conditions/exceptions) and every surface item must
 * be claimed by at least one NON-mediocre test.
 *
 * Naming convention: `it('RF-NN: <scenario> — <expected>', …)` with the
 * `@rf`/`@rnf` markers in the JSDoc block immediately above each test.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MANDATORY_TEST_TYPES,
  computeSurfaceCoverage,
  computeTypeMatrix,
  extractContractSurface,
  extractExemptedSurfaceIds,
  extractOperationSurface,
  extractPlannedTypes,
  extractSurfaceRefs,
  extractUseCaseSurface,
  type SurfaceItem,
} from './surface-coverage.ts';

const UC_FILE = 'docs/up/03-use-cases/UC-03-manage-order.md';
const CONTRACT_FILE = 'docs/up/06-contracts/contract-startPurchase.md';

const USE_CASE_MD = `# Use Case: Manage Order

> **ID:** UC-03 | **Stereotype:** \`<<CRUD>>\` | **Phase:** Elaboration

## Main Flow

1. The user chooses the operation to perform.

## Variant 2a: Alternative condition

2a.1. The system displays alternatives.

## Exception 3a — Invalid data

3a.1. The system informs the reason.
`;

const CONTRACT_MD = `# Contract: \`startPurchase(customerId: string): Order\`

## Pre-conditions

- \`[existence]\` An instance of \`Customer\` exists

## Post-conditions

### Instance creation
- \`new Order(number=nextNumber, status=OPEN)\` was created

### Association creation
- \`customer.orders.add(newOrder)\` — order associated with the customer

## Exceptions

| Condition | Violated Pre-condition | Action |
| --- | --- | --- |
| Customer not found | \`ssn\` does not exist | Throw \`CustomerNotFound\` |
`;

describe('extractUseCaseSurface — RF-25', () => {
  /**
   * @rf RF-25
   * @rnf RNF-07
   */
  it('derives one item per use case plus one per flow heading', () => {
    const items = extractUseCaseSurface(USE_CASE_MD, UC_FILE);
    assert.deepEqual(
      items.map((i) => i.id),
      ['UC-03', 'UC-03-MAIN', 'UC-03-VARIANT-2A', 'UC-03-EXCEPTION-3A'],
    );
    assert.equal(items[0]?.kind, 'use_case');
    assert.equal(items[1]?.kind, 'flow');
    assert.equal(items[3]?.kind, 'flow');
    assert.equal(items[3]?.title, 'Invalid data');
    assert.equal(items[0]?.file, UC_FILE);
    assert.ok((items[0]?.line ?? 0) > 0);
  });

  /**
   * @rf RF-25
   * @rnf RNF-08
   */
  it('falls back to the file name when the ID line is absent', () => {
    const items = extractUseCaseSurface('# Use Case: Manage Order\n\n## Main Flow\n\n1. step\n', UC_FILE);
    assert.equal(items[0]?.id, 'UC-03');
    assert.equal(items[1]?.id, 'UC-03-MAIN');
  });
});

describe('extractContractSurface — RF-26', () => {
  /**
   * @rf RF-26
   * @rnf RNF-07
   */
  it('derives operation, post-condition and exception items from a contract', () => {
    const items = extractContractSurface(CONTRACT_MD, CONTRACT_FILE);
    assert.deepEqual(
      items.map((i) => i.id),
      ['OP-STARTPURCHASE', 'OP-STARTPURCHASE-PC1', 'OP-STARTPURCHASE-PC2', 'OP-STARTPURCHASE-EX1'],
    );
    assert.equal(items[0]?.kind, 'operation');
    assert.equal(items[1]?.kind, 'post_condition');
    assert.equal(items[3]?.kind, 'exception');
  });

  /**
   * @rf RF-26
   * @rnf RNF-08
   */
  it('never derives items from the pre-conditions block', () => {
    const items = extractContractSurface(CONTRACT_MD, CONTRACT_FILE);
    assert.equal(items.filter((i) => i.title.includes('existence')).length, 0);
  });
});

describe('extractSurfaceRefs — RF-27', () => {
  /**
   * @rf RF-27
   * @rnf RNF-07
   */
  it('reads @surface ids and @type from the JSDoc block above each test', () => {
    const source = `import { it } from 'node:test';
/**
 * @rf RF-25
 * @surface UC-03-MAIN, OP-STARTPURCHASE-PC1
 * @type E2E-T1
 */
it('covers the main flow', () => {
  assert.equal(1, 1);
});
`;
    const refs = extractSurfaceRefs(source, 'sample.test.ts');
    assert.equal(refs.length, 1);
    assert.deepEqual(refs[0]?.surface, ['UC-03-MAIN', 'OP-STARTPURCHASE-PC1']);
    assert.equal(refs[0]?.type, 'E2E-T1');
    assert.equal(refs[0]?.mediocre, false);
  });

  /**
   * @rf RF-27
   * @rnf RNF-08
   */
  it('returns no surface claim for a test without markers', () => {
    const source = `import { it } from 'node:test';
it('plain test', () => { assert.equal(1, 1); });
`;
    const refs = extractSurfaceRefs(source, 'sample.test.ts');
    assert.equal(refs.length, 1);
    assert.deepEqual(refs[0]?.surface, []);
    assert.equal(refs[0]?.type, undefined);
  });
});

describe('computeSurfaceCoverage — RF-28', () => {
  const items: SurfaceItem[] = [
    { id: 'UC-03-MAIN', kind: 'flow', title: 'Main Flow', file: UC_FILE, line: 1 },
    { id: 'UC-03-EXCEPTION-3A', kind: 'flow', title: 'Exception 3a', file: UC_FILE, line: 2 },
  ];

  /**
   * @rf RF-28
   * @rnf RNF-07
   */
  it('marks an item covered when a non-mediocre test claims it', () => {
    const report = computeSurfaceCoverage(items, [
      {
        file: 'a.test.ts',
        line: 10,
        testName: 'covers main flow',
        surface: ['UC-03-MAIN'],
        type: 'UNIT',
        mediocre: false,
      },
    ]);
    assert.equal(report.covered.length, 1);
    assert.equal(report.uncovered.length, 1);
    assert.equal(report.uncovered[0]?.id, 'UC-03-EXCEPTION-3A');
    assert.equal(report.expectedMinCases, 2);
  });

  /**
   * @rf RF-28
   * @rnf RNF-08
   */
  it('refuses to count a mediocre test as coverage', () => {
    const report = computeSurfaceCoverage(items, [
      {
        file: 'a.test.ts',
        line: 10,
        testName: 'should work',
        surface: ['UC-03-MAIN'],
        type: 'UNIT',
        mediocre: true,
      },
    ]);
    assert.equal(report.covered.length, 0);
    assert.equal(report.uncovered.length, 2);
    assert.equal(report.claimedBy['UC-03-MAIN']?.length, 1, 'the claim is still reported for remediation');
  });

  /**
   * @rf RF-28
   * @rnf RNF-08
   */
  it('matches surface ids case-insensitively', () => {
    const report = computeSurfaceCoverage(items, [
      {
        file: 'a.test.ts',
        line: 10,
        testName: 'lowercase claim',
        surface: ['uc-03-main'],
        type: 'UNIT',
        mediocre: false,
      },
    ]);
    assert.equal(report.covered.length, 1);
  });
});

describe('computeTypeMatrix — RF-29', () => {
  /**
   * @rf RF-29
   * @rnf RNF-07
   */
  it('reports the mandatory types missing from the declared battery', () => {
    const matrix = computeTypeMatrix([
      { file: 'a.test.ts', line: 1, testName: 'unit test', surface: [], type: 'UNIT', mediocre: false },
    ]);
    assert.deepEqual(matrix.declared, ['UNIT']);
    assert.ok(matrix.missingMandatory.includes('INTEGRATION'));
    assert.equal(matrix.satisfied, false);
  });

  /**
   * @rf RF-29
   * @rnf RNF-08
   */
  it('is satisfied only when every mandatory type plus one NFR type is declared', () => {
    const refs = [...MANDATORY_TEST_TYPES, 'PERF'].map((type, index) => ({
      file: 'a.test.ts',
      line: index + 1,
      testName: `test ${type}`,
      surface: [],
      type,
      mediocre: false,
    }));
    const matrix = computeTypeMatrix(refs);
    assert.deepEqual(matrix.missingMandatory, []);
    assert.equal(matrix.satisfied, true);
  });

  /**
   * @rf RF-29
   * @rnf RNF-08
   */
  it('treats a battery with no declared type as not applicable instead of failing', () => {
    const matrix = computeTypeMatrix([
      { file: 'a.test.ts', line: 1, testName: 'untyped', surface: [], type: undefined, mediocre: false },
    ]);
    assert.deepEqual(matrix.declared, []);
    assert.deepEqual(matrix.missingMandatory, []);
    assert.equal(matrix.satisfied, true);
  });
});

describe('extractOperationSurface — RF-35', () => {
  const SSD_MD = `# System Operations List

## Identified System Operations

| # | Operation | Parameters | Return | Origin |
|---|---|---|---|---|
| 1 | \`startProcess(param1, param2)\` | param1: Type | confirmation | UC-01 step 1 |
| 2 | \`addItem(itemId, quantity)\` | itemId: ID | subtotal: Money | UC-01 step 3 |
`;

  /**
   * @rf RF-35
   * @rnf RNF-09
   */
  it('RF-35: derives one operation item per row of the operations table', () => {
    const items = extractOperationSurface(SSD_MD, 'docs/up/04-system-operations.md');
    assert.deepEqual(items.map((i) => i.id), ['OP-STARTPROCESS', 'OP-ADDITEM']);
    assert.equal(items[0]?.kind, 'operation');
    assert.equal(items[0]?.title, 'startProcess');
  });

  /**
   * @rf RF-35
   * @rnf RNF-10
   */
  it('RF-35: ignores tables that do not declare an Operation column', () => {
    const md = `| Case | Expected |\n|---|---|\n| something | value |\n`;
    assert.deepEqual(extractOperationSurface(md, 'docs/up/04-system-operations.md'), []);
  });
});

describe('computeSurfaceCoverage — RF-36: contract hierarchy', () => {
  /**
   * @rf RF-36
   * @rnf RNF-08
   */
  it('RF-36: a claim on a post-condition implies the operation itself is exercised', () => {
    const items: SurfaceItem[] = [
      { id: 'OP-STARTPURCHASE', kind: 'operation', title: 'startPurchase', file: 'c.md', line: 1 },
      { id: 'OP-STARTPURCHASE-PC1', kind: 'post_condition', title: 'order created', file: 'c.md', line: 2 },
    ];
    const report = computeSurfaceCoverage(items, [
      {
        file: 'a.test.ts',
        line: 10,
        testName: 'creates the order',
        surface: ['OP-STARTPURCHASE-PC1'],
        type: 'UNIT',
        mediocre: false,
      },
    ]);
    assert.equal(report.uncovered.length, 0, 'the operation is covered by its own post-condition test');
  });
});

describe('extractPlannedTypes — RF-37', () => {
  const PLAN_MD = `# TDD Plan

## 3. Test Taxonomy

| Type | Count | Artifact Source | Status |
|---|---|---|---|
| Unit | 42 | Contracts, system operations | SPECIFIED |
| Integration | 12 | Sequence diagrams | SPECIFIED |
| End-to-End (E2E) | 4 | Use case main flows | SPECIFIED |
| Performance | [N] | NFRs | DRAFT |
`;

  /**
   * @rf RF-37
   * @rnf RNF-09
   */
  it('RF-37: reads the taxonomy table into types and counts', () => {
    const planned = extractPlannedTypes(PLAN_MD);
    assert.deepEqual(planned.map((p) => p.type), ['UNIT', 'INTEGRATION', 'E2E', 'PERF']);
    assert.equal(planned[0]?.count, 42);
    assert.equal(planned[1]?.count, 12);
    assert.equal(planned[2]?.count, 4);
  });

  /**
   * @rf RF-37
   * @rnf RNF-10
   */
  it('RF-37: a placeholder count is not enforceable', () => {
    const planned = extractPlannedTypes(PLAN_MD);
    const perf = planned.find((p) => p.type === 'PERF');
    assert.equal(perf?.count, 0);
    assert.equal(perf?.enforceable, false);
  });
});

describe('computeTypeMatrix — RF-38: planned types are authoritative', () => {
  /**
   * @rf RF-38
   * @rnf RNF-08
   */
  it('RF-38: requires only the types the plan declares', () => {
    const matrix = computeTypeMatrix(
      [{ file: 'a.test.ts', line: 1, testName: 'unit', surface: [], type: 'UNIT', mediocre: false }],
      [{ type: 'UNIT', count: 10, enforceable: true }],
    );
    assert.deepEqual(matrix.missingMandatory, []);
    assert.equal(matrix.satisfied, true);
  });

  /**
   * @rf RF-38
   * @rnf RNF-08
   */
  it('RF-38: reports a planned type that no test declares', () => {
    const matrix = computeTypeMatrix(
      [{ file: 'a.test.ts', line: 1, testName: 'unit', surface: [], type: 'UNIT', mediocre: false }],
      [
        { type: 'UNIT', count: 10, enforceable: true },
        { type: 'E2E', count: 2, enforceable: true },
      ],
    );
    assert.deepEqual(matrix.missingMandatory, ['E2E']);
    assert.equal(matrix.satisfied, false);
  });

  /**
   * @rf RF-38
   * @rnf RNF-09
   */
  it('RF-38: reports the shortfall between planned and actual case counts', () => {
    const matrix = computeTypeMatrix(
      [
        { file: 'a.test.ts', line: 1, testName: 'one', surface: [], type: 'UNIT', mediocre: false },
        { file: 'a.test.ts', line: 2, testName: 'two', surface: [], type: 'UNIT', mediocre: false },
      ],
      [{ type: 'UNIT', count: 5, enforceable: true }],
    );
    assert.equal(matrix.shortfall.length, 1);
    assert.equal(matrix.shortfall[0]?.planned, 5);
    assert.equal(matrix.shortfall[0]?.actual, 2);
  });

  /**
   * @rf RF-38
   * @rnf RNF-09
   */
  it('RF-38: an E2E plan row is satisfied by either e2e tier', () => {
    const matrix = computeTypeMatrix(
      [{ file: 'a.test.ts', line: 1, testName: 'e2e', surface: [], type: 'E2E-T1', mediocre: false }],
      [{ type: 'E2E', count: 1, enforceable: true }],
    );
    assert.deepEqual(matrix.missingMandatory, []);
  });
});

describe('extractExemptedSurfaceIds — RF-39', () => {
  const PLAN_MD = `# TDD Plan

### 1.3 Uncovered Gaps

| Gap | Source | Decision |
|---|---|---|
| Payment gateway integration | UC-03-VARIANT-2A | Justified exclusion: vendor sandbox unavailable |
| Load profile | NFR-response-time | Will be covered by the performance suite |
`;

  /**
   * @rf RF-39
   * @rnf RNF-09
   */
  it('RF-39: collects only the surface ids justified as excluded', () => {
    assert.deepEqual(extractExemptedSurfaceIds(PLAN_MD), ['UC-03-VARIANT-2A']);
  });

  /**
   * @rf RF-39
   * @rnf RNF-10
   */
  it('RF-39: returns nothing when the plan has no gaps table', () => {
    assert.deepEqual(extractExemptedSurfaceIds('# TDD Plan\n\n## 1. Strategy\n'), []);
  });
});
