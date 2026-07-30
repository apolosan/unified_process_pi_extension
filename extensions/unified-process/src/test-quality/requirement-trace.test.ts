/**
 * Requirement-Trace — TDD test battery
 *
 * Validates extraction of canonical RF/RNF identifiers from `02-requirements.md`
 * style markdown, plus cross-referencing of `@rf`/`@rnf` markers from test
 * source files.
 *
 * Naming convention: `it('RF-NN: <scenario> — <expected>', …)`.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  extractRequirements,
  extractTestTraceability,
  computeCoverage,
  type Requirement,
  type TestTrace,
} from './requirement-trace.ts';

const REQUIREMENTS_PATH = 'docs/up/02-requirements.md';

describe('extractRequirements — RF-13 bold bullet form', () => {
  it('RF-13: parses - **RF-01: title** bullets', () => {
    const md = `# Requirements\n\n- **RF-01: User registration with email validation**\n- **RF-02: User login**\n`;
    const reqs = extractRequirements(md, REQUIREMENTS_PATH);
    assert.equal(reqs.length, 2);
    assert.equal(reqs[0]?.id, 'RF-01');
    assert.equal(reqs[0]?.type, 'RF');
    assert.equal(reqs[0]?.title, 'User registration with email validation');
    assert.equal(reqs[0]?.file, REQUIREMENTS_PATH);
    assert.equal(reqs[0]?.line, 3);
  });

  it('RF-13: parses - **RNF-01: p95 < 200ms** with the same shape', () => {
    const md = `- **RNF-01: p95 response time under 200ms**\n`;
    const reqs = extractRequirements(md, REQUIREMENTS_PATH);
    assert.equal(reqs.length, 1);
    assert.equal(reqs[0]?.id, 'RNF-01');
    assert.equal(reqs[0]?.type, 'RNF');
    assert.equal(reqs[0]?.title, 'p95 response time under 200ms');
  });

  it('RF-13: optional parenthesized category is preserved in title', () => {
    const md = `- **RF-01 (Functional): do thing**\n`;
    const reqs = extractRequirements(md, REQUIREMENTS_PATH);
    assert.equal(reqs[0]?.title, 'do thing');
  });
});

describe('extractRequirements — RF-14 table form', () => {
  it('RF-14: parses | ID | Title | rows immediately after a separator line', () => {
    const md = `| ID | Title |\n| --- | --- |\n| RF-01 | User registration |\n| RNF-01 | p95 < 200ms |\n`;
    const reqs = extractRequirements(md, REQUIREMENTS_PATH);
    assert.equal(reqs.length, 2);
    assert.equal(reqs[0]?.id, 'RF-01');
    assert.equal(reqs[0]?.title, 'User registration');
    assert.equal(reqs[1]?.id, 'RNF-01');
    assert.equal(reqs[1]?.title, 'p95 < 200ms');
  });

  it('RF-14: ignores a bare pipe line that is not preceded by a separator', () => {
    const md = `| RF-01 | orphan |\n| RF-02 | also orphan |\n`;
    const reqs = extractRequirements(md, REQUIREMENTS_PATH);
    assert.equal(reqs.length, 0, 'orphan pipes should not be parsed as requirements');
  });
});

describe('extractRequirements — plain list fallback', () => {
  it('parses - RF-NN: title without bold markers', () => {
    const md = `- RF-03: third feature\n`;
    const reqs = extractRequirements(md, REQUIREMENTS_PATH);
    assert.equal(reqs[0]?.id, 'RF-03');
    assert.equal(reqs[0]?.title, 'third feature');
  });
});

describe('extractTestTraceability — RF-09..12 markers', () => {
  it('RF-09: extracts @rf RF-XX from JSDoc above it()', () => {
    const src = `import { it } from 'node:test';
/**
 * @rf RF-01
 */
it('validates a contract post-condition', () => {
  assert.equal(1, 1);
});
`;
    const traces = extractTestTraceability(src, 'src/example.test.ts');
    assert.equal(traces.length, 1);
    assert.deepEqual(traces[0]?.rf, ['RF-01']);
    assert.equal(traces[0]?.testName, 'validates a contract post-condition');
  });

  it('RF-10: extracts @rnf RNF-YY from same JSDoc block', () => {
    const src = `/**
 * @rf RF-01
 * @rnf RNF-02
 */
it('latency budget', () => {});
`;
    const traces = extractTestTraceability(src, 'src/lat.test.ts');
    assert.deepEqual(traces[0]?.rf, ['RF-01']);
    assert.deepEqual(traces[0]?.rnf, ['RNF-02']);
  });

  it('RF-11: returns empty arrays when no JSDoc above it()', () => {
    const src = `it('unmarked test', () => {});
`;
    const traces = extractTestTraceability(src, 'src/x.test.ts');
    assert.deepEqual(traces[0]?.rf, []);
    assert.deepEqual(traces[0]?.rnf, []);
  });

  it('RF-12: accepts single-line // @rf comment immediately above it()', () => {
    const src = `// @rf RF-05
it('inline annotation', () => {});
`;
    const traces = extractTestTraceability(src, 'src/x.test.ts');
    assert.deepEqual(traces[0]?.rf, ['RF-05']);
  });

  it('RF-12: accepts multiple markers on the same comment line', () => {
    const src = `// @rf RF-06 @rnf RNF-04
it('combined', () => {});
`;
    const traces = extractTestTraceability(src, 'src/x.test.ts');
    assert.deepEqual(traces[0]?.rf, ['RF-06']);
    assert.deepEqual(traces[0]?.rnf, ['RNF-04']);
  });
});

describe('computeCoverage — RF-15..16 coverage diff', () => {
  const requirements: Requirement[] = [
    { id: 'RF-01', type: 'RF', title: 'alpha', file: REQUIREMENTS_PATH, line: 1 },
    { id: 'RF-02', type: 'RF', title: 'beta', file: REQUIREMENTS_PATH, line: 2 },
    { id: 'RNF-01', type: 'RNF', title: 'p95 budget', file: REQUIREMENTS_PATH, line: 3 },
  ];

  it('RF-15: marks uncovered requirements absent from any test marker', () => {
    const tests: TestTrace[] = [
      {
        file: 'src/a.test.ts',
        line: 1,
        testName: 't',
        rf: ['RF-01'],
        rnf: [],
      },
    ];
    const cov = computeCoverage(requirements, tests);
    assert.deepEqual(cov.coveredRf.map((r) => r.id), ['RF-01']);
    assert.deepEqual(cov.uncoveredRf.map((r) => r.id), ['RF-02']);
    assert.deepEqual(cov.uncoveredRnf.map((r) => r.id), ['RNF-01']);
  });

  it('RF-16: returns full requirement objects with titles in coveredRf/coveredRnf', () => {
    const tests: TestTrace[] = [
      {
        file: 'src/a.test.ts',
        line: 1,
        testName: 't',
        rf: ['RF-01', 'RF-02'],
        rnf: ['RNF-01'],
      },
    ];
    const cov = computeCoverage(requirements, tests);
    assert.equal(cov.coveredRf[0]?.title, 'alpha');
    assert.equal(cov.coveredRnf[0]?.title, 'p95 budget');
    assert.equal(cov.uncoveredRf.length, 0);
    assert.equal(cov.uncoveredRnf.length, 0);
  });

  it('treats redundant references as a single cover (idempotent)', () => {
    const tests: TestTrace[] = [
      { file: 'a', line: 1, testName: 'x', rf: ['RF-01'], rnf: [] },
      { file: 'b', line: 2, testName: 'y', rf: ['RF-01'], rnf: [] },
    ];
    const cov = computeCoverage(requirements, tests);
    assert.equal(cov.coveredRf.length, 1);
    assert.equal(cov.uncoveredRf.length, 1);
  });
});
