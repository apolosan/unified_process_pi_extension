# Changelog

All notable changes to this project are documented in this file.

## [1.2.1] - 2026-06-09

### Fixed
- Hardened artifact save/load path validation to keep generated UP artifacts confined to `docs/up/`.
- Validated `up_update_state` payloads before applying state changes, rejecting malformed, oversized, or unsupported updates.
- Made recovered activity completion use explicit artifact rules so partial artifacts do not overstate process progress.

### Changed
- Recorded integration evidence as structured JSONL with deploy readiness checks for `stack_up`, `api_health`, `smoke`, and `tier1_integrated_e2e`.
- Updated README runtime guarantees to reflect verified extension behavior and current typecheck limitations.
- Expanded extension tests from 22 to 42 cases covering validation, recovery, and integration evidence behavior.

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
