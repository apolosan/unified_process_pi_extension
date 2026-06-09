import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseStateUpdates } from './tool-validation.ts';

describe('parseStateUpdates', () => {
  it('parses valid state updates', () => {
    const updates = parseStateUpdates(
      JSON.stringify({
        systemName: 'Canonical System',
        completedActivities: ['vision'],
        recommendedNextCommand: '/skill:up-requirements',
      })
    );

    assert.equal(updates.systemName, 'Canonical System');
    assert.deepEqual(updates.completedActivities, ['vision']);
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
});
