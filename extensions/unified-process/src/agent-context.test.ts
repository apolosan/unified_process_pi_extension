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
  it('includes the integration checklist marker and evidence requirement', () => {
    const block = buildIntegrationChecklistBlock();
    assert.match(block, new RegExp(INTEGRATION_CHECKLIST_MARKER, 'i'));
    assert.match(block, /smoke\.log/i);
    assert.match(block, /exit code/i);
    assert.match(block, /Tier 1/i);
  });

  it('lists stack-up and health verification steps', () => {
    const block = buildIntegrationChecklistBlock();
    assert.match(block, /bring up the application stack/i);
    assert.match(block, /health/i);
  });
});

describe('hasIntegrationMatrixArtifact', () => {
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

  it('returns false when matrix artifact is missing', () => {
    assert.equal(hasIntegrationMatrixArtifact(sampleState()), false);
  });
});

describe('inferArtifactMetadata', () => {
  it('recognizes integration matrix artifact', () => {
    const meta = inferArtifactMetadata('12b-integration-matrix.md');
    assert.ok(meta);
    assert.equal(meta?.title, 'Integration Matrix (UI ↔ API ↔ Operations)');
  });
});

describe('buildUPAgentContext', () => {
  it('appends integration checklist to UP context', () => {
    const context = buildUPAgentContext(sampleState(), { autoTransitionEnabled: false });
    assert.match(context, /Unified Process \(UP\) Context/);
    assert.match(context, new RegExp(INTEGRATION_CHECKLIST_MARKER, 'i'));
    assert.match(context, /12b-integration-matrix\.md/);
  });

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

  it('includes explicit recommendation fields when present', () => {
    const state = sampleState({
      recommendedNextCommand: '/skill:up-implementation',
      recommendedNextReason: 'Construction ready after data mapping.',
    });
    const context = buildUPAgentContext(state, { autoTransitionEnabled: false });
    assert.match(context, /\/skill:up-implementation/);
    assert.match(context, /Construction ready/);
  });
});
