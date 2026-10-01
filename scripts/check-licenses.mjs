import { readFile } from "node:fs/promises";

const lockfileUrl = new URL("../package-lock.json", import.meta.url);
// This fixed repository-relative URL is not user-controlled input.
// eslint-disable-next-line security/detect-non-literal-fs-filename
const lockContents = await readFile(lockfileUrl, "utf8");
const lock = JSON.parse(lockContents);

// Licenses whose terms have been reviewed for this repository's current dependency set.
// New or compound expressions require a human review before being added here.
const reviewedLicenses = new Set([
  "0BSD",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BlueOak-1.0.0",
  "CC-BY-4.0",
  "CC-BY-3.0",
  "CC0-1.0",
  "ISC",
  "MIT",
  "MPL-2.0",
  "Python-2.0",
  "Unlicense",
  "(MIT OR Apache-2.0)",
  "(MIT OR CC0-1.0)",
  "(BSD-3-Clause OR GPL-2.0)",
  "MIT AND Apache-2.0",
  "(MIT AND CC-BY-3.0)",
]);

// These older transitive packages omit SPDX metadata in package-lock. Their
// checked-in LICENSE files were reviewed and identify the MIT license.
const reviewedMissingMetadata = new Map([
  ["busboy@1.6.0", "MIT"],
  ["exit@0.1.2", "MIT"],
  ["streamsearch@1.1.0", "MIT"],
]);

const violations = [];
const counts = new Map();

for (const [path, metadata] of Object.entries(lock.packages)) {
  if (!path.includes("node_modules/") || metadata.link) continue;

  const name = path.slice(
    path.lastIndexOf("node_modules/") + "node_modules/".length,
  );
  const license =
    metadata.license ??
    reviewedMissingMetadata.get(`${name}@${metadata.version}`);

  if (!license) {
    violations.push(
      `${name}@${metadata.version}: falta metadato de licencia y revisión explícita`,
    );
    continue;
  }

  if (!reviewedLicenses.has(license)) {
    violations.push(
      `${name}@${metadata.version}: licencia no revisada (${license})`,
    );
    continue;
  }

  counts.set(license, (counts.get(license) ?? 0) + 1);
}

if (violations.length > 0) {
  console.error(
    "Revisión de licencias requerida:\n" +
      violations.map((item) => `- ${item}`).join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log("Inventario de licencias de dependencias verificado:");
  for (const [license, count] of [...counts].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    console.log(`- ${license}: ${count}`);
  }
  console.log(
    "Las licencias de terceros deben respetarse; este control no sustituye asesoramiento legal.",
  );
}
