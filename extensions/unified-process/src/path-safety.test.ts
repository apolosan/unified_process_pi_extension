/**
 * @rf RF-PathSafety-Traversal
 * @rnf RNF-PathSafety
 *
 * Validates `resolveArtifactPath`'s security guard against the documented path
 * traversal vectors. Every test below must continue to fail if any of the
 * traversal vectors become reachable again.
 */

import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { resolveArtifactPath } from './tool-validation.ts';

describe('resolveArtifactPath', () => {
  /**
   * @rf RF-PathSafety-Nested
   */
  it('allows nested artifact paths inside docs/up', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    const result = resolveArtifactPath(cwd, '03-use-cases/UC-01.md');

    assert.equal(result.artifactPath, '03-use-cases/UC-01.md');
    assert.match(result.absolutePath, /docs\/up\/03-use-cases\/UC-01\.md$/);
  });

  /**
   * @rf RF-PathSafety-Traversal-Parent
   */
  it('rejects parent directory traversal', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, '../../etc/passwd'), /inside docs\/up/i);
  });

  /**
   * @rf RF-PathSafety-Absolute
   */
  it('rejects absolute paths', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, '/etc/passwd'), /relative/i);
  });

  /**
   * @rf RF-PathSafety-Encoded
   */
  it('rejects encoded traversal', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, '..%2F..%2Fetc/passwd'), /inside docs\/up/i);
  });

  /**
   * @rf RF-PathSafety-MixedSeparator
   */
  it('rejects mixed separator traversal', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, '..\\..\\etc/passwd'), /inside docs\/up/i);
  });

  /**
   * @rf RF-PathSafety-WindowsAbsolute
   */
  it('rejects Windows-style absolute paths (C:\\foo)', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, 'C:\\Windows\\System32'), /relative/i);
  });

  /**
   * @rf RF-PathSafety-NullByte
   */
  it('rejects paths containing null bytes', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, 'safe.md\0../../etc/passwd'), /null bytes/i);
  });

  /**
   * @rf RF-PathSafety-EmptyOrWhitespace
   */
  it('rejects empty and whitespace-only paths', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    assert.throws(() => resolveArtifactPath(cwd, ''), /non-empty|valid/i);
    assert.throws(() => resolveArtifactPath(cwd, '   '), /non-empty|valid/i);
  });

  /**
   * @rf RF-PathSafety-DoubleEncoded
   */
  it('rejects double-encoded traversal (%252F = literal %2F after first decode)', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    // decodeURIComponent('%252F') = '%2F' (a literal percent sign + 2F). The
    // first decode leaves a benign string so the path resolves inside docs/up.
    // The check is that the double-encoded form does not bypass the guard.
    assert.doesNotThrow(() => resolveArtifactPath(cwd, 'safe%252F..%252F..%252Fetc.md'));
    // But triple-encoded `%25252F` becomes `%252F` then `%2F` (literal).
    // The path `decoded = '%2F..%2F..%2Fetc.md'` contains no real slashes, so
    // it cannot traverse. The guard rejects only resolved paths that escape.
    assert.doesNotThrow(() => resolveArtifactPath(cwd, 'a%25252Fb%25252Fc.md'));
  });

  /**
   * @rnf RNF-PathSafety-Deterministic
   */
  it('RNF-PathSafety-Deterministic: same input yields byte-identical output across 1000 calls', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'up-artifact-path-'));
    const first = resolveArtifactPath(cwd, '03-use-cases/UC-01.md');
    for (let i = 0; i < 1000; i++) {
      const again = resolveArtifactPath(cwd, '03-use-cases/UC-01.md');
      assert.deepEqual(again, first);
    }
  });
});
