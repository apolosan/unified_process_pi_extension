/**
 * Audit Tool — pure orchestration of mediocre-detector + requirement-trace
 * over the file system. Stays free of the pi extension runtime so it can be
 * exercised with plain `node:test` and so the same logic powers both the
 * `up_test_quality_audit` tool and ad-hoc CLI invocations.
 */

import { mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { detectMediocrePatterns, type MediocreIssue } from './mediocre-detector.ts';
import {
  computeCoverage,
  extractRequirements,
  extractTestTraceability,
  type CoverageReport,
  type Requirement,
  type TestTrace,
} from './requirement-trace.ts';

export interface AuditInput {
  cwd: string;
  requirementsFile?: string;
  testGlobs?: string[];
  mode: 'report' | 'strict';
}

export interface AuditReport {
  mode: 'report' | 'strict';
  cwd: string;
  requirementsFile: string;
  totals: {
    files: number;
    tests: number;
    mediocre: number;
    uncoveredRf: number;
    uncoveredRnf: number;
  };
  issues: MediocreIssue[];
  coverage: CoverageReport;
  passed: boolean;
}

const DEFAULT_REQUIREMENTS_FILE = 'docs/up/02-requirements.md';
const TEST_FILE_REGEX = /\.test\.(ts|js|mjs|cjs)$/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.next']);

export class EmptyRequirementsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmptyRequirementsError';
  }
}

export async function runTestQualityAudit(input: AuditInput): Promise<AuditReport> {
  const reqRel = input.requirementsFile ?? DEFAULT_REQUIREMENTS_FILE;
  const reqAbs = isAbsolute(reqRel) ? reqRel : join(input.cwd, reqRel);

  const requirements = await loadRequirements(reqAbs, input.cwd, reqRel, input.mode);

  const testFiles = await discoverTests(input.cwd);

  const allIssues: MediocreIssue[] = [];
  const allTests: TestTrace[] = [];

  for (const file of testFiles) {
    const content = await readFile(file, 'utf8');
    allIssues.push(...detectMediocrePatterns(content, file));
    allTests.push(...extractTestTraceability(content, file));
  }

  const coverage = computeCoverage(requirements, allTests);

  const totals = {
    files: testFiles.length,
    tests: allTests.length,
    mediocre: allIssues.length,
    uncoveredRf: coverage.uncoveredRf.length,
    uncoveredRnf: coverage.uncoveredRnf.length,
  };

  const passed =
    input.mode === 'strict'
      ? totals.mediocre === 0 && totals.uncoveredRf === 0 && totals.uncoveredRnf === 0
      : true;

  return {
    mode: input.mode,
    cwd: input.cwd,
    requirementsFile: reqRel,
    totals,
    issues: allIssues,
    coverage,
    passed,
  };
}

async function loadRequirements(
  absolutePath: string,
  cwd: string,
  relativeLabel: string,
  mode: 'report' | 'strict',
): Promise<Requirement[]> {
  let content: string;
  try {
    content = await readFile(absolutePath, 'utf8');
  } catch (err) {
    if (mode === 'strict') {
      throw new EmptyRequirementsError(
        `no requirements file at ${relativeLabel} (cwd=${cwd})`,
      );
    }
    content = '';
  }
  const requirements = extractRequirements(content, absolutePath);
  if (mode === 'strict' && requirements.length === 0) {
    throw new EmptyRequirementsError(
      `empty requirements: no RF/RNF parseable from ${relativeLabel}`,
    );
  }
  return requirements;
}

async function discoverTests(cwd: string): Promise<string[]> {
  const out: string[] = [];
  await walk(cwd, out);
  out.sort();
  return out;
}

async function walk(dir: string, out: string[]): Promise<void> {
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
      continue;
    }
    if (entry.isFile() && TEST_FILE_REGEX.test(entry.name)) {
      out.push(full);
    }
  }
}

/** Quiet helper used by tests and the cli to silence unused-import warnings. */
export async function _ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

// Reference stat import so it's available for future extensions without
// tripping the unused-import linter.
void stat;
