/**
 * Mediocre-detector — flags P1 (Quality Bar) violations in test files.
 *
 * Pure static analysis over a TypeScript/JavaScript test source. Reports one
 * `MediocreIssue` per violation with file:line + the offending `it()` name so
 * the surrounding audit tool can render actionable remediation messages.
 *
 * Implemented against the requirements documented in
 * `extensions/unified-process/src/test-quality/REQUIREMENTS.md` (RF-01..08,
 * RNF-01..02).
 */

export type MediocreType =
  | 'medicre'
  | 'simple'
  | 'simplorio'
  | 'stupid'
  | 'smoke_empty'
  | 'snapshot_blind';

export interface MediocreIssue {
  type: MediocreType;
  severity: 'error' | 'warning';
  file: string;
  line: number;
  testName: string;
  message: string;
  rf?: string;
  rnf?: string;
}

interface TestBlock {
  name: string;
  startLine: number;
  body: string;
  rf?: string;
  rnf?: string;
}

const FRAMEWORK_VENDOR_NAMES = new Set([
  'vitest',
  'jest',
  'mocha',
  'describe',
  'it',
  'test',
  'expect',
  'chai',
  'sinon',
  'typebox',
  'tslib',
  'tsx',
  'esbuild',
]);

const TRIVIAL_NAME_PATTERNS = [/^should\s+work$/i, /^works?$/i, /^basic\s+\w+$/i, /^smoke$/i];

const TEST_HEAD_REGEX = /\b(it|test)\s*\(\s*['"`]([^'"`]+)['"`]\s*,/;
const JSDOC_RF = /@rf\s+(RF-\d+)/;
const JSDOC_RNF = /@rnf\s+(RNF-\d+)/;

export function detectMediocrePatterns(source: string, filePath: string): MediocreIssue[] {
  const issues: MediocreIssue[] = [];
  const blocks = extractTestBlocks(source);
  for (const block of blocks) issues.push(...checkPatterns(block, filePath));
  return issues;
}

export function extractTestBlocks(source: string): TestBlock[] {
  const blocks: TestBlock[] = [];
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const match = (lines[i] ?? '').match(TEST_HEAD_REGEX);
    if (!match) continue;

    const name = match[2] ?? '';
    const startLine = i + 1;
    const annotations = captureAnnotations(lines, i);
    const body = sliceBody(lines, i);

    blocks.push({
      name,
      startLine,
      body,
      rf: annotations.rf,
      rnf: annotations.rnf,
    });
  }
  return blocks;
}

function captureAnnotations(lines: string[], headLineIndex: number): { rf?: string; rnf?: string } {
  const collected: string[] = [];
  for (let j = headLineIndex - 1; j >= Math.max(0, headLineIndex - 12); j--) {
    const trimmed = (lines[j] ?? '').trim();
    if (trimmed === '') {
      if (collected.length > 0) break;
      continue;
    }
    const isCommentish =
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.includes('*/');
    if (!isCommentish) break;
    collected.unshift(lines[j] ?? '');
  }

  if (collected.length === 0) return {};
  const text = collected.join('\n');
  const rfMatch = text.match(JSDOC_RF);
  const rnfMatch = text.match(JSDOC_RNF);
  if (rfMatch) return { rf: rfMatch[1], rnf: rnfMatch?.[1] };
  return { rnf: rnfMatch?.[1] };
}

function sliceBody(lines: string[], headLineIndex: number): string {
  const tail = lines.slice(headLineIndex).join('\n');
  const openIdx = tail.indexOf('{');
  if (openIdx < 0) return '';

  let depth = 0;
  for (let k = openIdx; k < tail.length; k++) {
    const ch = tail[k];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return tail.slice(openIdx + 1, k);
    }
  }
  return '';
}

function checkPatterns(block: TestBlock, filePath: string): MediocreIssue[] {
  const issues: MediocreIssue[] = [];
  const body = block.body.trim();
  const traceRefs = { rf: block.rf, rnf: block.rnf };

  const assertionCount =
    (body.match(/\bassert\.\w+\(/g) ?? []).length + (body.match(/\bexpect\(/g) ?? []).length;
  const onlyOneAssertion = assertionCount === 1;

  // RF-07 runs FIRST and short-circuits when a vendor match fires — a vendor
  // test outranks generic 'medicre'/'simplorio' tags because the test is
  // poking the runner, not asserting behavior.
  const vendorMatch = body.match(/expect\(\s*([A-Za-z_$][\w$]*)\s*\)/);
  if (vendorMatch && FRAMEWORK_VENDOR_NAMES.has(vendorMatch[1] ?? '')) {
    issues.push({
      type: 'stupid',
      severity: 'error',
      file: filePath,
      line: block.startLine,
      testName: block.name,
      message: `Asserting on a framework/vendor symbol (${vendorMatch[1]}) validates the runner, not the system.`,
      ...traceRefs,
    });
    return issues;
  }

  // RF-01 — sole `expect(x).toBeDefined()`.
  if (
    onlyOneAssertion &&
    /^expect\([\s\S]*?\)\.toBeDefined\(\)\s*;?\s*$/.test(body)
  ) {
    issues.push({
      type: 'medicre',
      severity: 'error',
      file: filePath,
      line: block.startLine,
      testName: block.name,
      message: '`.toBeDefined()` is the only assertion; the test verifies nothing about behavior.',
      ...traceRefs,
    });
  }

  // RF-02 — generic-instanceof with no other assertion.
  if (
    onlyOneAssertion &&
    /^expect\([\s\S]*?\)\.toBeInstanceOf\((Function|Object)\)\s*;?\s*$/.test(body)
  ) {
    issues.push({
      type: 'medicre',
      severity: 'error',
      file: filePath,
      line: block.startLine,
      testName: block.name,
      message: 'Generic `toBeInstanceOf(Function|Object)` does not validate behavior.',
      ...traceRefs,
    });
  }

  // RF-03 — sole toBeTruthy / toBeFalsy (simplorio).
  if (
    onlyOneAssertion &&
    /^expect\([\s\S]*?\)\.toBe(Truthy|Falsy)\(\)\s*;?\s*$/.test(body)
  ) {
    issues.push({
      type: 'simplorio',
      severity: 'error',
      file: filePath,
      line: block.startLine,
      testName: block.name,
      message: '`.toBeTruthy/Falsy()` as the only assertion provides no concrete acceptance criterion.',
      ...traceRefs,
    });
  }

  // RF-04 — trivial `it()` name combined with toBeTruthy.
  const isTrivialName = TRIVIAL_NAME_PATTERNS.some((re) => re.test(block.name.trim()));
  if (isTrivialName && /toBeTruthy\(/.test(body)) {
    issues.push({
      type: 'simple',
      severity: 'error',
      file: filePath,
      line: block.startLine,
      testName: block.name,
      message: 'Trivial name combined with `.toBeTruthy()` — rewrite with a behavior-focused name and concrete assertion.',
      ...traceRefs,
    });
  }

  // RF-05 — `expect(() => import(...)).not.toThrow()` standalone.
  if (
    onlyOneAssertion &&
    /expect\(\s*\(\s*\)\s*=>\s*import\(/.test(body) &&
    /\.not\.toThrow\(\)/.test(body)
  ) {
    issues.push({
      type: 'smoke_empty',
      severity: 'warning',
      file: filePath,
      line: block.startLine,
      testName: block.name,
      message: '`expect(() => import(...)).not.toThrow()` only validates module loading; tests nothing about behavior.',
      ...traceRefs,
    });
  }

  // RF-06 — literal self-reference expect(x).toEqual(x).
  const selfRef = body.match(/expect\((\w+)\)\.(toEqual|toBe)\(\s*\1\s*\)/);
  if (selfRef) {
    issues.push({
      type: 'simplorio',
      severity: 'error',
      file: filePath,
      line: block.startLine,
      testName: block.name,
      message: `Literal self-reference: expect(${selfRef[1]}).${selfRef[2]}(${selfRef[1]}) asserts nothing.`,
      ...traceRefs,
    });
  }

  // RF-08 — `toMatchSnapshot()` with no argument.
  if (/toMatchSnapshot\(\s*\)/.test(body)) {
    issues.push({
      type: 'snapshot_blind',
      severity: 'warning',
      file: filePath,
      line: block.startLine,
      testName: block.name,
      message: 'Blind `toMatchSnapshot()` — provide a named snapshot or an inline assertion to make intent explicit.',
      ...traceRefs,
    });
  }

  return issues;
}
