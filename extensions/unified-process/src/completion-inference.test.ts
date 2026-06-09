import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { inferStateFromProject, validateActivityCompletion } from './state.ts';

describe('validateActivityCompletion', () => {
  it('does not complete requirements with only one requirements artifact', () => {
    assert.equal(validateActivityCompletion('requirements', ['02-requirements.md']), false);
  });

  it('completes requirements when both requirements artifacts exist', () => {
    assert.equal(
      validateActivityCompletion('requirements', ['02-requirements.md', '02-use-case-list.md']),
      true
    );
  });

  it('does not complete an activity from an undersized artifact', () => {
    assert.equal(validateActivityCompletion('vision', new Map([['01-vision.md', 5]])), false);
  });

  it('completes use-cases with one valid use case artifact', () => {
    assert.equal(validateActivityCompletion('use-cases', new Map([['03-use-cases/UC-01.md', 80]])), true);
  });

  it('does not treat the integration matrix as completed contracts', () => {
    assert.equal(validateActivityCompletion('contracts', ['12b-integration-matrix.md']), false);
  });
});

describe('inferStateFromProject completion rules', () => {
  it('keeps partial requirements out of completed activities', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-infer-state-'));
    await mkdir(join(cwd, 'docs/up'), { recursive: true });
    await writeFile(join(cwd, 'docs/up/02-requirements.md'), '# Requirements\n\nOnly one file.\n', 'utf8');

    const state = await inferStateFromProject(cwd);
    assert.ok(state);
    assert.equal(state?.completedActivities.includes('requirements'), false);
  });

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
});
