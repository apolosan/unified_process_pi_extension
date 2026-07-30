/**
 * Requirement-Trace — parses requirements documents and test traceability
 * markers; computes the symmetric diff between declared requirements and the
 * union of `@rf`/`@rnf` markers in test files.
 *
 * Companion to `mediocre-detector.ts`. Both modules share `extractTestBlocks`
 * to keep the JSDoc walking logic in one place.
 */

import { extractTestBlocks } from './mediocre-detector.ts';

export interface Requirement {
  id: string;
  type: 'RF' | 'RNF';
  title: string;
  file: string;
  line: number;
}

export interface TestTrace {
  file: string;
  line: number;
  testName: string;
  rf: string[];
  rnf: string[];
}

export interface CoverageReport {
  requirements: Requirement[];
  tests: TestTrace[];
  coveredRf: Requirement[];
  coveredRnf: Requirement[];
  uncoveredRf: Requirement[];
  uncoveredRnf: Requirement[];
}

const BOLD_BULLET_REGEX = /^\s*[*-]\s+\*\*(RF|RNF)-(\d+)(?:\s*\([^)]+\))?\s*:?\s*([^*]+?)\*\*/;
const PLAIN_BULLET_REGEX = /^\s*[*-]\s+(RF|RNF)-(\d+)\s*:?\s+(.+)/;
const TABLE_SEPARATOR_REGEX = /^\s*\|[\s-]+\|/;
const TABLE_ROW_REGEX = /^\s*\|\s*(RF|RNF)-(\d+)\s*\|\s*([^|]+?)\s*\|/;

export function extractRequirements(mdContent: string, sourcePath: string): Requirement[] {
  const requirements: Requirement[] = [];
  const lines = mdContent.split(/\r?\n/);
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Bullet patterns first.
    const bold = line.match(BOLD_BULLET_REGEX);
    if (bold) {
      requirements.push({
        id: `${bold[1]}-${bold[2]}`,
        type: (bold[1] as 'RF' | 'RNF') ?? 'RF',
        title: (bold[3] ?? '').trim(),
        file: sourcePath,
        line: i + 1,
      });
      continue;
    }

    const plain = line.match(PLAIN_BULLET_REGEX);
    if (plain) {
      requirements.push({
        id: `${plain[1]}-${plain[2]}`,
        type: (plain[1] as 'RF' | 'RNF') ?? 'RF',
        title: (plain[3] ?? '').trim(),
        file: sourcePath,
        line: i + 1,
      });
      continue;
    }

    // Table row only valid when inside a markdown table (immediately after a
    // `| --- |` separator).
    if (inTable) {
      const row = line.match(TABLE_ROW_REGEX);
      if (row) {
        requirements.push({
          id: `${row[1]}-${row[2]}`,
          type: (row[1] as 'RF' | 'RNF') ?? 'RF',
          title: (row[3] ?? '').trim(),
          file: sourcePath,
          line: i + 1,
        });
        continue;
      }
    }

    // Toggle `inTable` flag on separator / non-pipe lines.
    if (TABLE_SEPARATOR_REGEX.test(line)) {
      inTable = true;
      continue;
    }
    if (!line.includes('|')) {
      inTable = false;
    }
  }

  return requirements;
}

export function extractTestTraceability(testContent: string, filePath: string): TestTrace[] {
  const blocks = extractTestBlocks(testContent);
  return blocks.map((block) => ({
    file: filePath,
    line: block.startLine,
    testName: block.name,
    rf: block.rf ? [block.rf] : [],
    rnf: block.rnf ? [block.rnf] : [],
  }));
}

export function computeCoverage(
  requirements: Requirement[],
  tests: TestTrace[],
): CoverageReport {
  const coveredRfSet = new Set<string>();
  const coveredRnfSet = new Set<string>();

  for (const test of tests) {
    for (const rf of test.rf) coveredRfSet.add(rf);
    for (const rnf of test.rnf) coveredRnfSet.add(rnf);
  }

  const coveredRf: Requirement[] = [];
  const coveredRnf: Requirement[] = [];
  const uncoveredRf: Requirement[] = [];
  const uncoveredRnf: Requirement[] = [];

  for (const req of requirements) {
    const isCovered = req.type === 'RF' ? coveredRfSet.has(req.id) : coveredRnfSet.has(req.id);
    if (req.type === 'RF') {
      (isCovered ? coveredRf : uncoveredRf).push(req);
    } else {
      (isCovered ? coveredRnf : uncoveredRnf).push(req);
    }
  }

  return { requirements, tests, coveredRf, coveredRnf, uncoveredRf, uncoveredRnf };
}
