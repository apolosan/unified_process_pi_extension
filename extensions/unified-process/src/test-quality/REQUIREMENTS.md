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
  last 5 smoke.log entries (command, exit code, ISO timestamp).
- **RF-20**: generateHandoff includes a numbered "Resume Instructions"
  block referencing the canonical recovery commands.

### Surface Coverage — Extent Enforcement

- **RF-25**: extractUseCaseSurface derives one `use_case` item per use case
  plus one `flow` item per flow heading (`## Main Flow`, `## Variant …`,
  `## Exception …`), with stable ids (`UC-03`, `UC-03-MAIN`,
  `UC-03-VARIANT-2A`, `UC-03-EXCEPTION-3A`).
- **RF-26**: extractContractSurface derives one `operation` item per contract,
  one `post_condition` item per post-condition bullet and one `exception` item
  per exceptions-table row (`OP-STARTPURCHASE`, `…-PC1`, `…-EX1`); pre-conditions
  never produce items.
- **RF-27**: extractSurfaceRefs reads the `@surface` ids and the `@type` value
  declared in the JSDoc block immediately above each `it()`, and marks the
  reference as `mediocre` when the same test violates the P1 rule chain.
- **RF-28**: computeSurfaceCoverage counts a surface item as covered only when
  a NON-mediocre test claims it; claims made by mediocre tests are still
  reported in `claimedBy` for remediation.
- **RF-29**: computeTypeMatrix reports the mandatory types missing from the
  declared battery and is satisfied when UNIT, INTEGRATION, E2E-T1, E2E-T2 and
  one non-functional type are declared.
- **RF-30**: runTestQualityAudit adds the surface axis to the report and
  strict mode fails when any surface item is uncovered or a mandatory test
  type is missing.

### Scanner Robustness — Literals, Comments and Markers

- **RF-31**: extractTestBlocks ignores test heads that live inside string
  literals or comments — a fixture embedded in a template literal is not a
  test block.
- **RF-32**: the rule chain evaluates the *masked* body, so a fixture inside a
  test body cannot masquerade as a real assertion.
- **RF-33**: maskLiteralsAndComments preserves offsets and line count, so the
  masked text stays positionally aligned with the source.
- **RF-34**: extractRequirements parses the `- **RF-01**: title` form without
  corrupting the id, and keeps the `- **RF-01: title**` form working.
- **RF-46**: a test may declare several requirement ids, including ranges
  (`@rf RF-09..12`), and every id counts as coverage.

### Plan-Driven Enforcement — Operations, Types and Exclusions

- **RF-35**: extractOperationSurface derives one operation item per row of the
  system-operations list, so an operation without a contract still demands a
  test.
- **RF-36**: a claim on a contract element (`…-PCn`, `…-EXn`) implies the
  operation itself is exercised.
- **RF-37**: extractPlannedTypes reads the test taxonomy of the TDD plan
  (type + committed count); a placeholder count is not enforceable.
- **RF-38**: when a plan exists it is authoritative for the type matrix: only
  the planned types are required, and the planned-vs-delivered case count is
  reported as a shortfall.
- **RF-39**: extractExemptedSurfaceIds collects the surface ids the TDD plan
  justifies as excluded; those items are reported as exempted, not uncovered.
- **RF-40**: generateHandoffMarkdown lists the surface items that still have
  no test.
- **RF-41**: buildHandoffFilename is deterministic, iteration-scoped and
  filesystem-safe.
- **RF-42**: writeHandoffDocument writes the handoff under
  `docs/up/15-handoff/` and reports a warning when the smoke log is missing.
- **RF-43**: runTestQualityAudit discovers the test files, honours the
  `requirementsFile` override and honours the `scope` option.
- **RF-44**: the audit of the project's own battery reports no mediocre test
  and no uncovered requirement (self-validation test).
- **RF-45**: the `up_test_quality_audit` tool answers with a blocked report
  instead of throwing when strict mode cannot run.

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
- **RNF-07** (Determinism): surface extraction and coverage computation are
  pure functions of their inputs — same artifacts, same report, no clock.
- **RNF-08** (No false pass): a surface item claimed only by a test that
  violates the anti-mediocre policy counts as uncovered, never as coverage.
- **RNF-09** (Purity): every artifact/plan parser is a pure function of its
  input — no clock, no filesystem, no randomness.
- **RNF-10** (Structure preserving): the literal/comment mask keeps the
  source offsets and line structure intact so every reported line number still
  points at the original file.
