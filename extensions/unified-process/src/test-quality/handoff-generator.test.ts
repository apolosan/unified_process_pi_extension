/**
 * Handoff-Generator — TDD test battery
 *
 * Validates the markdown template the orchestrator writes when a UP iteration
 * does not deliver the full deliverable set. The handoff doc must encode
 * enough state for the next iteration to resume without losing context.
 *
 * Naming convention: `it('RF-NN: <scenario> — <expected>', …)`.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  generateHandoffMarkdown,
  buildHandoffFilename,
  type HandoffInput,
} from './handoff-generator.ts';
import { ACTIVITY_ORDER } from '../state.ts';

function baseInput(overrides: Partial<HandoffInput> = {}): HandoffInput {
  return {
    systemName: 'TestSys',
    phase: 'elaboration',
    iteration: 1,
    completedActivities: ['vision'],
    recommendedNext: '/skill:up-requirements',
    recommendedReason: '',
    smokeLogEntries: [],
    audit: { total: 0, mediocre: 0, uncoveredRf: 0, uncoveredRnf: 0 },
    uncovered: [],
    outputDir: 'docs/up/15-handoff',
    timestamp: '2026-03-28T10:00:00.000Z',
    ...overrides,
  };
}

describe('generateHandoffMarkdown — header & identity', () => {
  it('opens with # Handoff — Iteration N → N+1 + system name block', () => {
    const md = generateHandoffMarkdown(baseInput({ iteration: 3 }));
    assert.match(md, /^# Handoff — Iteration 3 → 4/m);
    assert.match(md, /## 1\. System Identity/);
    assert.match(md, /TestSys/);
    assert.match(md, /\*\*phase:\*\* elaboration/);
    assert.match(md, /\*\*last updated:\*\* 2026-03-28T10:00:00\.000Z/);
  });
});

describe('generateHandoffMarkdown — RF-17 completion table', () => {
  it('RF-17: includes every entry of ACTIVITY_ORDER with ✅/❌ marker', () => {
    const md = generateHandoffMarkdown(
      baseInput({ completedActivities: ['vision', 'requirements'] }),
    );
    assert.match(md, /## 2\. Completion Status/);
    assert.match(md, /\| Activity \| Status \| Artifact \|/);
    for (const activity of ACTIVITY_ORDER) {
      // Each activity name appears as a table row.
      const row = md.split('\n').find((line) => line.startsWith(`| ${activity} |`));
      assert.ok(row, `expected row for activity '${activity}'`);
    }
    assert.ok(/\| vision \| ✅ done \|/.test(md));
    assert.ok(/\| requirements \| ✅ done \|/.test(md));
    assert.ok(/\| implementation \| ❌ not started \|/.test(md));
  });

  it('uses ⚠ partial marker for activities listed in completedActivities with explicit warning', () => {
    const md = generateHandoffMarkdown(
      baseInput({
        completedActivities: ['vision', 'requirements'],
        partialActivities: { requirements: 'RF-12..15 missing' },
      }),
    );
    assert.match(md, /\| requirements \| ⚠ partial \|/);
    assert.match(md, /RF-12\.\.15 missing/);
  });
});

describe('generateHandoffMarkdown — RF-18 uncovered requirements', () => {
  it('RF-18: emits the Uncovered Requirements section only when at least 1 uncovered exists', () => {
    const without = generateHandoffMarkdown(baseInput({ uncovered: [] }));
    assert.equal(/## 3\. Uncovered Requirements/.test(without), false);

    const withUn = generateHandoffMarkdown(
      baseInput({
        uncovered: [
          {
            id: 'RF-08',
            type: 'RF',
            title: 'audit log capture',
            file: 'docs/up/02-requirements.md',
            line: 25,
          },
        ],
      }),
    );
    assert.match(withUn, /## 3\. Uncovered Requirements/);
    assert.match(withUn, /- RF-08.*audit log capture/);
  });
});

describe('generateHandoffMarkdown — RF-19 last integration evidence', () => {
  it('RF-19: lists up to 5 most recent smoke.log entries with command + exit + timestamp', () => {
    const entries = Array.from({ length: 8 }, (_, i) => ({
      timestamp: `2026-03-28T09:${String(i).padStart(2, '0')}:00Z`,
      command: `npm run test:smoke-${i}`,
      exitCode: i === 7 ? 1 : 0,
      checkType: 'smoke',
    }));
    const md = generateHandoffMarkdown(baseInput({ smokeLogEntries: entries }));
    assert.match(md, /## 4\. Last Integration Evidence/);
    assert.match(md, /test:smoke-7/);
    assert.match(md, /test:smoke-3/);
    assert.equal(/test:smoke-2/.test(md), false, 'older entries should be truncated');
    assert.match(md, /exit_code: 1/);
  });

  it('skips Last Integration Evidence section when no entries', () => {
    const md = generateHandoffMarkdown(baseInput({ smokeLogEntries: [] }));
    assert.equal(/## 4\. Last Integration Evidence/.test(md), false);
  });
});

describe('generateHandoffMarkdown — RF-20 resume instructions', () => {
  it('RF-20: includes a numbered Resume Instructions block referencing /up and /skill:up-...', () => {
    const md = generateHandoffMarkdown(baseInput());
    assert.match(md, /## 6\. Resume Instructions/);
    assert.match(md, /1\.\s+/);
    assert.match(md, /\/up\b/);
    assert.match(md, /\/skill:up-/);
  });

  it('includes the recommended next command as a concrete step', () => {
    const md = generateHandoffMarkdown(
      baseInput({ recommendedNext: '/skill:up-tdd' }),
    );
    assert.match(md, /5\..*\/skill:up-tdd/, 'resume step 5 mentions the recommended next command');
  });
});

describe('generateHandoffMarkdown — RNF-03 determinism + RNF-04 bounds', () => {
  it('RNF-03: byte-identical for identical input (caller-provided timestamp)', () => {
    const md1 = generateHandoffMarkdown(baseInput());
    const md2 = generateHandoffMarkdown(baseInput());
    assert.equal(md1, md2);
  });

  it('RNF-04: output stays under 32 KB even with worst-case inputs', () => {
    const bigUncovered = Array.from({ length: 50 }, (_, i) => ({
      id: `RF-${String(i + 1).padStart(2, '0')}`,
      type: 'RF' as const,
      title: 'lorem ipsum '.repeat(20),
      file: 'docs/up/02-requirements.md',
      line: i + 1,
    }));
    const entries = Array.from({ length: 50 }, (_, i) => ({
      timestamp: `2026-03-28T09:${String(i % 60).padStart(2, '0')}:00Z`,
      command: `cmd-${i}`,
      exitCode: 0,
      checkType: 'smoke',
    }));
    const md = generateHandoffMarkdown(
      baseInput({
        completedActivities: ACTIVITY_ORDER,
        uncovered: bigUncovered,
        smokeLogEntries: entries,
      }),
    );
    assert.ok(md.length < 32 * 1024, `handoff size ${md.length}b exceeds 32 KB`);
  });
});

describe('buildHandoffFilename', () => {
  it('produces a sortable filename with iteration + ISO timestamp', () => {
    const name = buildHandoffFilename(2, '2026-03-28T10:00:00.000Z');
    assert.match(name, /^HANDOFF-iter-2-2026-03-28T10-00-00\.000Z\.md$/);
  });

  it('collons → dashes in the ISO stamp for filesystem safety', () => {
    const name = buildHandoffFilename(1, '2026:03:28T10:00:00Z');
    assert.match(name, /^HANDOFF-iter-1-2026-03-28T10-00-00Z\.md$/);
  });
});
