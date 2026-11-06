#!/usr/bin/env node
/**
 * Reads the output of `n8n execute --rawOutput` (a file path argument) and
 * prints the "Report" node's result. Exits 1 if the report is missing.
 */
import { readFileSync } from "node:fs";

const text = readFileSync(process.argv[2], "utf8");
// n8n prints log lines around the execution JSON; the JSON starts on a line of its own.
const start = text.search(/^\{\s*$/m);
const end = text.lastIndexOf("\n}");
let report;
if (start >= 0 && end > start) {
  try {
    const run = JSON.parse(text.slice(start, end + 2));
    const runData = run?.data?.resultData?.runData ?? {};
    report = runData.Report?.at(-1)?.data?.main?.[0]?.[0]?.json;
    const nodes = Object.keys(runData);
    if (report) report = { ...report, nodesRun: nodes };
  } catch {
    /* fall through */
  }
}
if (!report) {
  process.stderr.write(
    "i18n sync: n8n finished without a Report node result.\n",
  );
  process.exit(1);
}

const lines = [
  `i18n sync (n8n): ${report.status.toUpperCase()}`,
  `  UI strings: ${report.uiStrings} · missing before: ${report.missingBefore} · added: ${report.addedCount}`,
  ...(report.added?.length
    ? ["  added:", ...report.added.map((a) => `    + ${a}`)]
    : []),
  ...(report.stillMissing?.length
    ? ["  still missing:", ...report.stillMissing.map((k) => `    - ${k}`)]
    : []),
  ...(report.placeholderMismatch?.length
    ? [
        "  placeholder mismatch:",
        ...report.placeholderMismatch.map((k) => `    ! ${k}`),
      ]
    : []),
  ...(report.unresolvedCalls?.length
    ? [
        "  t() calls the extractor could not follow:",
        ...report.unresolvedCalls.map((k) => `    ? ${k}`),
      ]
    : []),
  ...(report.translateError ? [`  translate: ${report.translateError}`] : []),
  `  nodes run: ${report.nodesRun.join(" → ")}`,
];
process.stdout.write(`${lines.join("\n")}\n`);
