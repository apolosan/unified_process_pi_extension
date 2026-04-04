# Unified Process pi Extension

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

Registered tools:
- `up_save_artifact`
- `up_load_artifact`
- `up_update_state`
- `up_list_artifacts`

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
npm run check
```

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

## License

MIT
