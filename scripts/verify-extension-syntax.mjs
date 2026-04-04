#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extensionsDir = path.join(rootDir, 'extensions');
const supportedExtensions = new Set(['.ts', '.js', '.mjs']);

function listSourceFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      results.push(...listSourceFiles(fullPath));
      continue;
    }

    if (supportedExtensions.has(path.extname(fullPath))) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function detectPatchArtifacts(source) {
  const issues = [];
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^(<<<<<<<|=======|>>>>>>>)( .*)?$/.test(line)) {
      issues.push(`merge conflict marker at line ${index + 1}`);
    }

    if (/^(diff --git|index [0-9a-f]+\.\.[0-9a-f]+|--- |\+\+\+ |@@ )/.test(line)) {
      issues.push(`patch header marker at line ${index + 1}`);
    }

    const nextLine = lines[index + 1] ?? '';
    if (/^-[^-]/.test(line) && /^\+[^+]/.test(nextLine)) {
      issues.push(`probable pasted unified diff hunk at lines ${index + 1}-${index + 2}`);
    }
  }

  return issues;
}

function parseModule(filePath, source) {
  const extension = path.extname(filePath);
  if (extension === '.ts') {
    stripTypeScriptTypes(source, { mode: 'strip' });
    return;
  }

  const result = spawnSync(process.execPath, ['--check', filePath], {
    cwd: rootDir,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'syntax check failed').trim());
  }
}

const files = listSourceFiles(extensionsDir);
const failures = [];

for (const filePath of files) {
  const source = readFileSync(filePath, 'utf8');
  const issues = detectPatchArtifacts(source);

  try {
    parseModule(filePath, source);
  } catch (error) {
    issues.push(`parser error: ${error.message}`);
  }

  if (issues.length) {
    failures.push({ filePath, issues });
  }
}

if (failures.length) {
  console.error('Unified Process extension verification failed.');
  for (const failure of failures) {
    console.error(`\n- ${path.relative(rootDir, failure.filePath)}`);
    for (const issue of failure.issues) {
      console.error(`  • ${issue}`);
    }
  }
  process.exit(1);
}

console.log(`Verified ${files.length} extension source file(s): syntax and patch-artifact checks passed.`);
