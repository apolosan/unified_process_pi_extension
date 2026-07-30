/**
 * System Name Derivation — TDD test battery
 *
 * Validates the pure helpers in `system-name.ts` that produce the canonical
 * `systemName` shown in the UP status bar, the recommended-next widget, and
 * every artifact header. These helpers ran without direct test coverage
 * before this iteration; bugs here would silently rename every new UP
 * process.
 *
 * Naming convention: `it('RF-SN-NN: <scenario> — <expected>', …)`.
 *
 * @rf RF-SN-01..06
 * @rnf RNF-SN-01..02
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  deriveSystemNameFromVision,
  normalizeVisionText,
} from './system-name.ts';

describe('normalizeVisionText — RF-SN-01', () => {
  /**
   * @rf RF-SN-01
   */
  it('RF-SN-01: trims leading and trailing whitespace from the input', () => {
    assert.equal(normalizeVisionText('   hello world   '), 'hello world');
  });

  /**
   * @rf RF-SN-01
   */
  it('RF-SN-01: strips a /up command prefix from the vision', () => {
    assert.equal(normalizeVisionText('/up Inventory System'), 'Inventory System');
    assert.equal(normalizeVisionText('/up-Inventory'), 'Inventory');
  });

  /**
   * @rf RF-SN-01
   */
  it('RF-SN-01: strips surrounding quotes, smart quotes, and backticks', () => {
    assert.equal(normalizeVisionText('"Online Bookstore"'), 'Online Bookstore');
    assert.equal(normalizeVisionText('\u201CHospital Portal\u201D'), 'Hospital Portal');
    assert.equal(normalizeVisionText('`Slack Bot`'), 'Slack Bot');
    assert.equal(normalizeVisionText("'Retail App'"), 'Retail App');
  });

  /**
   * @rf RF-SN-01
   */
  it('RF-SN-01: normalizes CRLF and CR to LF', () => {
    assert.equal(normalizeVisionText('line1\r\nline2'), 'line1\nline2');
    assert.equal(normalizeVisionText('line1\rline2'), 'line1\nline2');
  });

  /**
   * @rf RF-SN-01
   */
  it('RF-SN-01: returns empty string for empty or whitespace-only input', () => {
    assert.equal(normalizeVisionText(''), '');
    assert.equal(normalizeVisionText('   '), '');
  });
});

describe('deriveSystemNameFromVision — RF-SN-02', () => {
  /**
   * @rf RF-SN-02
   */
  it('RF-SN-02: derives the canonical name from a clean, type-bearing vision', () => {
    assert.equal(
      deriveSystemNameFromVision('Online Bookstore for Small Businesses'),
      'Online Bookstore for Small Businesses',
    );
  });

  /**
   * @rf RF-SN-02
   */
  it('RF-SN-02: strips a /up command prefix before derivation', () => {
    assert.equal(
      deriveSystemNameFromVision('/up Inventory Control System for Small Businesses'),
      'Inventory Control System for Small Businesses',
    );
  });

  /**
   * @rf RF-SN-02
   */
  it('RF-SN-02: recognizes Portuguese request prefixes', () => {
    assert.equal(
      deriveSystemNameFromVision('por favor crie um sistema de gest\u00e3o de estoque'),
      'Sistema de Gest\u00e3o de Estoque',
    );
  });

  /**
   * @rf RF-SN-02
   */
  it('RF-SN-02: recognizes English request prefixes', () => {
    assert.equal(
      deriveSystemNameFromVision('please create a platform for booking appointments'),
      'Platform for Booking Appointments',
    );
  });

  /**
   * @rf RF-SN-02
   */
  it('RF-SN-02: returns Unnamed System for empty or whitespace input', () => {
    assert.equal(deriveSystemNameFromVision(''), 'Unnamed System');
    assert.equal(deriveSystemNameFromVision('   '), 'Unnamed System');
  });

  /**
   * @rf RF-SN-02
   */
  it('RF-SN-02: clamps the name to 14 words when the vision is unbounded', () => {
    const longVision = 'Sistema de gest\u00e3o '.repeat(40);
    const result = deriveSystemNameFromVision(longVision);
    const wordCount = result.split(' ').length;
    assert.ok(wordCount <= 14, `expected \u2264 14 words, got ${wordCount}`);
    assert.match(result, /^Sistema/);
  });

  /**
   * @rf RF-SN-02
   */
  it('RF-SN-02: uses only the first sentence when multiple sentences are present', () => {
    assert.equal(
      deriveSystemNameFromVision('Hospital Portal for patients. The portal must integrate with the EHR.'),
      'Hospital Portal for Patients',
    );
  });
});

describe('deriveSystemNameFromVision — RF-SN-03 explicit-type promotion', () => {
  /**
   * @rf RF-SN-03
   */
  it('RF-SN-03: promotes the explicit type to its canonical English label (PT)', () => {
    assert.equal(
      deriveSystemNameFromVision('um sistema de gest\u00e3o de estoque'),
      'Sistema de Gest\u00e3o de Estoque',
    );
  });

  /**
   * @rf RF-SN-03
   */
  it('RF-SN-03: promotes the explicit type to its canonical English label (EN)', () => {
    assert.equal(
      deriveSystemNameFromVision('a platform for online learning'),
      'Platform for Online Learning',
    );
  });

  /**
   * @rf RF-SN-03
   */
  it('RF-SN-03: leaves the type untouched when it is not in the canonical dictionary', () => {
    assert.equal(
      deriveSystemNameFromVision('a thingamajig for tracking widgets'),
      'Thingamajig for Tracking Widgets',
    );
  });
});

describe('deriveSystemNameFromVision — RF-SN-04 boundary truncation', () => {
  /**
   * @rf RF-SN-04
   */
  it('RF-SN-04: truncates at the first boundary marker (PT)', () => {
    assert.equal(
      deriveSystemNameFromVision('Plataforma de vendas que permite comprar online'),
      'Plataforma de Vendas',
    );
  });

  /**
   * @rf RF-SN-04
   */
  it('RF-SN-04: truncates at the first boundary marker (EN)', () => {
    assert.equal(
      deriveSystemNameFromVision('Inventory control system that allows tracking items'),
      'Inventory Control System',
    );
  });
});

describe('deriveSystemNameFromVision — RF-SN-05 title-case + minor words', () => {
  /**
   * @rf RF-SN-05
   */
  it('RF-SN-05: lowercases minor words (de, do, da, for, the) inside the name', () => {
    const result = deriveSystemNameFromVision('um sistema de gest\u00e3o de pedidos');
    // First word capitalized, "De" lowercased as a minor word in body.
    assert.match(result, /Sistema de Gest\u00e3o de Pedidos/);
  });

  /**
   * @rf RF-SN-05
   */
  it('RF-SN-05: preserves acronyms in upper case', () => {
    assert.equal(
      deriveSystemNameFromVision('um sistema integrado de gest\u00e3o de RH para uma IES'),
      'Sistema Integrado de Gest\u00e3o de RH para uma IES',
    );
  });
});

describe('deriveSystemNameFromVision — RNF-SN-01 determinism', () => {
  /**
   * @rnf RNF-SN-01
   */
  it('RNF-SN-01: produces byte-identical output for identical input across 1000 calls', () => {
    const input = '/up Online Bookstore E-Commerce System for Small Retailers';
    const first = deriveSystemNameFromVision(input);
    for (let i = 0; i < 1000; i++) {
      assert.equal(deriveSystemNameFromVision(input), first);
    }
  });
});

describe('deriveSystemNameFromVision — RNF-SN-02 performance', () => {
  /**
   * @rnf RNF-SN-02
   */
  it('RNF-SN-02: derives a name from a 500-character vision in under 5ms', () => {
    const vision = 'Sistema de gest\u00e3o '.repeat(40).slice(0, 500);
    const start = performance.now();
    const result = deriveSystemNameFromVision(vision);
    const elapsed = performance.now() - start;
    assert.ok(
      elapsed < 5,
      `deriveSystemNameFromVision took ${elapsed.toFixed(2)}ms (RNF-SN-02 budget: 5ms)`,
    );
    assert.ok(result.length > 0);
  });
});

describe('deriveSystemNameFromVision — RF-SN-06 markdown-noise stripping', () => {
  /**
   * @rf RF-SN-06
   */
  it('RF-SN-06: strips markdown noise (#, >, *, |, `) before derivation', () => {
    assert.equal(
      deriveSystemNameFromVision('# Inventory **Control** | System'),
      'Inventory Control System',
    );
  });

  /**
   * @rf RF-SN-06
   */
  it('RF-SN-06: falls back to Unnamed System when only noise characters are provided', () => {
    assert.equal(deriveSystemNameFromVision('# * | >'), 'Unnamed System');
  });
});
