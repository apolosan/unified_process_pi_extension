/**
 * Surface-Coverage — the "extent" axis of the UP test-quality enforcement.
 *
 * The mediocre-detector answers "is this test good?". This module answers
 * "how much of the declared behaviour is actually under test?": the expected
 * test surface is derived from the UP artifacts (use cases and their flows,
 * contracts and their post-conditions/exceptions) and every surface item must
 * be claimed by at least one NON-mediocre test.
 *
 * Pure by construction: no IO, no clock, no randomness. `audit-tool.ts` does
 * the file reading and feeds this module plain strings.
 *
 * Patterns applied (consulted via the `design-patterns` MCP):
 * - Pure Function Core: all decisions here are pure functions of their inputs.
 * - Chain of Responsibility: composes with the existing rule chain — a surface
 *   claim only counts when the claiming test passes the P1 rule chain.
 * - Facade: `runTestQualityAudit` stays the single entry point for the agent.
 */

import { detectMediocrePatterns, extractTestBlocks } from './mediocre-detector.ts';

export type SurfaceKind = 'use_case' | 'flow' | 'operation' | 'post_condition' | 'exception';

export interface SurfaceItem {
  id: string;
  kind: SurfaceKind;
  title: string;
  file: string;
  line: number;
}

export interface SurfaceRef {
  file: string;
  line: number;
  testName: string;
  /** Surface ids claimed by the test (`@surface` marker). */
  surface: string[];
  /** Test type declared by the test (`@type` marker). */
  type?: string;
  /** True when the claiming test violates the anti-mediocre policy. */
  mediocre: boolean;
}

export interface SurfaceCoverageReport {
  items: SurfaceItem[];
  covered: SurfaceItem[];
  uncovered: SurfaceItem[];
  /** surface id -> names of the tests that claim it (including mediocre ones). */
  claimedBy: Record<string, string[]>;
  /** Minimum number of test cases implied by the surface (1 per surface item). */
  expectedMinCases: number;
  /** Number of test blocks found in the battery. */
  actualCases: number;
}

export interface TypeMatrixReport {
  declared: string[];
  missingMandatory: string[];
  satisfied: boolean;
  /** Types the TDD plan committed to (empty when no plan exists). */
  planned: PlannedType[];
  /** Planned case count minus delivered case count, per type. */
  shortfall: { type: string; planned: number; actual: number }[];
}

export interface PlannedType {
  /** Canonical type id (UNIT, INTEGRATION, E2E, …). */
  type: string;
  /** Number of cases the plan committed to. */
  count: number;
  /** False when the plan has no numeric commitment (draft placeholder). */
  enforceable: boolean;
}

/** Types every UP system must have — `skills/up-tdd/SKILL.md` Step 2.1. */
export const MANDATORY_TEST_TYPES = ['UNIT', 'INTEGRATION', 'E2E-T1', 'E2E-T2'] as const;

/** At least one of these must be present (the non-functional requirement slot). */
export const NFR_TEST_TYPES = [
  'PERF',
  'LOAD',
  'STRESS',
  'SEC',
  'A11Y',
  'MUTATION',
  'PROPERTY',
] as const;

/** Canonical type ids per planned taxonomy label (`10-tdd-plan.md` §3). */
const TYPE_LABELS: Record<string, string> = {
  unit: 'UNIT',
  integration: 'INTEGRATION',
  component: 'COMPONENT',
  'frontend / ui': 'UI',
  frontend: 'UI',
  ui: 'UI',
  'end-to-end (e2e)': 'E2E',
  'end-to-end': 'E2E',
  e2e: 'E2E',
  performance: 'PERF',
  load: 'LOAD',
  stress: 'STRESS',
  security: 'SEC',
  accessibility: 'A11Y',
  regression: 'REG',
  smoke: 'SMOKE',
  contract: 'CONTRACT',
  mutation: 'MUTATION',
  'property-based': 'PROPERTY',
  'property based': 'PROPERTY',
  snapshot: 'SNAPSHOT',
};

/** Test-type ids that satisfy a planned taxonomy row. */
const TYPE_GROUP_MEMBERS: Record<string, string[]> = {
  E2E: ['E2E-T1', 'E2E-T2'],
};

const UC_ID_LINE = /^\s*>\s*\*\*ID:\*\*\s*(UC-\d+)/im;
const UC_HEADING = /^#\s*Use Case:\s*(.+)$/im;
const FLOW_HEADING =
  /^##\s+(Main\s+Flow|Variant\s+[0-9][0-9.a-zA-Z]*|Exception\s+[0-9][0-9.a-zA-Z]*)\s*(?:[:—–]\s*(.*))?$/im;
const CONTRACT_HEADING = /^#\s*Contract:\s*`?([A-Za-z_][\w]*)\s*\(/im;
const SECTION_HEADING = /^##\s+(.+)$/;

const clean = (value: string): string =>
  value
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[*`]/g, '')
    .trim();

const slug = (value: string): string =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Derives the use case and its flow-level surface items from a UC artifact. */
export function extractUseCaseSurface(content: string, filePath: string): SurfaceItem[] {
  const lines = content.split(/\r?\n/);
  const items: SurfaceItem[] = [];

  const idMatch = content.match(UC_ID_LINE);
  const fileId = filePath.split(/[\\/]/).pop()?.match(/UC-\d+/)?.[0];
  const ucId = (idMatch?.[1] ?? fileId ?? '').toUpperCase();
  if (!ucId) return items;

  const headingIndex = lines.findIndex((line) => UC_HEADING.test(line));
  const heading = headingIndex >= 0 ? lines[headingIndex]?.match(UC_HEADING)?.[1] : undefined;
  items.push({
    id: ucId,
    kind: 'use_case',
    title: clean(heading ?? 'Use case'),
    file: filePath,
    line: headingIndex >= 0 ? headingIndex + 1 : 1,
  });

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]?.match(FLOW_HEADING);
    if (!match) continue;
    const keyword = (match[1] ?? '').trim();
    const kind = /^main/i.test(keyword) ? 'MAIN' : /^variant/i.test(keyword) ? 'VARIANT' : 'EXCEPTION';
    const label = keyword.replace(/^(Main\s+Flow|Variant|Exception)\s*/i, '').trim();
    const suffix = kind === 'MAIN' ? 'MAIN' : `${kind}-${slug(label)}`;
    const title = clean(match[2] ?? keyword);
    items.push({
      id: `${ucId}-${suffix}`,
      kind: 'flow',
      title: title.length > 0 ? title : keyword,
      file: filePath,
      line: i + 1,
    });
  }

  return items;
}

/** Derives operation, post-condition and exception surface items from a contract. */
export function extractContractSurface(content: string, filePath: string): SurfaceItem[] {
  const lines = content.split(/\r?\n/);
  const items: SurfaceItem[] = [];

  const opName = content.match(CONTRACT_HEADING)?.[1];
  if (!opName) return items;
  const opId = `OP-${slug(opName)}`;

  let section = '';
  let pc = 0;
  let ex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const heading = line.match(SECTION_HEADING);
    if (heading) section = (heading[1] ?? '').toLowerCase();

    if (section.startsWith('post-condition')) {
      const bullet = line.match(/^\s*[-*]\s+(.+)$/);
      if (bullet) {
        pc += 1;
        items.push({
          id: `${opId}-PC${pc}`,
          kind: 'post_condition',
          title: clean(bullet[1] ?? ''),
          file: filePath,
          line: i + 1,
        });
      }
      continue;
    }

    if (section.startsWith('exception')) {
      const row = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/);
      if (row && !/^condition$/i.test(row[1] ?? '') && !/^-+$/.test(row[1] ?? '')) {
        ex += 1;
        items.push({
          id: `${opId}-EX${ex}`,
          kind: 'exception',
          title: clean(row[1] ?? ''),
          file: filePath,
          line: i + 1,
        });
      }
    }
  }

  items.unshift({
    id: opId,
    kind: 'operation',
    title: opName,
    file: filePath,
    line: 1,
  });

  return items;
}

/**
 * Derives operation surface items from the system-operations list
 * (`docs/up/04-system-operations.md`) so an operation without a contract still
 * demands a test.
 */
export function extractOperationSurface(content: string, filePath: string): SurfaceItem[] {
  const items: SurfaceItem[] = [];
  let inTable = false;

  for (let i = 0; i < content.split(/\r?\n/).length; i++) {
    const line = content.split(/\r?\n/)[i] ?? '';
    if (!line.trim().startsWith('|')) {
      inTable = false;
      continue;
    }
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (!inTable) {
      if (cells.some((c) => /^operation$/i.test(c))) inTable = true;
      continue;
    }
    if (cells.every((c) => /^-+$/.test(c) || c === '')) continue;
    const cell = cells.find((c) => /`?[A-Za-z_][\w]*\s*\(/.test(c));
    const name = cell?.match(/([A-Za-z_][\w]*)\s*\(/)?.[1];
    if (!name) continue;
    items.push({
      id: `OP-${slug(name)}`,
      kind: 'operation',
      title: name,
      file: filePath,
      line: i + 1,
    });
  }

  return items;
}

/** Reads the test taxonomy committed by the TDD plan (`10-tdd-plan.md` §3). */
export function extractPlannedTypes(content: string): PlannedType[] {
  const planned: PlannedType[] = [];
  let inTable = false;

  for (const line of content.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) {
      inTable = false;
      continue;
    }
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (!inTable) {
      if (cells.some((c) => /^type$/i.test(c)) && cells.some((c) => /^count$/i.test(c))) inTable = true;
      continue;
    }
    if (cells.every((c) => /^-+$/.test(c) || c === '')) continue;
    const canonical = TYPE_LABELS[(cells[0] ?? '').toLowerCase()];
    if (!canonical) continue;
    const digits = (cells[1] ?? '').replace(/[^\d]/g, '');
    const count = digits.length > 0 ? Number(digits) : 0;
    planned.push({ type: canonical, count, enforceable: count > 0 });
  }

  return planned;
}

/**
 * Reads the justified exclusions declared in the TDD plan gaps table
 * (`10-tdd-plan.md` §1.3) — the surface ids the project consciously left
 * untested.
 */
export function extractExemptedSurfaceIds(content: string): string[] {
  const exempted: string[] = [];
  let inTable = false;

  for (const line of content.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) {
      inTable = false;
      continue;
    }
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (!inTable) {
      if (cells.some((c) => /^gap$/i.test(c)) && cells.some((c) => /^decision$/i.test(c))) {
        inTable = true;
      }
      continue;
    }
    if (cells.every((c) => /^-+$/.test(c) || c === '')) continue;
    const decision = cells[cells.length - 1] ?? '';
    if (!/exclusion|not applicable|excluded/i.test(decision)) continue;
    for (const cell of cells) {
      for (const match of cell.matchAll(/\b(?:UC-\d+(?:-[A-Z0-9]+)*|OP-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b/g)) {
        const id = match[0];
        if (!exempted.includes(id)) exempted.push(id);
      }
    }
  }

  return exempted;
}

/** Reads the `@surface` / `@type` claims of every test block in a test file. */
export function extractSurfaceRefs(content: string, filePath: string): SurfaceRef[] {
  const blocks = extractTestBlocks(content);
  const mediocreLines = new Set(detectMediocrePatterns(content, filePath).map((issue) => issue.line));
  return blocks.map((block) => ({
    file: filePath,
    line: block.startLine,
    testName: block.name,
    surface: block.surface,
    type: block.type,
    mediocre: mediocreLines.has(block.startLine),
  }));
}

/**
 * Computes which surface items are under test. Only non-mediocre claims count
 * as coverage — a mediocre test is reported as a claim but never as coverage.
 */
export function computeSurfaceCoverage(
  items: SurfaceItem[],
  refs: SurfaceRef[],
): SurfaceCoverageReport {
  const claimedBy: Record<string, string[]> = {};
  const effective = new Set<string>();

  for (const ref of refs) {
    for (const raw of ref.surface) {
      const id = raw.trim().toUpperCase();
      if (!id) continue;
      (claimedBy[id] ??= []).push(ref.testName);
      if (ref.mediocre) continue;
      effective.add(id);
      // A claim on a contract element implies the operation is exercised.
      const parent = id.match(/^(.*)-(?:PC|EX)\d+$/)?.[1];
      if (parent) effective.add(parent);
    }
  }

  const covered: SurfaceItem[] = [];
  const uncovered: SurfaceItem[] = [];
  for (const item of items) {
    (effective.has(item.id.toUpperCase()) ? covered : uncovered).push(item);
  }

  return {
    items,
    covered,
    uncovered,
    claimedBy,
    expectedMinCases: items.length,
    actualCases: refs.length,
  };
}

/**
 * Checks the battery against the test-type matrix. When the project has a TDD
 * plan, the plan is authoritative: only the types the plan committed to are
 * required, and the planned-vs-delivered case count is reported as a
 * shortfall. Without a plan the UP default matrix applies.
 */
export function computeTypeMatrix(
  refs: SurfaceRef[],
  planned: PlannedType[] = [],
): TypeMatrixReport {
  const declared = [
    ...new Set(refs.map((ref) => ref.type?.toUpperCase()).filter((t): t is string => !!t)),
  ].sort();

  const actualCounts = new Map<string, number>();
  for (const ref of refs) {
    const type = ref.type?.toUpperCase();
    if (!type) continue;
    actualCounts.set(type, (actualCounts.get(type) ?? 0) + 1);
  }

  if (planned.length === 0) {
    if (declared.length === 0) {
      return { declared, missingMandatory: [], satisfied: true, planned, shortfall: [] };
    }
    const missingMandatory: string[] = [];
    for (const required of MANDATORY_TEST_TYPES) {
      if (!declared.includes(required)) missingMandatory.push(required);
    }
    if (!declared.some((type) => (NFR_TEST_TYPES as readonly string[]).includes(type))) {
      missingMandatory.push(`NFR (one of ${NFR_TEST_TYPES.join('|')})`);
    }
    return { declared, missingMandatory, satisfied: missingMandatory.length === 0, planned, shortfall: [] };
  }

  const missingMandatory: string[] = [];
  const shortfall: { type: string; planned: number; actual: number }[] = [];
  for (const entry of planned) {
    if (!entry.enforceable) continue;
    const members = TYPE_GROUP_MEMBERS[entry.type] ?? [entry.type];
    const actual = members.reduce((sum, member) => sum + (actualCounts.get(member) ?? 0), 0);
    if (!members.some((member) => declared.includes(member))) missingMandatory.push(entry.type);
    if (actual < entry.count) shortfall.push({ type: entry.type, planned: entry.count, actual });
  }

  return { declared, missingMandatory, satisfied: missingMandatory.length === 0, planned, shortfall };
}
