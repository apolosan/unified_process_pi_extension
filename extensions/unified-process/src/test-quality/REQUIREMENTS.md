# Test Quality Module — Requirements Manifest

> Meta-test for the TDD-enforcement layer inside the `@apolosan/unified-process`
> extension. Every test in this module MUST declare `@rf RF-NN @rnf RNF-NN`
> markers above its `it()` block so the audit tool we ship can validate itself.

---

## Functional Requirements

### P1 Detection — Mediocre Pattern Recognition

- **RF-01**: detectMediocrePatterns flags `expect(x).toBeDefined()` as `medicre`
  when it appears as the sole assertion of an `it()` body.
- **RF-02**: detectMediocrePatterns flags `expect(fn).toBeInstanceOf(Function)`
  and similar generic-type asserts as `medicre`.
- **RF-03**: detectMediocrePatterns flags `expect(x).toBeTruthy()` and
  `.toBeFalsy()` with no preceding precondition as `medicre_simplorio`.
- **RF-04**: detectMediocrePatterns flags `it('should work' | 'works' | 'basic…')`
  with `expect(...).toBeTruthy()` as `simple`.
- **RF-05**: detectMediocrePatterns flags
  `expect(() => import('…')).not.toThrow()` standalone as `smoke_empty`.
- **RF-06**: detectMediocrePatterns flags
  `expect(x).toEqual(x)` / `expect(x).toBe(x)` literal self-reference as
  `simplorio`.
- **RF-07**: detectMediocrePatterns flags `expect(vitest | typebox).toBeDefined()`
  or any vendor/framework import as `stupid`.
- **RF-08**: detectMediocrePatterns flags `toMatchSnapshot()` without explicit
  `inline` or named-snapshot arg as `snapshot_blind`.

### P2 Detection — Traceability Markers

- **RF-09**: extractTestTraceability returns the `@rf RF-NN` annotation when
  declared in a JSDoc block immediately above an `it()`.
- **RF-10**: extractTestTraceability returns the `@rnf RNF-NN` annotation when
  declared in a JSDoc block immediately above an `it()`.
- **RF-11**: extractTestTraceability returns `rf: []`, `rnf: []` (with
  `traceabilityMissing: true`) when an `it()` has no JSDoc block above it.
- **RF-12**: extractTestTraceability accepts `@rf` / `@rnf` inside a single-line
  `// @rf RF-01 @rnf RNF-02` comment immediately above `it()`.

### P3 Detection — Coverage Gaps

- **RF-13**: extractRequirements parses `- **RF-NN: title**` and
  `- **RNF-NN: title**` bullets from `02-requirements.md`.
- **RF-14**: extractRequirements parses table rows `| RF-NN | title | … |` from
  `02-requirements.md`.
- **RF-15**: computeCoverage returns `uncoveredRf` and `uncoveredRnf` as the
  symmetric difference between parsed requirements and the union of marker ids.
- **RF-16**: computeCoverage returns `coveredRf` and `coveredRnf` mapped back
  to requirement titles (caller can render friendly names).

### Handoff Generator — Incomplete UP Transition

- **RF-17**: generateHandoff produces a markdown document with a
  "Completion Status" table covering every activity in `ACTIVITY_ORDER`.
- **RF-18**: generateHandoff includes "Uncovered Requirements" section only
  when at least one RF/RNF lacks a test link.
- **RF-19**: generateHandoff includes "Last Integration Evidence" with the
  last 3 smoke.log entries (command, exit code, ISO timestamp).
- **RF-20**: generateHandoff includes a numbered "Resume Instructions"
  block referencing the canonical recovery commands.

---

## Non-Functional Requirements

- **RNF-01** (Performance): `detectMediocrePatterns` + `extractTestTraceability`
  scan a 500-line test file in under 10 ms.
- **RNF-02** (Self-validation): zero false positives in the project's own
  test-quality test battery (i.e., the detector must not flag its own tests
  as mediocre when every `it()` declares the proper `@rf`/`@rnf` markers and
  targets real behavior).
- **RNF-03** (Determinism): `generateHandoff` produces byte-identical output
  when given identical input (no clock drift inside the body — caller passes
  `timestamp`).
- **RNF-04** (Output bound): `generateHandoff` output never exceeds 32 KB for
  a UP state with ≤ 16 activities and ≤ 50 uncovered requirements.
- **RNF-05** (Auditable): every public function returns structured objects
  with explicit `issues: Issue[]` arrays so downstream tooling can filter by
  severity without re-parsing prose.
- **RNF-06** (No silent pass): `computeCoverage` throws an
  `EmptyRequirementsError` when the requirements document is missing or
  contains zero parseable IDs (strict mode only).
