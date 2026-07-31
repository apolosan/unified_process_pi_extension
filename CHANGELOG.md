# Changelog

All notable changes to this project are documented in this file.

## [1.2.6] - 2026-07-31

### Fixed
- README on npm registry was stale at `1.2.3` (tarball from a prior publish). Bumped to `1.2.6` and republishing so the npm registry surface matches the GitHub source.

### Tests
- Added `version-coherence.test.ts` (4 assertions, RF-VD-01..03 / RNF-VD-01): every tracked forward-facing doc that names the package version (`package.json`, `README.md`, `CHANGELOG.md` head, `.agent/agents-md-manifest.json`) must share a single version string. Future drift fails `npm run check`.

## [1.2.5] - 2026-07-30

### Tests
- Added `entrypoint-smoke.test.ts` (12 cases, RF-ES-01..05 / RNF-ES-01..02): the suite now loads the real extension entrypoint (`index.ts`) with a mocked `ExtensionAPI` and dispatches real `input`/`agent_end` events through it. This closes the blind spot that let v1.2.3 ship with `extractUPSkillName is not defined` — unit tests on `src/*.ts` never imported the entrypoint, so missing imports at the top of `index.ts` were invisible. Pins handler registration (5 lifecycle events), tool/command/shortcut registration, symbol resolution for every documented `/skill:up-*` invocation, auto-transition arming/disarming, and a 1000-dispatch performance budget. Suite total: 192 → 204.
- `docs/TESTS_LIST.md` inventory updated to 204/204.

## [1.2.4] - 2026-07-30

### Fixed
- **Runtime crash on every `/skill:up-*` input**: `extensions/unified-process/index.ts` called `extractUPSkillName`, `isAutoChainSkill` and `buildUPSkillCommand` in the `input` event handler but never imported them after the v1.2.3 refactor that lifted those helpers into `src/auto-transition.ts`. The extension threw `extractUPSkillName is not defined` on each auto-transition cycle. The three symbols are now imported, and the handler was verified end-to-end (module load + input dispatch + 8 tool registrations).

## [1.2.3] - 2026-07-30

### Fixed
- Closed null-byte injection in `resolveArtifactPath` (dual-layer guard: raw input + post-decode). CVE-class path-truncation bypass: paths containing `\0` are now rejected before any filesystem operation.
- Normalized lone `\r` line endings in `normalizeVisionText` (Mac Classic). Extended regex to `\r\n?`.
- Stripped markdown syntax (`#`, `*`, `|`, `` ` ``, `<`, `>`) from vision content before deriving the canonical `systemName` so pasted visions no longer leak noise characters.

### Changed
- Refactored `extensions/unified-process/index.ts` to lift 11 pure helpers (`extractUPSkillName`, `buildUPSkillCommand`, `extractActivityFromUPCommand`, `isAutoChainSkill`, `formatRecommendedNextStatus`, `classifyRecommendation`, `compactReason`, `restoreAutoTransitionMode`, `formatShortcutList`, `AUTO_MODE_ENTRY_TYPE`, `AUTO_TOGGLE_SHORTCUTS`) into a new `src/auto-transition.ts` module so they can be unit-tested in isolation. Zero consumer-facing change.

### Tests
- Grew the test suite from 98 to 192 cases (+94 net new, 0 removed, 0 skipped). Two new test files (`auto-transition.test.ts` with 32 RF/RNF cases, `system-name.test.ts` with 20) cover previously-zero-tested pure helpers. Six existing test files (`state-validation`, `path-safety`, `agent-context`, `completion-inference`, `integration-tools`, `integration-evidence`) gained 42 new edge and RNF cases (boundary, null safety, idempotency, determinism, performance budgets). Every new `it()` carries an `@rf` or `@rnf` JSDoc marker.
- `docs/TESTS_LIST.md` rewritten as the test-strength audit catalog for all 192 cases.

## [1.2.2] - 2026-06-09

### Fixed
- Hardened artifact save/load path validation to keep generated UP artifacts confined to `docs/up/`.
- Validated `up_update_state` payloads before applying state changes, rejecting malformed, oversized, or unsupported updates.
- Made recovered activity completion use explicit artifact rules so partial artifacts do not overstate process progress.

### Changed
- Recorded integration evidence as structured JSONL with deploy readiness checks for `stack_up`, `api_health`, `smoke`, and `tier1_integrated_e2e`.
- Updated README runtime guarantees to reflect verified extension behavior and current typecheck limitations.
- Expanded extension tests from 22 to 42 cases covering validation, recovery, and integration evidence behavior.

## [1.2.1] - 2026-06-09

### Changed
- Superseded by `1.2.2` to publish the patch release under the intended next version.

## [1.2.0] - 2026-05-19

### Added
- Integration checklist injected into agent context via `before_agent_start` (stack up, health, smoke, Tier 1 e2e, `smoke.log` evidence).
- New tools: `up_record_integration_check` (record smoke/integration evidence) and `up_require_paths` (validate API, tests, matrix, operations, `.env.example`).
- Integration verification UI widget (`up:integration`) and smoke status (`up:smoke`) driven by `docs/up/14-implementation/smoke.log`.
- Extension modules: `agent-context.ts`, `integration-evidence.ts`, `integration-tools.ts` with 22 unit tests (`npm test`).
- UP skills: Tier 1 (integrated) vs Tier 2 (contract) e2e distinction, D1–D6 deferred until Tier 1 passes, interface-design integration hooks, deploy/orchestrator smoke gates.
- Artifact metadata for `12b-integration-matrix.md` in extension state.

### Changed
- `up-implementation`, `up-tdd`, `up-deploy`, and orchestrator templates now enforce `PROJECT_ROOT/src/` for code and `docs/up/14-implementation/` for logs only.
- `npm run check` now runs the extension test suite before publish.

## [1.1.3] - 2026-04-04

### Fixed
- Removed an accidentally committed diff hunk from `extensions/unified-process/index.ts` that made the published extension fail to parse during pi startup.
- Restored the `up:recommendation` widget refresh path so the extension loads correctly again.

### Added
- Added `scripts/verify-extension-syntax.mjs` to scan extension source files for patch artifacts and TypeScript parse errors.
- Wired `npm run check` into `prepublishOnly` so malformed extension sources block future npm publishes.

## [1.1.2] - 2026-04-04

### Added
- Added this `CHANGELOG.md` file to track package releases.

### Changed
- Bumped the package version from `1.1.1` to `1.1.2`.

## [1.1.1] - 2026-04-01

### Fixed
- Recovered the `/up` flow from persisted project state and generated UP documentation artifacts.
- Re-triggered the orchestrator when resuming an existing Unified Process project.
- Added tracking for the `data-mapping` activity in extension state.

## [1.1.0] - 2026-04-01

### Added
- Introduced the D1-D6 UI/UX quality gate across the relevant Unified Process skills.
- Added support for 4 new MCP integrations: Magic UI, Aceternity UI, ReactBits, and Lucide Icons.

## [1.0.1] - 2026-03-31

### Fixed
- Removed npm publish warnings from the public package.

## [1.0.0] - 2026-03-31

### Added
- Initial public release of `@apolosan/unified-process`.
- Bundled the Unified Process extension, UP skills, dependency manifests, and setup scripts.
