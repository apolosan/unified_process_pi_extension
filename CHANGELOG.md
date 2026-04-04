# Changelog

All notable changes to this project are documented in this file.

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
