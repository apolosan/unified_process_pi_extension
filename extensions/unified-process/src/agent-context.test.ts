/**
 * @rf RF-AgentContext-IntegrationChecklist
 * @rf RF-AgentContext-IntegrationMatrix
 * @rf RF-AgentContext-Recommendation
 * @rnf RNF-AgentContext-PromptIntegrity
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildIntegrationChecklistBlock,
  buildUPAgentContext,
  hasIntegrationMatrixArtifact,
  INTEGRATION_CHECKLIST_MARKER,
} from './agent-context.ts';
import { createInitialState, inferArtifactMetadata, type UPState } from './state.ts';

function sampleState(overrides: Partial<UPState> = {}): UPState {
  return {
    ...createInitialState('Demo System', 'Vision summary for demo'),
    completedActivities: ['vision', 'requirements'],
    artifacts: [
      {
        path: '01-vision.md',
        phase: 'inception',
        activity: 'vision',
        title: 'Vision',
        generated: 1,
      },
    ],
    ...overrides,
  };
}

describe('buildIntegrationChecklistBlock', () => {
  /**
   * @rf RF-AgentContext-IntegrationChecklist
   */
  it('includes the integration checklist marker and evidence requirement', () => {
    const block = buildIntegrationChecklistBlock();
    assert.match(block, new RegExp(INTEGRATION_CHECKLIST_MARKER, 'i'));
    assert.match(block, /smoke\.log/i);
    assert.match(block, /exit code/i);
    assert.match(block, /Tier 1/i);
  });

  /**
   * @rf RF-AgentContext-StackUp
   */
  it('lists stack-up and health verification steps', () => {
    const block = buildIntegrationChecklistBlock();
    assert.match(block, /bring up the application stack/i);
    assert.match(block, /health/i);
  });
});

describe('hasIntegrationMatrixArtifact', () => {
  /**
   * @rf RF-AgentContext-IntegrationMatrix
   */
  it('detects the integration matrix artifact path', () => {
    const state = sampleState({
      artifacts: [
        {
          path: '12b-integration-matrix.md',
          phase: 'elaboration',
          activity: 'contracts',
          title: 'Integration Matrix',
          generated: 2,
        },
      ],
    });
    assert.equal(hasIntegrationMatrixArtifact(state), true);
  });

  /**
   * @rf RF-AgentContext-IntegrationMatrix-Negative
   */
  it('returns false when matrix artifact is missing', () => {
    assert.equal(hasIntegrationMatrixArtifact(sampleState()), false);
  });
});

describe('inferArtifactMetadata', () => {
  /**
   * @rf RF-AgentContext-ArtifactMetadata
   */
  it('recognizes integration matrix artifact', () => {
    const meta = inferArtifactMetadata('12b-integration-matrix.md');
    assert.ok(meta);
    assert.equal(meta?.title, 'Integration Matrix (UI ↔ API ↔ Operations)');
  });
});

describe('buildUPAgentContext', () => {
  /**
   * @rf RF-AgentContext-Compose
   */
  it('appends integration checklist to UP context', () => {
    const context = buildUPAgentContext(sampleState(), { autoTransitionEnabled: false });
    assert.match(context, /Unified Process \(UP\) Context/);
    assert.match(context, new RegExp(INTEGRATION_CHECKLIST_MARKER, 'i'));
    assert.match(context, /12b-integration-matrix\.md/);
  });

  /**
   * @rf RF-AgentContext-ImplementationWarning
   */
  it('warns when integration matrix artifact is missing during implementation', () => {
    const state = sampleState({
      completedActivities: [
        'vision',
        'requirements',
        'use-cases',
        'sequence-diagrams',
        'conceptual-model',
        'contracts',
        'tech-stack',
        'tdd',
        'design-patterns',
        'object-design',
        'interface-design',
        'design-system',
        'data-mapping',
      ],
    });
    const context = buildUPAgentContext(state, { autoTransitionEnabled: true });
    assert.match(context, /integration matrix.*missing/i);
  });

  /**
   * @rf RF-AgentContext-Recommendation
   */
  it('includes explicit recommendation fields when present', () => {
    const state = sampleState({
      recommendedNextCommand: '/skill:up-implementation',
      recommendedNextReason: 'Construction ready after data mapping.',
    });
    const context = buildUPAgentContext(state, { autoTransitionEnabled: false });
    assert.match(context, /\/skill:up-implementation/);
    assert.match(context, /Construction ready/);
  });

  /**
   * @rf RF-AgentContext-AutoMode
   */
  it('RF-AgentContext-AutoMode: distinguishes ENABLED vs DISABLED auto-transition text', () => {
    const state = sampleState();
    const on = buildUPAgentContext(state, { autoTransitionEnabled: true });
    const off = buildUPAgentContext(state, { autoTransitionEnabled: false });
    assert.match(on, /ENABLED/);
    assert.match(off, /DISABLED/);
    assert.equal(on.includes('DISABLED'), false, 'ENABLED context must not contain DISABLED');
    assert.equal(off.includes('ENABLED'), false, 'DISABLED context must not contain ENABLED');
  });

  /**
   * @rf RF-AgentContext-NoWarningWhenMatrixPresent
   */
  it('RF-AgentContext-NoWarningWhenMatrixPresent: does NOT warn when matrix artifact exists', () => {
    const state = sampleState({
      completedActivities: [
        'vision',
        'requirements',
        'use-cases',
        'sequence-diagrams',
        'conceptual-model',
        'contracts',
        'tech-stack',
        'tdd',
        'design-patterns',
        'object-design',
        'interface-design',
        'design-system',
        'data-mapping',
      ],
      artifacts: [
        {
          path: '12b-integration-matrix.md',
          phase: 'elaboration',
          activity: 'contracts',
          title: 'Integration Matrix',
          generated: 2,
        },
      ],
    });
    const context = buildUPAgentContext(state, { autoTransitionEnabled: true });
    assert.equal(
      /integration matrix.*missing/i.test(context),
      false,
      'must not warn when matrix is present',
    );
  });

  /**
   * @rf RF-AgentContext-EmptyRecommendationReason
   */
  it('RF-AgentContext-EmptyRecommendationReason: omits the rationale line when reason is empty', () => {
    const state = sampleState({
      recommendedNextCommand: '/skill:up-requirements',
      recommendedNextReason: '',
    });
    const context = buildUPAgentContext(state, { autoTransitionEnabled: false });
    assert.equal(/rationale/i.test(context), false);
    assert.match(context, /\/skill:up-requirements/);
  });

  /**
   * @rnf RNF-AgentContext-Deterministic
   */
  it('RNF-AgentContext-Deterministic: byte-identical output across 1000 calls (caller-fixed state)', () => {
    const state = sampleState({
      completedActivities: ['vision', 'requirements'],
      artifacts: [
        {
          path: '01-vision.md',
          phase: 'inception',
          activity: 'vision',
          title: 'Vision',
          generated: 1,
        },
      ],
    });
    const first = buildUPAgentContext(state, { autoTransitionEnabled: false });
    for (let i = 0; i < 1000; i++) {
      assert.equal(buildUPAgentContext(state, { autoTransitionEnabled: false }), first);
    }
  });
});
