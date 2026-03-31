#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog } from './dependency-catalog.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const command = args[0] ?? 'check';
const includeConditional = args.includes('--include-conditional');
const prefixArgIndex = args.indexOf('--prefix');
const installPrefix =
  prefixArgIndex >= 0 && args[prefixArgIndex + 1]
    ? path.resolve(process.cwd(), args[prefixArgIndex + 1])
    : path.join(rootDir, '.up-tools');
const outputArgIndex = args.indexOf('--output');
const outputPath =
  outputArgIndex >= 0 && args[outputArgIndex + 1]
    ? path.resolve(process.cwd(), args[outputArgIndex + 1])
    : path.join(rootDir, 'resources', 'unified-process.mcp.example.json');

function run(bin, binArgs, options = {}) {
  return spawnSync(bin, binArgs, {
    stdio: options.stdio ?? 'pipe',
    encoding: 'utf8',
    cwd: options.cwd ?? rootDir,
  });
}

function commandExists(dep) {
  if (dep.id === 'docker-compose') {
    const direct = run('bash', ['-lc', 'command -v docker-compose >/dev/null']);
    if (direct.status === 0) return true;
    const compose = run('docker', ['compose', 'version']);
    return compose.status === 0;
  }

  if (!dep.command) return false;
  const result = run('bash', ['-lc', `command -v ${dep.command} >/dev/null`]);
  return result.status === 0;
}

function renderMcpTemplate() {
  return {
    mcpServers: {
      'design-patterns': {
        command: '<configure-your-design-patterns-server-command>',
        args: ['<server-args-if-needed>'],
        directTools: true,
        notes:
          'Provide any public/private design-patterns MCP server that exposes the design_patterns_* tools expected by the skills.',
      },
      shadcn: {
        command: 'npx',
        args: ['-y', 'shadcn@latest', 'mcp'],
        directTools: true,
      },
      'radix-mcp-server': {
        command: 'npx',
        args: ['-y', '@gianpieropuleo/radix-mcp-server@latest'],
        directTools: true,
      },
      flyonui: {
        command: 'npx',
        args: ['-y', 'flyonui-mcp'],
        directTools: true,
      },
    },
  };
}

function printCheck() {
  console.log('Unified Process dependency report');
  console.log('=================================');

  console.log('\nMCP servers referenced by the package:');
  for (const dep of catalog.mcpServers) {
    const mode = dep.install.strategy === 'npx-mcp' ? 'portable via npx' : dep.install.strategy;
    console.log(`- ${dep.id} [${dep.level}] -> ${mode}`);
  }

  console.log('\nCompanion pi skills referenced by the package:');
  for (const dep of catalog.companionSkills) {
    console.log(`- ${dep.id} [${dep.level}]`);
  }

  console.log('\nCLI/tooling referenced by the package skills:');
  for (const dep of catalog.cliTools) {
    const available = commandExists(dep) ? 'present' : 'missing';
    console.log(`- ${dep.id} [${dep.level}] -> ${available}`);
  }

  console.log('\nTips:');
  console.log(`- Generate an MCP template with: ${path.basename(process.argv[1])} emit-mcp-template`);
  console.log(`- Install known npm-based tools locally with: ${path.basename(process.argv[1])} install-known`);
  console.log(`- Add --include-conditional to also install conditional npm/pip tools when supported.`);
}

function npmInstall(packages) {
  if (!packages.length) return;
  mkdirSync(installPrefix, { recursive: true });
  const result = run('npm', ['install', '--prefix', installPrefix, '--no-save', ...packages], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function pipInstall(packages) {
  if (!packages.length) return;
  const result = run('python3', ['-m', 'pip', 'install', '--user', ...packages], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function installKnown() {
  const npmPackages = [];
  const pipPackages = [];

  for (const dep of catalog.cliTools) {
    if (dep.level === 'conditional' && !includeConditional) continue;
    if (!dep.install?.autoInstall) continue;

    if (dep.install.strategy === 'npm-package') npmPackages.push(dep.install.package);
    if (dep.install.strategy === 'pip-package') pipPackages.push(dep.install.package);
  }

  console.log('Installing known auto-installable dependencies...');
  if (npmPackages.length) {
    console.log(`- npm packages -> ${npmPackages.join(', ')}`);
    npmInstall(npmPackages);
  }
  if (pipPackages.length) {
    console.log(`- pip packages -> ${pipPackages.join(', ')}`);
    pipInstall(pipPackages);
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(renderMcpTemplate(), null, 2) + '\n', 'utf8');

  console.log('\nDone.');
  console.log(`- Local npm tools: ${installPrefix}`);
  console.log(`- MCP template:    ${outputPath}`);
  console.log('\nManual follow-up still required for:');
  for (const dep of catalog.mcpServers.filter((item) => item.install.strategy === 'manual')) {
    console.log(`- ${dep.id}: ${dep.install.notes}`);
  }
  for (const dep of catalog.cliTools.filter((item) => item.install.strategy === 'system')) {
    console.log(`- ${dep.id}: install via your OS package manager`);
  }
  if (!includeConditional) {
    console.log('\nConditional tools were intentionally skipped. Re-run with --include-conditional if you want the script to install supported optional npm/pip tools.');
  }
}

function emitMcpTemplate() {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(renderMcpTemplate(), null, 2) + '\n', 'utf8');
  console.log(`Wrote ${outputPath}`);
}

switch (command) {
  case 'check':
    printCheck();
    break;
  case 'install-known':
    installKnown();
    break;
  case 'emit-mcp-template':
    emitMcpTemplate();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error('Usage: up-deps [check|install-known|emit-mcp-template] [--include-conditional] [--prefix <dir>] [--output <file>]');
    process.exit(1);
}
