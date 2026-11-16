import { readFile } from "node:fs/promises";

for (const relative of [
  "../coverage/domain/coverage-summary.json",
  "../coverage/mobile/coverage-summary.json",
]) {
  // Only the two fixed coverage artifacts above can be read.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const contents = await readFile(new URL(relative, import.meta.url), "utf8");
  const report = JSON.parse(contents);
  for (const [file, metrics] of Object.entries(report)) {
    if (file === "total") continue;
    if (metrics.lines.pct < 80 || metrics.branches.pct < 70)
      throw new Error(`Cobertura insuficiente por archivo: ${file}`);
  }
}
console.log("Cobertura por archivo: al menos 80% líneas y 70% ramas.");
