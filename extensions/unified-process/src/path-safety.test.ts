import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { resolveArtifactPath } from './tool-validation.ts';

describe('resolveArtifactPath', () => {
  it('allows nested artifact paths inside docs/up', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    const result = resolveArtifactPath(cwd, '03-use-cases/UC-01.md');

    assert.equal(result.artifactPath, '03-use-cases/UC-01.md');
    assert.match(result.absolutePath, /docs\/up\/03-use-cases\/UC-01\.md$/);
  });

  it('rejects parent directory traversal', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, '../../etc/passwd'), /inside docs\/up/i);
  });

  it('rejects absolute paths', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, '/etc/passwd'), /relative/i);
  });

  it('rejects encoded traversal', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, '..%2F..%2Fetc/passwd'), /inside docs\/up/i);
  });

  it('rejects mixed separator traversal', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, '..\\..\\etc/passwd'), /inside docs\/up/i);
  });
});
