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
  computeSurfaceCoverage,
  computeTypeMatrix,
  extractContractSurface,
  extractExemptedSurfaceIds,
  extractOperationSurface,
  extractPlannedTypes,
  extractSurfaceRefs,
  extractUseCaseSurface,
  type PlannedType,
  type SurfaceCoverageReport,
  type SurfaceItem,
  type SurfaceRef,
  type TypeMatrixReport,
} from './surface-coverage.ts';
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
  /** `project` scans the whole cwd (default); `extensions` scans cwd/extensions only. */
  scope?: 'project' | 'extensions';
}

export interface AuditSurfaceReport extends SurfaceCoverageReport {
  types: TypeMatrixReport;
  /** Artifact files that produced the surface items. */
  sources: string[];
  /** Surface items the TDD plan justified as excluded. */
  exempted: SurfaceItem[];
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
    surfaceItems: number;
    uncoveredSurface: number;
    exemptedSurface: number;
  };
  issues: MediocreIssue[];
  coverage: CoverageReport;
  surface: AuditSurfaceReport;
  passed: boolean;
}

const DEFAULT_REQUIREMENTS_FILE = 'docs/up/02-requirements.md';
const TEST_FILE_REGEX = /\.test\.(ts|js|mjs|cjs)$/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.next']);

/** UP artifacts that define the expected test surface. */
const SURFACE_ARTIFACT_DIRS = [
  { dir: 'docs/up/03-use-cases', kind: 'use_case' },
  { dir: 'docs/up/06-contracts', kind: 'contract' },
] as const;

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

  const testFiles = await discoverTests(input.cwd, input.scope ?? 'project');

  const allIssues: MediocreIssue[] = [];
  const allTests: TestTrace[] = [];
  const allRefs: SurfaceRef[] = [];

  for (const file of testFiles) {
    const content = await readFile(file, 'utf8');
    allIssues.push(...detectMediocrePatterns(content, file));
    allTests.push(...extractTestTraceability(content, file));
    allRefs.push(...extractSurfaceRefs(content, file));
  }

  const coverage = computeCoverage(requirements, allTests);

  const surfaceArtifacts = await collectSurfaceItems(input.cwd);
  const plan = await loadTddPlan(input.cwd);
  const rawCoverage = computeSurfaceCoverage(surfaceArtifacts.items, allRefs);
  const typeMatrix = computeTypeMatrix(allRefs, plan.planned);

  const exemptedIds = new Set(plan.exempted.map((id) => id.toUpperCase()));
  const exempted = rawCoverage.uncovered.filter((item) => exemptedIds.has(item.id.toUpperCase()));
  const uncovered = rawCoverage.uncovered.filter((item) => !exemptedIds.has(item.id.toUpperCase()));
  const surfaceCoverage: SurfaceCoverageReport = { ...rawCoverage, uncovered };

  const totals = {
    files: testFiles.length,
    tests: allTests.length,
    mediocre: allIssues.length,
    uncoveredRf: coverage.uncoveredRf.length,
    uncoveredRnf: coverage.uncoveredRnf.length,
    surfaceItems: surfaceCoverage.items.length,
    uncoveredSurface: surfaceCoverage.uncovered.length,
    exemptedSurface: exempted.length,
  };

  const passed =
    input.mode === 'strict'
      ? totals.mediocre === 0 &&
        totals.uncoveredRf === 0 &&
        totals.uncoveredRnf === 0 &&
        totals.uncoveredSurface === 0 &&
        typeMatrix.satisfied
      : true;

  return {
    mode: input.mode,
    cwd: input.cwd,
    requirementsFile: reqRel,
    totals,
    issues: allIssues,
    coverage,
    surface: { ...surfaceCoverage, types: typeMatrix, sources: surfaceArtifacts.sources, exempted },
    passed,
  };
}

/** Reads the TDD plan: the committed test taxonomy and the justified exclusions. */
async function loadTddPlan(
  cwd: string,
): Promise<{ planned: PlannedType[]; exempted: string[] }> {
  let content: string;
  try {
    content = await readFile(join(cwd, 'docs/up/10-tdd-plan.md'), 'utf8');
  } catch {
    return { planned: [], exempted: [] };
  }
  return { planned: extractPlannedTypes(content), exempted: extractExemptedSurfaceIds(content) };
}

/** Derives the expected test surface from the UP artifacts of the project. */
async function collectSurfaceItems(
  cwd: string,
): Promise<{ items: SurfaceItem[]; sources: string[] }> {
  const items: SurfaceItem[] = [];
  const sources: string[] = [];
  const seen = new Set<string>();

  const push = (derived: SurfaceItem[]) => {
    for (const item of derived) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
  };

  for (const { dir, kind } of SURFACE_ARTIFACT_DIRS) {
    let entries: string[];
    try {
      entries = (await readdir(join(cwd, dir))).filter((f) => f.endsWith('.md')).sort();
    } catch {
      continue;
    }
    for (const entry of entries) {
      const relative = join(dir, entry);
      const content = await readFile(join(cwd, relative), 'utf8');
      push(
        kind === 'use_case'
          ? extractUseCaseSurface(content, relative)
          : extractContractSurface(content, relative),
      );
      sources.push(relative);
    }
  }

  // System operations list — operations without a contract still demand a test.
  const operationsRel = 'docs/up/04-system-operations.md';
  try {
    const content = await readFile(join(cwd, operationsRel), 'utf8');
    push(extractOperationSurface(content, operationsRel));
    sources.push(operationsRel);
  } catch {
    // no system-operations artifact yet
  }

  return { items, sources };
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

async function discoverTests(cwd: string, scope: 'project' | 'extensions' = 'project'): Promise<string[]> {
  const out: string[] = [];
  await walk(scope === 'extensions' ? join(cwd, 'extensions') : cwd, out);
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
