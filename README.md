# Unified Process pi Extension

**Version:** `1.3.0`

Pi package that bundles an Object-Oriented Unified Process workflow for the **pi coding agent**.

It ships:
- a custom extension with UP state, commands, and tools
- the full `up-*` skill chain
- dependency manifests and bootstrap scripts for the MCP/CLI ecosystem referenced by the skills

## Canonical public package layout

This repository is organized as a **pi package** for public distribution:

- `extensions/unified-process/` → pi extension entrypoint and source
- `skills/up-*/` → public skills shipped by the package
- `resources/` → dependency manifests and MCP template
- `scripts/` → dependency scanning/bootstrap helpers

This is the recommended layout for public sharing. The old project-local `.pi/extensions/...` layout is fine for local development, but **not** ideal as the canonical public/package structure.

## Installation

Recommended npm package install:

```bash
pi install npm:@apolosan/unified-process
```

Alternative GitHub install:

```bash
pi install git:github.com/apolosan/unified_process_pi_extension
```

## Package contents

### Extension

Main extension entrypoint:

- `extensions/unified-process/index.ts`

Registered commands:
- `/up`
- `/up-status`
- `/up-next`
- `/up-auto`
- `/up-artifacts`

The extension footer/status now also shows the effective next UP command in real time (`up:next`). When the orchestrator persists an explicit recommendation, the extension also renders a compact widget above the editor with the recommended command and rationale, varying the label by recommendation type (forward progression, refinement, jump, coordination, risk-aware).

**Integration verification (v1.3.0):** before declaring implementation or deploy ready, the agent receives a mandatory integration checklist. Run stack/API/smoke/Tier 1 e2e commands, then record evidence with `up_record_integration_check`. The tool writes structured JSONL records to `docs/up/14-implementation/smoke.log` and deploy readiness requires all four check types (`stack_up`, `api_health`, `smoke`, `tier1_integrated_e2e`) with `exit_code: 0`.

Registered tools:
- `up_save_artifact`
- `up_load_artifact`
- `up_update_state`
- `up_list_artifacts`
- `up_record_integration_check` — record check type, command, exit code, and timestamp to `smoke.log`
- `up_require_paths` — validate required integration paths (API, tests, matrix, operations, env template)
- `up_test_quality_audit` — audit the test battery against the anti-mediocre rules (P1), RF/RNF traceability, the UP test surface (use cases, flows, contracts, operations) and the test-type matrix; `mode="strict"` blocks the phase
- `up_generate_handoff` — write `docs/up/15-handoff/HANDOFF-iter-{N}-{ISO}.md` with completion status, uncovered requirements, uncovered surface and the last smoke evidence

### Test-quality enforcement

`up_test_quality_audit` (and `/up-audit`) enforces four axes over the battery:

1. **Anti-mediocre** (P1) — rejects `toBeDefined`-only, trivial names, vendor-targeting and blind-snapshot tests. Fixtures embedded in string literals are not mistaken for tests.
2. **Traceability** — every `RF-NN` / `RNF-NN` of `docs/up/02-requirements.md` must be referenced by an `@rf` / `@rnf` marker (ranges like `RF-09..12` are supported).
3. **Surface coverage** — every use case, use-case flow, system operation, contract post-condition and contract exception must be claimed by a `@surface` marker on a non-mediocre test; the TDD plan can justify an exclusion.
4. **Type matrix** — the `@type` slots must cover the taxonomy committed in `docs/up/10-tdd-plan.md`; the audit reports `planned vs delivered` per type.

### Skills

Included UP skills:

- `up-orchestrator`
- `up-5w2h`
- `up-vision`
- `up-requirements`
- `up-use-cases`
- `up-sequence-diagrams`
- `up-conceptual-model`
- `up-contracts`
- `up-tech-stack`
- `up-tdd`
- `up-design-patterns`
- `up-object-design`
- `up-interface-design`
- `up-design-system`
- `up-data-mapping`
- `up-implementation`
- `up-deploy`
- `up-documentation`

## External dependencies referenced by the skills

The package itself is a pi package, but several skills explicitly rely on external MCP servers and CLIs.

### MCP servers

Required/recommended MCPs referenced by the skills:
- `design-patterns`
- `shadcn`
- `radix-mcp-server`
- `flyonui`

#### Design Patterns MCP (concrete source + config)

The `design-patterns` MCP expected by `up-design-patterns` is the public repository:
- `https://github.com/apolosan/design_patterns_mcp`

Manual install:

```bash
git clone https://github.com/apolosan/design_patterns_mcp.git .up-tools/design_patterns_mcp
cd .up-tools/design_patterns_mcp
bun install
bun run db:setup
```

Recommended MCP config:

```json
{
  "mcpServers": {
    "design-patterns": {
      "command": "node",
      "args": ["dist/src/mcp-server.js"],
      "cwd": "<INSTALL_PREFIX>/design_patterns_mcp",
      "directTools": true,
      "env": {
        "LOG_LEVEL": "info",
        "DATABASE_PATH": "./data/design-patterns.db",
        "ENABLE_HYBRID_SEARCH": "true",
        "ENABLE_GRAPH_AUGMENTATION": "true",
        "EMBEDDING_COMPRESSION": "true",
        "ENABLE_FUZZY_LOGIC": "true",
        "ENABLE_TELEMETRY": "true",
        "ENABLE_MULTI_LEVEL_CACHE": "true"
      }
    }
  }
}
```

Example MCP configuration template:
- `resources/unified-process.mcp.example.json`

### Companion pi skills

Referenced support skills:
- `context7`
- `brave-search`
- `web-search`
- `web-fetch`

### CLI/tooling

Core CLI/tooling referenced directly by the skills:
- `npm`
- `npx`
- `mmdc` (`@mermaid-js/mermaid-cli`)
- `docker`
- `docker-compose`

Conditional toolchain candidates also referenced by the skills are listed in:
- `resources/unified-process-dependencies.json`

That file includes the broader optional ecosystem mentioned in `up-tech-stack`, such as `jest`, `pytest`, `playwright`, `cypress`, `k6`, `locust`, `semgrep`, `snyk`, `trivy`, `lighthouse`, `pa11y`, `stryker`, `mutmut`, and others.

## Automated dependency procedure

This repository includes an explicit automation layer to **check**, **bootstrap**, and **template** the MCP/CLI dependencies mentioned by the skills.

### Check dependency status

```bash
npm run deps:check
```

or, after global install:

```bash
up-deps check
```

### Scan skill references against the dependency catalog

```bash
npm run deps:scan
npm run check   # dependency scan + extension syntax + unit tests
npm test        # extension unit tests only
```

## Runtime guarantees

| Capability | The workflow requires | The extension verifies automatically |
|------------|-----------------------|--------------------------------------|
| Artifact I/O boundary | Artifacts stay under `docs/up/` | Yes: save/load reject traversal, absolute paths, encoded traversal, and mixed separator escapes |
| State updates | Only known UP state fields are persisted | Yes: malformed JSON, arrays/primitives, oversized payloads, and unknown fields are rejected |
| Activity completion | Activities advance only from sufficient artifacts | Partially: recovered state uses explicit completion rules and minimum artifact size; semantic completeness remains a skill/reviewer responsibility |
| Integration evidence | Stack/API/smoke/Tier 1 e2e evidence before deploy readiness | Partially: structured JSONL is parsed and all four check types are required, but commands are still executed outside the recording tool |
| Typecheck | Static TypeScript validation | Not yet: `typescript` is not installed in this package, so `npx tsc --noEmit` is a dependency/setup task |

### Install known auto-installable dependencies

```bash
npm run deps:install
```

This now also bootstraps the public `design_patterns_mcp` server automatically when `git` and `bun` are available, then regenerates the MCP template.

To also include supported conditional npm/pip-based tools:

```bash
node ./scripts/setup-dependencies.mjs install-known --include-conditional
```

### Generate an MCP template

```bash
npm run deps:mcp-template
```

## Notes on automation scope

Not every dependency can be installed safely or universally in a single cross-platform script.

Because of that, the automation is intentionally split into:
- **auto-installable** dependencies: portable npm/pip packages plus the git+bun bootstrap for `design_patterns_mcp`
- **system/manual** dependencies: tools such as Docker or OS-level/security-sensitive tooling that depend on platform, credentials, or private infrastructure

This keeps the public package safe, reproducible, and aligned with pi package best practices.

## Publishing notes

Recommended npm package name:
- `@apolosan/unified-process`

Recommended GitHub repository:
- `apolosan/unified_process_pi_extension`

### Release script

```bash
NPM_TOKEN=<automation token with write access to the @apolosan scope> \
  node scripts/publish-release.mjs
```

`scripts/publish-release.mjs` (also available as `npm run release:publish`) refuses to
publish unless every pre-flight condition holds: the version in `package.json` is a
plain semver, the tracked tree matches `HEAD` (override with `--allow-dirty`), the
target version is not already on the registry, `npm run check` passes, and the token
authenticates. The token is read from `$NPM_TOKEN`, never printed, and kept only in a
temporary `0600` npmrc that is deleted when the process exits. After a successful
publish the script re-reads the registry to confirm the new version is live.

The script publishes the **tarball** from a neutral working directory: npm gives the
project `.npmrc` (the one next to `package.json`) a higher precedence than any user
config, so a stale `//registry…:_authToken` line there would otherwise silently
shadow `$NPM_TOKEN`. When the repository has such a line the script says so and
ignores it on purpose.

Useful flags: `--dry-run` (validate and build the tarball without publishing, no token
needed), `--otp <code>` (two-factor code), `--registry <url>` (alternative registry),
`--skip-check`, `--provenance` (only honoured by GitHub Actions / GitLab CI).

## License

MIT
