#!/usr/bin/env node

/**
 * Publish a release of @apolosan/unified-process to npmjs.com.
 *
 * The script is deliberately conservative: every pre-flight condition that can
 * produce a bad or unrecoverable release (wrong version, dirty tree, already
 * published version, failing quality gate, missing/invalid credentials) is
 * checked BEFORE `npm publish` runs. The token is read from $NPM_TOKEN, is
 * never printed, and only lives in a temporary 0600 npmrc that is removed when
 * the process ends.
 *
 * Usage:
 *   NPM_TOKEN=<automation-token> node scripts/publish-release.mjs
 *   NPM_TOKEN=<automation-token> node scripts/publish-release.mjs --dry-run
 *   NPM_TOKEN=<automation-token> node scripts/publish-release.mjs --otp 123456
 *
 * Options:
 *   --dry-run          build and inspect the tarball, never publish
 *   --otp <code>       two-factor code for the publish step
 *   --provenance       ask npm for a signed provenance statement
 *                      (only supported by GitHub Actions / GitLab CI)
 *   --skip-check       skip the `npm run check` quality gate
 *   --allow-dirty      publish even with uncommitted tracked changes
 *   --registry <url>   alternative registry (default: https://registry.npmjs.org/)
 *   --version <x.y.z>  version to publish (must match package.json#version)
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

const argv = process.argv.slice(2);
const hasFlag = (name) => argv.includes(name);
const flagValue = (name) => {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
};

const dryRun = hasFlag('--dry-run');
const skipCheck = hasFlag('--skip-check');
const allowDirty = hasFlag('--allow-dirty');
const otp = flagValue('--otp');
const provenance = hasFlag('--provenance');
const registry = flagValue('--registry') ?? 'https://registry.npmjs.org/';
const targetVersion = flagValue('--version') ?? pkg.version;

function fail(message, hint) {
  console.error(`✖ ${message}`);
  if (hint) console.error(`  ${hint}`);
  process.exit(1);
}

function step(label) {
  console.log(`\n▸ ${label}`);
}

function ok(message) {
  console.log(`  ✓ ${message}`);
}

function npmCapture(args, env) {
  const result = spawnSync('npm', args, {
    encoding: 'utf8',
    cwd: neutralCwd,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function npmRun(args, env, cwd = rootDir) {
  const result = spawnSync('npm', args, { cwd, env, stdio: 'inherit' });
  return result.status === 0;
}

// ---------------------------------------------------------------- pre-flight

step('Pre-flight');

if (!/^\d+\.\d+\.\d+$/.test(targetVersion)) {
  fail(`invalid version "${targetVersion}"`, 'expected a plain semver X.Y.Z');
}
if (targetVersion !== pkg.version) {
  fail(
    `version mismatch: --version ${targetVersion} ≠ package.json ${pkg.version}`,
    'the tarball version comes from package.json — update it first',
  );
}
ok(`package ${pkg.name}@${targetVersion}`);

const token = process.env.NPM_TOKEN?.trim();
if (!token && !dryRun) {
  fail(
    'NPM_TOKEN is not set',
    'export NPM_TOKEN=<automation token with write access to the @apolosan scope>',
  );
}
ok(token ? 'NPM_TOKEN present (value never printed)' : 'NPM_TOKEN absent — dry run only');

const dirty = spawnSync('git', ['diff', '--quiet', 'HEAD'], { cwd: rootDir }).status !== 0;
if (dirty && !allowDirty) {
  fail(
    'tracked files differ from HEAD — the published tarball would not match any commit',
    'commit the release or pass --allow-dirty',
  );
}
ok(dirty ? 'tracked changes present (allowed via --allow-dirty)' : 'working tree matches HEAD');

// ------------------------------------------------------------------- npmrc

const npmrcDir = mkdtempSync(path.join(tmpdir(), 'up-npmrc-'));
const npmrcPath = path.join(npmrcDir, '.npmrc');
writeFileSync(
  npmrcPath,
  [
    `registry=${registry}`,
    ...(token ? [`//${registry.replace(/^https?:\/\//, '')}/:_authToken=${token}`] : []),
    '',
  ].join('\n'),
  { mode: 0o600 },
);

// npm loads the PROJECT .npmrc (the one next to the package) with a higher
// precedence than any user config, so a stale `//registry…:_authToken` line
// there silently shadows $NPM_TOKEN. Every registry-facing command therefore
// runs from a neutral directory, with the package passed as an argument — the
// project .npmrc is then never loaded.
const neutralCwd = npmrcDir;
const npmEnv = { ...process.env, NPM_CONFIG_USERCONFIG: npmrcPath };
let npmrcRemoved = false;
function cleanup() {
  if (npmrcRemoved) return;
  npmrcRemoved = true;
  rmSync(npmrcDir, { recursive: true, force: true });
}
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

const projectNpmrc = path.join(rootDir, '.npmrc');
if (existsSync(projectNpmrc)) {
  const shadowing = readFileSync(projectNpmrc, 'utf8').includes('_authToken');
  if (shadowing) {
    console.log(
      '  ! the repository has a .npmrc with an auth token — it is ignored on purpose\n' +
        '    (npm would otherwise let it shadow $NPM_TOKEN); delete it if you do not need it',
    );
  }
}

const auth = token ? npmCapture(['whoami', '--registry', registry], npmEnv) : { ok: true, stdout: '(anonymous)', stderr: '' };
if (!auth.ok) {
  cleanup();
  fail(
    'npm authentication failed for the configured registry',
    auth.stderr.trim().split('\n').slice(-1)[0] ?? 'run `npm whoami` to debug',
  );
}
ok(`authenticated as ${auth.stdout.trim()}`);

const published = npmCapture(
  ['view', `${pkg.name}@${targetVersion}`, 'version', '--registry', registry],
  npmEnv,
);
if (published.ok && published.stdout.trim()) {
  cleanup();
  fail(
    `${pkg.name}@${targetVersion} is already published`,
    'pick a new version — SemVer rule 3 forbids re-releasing modified contents',
  );
}
ok(`${targetVersion} is not published yet`);

if (!skipCheck) {
  step('Quality gate (npm run check)');
  if (!npmRun(['run', 'check'], npmEnv)) {
    cleanup();
    fail('npm run check failed — refusing to publish');
  }
  ok('check passed');
}

step('Tarball');
const pack = npmCapture(['pack', rootDir, '--pack-destination', neutralCwd, '--json'], npmEnv);
if (!pack.ok) {
  cleanup();
  fail('npm pack failed', pack.stderr.trim().split('\n').slice(-1)[0]);
}
let tarball = '';
try {
  const info = JSON.parse(pack.stdout)[0];
  tarball = path.join(neutralCwd, info.filename);
  ok(`${info.filename} — ${info.entryCount} files, ${info.size} bytes`);
} catch {
  cleanup();
  fail('could not read the npm pack report', pack.stdout.slice(0, 200));
}

if (dryRun) {
  cleanup();
  console.log('\nDry run finished — nothing was published.');
  process.exit(0);
}

// ------------------------------------------------------------------ publish

step(`Publishing ${pkg.name}@${targetVersion} to ${registry}`);
// The TARBALL is published, not the folder: `npm publish <folder>` switches
// npm to that folder and re-reads its .npmrc, which would hand the release
// to a stale project token instead of $NPM_TOKEN.
const publishArgs = ['publish', tarball, '--access', 'public', '--registry', registry];
if (otp) publishArgs.push(`--otp=${otp}`);
if (provenance) publishArgs.push('--provenance');

if (!npmRun(publishArgs, npmEnv, neutralCwd)) {
  cleanup();
  fail('npm publish failed — nothing was released');
}
ok('npm publish returned success');

const verify = npmCapture(
  ['view', `${pkg.name}@${targetVersion}`, 'version', '--registry', registry],
  npmEnv,
);
cleanup();
if (!verify.ok || verify.stdout.trim() !== targetVersion) {
  fail(
    `post-publish verification failed (registry reports "${verify.stdout.trim()}")`,
    'check the registry state before retrying — a partial publish is not retryable',
  );
}
ok(`registry now serves ${pkg.name}@${targetVersion}`);

console.log(`\nReleased ${pkg.name}@${targetVersion}.`);
console.log('Next: push the commit and tags — git push origin main --follow-tags');
