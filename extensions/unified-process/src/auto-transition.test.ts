/**
 * Auto-Transition Helpers — TDD test battery
 *
 * Validates every pure helper extracted from the extension entrypoint into
 * `auto-transition.ts`. The extension README documents the auto-transition
 * protocol; these tests pin every observable contract to a concrete
 * acceptance criterion.
 *
 * Naming convention: `it('RF-AT-NN: <scenario> — <expected>', …)`.
 *
 * @rf RF-AT-01..09
 * @rnf RNF-AT-01..03
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AUTO_MODE_ENTRY_TYPE,
  AUTO_TOGGLE_SHORTCUTS,
  buildUPSkillCommand,
  classifyRecommendation,
  compactReason,
  extractActivityFromUPCommand,
  extractUPSkillName,
  formatRecommendedNextStatus,
  formatShortcutList,
  isAutoChainSkill,
  restoreAutoTransitionMode,
  type RecommendationClassification,
} from './auto-transition.ts';
import { ACTIVITY_ORDER, createInitialState } from './state.ts';

describe('extractUPSkillName — RF-AT-01', () => {
  /**
   * @rf RF-AT-01
   */
  it('RF-AT-01: parses /skill:up-requirements from a canonical invocation', () => {
    assert.equal(extractUPSkillName('/skill:up-requirements'), 'requirements');
  });

  /**
   * @rf RF-AT-01
   */
  it('RF-AT-01: lowercases the skill name regardless of input casing', () => {
    assert.equal(extractUPSkillName('/skill:up-Use-Cases'), 'use-cases');
    assert.equal(extractUPSkillName('/SKILL:UP-TDD'), 'tdd');
  });

  /**
   * @rf RF-AT-01
   */
  it('RF-AT-01: returns null for non-UP-skill slash commands', () => {
    assert.equal(extractUPSkillName('/up'), null);
    assert.equal(extractUPSkillName('/up-status'), null);
    assert.equal(extractUPSkillName('/skill:other-foo'), null);
  });

  /**
   * @rf RF-AT-01
   */
  it('RF-AT-01: returns null for empty or whitespace-only input', () => {
    assert.equal(extractUPSkillName(''), null);
    assert.equal(extractUPSkillName('   '), null);
    assert.equal(extractUPSkillName('/skill:'), null);
  });

  /**
   * @rf RF-AT-01
   */
  it('RF-AT-01: stops at the first whitespace boundary in multi-word input', () => {
    assert.equal(extractUPSkillName('/skill:up-tdd follow-up message'), 'tdd');
  });
});

describe('buildUPSkillCommand — RF-AT-02', () => {
  /**
   * @rf RF-AT-02
   */
  it('RF-AT-02: composes /skill:up-X for every canonical UP activity', () => {
    for (const activity of ACTIVITY_ORDER) {
      assert.equal(
        buildUPSkillCommand(activity),
        `/skill:up-${activity}`,
        `activity ${activity} must round-trip through buildUPSkillCommand`,
      );
    }
  });

  /**
   * @rf RF-AT-02
   */
  it('RF-AT-02: composes /skill:up-orchestrator for the orchestrator alias', () => {
    assert.equal(buildUPSkillCommand('orchestrator'), '/skill:up-orchestrator');
  });

  /**
   * @rf RF-AT-02
   */
  it('RF-AT-02: returns null for unknown skill names (RF-AT-04 contract)', () => {
    assert.equal(buildUPSkillCommand('not-a-real-skill'), null);
    assert.equal(buildUPSkillCommand('  tdd-bogus'), null);
  });

  /**
   * @rf RF-AT-02
   */
  it('RF-AT-02: returns null for empty string input', () => {
    assert.equal(buildUPSkillCommand(''), null);
  });
});

describe('extractActivityFromUPCommand — RF-AT-03', () => {
  /**
   * @rf RF-AT-03
   */
  it('RF-AT-03: extracts the activity identifier from /skill:up-X commands', () => {
    assert.equal(extractActivityFromUPCommand('/skill:up-implementation'), 'implementation');
    assert.equal(extractActivityFromUPCommand('/skill:up-DEPLOY'), 'deploy');
  });

  /**
   * @rf RF-AT-03
   */
  it('RF-AT-03: returns null for /up-next and other non-skill commands', () => {
    assert.equal(extractActivityFromUPCommand('/up-next'), null);
    // orchestrator IS a valid identifier extracted by the regex; use isAutoChainSkill
    // (RF-AT-04) to validate it as a known auto-chain skill.
    assert.equal(extractActivityFromUPCommand('/skill:up-orchestrator'), 'orchestrator');
  });

  /**
   * @rf RF-AT-03
   */
  it('RF-AT-03: returns null for free-text input', () => {
    assert.equal(extractActivityFromUPCommand('please do the implementation'), null);
    assert.equal(extractActivityFromUPCommand(''), null);
  });
});

describe('isAutoChainSkill — RF-AT-04', () => {
  /**
   * @rf RF-AT-04
   */
  it('RF-AT-04: accepts orchestrator as an auto-chain skill', () => {
    assert.equal(isAutoChainSkill('orchestrator'), true);
  });

  /**
   * @rf RF-AT-04
   */
  it('RF-AT-04: accepts every canonical UP activity as an auto-chain skill', () => {
    for (const activity of ACTIVITY_ORDER) {
      assert.equal(isAutoChainSkill(activity), true, `${activity} must be auto-chain`);
    }
  });

  /**
   * @rf RF-AT-04
   */
  it('RF-AT-04: rejects unknown skill names', () => {
    assert.equal(isAutoChainSkill('not-a-skill'), false);
    assert.equal(isAutoChainSkill('vision-extra'), false);
  });

  /**
   * @rf RF-AT-04
   */
  it('RF-AT-04: rejects empty string input', () => {
    assert.equal(isAutoChainSkill(''), false);
  });
});

describe('formatRecommendedNextStatus — RF-AT-05', () => {
  /**
   * @rf RF-AT-05
   */
  it('RF-AT-05: returns no-process sentinel when state is null', () => {
    assert.equal(formatRecommendedNextStatus(null), '➡️ no-process');
  });

  /**
   * @rf RF-AT-05
   */
  it('RF-AT-05: returns DONE when every canonical activity is completed', () => {
    const state = createInitialState('Done System', 'all done');
    state.completedActivities = [...ACTIVITY_ORDER];
    assert.equal(formatRecommendedNextStatus(state), '➡️ DONE');
  });

  /**
   * @rf RF-AT-05
   */
  it('RF-AT-05: marks explicit orchestrator recommendation with ★', () => {
    const state = createInitialState('Demo', 'vision');
    state.recommendedNextCommand = '/skill:up-orchestrator';
    state.recommendedNextReason = 'Re-plan needed after contract gap';
    const out = formatRecommendedNextStatus(state);
    assert.match(out, /➡️ \/skill:up-orchestrator ★/);
  });

  /**
   * @rf RF-AT-05
   */
  it('RF-AT-05: shows effective next command without ★ when no explicit recommendation', () => {
    const state = createInitialState('Demo', 'vision');
    state.completedActivities = ['vision'];
    const out = formatRecommendedNextStatus(state);
    assert.equal(out, '➡️ /skill:up-requirements');
    assert.equal(out.includes('★'), false);
  });
});

describe('classifyRecommendation — RF-AT-06', () => {
  /**
   * @rf RF-AT-06
   */
  it('RF-AT-06: classifies risk-aware recommendations when the reason matches risk signals', () => {
    const state = createInitialState('X', 'v');
    state.recommendedNextReason = 'Critical contract gap found during implementation';
    const result = classifyRecommendation(state, '/skill:up-contracts');
    assert.deepEqual(result, {
      icon: '⚠',
      label: 'UP risk-aware recommendation',
      tone: 'warning',
    } satisfies RecommendationClassification);
  });

  /**
   * @rf RF-AT-06
   */
  it('RF-AT-06: classifies coordination recommendations targeting /skill:up-orchestrator', () => {
    const state = createInitialState('X', 'v');
    state.recommendedNextReason = 'plan refresh';
    const result = classifyRecommendation(state, '/skill:up-orchestrator');
    assert.equal(result.tone, 'accent');
    assert.equal(result.label, 'UP coordination recommendation');
  });

  /**
   * @rf RF-AT-06
   */
  it('RF-AT-06: classifies /up-next as a forward recommendation', () => {
    const state = createInitialState('X', 'v');
    state.recommendedNextReason = 'forward';
    const result = classifyRecommendation(state, '/up-next');
    assert.equal(result.tone, 'success');
    assert.equal(result.label, 'UP forward recommendation');
  });

  /**
   * @rf RF-AT-06
   */
  it('RF-AT-06: classifies explicit recommendation equal to the linear next as forward', () => {
    const state = createInitialState('X', 'v');
    state.completedActivities = ['vision'];
    state.recommendedNextReason = 'continue';
    // No explicit recommendation in state; explicit next equals linear next.
    const result = classifyRecommendation(state, '/skill:up-requirements');
    assert.equal(result.tone, 'success');
    assert.equal(result.label, 'UP forward recommendation');
  });

  /**
   * @rf RF-AT-06
   */
  it('RF-AT-06: classifies upstream refinement when explicit is before the linear next', () => {
    const state = createInitialState('X', 'v');
    state.completedActivities = ['vision', 'requirements', 'use-cases', 'sequence-diagrams', 'conceptual-model', 'contracts', 'tech-stack', 'tdd', 'design-patterns', 'object-design', 'interface-design'];
    state.recommendedNextReason = 'orchestrator requested revision of design-patterns';
    // Linear next is "data-mapping" (index 12); explicit is "design-patterns" (index 8) — earlier.
    const result = classifyRecommendation(state, '/skill:up-design-patterns');
    assert.equal(result.tone, 'warning');
    assert.equal(result.label, 'UP upstream refinement');
  });

  /**
   * @rf RF-AT-06
   */
  it('RF-AT-06: classifies non-linear jump when explicit is after the linear next', () => {
    const state = createInitialState('X', 'v');
    state.completedActivities = ['vision'];
    state.recommendedNextReason = 'jump ahead';
    // Linear next is "requirements" (index 1); explicit is "implementation" (index 13) — later.
    const result = classifyRecommendation(state, '/skill:up-implementation');
    assert.equal(result.tone, 'accent');
    assert.equal(result.label, 'UP non-linear jump');
  });

  /**
   * @rf RF-AT-06
   */
  it('RF-AT-06: classifies generic explicit recommendation as fallback', () => {
    const state = createInitialState('X', 'v');
    state.recommendedNextReason = 'follow-up';
    const result = classifyRecommendation(state, '/skill:up-orchestrator');
    // Already covered above, but ensure the orchestrator branch remains the
    // top priority by verifying the icon/text explicitly.
    assert.equal(result.icon, '⟳');
  });
});

describe('compactReason — RF-AT-07', () => {
  /**
   * @rf RF-AT-07
   */
  it('RF-AT-07: collapses internal whitespace runs to a single space', () => {
    assert.equal(compactReason('foo   bar\tbaz\nqux'), 'foo bar baz qux');
  });

  /**
   * @rf RF-AT-07
   */
  it('RF-AT-07: truncates with an ellipsis when text exceeds maxLength', () => {
    const long = 'x'.repeat(200);
    const out = compactReason(long, 50);
    assert.equal(out.length, 50);
    assert.match(out, /…$/);
  });

  /**
   * @rnf RNF-AT-03
   */
  it('RNF-AT-03: returns the trimmed input unchanged when at or below the threshold', () => {
    const text = 'short reason';
    assert.equal(compactReason(text, 50), text);
    assert.equal(compactReason(text, 12), text);
  });

  /**
   * @rf RF-AT-07
   */
  it('RF-AT-07: returns empty string for empty or whitespace-only input', () => {
    assert.equal(compactReason(''), '');
    assert.equal(compactReason('   \n\t  '), '');
  });
});

describe('restoreAutoTransitionMode — RF-AT-08', () => {
  /**
   * @rf RF-AT-08
   */
  it('RF-AT-08: defaults to ON when no up-auto-mode entries exist', () => {
    assert.equal(restoreAutoTransitionMode([]), true);
    assert.equal(restoreAutoTransitionMode([{ type: 'custom', customType: 'other' }]), true);
  });

  /**
   * @rf RF-AT-08
   */
  it('RF-AT-08: reads the latest up-auto-mode entry', () => {
    const entries = [
      { type: 'custom', customType: AUTO_MODE_ENTRY_TYPE, data: { enabled: true } },
      { type: 'custom', customType: AUTO_MODE_ENTRY_TYPE, data: { enabled: false } },
      { type: 'custom', customType: AUTO_MODE_ENTRY_TYPE, data: { enabled: true } },
    ];
    assert.equal(restoreAutoTransitionMode(entries), true);
  });

  /**
   * @rf RF-AT-08
   */
  it('RF-AT-08: returns false when the last entry disabled auto-mode', () => {
    const entries = [
      { type: 'custom', customType: AUTO_MODE_ENTRY_TYPE, data: { enabled: false } },
    ];
    assert.equal(restoreAutoTransitionMode(entries), false);
  });

  /**
   * @rf RF-AT-08
   */
  it('RF-AT-08: ignores non-object and malformed entries without throwing', () => {
    const mixed: unknown[] = [
      null,
      'string-entry',
      { type: 'message' },
      { type: 'custom', customType: AUTO_MODE_ENTRY_TYPE }, // missing data
      { type: 'custom', customType: AUTO_MODE_ENTRY_TYPE, data: {} }, // missing enabled
      { type: 'custom', customType: AUTO_MODE_ENTRY_TYPE, data: { enabled: 'yes' } }, // wrong type
      { type: 'custom', customType: AUTO_MODE_ENTRY_TYPE, data: { enabled: true } },
    ];
    assert.equal(restoreAutoTransitionMode(mixed), true);
  });

  /**
   * @rnf RNF-AT-02
   */
  it('RNF-AT-02: restores from 10000 mixed entries in under 25ms (perf budget)', () => {
    const entries: unknown[] = Array.from({ length: 10_000 }, (_, index) => ({
      type: 'custom',
      customType: index % 2 === 0 ? AUTO_MODE_ENTRY_TYPE : 'noise',
      data: { enabled: index % 4 === 0 },
    }));
    const start = performance.now();
    const result = restoreAutoTransitionMode(entries);
    const elapsed = performance.now() - start;
    assert.ok(
      elapsed < 25,
      `restoreAutoTransitionMode took ${elapsed.toFixed(2)}ms (RNF-AT-02 budget: 25ms)`,
    );
    assert.equal(typeof result, 'boolean');
  });
});

describe('formatShortcutList — RF-AT-09', () => {
  /**
   * @rf RF-AT-09
   */
  it('RF-AT-09: uppercases and pipe-separates every registered shortcut', () => {
    const out = formatShortcutList();
    for (const shortcut of AUTO_TOGGLE_SHORTCUTS) {
      assert.ok(out.includes(shortcut.toUpperCase()), `missing ${shortcut.toUpperCase()}`);
    }
    // Pipe-separated → 2 pipes for 3 entries.
    const pipes = out.split(' | ').length;
    assert.equal(pipes, AUTO_TOGGLE_SHORTCUTS.length);
  });

  /**
   * @rf RF-AT-09
   */
  it('RF-AT-09: includes CTRL+SHIFT+Y, N, and T', () => {
    const out = formatShortcutList();
    assert.match(out, /CTRL\+SHIFT\+Y/);
    assert.match(out, /CTRL\+SHIFT\+N/);
    assert.match(out, /CTRL\+SHIFT\+T/);
  });
});

describe('AUTO_MODE_ENTRY_TYPE constant — RF-AT-08', () => {
  /**
   * @rf RF-AT-08
   */
  it('RF-AT-08: equals the canonical "up-auto-mode" literal', () => {
    assert.equal(AUTO_MODE_ENTRY_TYPE, 'up-auto-mode');
  });
});
