#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allDependencies } from './dependency-catalog.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const skillsDir = path.join(rootDir, 'skills');
const verify = process.argv.includes('--verify');

function listSkillFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      const skillFile = path.join(fullPath, 'SKILL.md');
      try {
        if (statSync(skillFile).isFile()) result.push(skillFile);
      } catch {}
    }
  }
  return result.sort();
}

const skillFiles = listSkillFiles(skillsDir);
const report = [];
let missing = 0;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesPattern(text, pattern) {
  const normalized = pattern.toLowerCase();
  if (/^[a-z0-9+-]+$/i.test(normalized)) {
    const regex = new RegExp(`(^|[^a-z0-9+_-])${escapeRegExp(normalized)}([^a-z0-9+_-]|$)`, 'i');
    return regex.test(text);
  }
  return text.includes(normalized);
}

for (const dep of allDependencies) {
  const hits = [];
  for (const file of skillFiles) {
    const text = readFileSync(file, 'utf8').toLowerCase();
    const matched = (dep.scanPatterns ?? []).some((pattern) => matchesPattern(text, pattern));
    if (matched) hits.push(path.relative(rootDir, file));
  }
  if (!hits.length) missing += 1;
  report.push({ dep, hits });
}

console.log('Unified Process skill dependency scan');
console.log('=====================================');
for (const { dep, hits } of report) {
  console.log(`- [${dep.type}] ${dep.id} -> ${hits.length ? hits.join(', ') : 'NO MATCHES'}`);
}

if (verify) {
  if (missing > 0) {
    console.error(`\nVerification failed: ${missing} dependency entries have no matching skill references.`);
    process.exit(1);
  }
  console.log('\nVerification passed.');
}
