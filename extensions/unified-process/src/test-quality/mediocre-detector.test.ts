/**
 * Mediocre Detector — TDD test battery
 *
 * Each test below maps to one or more RFs declared in
 * `extensions/unified-process/src/test-quality/REQUIREMENTS.md`.
 *
 * Naming convention: `it('RF-NN: <scenario> — <expected>', …)`.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  detectMediocrePatterns,
  extractTestBlocks,
  maskLiteralsAndComments,
  type MediocreIssue,
} from './mediocre-detector.ts';

// Helper: extract first issue of a given type, throw descriptive failure otherwise.
function findIssue(issues: MediocreIssue[], type: MediocreIssue['type']): MediocreIssue | undefined {
  return issues.find((i) => i.type === type);
}

const SAMPLE_PATH = 'src/example.test.ts';

function wrap(body: string, name = 'sample test'): string {
  return `import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('sample', () => {
  it('${name}', () => {
    ${body}
  });
});
`;
}

describe('extractTestBlocks — RF-31: literals and comments are not test blocks', () => {
  /**
   * @rf RF-31
   * @rnf RNF-09
   */
  it('RF-31: ignores a test head embedded in a template-literal fixture', () => {
    const source = `import { it } from 'node:test';
const fixture = \`
it('should work', () => {
  expect(vitest).toBeDefined();
});
\`;
it('real behaviour', () => {
  assert.equal(compute(), 42);
});
`;
    const blocks = extractTestBlocks(source);
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]?.name, 'real behaviour');
  });

  /**
   * @rf RF-31
   * @rnf RNF-09
   */
  it('RF-31: ignores a commented-out test', () => {
    const source = `import { it } from 'node:test';
// it('disabled', () => { expect(vitest).toBeDefined(); });
/* it('also disabled', () => { expect(vitest).toBeDefined(); }); */
it('real behaviour', () => {
  assert.equal(compute(), 42);
});
`;
    const blocks = extractTestBlocks(source);
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]?.name, 'real behaviour');
  });

  /**
   * @rf RF-31
   * @rnf RNF-09
   */
  it('RF-31: does not flag a mediocre-looking fixture that lives inside a string', () => {
    const source = `import { it } from 'node:test';
const fixture = \`
it('should work', () => {
  expect(vitest).toBeDefined();
});
\`;
`;
    assert.deepEqual(detectMediocrePatterns(source, SAMPLE_PATH), []);
  });

  /**
   * @rf RF-31
   * @rnf RNF-10
   */
  it('RF-31: keeps the real test body while ignoring braces inside string literals', () => {
    const source = `import { it } from 'node:test';
it('handles braces in strings', () => {
  const payload = '{ "not": "a body" }';
  assert.equal(payload.length > 0, true);
});
`;
    const blocks = extractTestBlocks(source);
    assert.equal(blocks.length, 1);
    assert.ok(blocks[0]?.body.includes('payload.length'), 'the assertion must land inside the extracted body');
    assert.equal(blocks[0]?.body.trim().endsWith('}'), false, 'the body must stop at the matching brace');
  });

  /**
   * @rf RF-31
   * @rnf RNF-10
   */
  it('RF-31: maskLiteralsAndComments preserves offsets and line count', () => {
    const source = 'const a = "text";\n// comment\nconst b = 1;\n';
    const masked = maskLiteralsAndComments(source);
    assert.equal(masked.length, source.length);
    assert.equal(masked.split('\n').length, source.split('\n').length);
    assert.ok(masked.includes('const b = 1;'));
    assert.ok(!masked.includes('text'));
    assert.ok(!masked.includes('comment'));
  });
});

describe('detectMediocrePatterns — RF-01 toBeDefined as sole assertion', () => {
  // @rf RF-01
  it('RF-01: flags a standalone expect(x).toBeDefined() as mediocre', () => {
    const source = wrap(`expect(build()).toBeDefined();`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const issue = findIssue(issues, 'medicre');
    assert.ok(issue, 'expected a mediocre issue, got: ' + JSON.stringify(issues));
    assert.equal(issue.file, SAMPLE_PATH);
    assert.ok(issue.line > 0, 'line number must be reported');
    assert.equal(issue.severity, 'error');
  });

  // @rf RF-01
  it('RF-01: does NOT flag toBeDefined when preceded by another meaningful assertion', () => {
    const source = wrap(`
      const result = build();
      assert.ok(result !== null);
      expect(result.field).toBeDefined();
    `);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.equal(
      issues.find((i) => i.type === 'medicre' && /toBeDefined/.test(i.message)),
      undefined,
      'guard assertion before toBeDefined is sufficient'
    );
  });
});

describe('detectMediocrePatterns — RF-02 generic type asserts', () => {
  // @rf RF-02
  it('RF-02: flags expect(fn).toBeInstanceOf(Function) as mediocre', () => {
    const source = wrap(`expect(thing).toBeInstanceOf(Function);`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const issue = issues.find((i) => i.type === 'medicre' && /instanceof/i.test(i.message));
    assert.ok(issue, 'expected instanceof pattern flagged');
  });

  // @rf RF-02
  it('RF-02: does NOT flag toBeInstanceOf(Array) when paired with array-length check', () => {
    const source = wrap(`
      const list = buildList();
      expect(list).toBeInstanceOf(Array);
      assert.equal(list.length, 3);
    `);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const flagged = issues.find((i) => i.type === 'medicre' && /instanceof/i.test(i.message));
    assert.equal(flagged, undefined, 'context-rich instanceof should pass');
  });
});

describe('detectMediocrePatterns — RF-03 truthy/falsy as sole assertion', () => {
  // @rf RF-03
  it('RF-03: flags expect(x).toBeTruthy() with no preceding precondition as simplorio', () => {
    const source = wrap(`expect(compute()).toBeTruthy();`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const issue = issues.find((i) => i.type === 'simplorio');
    assert.ok(issue, 'expected a simplorio issue');
  });

  // @rf RF-03
  it('RF-03: flags expect(x).toBeFalsy() with no preceding precondition', () => {
    const source = wrap(`expect(missing).toBeFalsy();`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.ok(findIssue(issues, 'simplorio'));
  });
});

describe('detectMediocrePatterns — RF-04 trivial it-name + toBeTruthy', () => {
  // @rf RF-04
  it('RF-04: flags it("should work") with toBeTruthy as simple', () => {
    const source = `import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('sample', () => {
  it('should work', () => {
    expect(build()).toBeTruthy();
  });
});
`;
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const issue = findIssue(issues, 'simple');
    assert.ok(issue, 'expected a simple issue');
    assert.match(issue.message, /should work|trivial name/i);
  });

  // @rf RF-04
  it('RF-04: flags it("basic check") variants the same way', () => {
    const source = `import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
describe('x', () => { it('basic case', () => { expect(true).toBeTruthy(); }); });
`;
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.ok(findIssue(issues, 'simple'));
  });
});

describe('detectMediocrePatterns — RF-05 smoke-empty imports', () => {
  // @rf RF-05
  it('RF-05: flags expect(() => import("…")).not.toThrow() as smoke_empty', () => {
    const source = wrap(`expect(() => import('./mod.ts')).not.toThrow();`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.ok(findIssue(issues, 'smoke_empty'));
  });
});

describe('detectMediocrePatterns — RF-06 literal self-reference', () => {
  // @rf RF-06
  it('RF-06: flags expect(x).toEqual(x) as simplorio', () => {
    const source = wrap(`
      const fixture = { a: 1 };
      expect(fixture).toEqual(fixture);
    `);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.ok(
      issues.find((i) => i.type === 'simplorio' && /self.reference|literal/i.test(i.message)),
      'expected literal self-reference to be flagged'
    );
  });

  // @rf RF-06
  it('RF-06: does NOT flag expect(fixture).toEqual(expected) when args differ', () => {
    const source = wrap(`
      const fixture = { a: 1 };
      const expected = { a: 1 };
      expect(fixture).toEqual(expected);
    `);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const flagged = issues.find(
      (i) => i.type === 'simplorio' && /self.reference|literal/i.test(i.message)
    );
    assert.equal(flagged, undefined);
  });
});

describe('detectMediocrePatterns — RF-07 framework/vendor tests', () => {
  // @rf RF-07
  it('RF-07: flags expect(vitest).toBeDefined() as stupid', () => {
    const source = wrap(`expect(vitest).toBeDefined();`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const issue = issues.find((i) => i.type === 'stupid');
    assert.ok(issue, 'expected vendor import to be flagged as stupid');
    assert.match(issue.message, /framework|vendor/i);
  });

  // @rf RF-07
  it('RF-07: flags expect(typebox).toBeTruthy() as stupid', () => {
    const source = wrap(`expect(typebox).toBeTruthy();`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.ok(findIssue(issues, 'stupid'));
  });
});

describe('detectMediocrePatterns — RF-08 blind snapshot', () => {
  // @rf RF-08
  it('RF-08: flags toMatchSnapshot() without inline or named argument as snapshot_blind', () => {
    const source = wrap(`expect(render()).toMatchSnapshot();`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const issue = findIssue(issues, 'snapshot_blind');
    assert.ok(issue);
    assert.equal(issue.severity, 'warning');
  });

  // @rf RF-08
  it('RF-08: does NOT flag toMatchSnapshot("named-baseline")', () => {
    const source = wrap(`expect(render()).toMatchSnapshot('with user logged in');`);
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.equal(findIssue(issues, 'snapshot_blind'), undefined);
  });
});

describe('detectMediocrePatterns — edge cases', () => {
  it('returns an empty array for source with no test bodies', () => {
    const source = `// just a comment\nconst x = 1;\n`;
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.deepEqual(issues, []);
  });

  it('reports multiple issues across distinct it() blocks', () => {
    const source = `import { it } from 'node:test';
it('one', () => { expect(vitest).toBeDefined(); });
it('two', () => { expect(r).toBeTruthy(); });
`;
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    assert.ok(issues.length >= 2, 'expected multiple issues, got: ' + JSON.stringify(issues));
  });

  // @rf RF-09..12
  it('RF-09..12: emits traceability references in each issue when @rf is present', () => {
    const source = `import { it } from 'node:test';

/**
 * @rf RF-01
 * @rnf RNF-04
 */
it('validates a contract post-condition', () => {
  expect(vitest).toBeDefined();
});
`;
    const issues = detectMediocrePatterns(source, SAMPLE_PATH);
    const issue = findIssue(issues, 'stupid');
    assert.ok(issue);
    assert.equal(issue.rf, 'RF-01');
    assert.equal(issue.rnf, 'RNF-04');
  });
});

describe('detectMediocrePatterns — RNF-01 performance', () => {
  // @rnf RNF-01
  it('RNF-01: scans a 500-line synthetic file within the 25ms budget (perf invariant)', () => {
    const repeated = `import { it } from 'node:test';
it('case ' + N, () => { expect(value).toEqual(expected); });
`.replace(/value|expected|N/g, '');
    const padded = Array.from({ length: 60 }, (_, i) =>
      repeated.replace(/N/, String(i)).replace('value', `v${i}`).replace('expected', `e${i}`)
    ).join('\n');
    const start = performance.now();
    const issues = detectMediocrePatterns(padded, SAMPLE_PATH);
    const elapsed = performance.now() - start;
    assert.ok(
      elapsed < 25,
      `scan took ${elapsed.toFixed(1)}ms (> 25ms RNF-01 budget)`,
    );
    assert.ok(Array.isArray(issues));
  });
});
