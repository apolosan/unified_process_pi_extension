import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseStateUpdates } from './tool-validation.ts';

/**
 * @rf RF-StateUpdateParse
 * @rnf RNF-StateUpdateInputCap
 */
describe('parseStateUpdates', () => {
  it('parses valid state updates and preserves every allowed field', () => {
    const updates = parseStateUpdates(
      JSON.stringify({
        systemName: 'Canonical System',
        completedActivities: ['vision'],
        recommendedNextCommand: '/skill:up-requirements',
        recommendedNextReason: 'inception complete',
      })
    );

    assert.equal(updates.systemName, 'Canonical System');
    assert.deepEqual(updates.completedActivities, ['vision']);
    assert.equal(updates.recommendedNextCommand, '/skill:up-requirements');
    assert.equal(updates.recommendedNextReason, 'inception complete');
  });

  it('rejects malformed JSON with a clear error', () => {
    assert.throws(() => parseStateUpdates('{"systemName":'), /valid JSON/i);
  });

  it('rejects arrays and primitives', () => {
    assert.throws(() => parseStateUpdates('[]'), /JSON object/i);
    assert.throws(() => parseStateUpdates('"vision"'), /JSON object/i);
  });

  it('rejects payloads larger than 10 KB before parsing', () => {
    assert.throws(() => parseStateUpdates(`{"vision":"${'x'.repeat(11 * 1024)}"}`), /too large/i);
  });

  it('rejects unknown keys', () => {
    assert.throws(() => parseStateUpdates('{"currentPhase":"transition"}'), /unsupported field/i);
  });

  /**
   * @rnf RNF-StateUpdate-InputCap-Boundary
   */
  it('RNF-StateUpdate-InputCap-Boundary: accepts payloads at exactly 10 KB and rejects 10241 bytes', () => {
    // 10 KB is the documented ceiling; payload at the ceiling must parse.
    // JSON.stringify({systemName:"<N x's>"}) adds 18 chars of framing
    // ({"systemName":" + "}").
    const exactCeiling = JSON.stringify({ systemName: 'x'.repeat(10 * 1024 - 17) });
    assert.equal(exactCeiling.length, 10 * 1024);
    const parsed = parseStateUpdates(exactCeiling);
    assert.equal(typeof parsed.systemName, 'string');

    // One byte over the ceiling must throw.
    assert.throws(
      () => parseStateUpdates(JSON.stringify({ systemName: 'x'.repeat(10 * 1024) })),
      /too large/i,
    );
  });

  /**
   * @rf RF-StateUpdateParse-NullSafety
   */
  it('RF-StateUpdateParse-NullSafety: rejects the JSON literal null even though typeof null === "object"', () => {
    assert.throws(() => parseStateUpdates('null'), /JSON object/i);
  });

  /**
   * @rf RF-StateUpdateParse-EmptyInput
   */
  it('RF-StateUpdateParse-EmptyInput: rejects empty strings and whitespace-only input', () => {
    assert.throws(() => parseStateUpdates(''), /valid JSON/i);
    assert.throws(() => parseStateUpdates('   '), /valid JSON/i);
  });

  /**
   * @rnf RNF-StateUpdateParse-Idempotent
   */
  it('RNF-StateUpdateParse-Idempotent: parsing the same payload twice returns structurally equal objects', () => {
    const payload = JSON.stringify({
      systemName: 'Idempotent',
      completedActivities: ['vision'],
      recommendedNextCommand: '/skill:up-requirements',
      recommendedNextReason: 'inception done',
    });
    const first = parseStateUpdates(payload);
    const second = parseStateUpdates(payload);
    assert.deepEqual(second, first);
  });

  /**
   * @rf RF-StateUpdateParse-EveryKey
   */
  it('RF-StateUpdateParse-EveryKey: preserves every whitelisted field individually', () => {
    const whitelistKeys = [
      'systemName',
      'vision',
      'currentIteration',
      'completedActivities',
      'artifacts',
      'recommendedNextCommand',
      'recommendedNextReason',
    ] as const;
    for (const key of whitelistKeys) {
      const payload = JSON.stringify({ [key]: 'probe' });
      const parsed = parseStateUpdates(payload);
      assert.ok(key in parsed, `key ${key} must be preserved by the parser`);
    }
  });
});
