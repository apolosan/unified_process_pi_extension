/**
 * Extension Entrypoint Smoke — TDD test battery
 *
 * Regression battery for the v1.2.3 incident: `index.ts` called
 * `extractUPSkillName`, `isAutoChainSkill` and `buildUPSkillCommand` inside
 * the `input` event handler without importing them, so every `/skill:up-*`
 * message crashed the extension with `extractUPSkillName is not defined`.
 * Unit tests on `src/*.ts` could not catch that class of failure because the
 * entrypoint itself was never loaded. These tests load the REAL entrypoint
 * with a mocked ExtensionAPI and dispatch REAL input events through it.
 *
 * Naming convention: `it('RF-ES-NN: <scenario> — <expected>', …)`.
 *
 * @rf RF-ES-01..05
 * @rnf RNF-ES-01..02
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import unifiedProcessExtension from '../index.ts';

type Handler = (event: any, ctx?: any) => unknown;

function createMockExtensionAPI() {
  const handlers = new Map<string, Handler>();
  const tools: string[] = [];
  const commands: string[] = [];
  const shortcuts: string[] = [];
  const sent: Array<{ text: string; options?: unknown }> = [];
  const entries: Array<{ type: string; value: unknown }> = [];
  const pi = {
    on: (name: string, fn: Handler) => handlers.set(name, fn),
    registerTool: (def: { name: string }) => tools.push(def.name),
    registerCommand: (name: string) => commands.push(name),
    registerShortcut: (keys: string | readonly string[]) =>
      shortcuts.push(...(Array.isArray(keys) ? keys : [keys])),
    appendEntry: (type: string, value: unknown) => entries.push({ type, value }),
    sendUserMessage: (text: string, options?: unknown) => sent.push({ text, options }),
  };
  return { pi, handlers, tools, commands, shortcuts, sent, entries };
}

function createMockContext(overrides: Record<string, unknown> = {}) {
  const notifications: Array<{ message: string; level: string }> = [];
  const ctx = {
    cwd: '/tmp/up-entrypoint-smoke-nonexistent-project',
    isIdle: () => true,
    sessionManager: { getEntries: () => [] },
    ui: {
      notify: (message: string, level: string) => notifications.push({ message, level }),
      setStatus: () => undefined,
      setWidget: () => undefined,
      theme: { fg: (_tone: string, text: string) => text },
    },
    ...overrides,
  };
  return { ctx, notifications };
}

describe('entrypoint load — RF-ES-01', () => {
  /**
   * @rf RF-ES-01
   */
  it('RF-ES-01: default export is a function that registers without throwing', () => {
    assert.equal(typeof unifiedProcessExtension, 'function');
    const { pi } = createMockExtensionAPI();
    assert.doesNotThrow(() => unifiedProcessExtension(pi as never));
  });

  /**
   * @rf RF-ES-01
   */
  it('RF-ES-01: registers the five lifecycle event handlers', () => {
    const { pi, handlers } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    for (const event of ['session_start', 'before_agent_start', 'input', 'tool_execution_end', 'agent_end']) {
      assert.ok(handlers.has(event), `missing handler for "${event}"`);
      assert.equal(typeof handlers.get(event), 'function');
    }
  });
});

describe('tool and command registration — RF-ES-02', () => {
  /**
   * @rf RF-ES-02
   */
  it('RF-ES-02: registers exactly the eight documented UP tools', () => {
    const { pi, tools } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    assert.deepEqual([...tools].sort(), [
      'up_generate_handoff',
      'up_list_artifacts',
      'up_load_artifact',
      'up_record_integration_check',
      'up_require_paths',
      'up_save_artifact',
      'up_test_quality_audit',
      'up_update_state',
    ]);
  });

  /**
   * @rf RF-ES-02
   */
  it('RF-ES-02: registers the seven documented UP commands and the auto-toggle shortcuts', () => {
    const { pi, commands, shortcuts } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    assert.deepEqual([...commands].sort(), ['up', 'up-artifacts', 'up-audit', 'up-auto', 'up-handoff', 'up-next', 'up-status']);
    assert.ok(shortcuts.length >= 1, 'at least one auto-toggle shortcut must be registered');
  });
});

describe('input handler symbol resolution — RF-ES-03 (v1.2.3 regression)', () => {
  /**
   * @rf RF-ES-03
   */
  it('RF-ES-03: /skill:up-orchestrator input resolves extractUPSkillName without ReferenceError', async () => {
    const { pi, handlers } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    const input = handlers.get('input')!;
    await assert.doesNotReject(() => input({ text: '/skill:up-orchestrator' }));
  });

  /**
   * @rf RF-ES-03
   */
  it('RF-ES-03: every documented UP skill invocation passes through the input handler', async () => {
    const { pi, handlers } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    const input = handlers.get('input')!;
    const skills = [
      '/skill:up-vision',
      '/skill:up-requirements',
      '/skill:up-use-cases',
      '/skill:up-sequence-diagrams',
      '/skill:up-conceptual-model',
      '/skill:up-contracts',
      '/skill:up-tech-stack',
      '/skill:up-tdd',
      '/skill:up-design-patterns',
      '/skill:up-object-design',
      '/skill:up-interface-design',
      '/skill:up-design-system',
      '/skill:up-data-mapping',
      '/skill:up-implementation',
      '/skill:up-deploy',
      '/skill:up-documentation',
      '/skill:up-orchestrator',
      '/skill:up-5w2h',
    ];
    for (const skill of skills) {
      await assert.doesNotReject(() => input({ text: skill }), `input handler rejected on ${skill}`);
    }
  });

  /**
   * @rf RF-ES-03
   */
  it('RF-ES-03: casing variants and trailing text do not break the input handler', async () => {
    const { pi, handlers } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    const input = handlers.get('input')!;
    await assert.doesNotReject(() => input({ text: '/SKILL:UP-Use-Cases' }));
    await assert.doesNotReject(() => input({ text: '/skill:up-tdd follow-up message' }));
  });
});

describe('auto-transition arming — RF-ES-04', () => {
  /**
   * @rf RF-ES-04
   */
  it('RF-ES-04: UP skill input arms auto-transition and agent_end pauses when no progress was made', async () => {
    const { pi, handlers, sent } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    await handlers.get('input')!({ text: '/skill:up-orchestrator' });
    const { ctx, notifications } = createMockContext();
    await handlers.get('agent_end')!({}, ctx);
    assert.equal(sent.length, 0, 'no follow-up command may be dispatched without detected progress');
    assert.ok(
      notifications.some((n) => n.message.includes('auto-transition paused')),
      'agent_end must notify the paused auto-transition',
    );
  });

  /**
   * @rf RF-ES-04
   */
  it('RF-ES-04: plain text input disarms auto-transition and agent_end stays silent', async () => {
    const { pi, handlers, sent } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    await handlers.get('input')!({ text: '/skill:up-tdd' });
    await handlers.get('input')!({ text: 'just a normal user message' });
    const { ctx, notifications } = createMockContext();
    await handlers.get('agent_end')!({}, ctx);
    assert.equal(sent.length, 0);
    assert.equal(notifications.length, 0, 'disarmed auto-transition must not notify');
  });
});

describe('non-UP input tolerance — RF-ES-05 / RNF-ES-01..02', () => {
  /**
   * @rf RF-ES-05
   */
  it('RF-ES-05: foreign slash commands and empty text are ignored by the input handler', async () => {
    const { pi, handlers } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    const input = handlers.get('input')!;
    for (const text of ['/up', '/up-status', '/skill:other-foo', '', '   ', '/skill:']) {
      await assert.doesNotReject(() => input({ text }));
    }
  });

  /**
   * @rnf RNF-ES-01
   */
  it('RNF-ES-01: input handler processes 1000 mixed inputs in under 500ms', async () => {
    const { pi, handlers } = createMockExtensionAPI();
    unifiedProcessExtension(pi as never);
    const input = handlers.get('input')!;
    const inputs = ['/skill:up-tdd', 'plain message', '/up-status', '/SKILL:UP-TDD'];
    const start = performance.now();
    for (let i = 0; i < 1000; i += 1) {
      await input({ text: inputs[i % inputs.length] });
    }
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 500, `1000 input dispatches took ${elapsed.toFixed(1)}ms (budget: 500ms)`);
  });

  /**
   * @rnf RNF-ES-02
   */
  it('RNF-ES-02: repeated extension registration is isolated between instances', () => {
    const first = createMockExtensionAPI();
    const second = createMockExtensionAPI();
    unifiedProcessExtension(first.pi as never);
    unifiedProcessExtension(second.pi as never);
    assert.equal(first.handlers.size, second.handlers.size);
    assert.deepEqual(first.tools, second.tools);
    assert.notEqual(first.handlers, second.handlers, 'each registration must own its handler map');
  });
});
