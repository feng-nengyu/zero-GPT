import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceSiteRoot = path.resolve(scriptsRoot, "..");
const validator = path.join(scriptsRoot, "validate-content.mjs");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "learning-lab-validator-"));
const tempSiteRoot = path.join(tempRoot, "site");
const tempNote = path.join(tempSiteRoot, "content", "notes", "gate-check.md");

function runValidator() {
  return spawnSync(process.execPath, [validator], {
    cwd: tempSiteRoot,
    encoding: "utf8",
  });
}

function noteWith(evidence) {
  const evidenceLines = evidence.map((item) => "  - \"" + item + "\"").join("\n");
  return [
    "---",
    "title: Mastery gate fixture",
    "date: 2026-09-04",
    "summary: Temporary fixture used by the content validator regression test.",
    "track: karpathy",
    "status: mastered",
    "mastery: mastered",
    "evidence:",
    evidenceLines,
    "---",
    "",
    "Temporary test note.",
    "",
  ].join("\n");
}

try {
  fs.cpSync(path.join(sourceSiteRoot, "content"), path.join(tempSiteRoot, "content"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(tempRoot, "notes"), { recursive: true });

  fs.writeFileSync(
    tempNote,
    noteWith([
      "conceptual-input: source material was submitted",
      "practical-scaffold: an experiment was prepared",
    ]),
  );
  const invalid = runValidator();
  const invalidOutput = invalid.stdout + invalid.stderr;
  if (
    invalid.status === 0 ||
    !invalidOutput.includes("missing 'conceptual:' evidence") ||
    !invalidOutput.includes("missing 'practical:' evidence")
  ) {
    throw new Error("Mastery gate accepted input or scaffold evidence");
  }

  fs.writeFileSync(
    tempNote,
    noteWith([
      "conceptual: independently explained the mechanism",
      "practical: ran and interpreted the minimal experiment",
    ]),
  );
  const valid = runValidator();
  if (valid.status !== 0) {
    throw new Error("Mastery gate rejected valid typed evidence\n" + valid.stderr);
  }

  console.log("Learning Lab mastery gate regression test passed.");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
