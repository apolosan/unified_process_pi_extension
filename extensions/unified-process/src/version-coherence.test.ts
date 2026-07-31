/**
 * Cross-doc version coherence — every tracked forward-facing doc that names
 * the package version must mirror package.json#version. Drift between the
 * published version (package.json) and the human-visible version refs
 * (README badge, CHANGELOG head, agents-md manifest) would re-introduce
 * the descompasso that this test was added to catch.
 *
 * The test intentionally does NOT cover AGENTS.md: that file is gitignored
 * (regen-by-convention per gerador-diretrizes-agents-md skill) and its
 * version refs are ephemeral by design. CHANGELOG.md historical entries
 * below the head line are also out of scope — only the head [version]
 * is asserted because it is the surface readers see first.
 *
 * @rf RF-VD-01 README Version badge equals package.json#version
 * @rf RF-VD-02 CHANGELOG head [version] equals package.json#version
 * @rf RF-VD-03 manifest project_version equals package.json#version
 * @rnf RNF-VD-01 drift fails release readiness gate (npm run check)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../../..");

async function loadPackageVersion(): Promise<string> {
	const raw = await readFile(resolve(projectRoot, "package.json"), "utf8");
	const pkg = JSON.parse(raw) as { version?: unknown };
	assert.equal(typeof pkg.version, "string", "package.json must declare a string version");
	const version = pkg.version as string;
	assert.match(version, /^\d+\.\d+\.\d+$/, `package.json#version must be semver (got ${version})`);
	return version;
}

async function loadManifest(): Promise<{ project_version?: unknown }> {
	const raw = await readFile(resolve(projectRoot, ".agent/agents-md-manifest.json"), "utf8");
	return JSON.parse(raw) as { project_version?: unknown };
}

describe("cross-doc version coherence — RF-VD-01..03 / RNF-VD-01", () => {
	it("README Version badge equals package.json#version", async () => {
		const version = await loadPackageVersion();
		const readme = await readFile(resolve(projectRoot, "README.md"), "utf8");
		const match = readme.match(/^\*\*Version:\*\*\s*`([^`]+)`/m);
		assert.ok(match, "README.md must contain a **Version:** `X.Y.Z` line");
		assert.equal(match?.[1], version, `README.md Version badge drift: expected ${version}, got ${match?.[1]}`);
	});

	it("CHANGELOG head [version] entry equals package.json#version", async () => {
		const version = await loadPackageVersion();
		const changelog = await readFile(resolve(projectRoot, "CHANGELOG.md"), "utf8");
		const match = changelog.match(/^##\s*\[([^\]]+)\]/m);
		assert.ok(match, "CHANGELOG.md must contain a top-level ## [X.Y.Z] entry");
		assert.equal(
			match?.[1],
			version,
			`CHANGELOG.md head entry drift: expected [${version}], got [${match?.[1]}]`,
		);
	});

	it("manifest project_version equals package.json#version", async () => {
		const version = await loadPackageVersion();
		const manifest = await loadManifest();
		assert.equal(
			manifest.project_version,
			version,
			`manifest.project_version drift: expected ${version}, got ${manifest.project_version as string}`,
		);
	});

	it("drift in any tracked doc fails the suite (RNF-VD-01)", async () => {
		// Asserts the cross-section invariant in one place: if ALL three
		// pairwise assertions above pass, this aggregate assertion must
		// also pass. If any drift is introduced, the individual tests fail
		// first and this guards against silent test-skip regressions.
		const version = await loadPackageVersion();
		const readme = await readFile(resolve(projectRoot, "README.md"), "utf8");
		const changelog = await readFile(resolve(projectRoot, "CHANGELOG.md"), "utf8");
		const manifest = await loadManifest();

		const readmeVersion = readme.match(/^\*\*Version:\*\*\s*`([^`]+)`/m)?.[1];
		const changelogVersion = changelog.match(/^##\s*\[([^\]]+)\]/m)?.[1];
		const manifestVersion = manifest.project_version;

		const allMatch =
			readmeVersion === version &&
			changelogVersion === version &&
			manifestVersion === version;

		assert.ok(allMatch, `drift detected: README=${readmeVersion}, CHANGELOG=${changelogVersion}, manifest=${String(manifestVersion)}, expected all=${version}`);
	});
});
