/**
 * @rf RF-Completion-PartialRules
 * @rf RF-Completion-PhaseAdvance
 * @rnf RNF-Completion-Deterministic
 */
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { inferStateFromProject, validateActivityCompletion } from './state.ts';

describe('validateActivityCompletion', () => {
  /**
   * @rf RF-Completion-Requirements-Partial
   */
  it('does not complete requirements with only one requirements artifact', () => {
    assert.equal(validateActivityCompletion('requirements', ['02-requirements.md']), false);
  });

  /**
   * @rf RF-Completion-Requirements-All
   */
  it('completes requirements when both requirements artifacts exist', () => {
    assert.equal(
      validateActivityCompletion('requirements', ['02-requirements.md', '02-use-case-list.md']),
      true
    );
  });

  /**
   * @rf RF-Completion-MinBytes
   */
  it('does not complete an activity from an undersized artifact', () => {
    assert.equal(validateActivityCompletion('vision', new Map([['01-vision.md', 5]])), false);
  });

  /**
   * @rf RF-Completion-UseCases-Any
   */
  it('completes use-cases with one valid use case artifact', () => {
    assert.equal(validateActivityCompletion('use-cases', new Map([['03-use-cases/UC-01.md', 80]])), true);
  });

  /**
   * @rf RF-Completion-Contracts-Whitelist
   */
  it('does not treat the integration matrix as completed contracts', () => {
    assert.equal(validateActivityCompletion('contracts', ['12b-integration-matrix.md']), false);
  });
});

describe('inferStateFromProject completion rules', () => {
  /**
   * @rf RF-Completion-Requirements-Partial
   */
  it('keeps partial requirements out of completed activities', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-infer-state-'));
    await mkdir(join(cwd, 'docs/up'), { recursive: true });
    await writeFile(join(cwd, 'docs/up/02-requirements.md'), '# Requirements\n\nOnly one file.\n', 'utf8');

    const state = await inferStateFromProject(cwd);
    assert.ok(state);
    assert.equal(state?.completedActivities.includes('requirements'), false);
  });

  /**
   * @rf RF-Completion-PhaseAdvance
   */
  it('does not advance phase from an isolated integration matrix', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-infer-state-'));
    await mkdir(join(cwd, 'docs/up'), { recursive: true });
    await writeFile(
      join(cwd, 'docs/up/12b-integration-matrix.md'),
      '# Matrix\n\nPlaceholder traceability content.\n',
      'utf8'
    );

    const state = await inferStateFromProject(cwd);
    assert.ok(state);
    assert.equal(state?.currentPhase, 'inception');
    assert.deepEqual(state?.completedActivities, []);
  });

  /**
   * @rf RF-Completion-NoRuleReturnsFalse
   */
  it('RF-Completion-NoRuleReturnsFalse: validateActivityCompletion returns false for activities with no completion rule', () => {
    // 'orchestrator' is not in ACTIVITY_COMPLETION_RULES; no rule applies.
    // Cast through `unknown` because orchestrator is a UPArtifactActivity, not a UPActivity.
    assert.equal(validateActivityCompletion('orchestrator' as never, []), false);
    assert.equal(validateActivityCompletion('orchestrator' as never, new Map()), false);
  });

  /**
   * @rf RF-Completion-MissingDir
   */
  it('RF-Completion-MissingDir: inferStateFromProject returns null when docs/up does not exist', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-infer-state-missing-'));
    const state = await inferStateFromProject(cwd);
    assert.equal(state, null);
  });

  /**
   * @rf RF-Completion-EmptyArtifacts
   */
  it('RF-Completion-EmptyArtifacts: inferStateFromProject returns null when docs/up has no matching artifacts', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-infer-state-empty-'));
    await mkdir(join(cwd, 'docs/up'), { recursive: true });
    await writeFile(join(cwd, 'docs/up/random.txt'), 'noise', 'utf8');

    const state = await inferStateFromProject(cwd);
    assert.equal(state, null);
  });

  /**
   * @rnf RNF-Completion-Deterministic
   */
  it('RNF-Completion-Deterministic: inferStateFromProject produces stable output across 50 calls', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-infer-state-det-'));
    await mkdir(join(cwd, 'docs/up'), { recursive: true });
    await writeFile(
      join(cwd, 'docs/up/01-vision.md'),
      '# Vision\n\nA long enough vision summary to satisfy the 20-byte minimum size rule.\n',
      'utf8',
    );

    const first = await inferStateFromProject(cwd);
    for (let i = 0; i < 50; i++) {
      const again = await inferStateFromProject(cwd);
      assert.deepEqual(again, first);
    }
  });

  /**
   * @rf RF-Completion-SizeThreshold
   */
  it('RF-Completion-SizeThreshold: 20-byte minimum applies per artifact, not per activity', () => {
    // Two artifacts both exactly at the threshold should pass.
    const ok = new Map<string, number>([
      ['02-requirements.md', 20],
      ['02-use-case-list.md', 20],
    ]);
    assert.equal(validateActivityCompletion('requirements', ok), true);

    // One under threshold fails (mode: all).
    const oneUnder = new Map<string, number>([
      ['02-requirements.md', 20],
      ['02-use-case-list.md', 19],
    ]);
    assert.equal(validateActivityCompletion('requirements', oneUnder), false);
  });
});
