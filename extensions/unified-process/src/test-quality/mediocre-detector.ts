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
  /** Every requirement id claimed by the test (ranges are expanded). */
  rfIds: string[];
  rnfIds: string[];
  /** Surface ids claimed by the test — see `surface-coverage.ts`. */
  surface: string[];
  /** Test type declared by the test (UNIT, INTEGRATION, E2E-T1, …). */
  type?: string;
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

const TEST_HEAD_REGEX = /(?<![.\w])(it|test)\s*\(\s*(['"`])/;
const JSDOC_RF = /@rf\s+(RF-\d+(?:\.\.\d+)?)/g;
const JSDOC_RNF = /@rnf\s+(RNF-\d+(?:\.\.\d+)?)/g;
const JSDOC_SURFACE = /@surface\s+([^*\n]+)/g;
const JSDOC_TYPE = /@type\s+([A-Za-z0-9-]+)/i;

export function detectMediocrePatterns(source: string, filePath: string): MediocreIssue[] {
  const issues: MediocreIssue[] = [];
  const blocks = extractTestBlocks(source);
  for (const block of blocks) issues.push(...checkPatterns(block, filePath));
  return issues;
}

/**
 * Blanks the contents of string literals and comments while preserving offsets
 * and line structure, so the scanner never mistakes a fixture (a test head
 * embedded in a template literal) or a commented-out test for a real test
 * block. Quote delimiters are kept so the shape of the code stays readable.
 */
export function maskLiteralsAndComments(source: string): string {
  const out = source.split('');
  const n = source.length;
  let i = 0;

  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === '/' && next === '/') {
      while (i < n && source[i] !== '\n') {
        out[i] = ' ';
        i += 1;
      }
      continue;
    }

    if (ch === '/' && next === '*') {
      out[i] = ' ';
      out[i + 1] = ' ';
      i += 2;
      while (i < n && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] !== '\n') out[i] = ' ';
        i += 1;
      }
      if (i < n) {
        out[i] = ' ';
        out[i + 1] = ' ';
        i += 2;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i += 1;
      while (i < n) {
        const c = source[i];
        if (c === '\\') {
          out[i] = ' ';
          if (i + 1 < n && source[i + 1] !== '\n') out[i + 1] = ' ';
          i += 2;
          continue;
        }
        if (c === quote) break;
        if (c !== '\n') out[i] = ' ';
        i += 1;
      }
      if (i < n) i += 1;
      continue;
    }

    i += 1;
  }

  return out.join('');
}

export function extractTestBlocks(source: string): TestBlock[] {
  const blocks: TestBlock[] = [];
  const lines = source.split(/\r?\n/);
  const maskedLines = maskLiteralsAndComments(source).split(/\r?\n/);

  for (let i = 0; i < maskedLines.length; i++) {
    const match = maskedLines[i]?.match(TEST_HEAD_REGEX);
    if (!match) continue;

    const quoteIndex = (match.index ?? 0) + match[0].length - 1;
    const name = readStringLiteral(lines[i] ?? '', quoteIndex);
    const startLine = i + 1;
    const annotations = captureAnnotations(lines, i);
    const body = sliceBody(lines, maskedLines, i);

    blocks.push({
      name,
      startLine,
      body,
      rf: annotations.rf,
      rnf: annotations.rnf,
      rfIds: annotations.rfIds,
      rnfIds: annotations.rnfIds,
      surface: annotations.surface,
      type: annotations.type,
    });
  }
  return blocks;
}

/** Reads the string literal that starts at `quoteIndex` in the original line. */
function readStringLiteral(line: string, quoteIndex: number): string {
  const quote = line[quoteIndex];
  if (!quote) return '';
  let out = '';
  for (let i = quoteIndex + 1; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\\') {
      out += line[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (ch === quote) break;
    out += ch;
  }
  return out;
}

function captureAnnotations(
  lines: string[],
  headLineIndex: number,
): {
  rf?: string;
  rnf?: string;
  rfIds: string[];
  rnfIds: string[];
  surface: string[];
  type?: string;
} {
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

  if (collected.length === 0) return { rfIds: [], rnfIds: [], surface: [] };
  const text = collected.join('\n');
  const rfIds = expandIds([...text.matchAll(JSDOC_RF)].map((m) => m[1] ?? ''));
  const rnfIds = expandIds([...text.matchAll(JSDOC_RNF)].map((m) => m[1] ?? ''));
  const surface: string[] = [];
  for (const match of text.matchAll(JSDOC_SURFACE)) {
    for (const id of (match[1] ?? '').split(/[,\s]+/)) {
      const clean = id.trim().replace(/[.;]+$/, '');
      if (clean.length > 0) surface.push(clean);
    }
  }
  const typeMatch = text.match(JSDOC_TYPE);
  return {
    rf: rfIds[0],
    rnf: rnfIds[0],
    rfIds,
    rnfIds,
    surface,
    type: typeMatch?.[1]?.toUpperCase(),
  };
}

/** Expands `RF-09..12` style ranges into the individual requirement ids. */
function expandIds(rawIds: string[]): string[] {
  const ids: string[] = [];
  for (const raw of rawIds) {
    const parsed = raw.match(/^([A-Z]+)-(\d+)(?:\.\.(\d+))?$/);
    if (!parsed) continue;
    const prefix = parsed[1] ?? '';
    const from = Number(parsed[2]);
    const to = parsed[3] ? Number(parsed[3]) : from;
    const width = (parsed[2] ?? '').length;
    for (let i = from; i <= to; i++) {
      const id = `${prefix}-${String(i).padStart(width, '0')}`;
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

function sliceBody(lines: string[], maskedLines: string[], headLineIndex: number): string {
  const maskedTail = maskedLines.slice(headLineIndex).join('\n');
  const openIdx = maskedTail.indexOf('{');
  if (openIdx < 0) return '';

  let depth = 0;
  for (let k = openIdx; k < maskedTail.length; k++) {
    const ch = maskedTail[k];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        // The masked body is used on purpose: string literals are blanked, so
        // a fixture embedded in the test body cannot masquerade as a real
        // assertion (and cannot trip the rule chain).
        return maskedTail.slice(openIdx + 1, k);
      }
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
