import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import yaml from "js-yaml";
import { validateStudyPlan } from "./study-plan-validation.mjs";
const read = (name) =>
  yaml.load(
    fs.readFileSync(new URL("../content/" + name, import.meta.url), "utf8"),
    { schema: yaml.JSON_SCHEMA },
  );
const original = read("study-plan.yml"),
  state = read("state.yml");
test("published plan fits daily budgets and the rest window", () =>
  assert.deepEqual(validateStudyPlan(original, state), []));
test("extra work cannot silently exceed a day's displayed time", () => {
  const p = structuredClone(original);
  p.days[0].blocks[0].minutes += 15;
  assert.ok(validateStudyPlan(p, state).some((e) => e.includes("time budget")));
});
test("a dated task cannot land in the protected break", () => {
  const p = structuredClone(original);
  p.days.at(-1).date = state.break.start;
  assert.ok(validateStudyPlan(p, state).some((e) => e.includes("rest window")));
});
test("broken references and duplicate local-storage step keys are rejected", () => {
  const p = structuredClone(original);
  p.days[0].blocks[1].id = p.days[0].blocks[0].id;
  p.days[0].question.sources = ["missing"];
  const errors = validateStudyPlan(p, state);
  assert.ok(errors.some((e) => e.includes("duplicate block")));
  assert.ok(errors.some((e) => e.includes("source")));
});
