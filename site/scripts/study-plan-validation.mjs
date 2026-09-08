export function validateStudyPlan(plan, state) {
  const errors = [],
    fail = (msg) => errors.push("study-plan.yml: " + msg);
  const text = (x) => typeof x === "string" && x.trim().length > 0;
  const date = (x) =>
    typeof x === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(x) &&
    !Number.isNaN(Date.parse(x + "T00:00:00Z")) &&
    new Date(x + "T00:00:00Z").toISOString().startsWith(x);
  const https = (x) => {
    try {
      return new URL(x).protocol === "https:";
    } catch {
      return false;
    }
  };
  if (!plan || typeof plan !== "object")
    return ["study-plan.yml: missing plan"];
  for (const field of ["version", "timing_note", "boundary", "hardware"])
    if (!text(plan[field])) fail("missing " + field);
  if (!date(plan.updated)) fail("invalid updated date");
  const sources = plan.sources || {};
  for (const [id, source] of Object.entries(sources)) {
    if (!text(source?.title) || !https(source?.url))
      fail("invalid HTTPS source " + id);
  }
  const refs = (ids, label, required = false) => {
    if (
      !Array.isArray(ids) ||
      (required && !ids.length) ||
      ids.some((id) => !Object.hasOwn(sources, id))
    )
      fail("unknown or missing source in " + label);
  };
  const weeks = Array.isArray(plan.weeks) ? plan.weeks : [];
  if (!weeks.length || new Set(weeks.map((w) => w.id)).size !== weeks.length)
    fail("missing or duplicate week");
  for (const w of weeks)
    for (const f of ["id", "label", "period", "target", "note"])
      if (!text(w[f])) fail("missing week " + f);
  const days = Array.isArray(plan.days) ? plan.days : [];
  if (!days.length) fail("missing days");
  const seen = new Set(),
    kinds = new Set(["watch", "read", "code", "check", "algorithm", "output"]);
  let previous = "";
  for (const day of days) {
    const label = day.date || "day";
    if (!date(day.date) || seen.has(day.date) || day.date < previous)
      fail("invalid, duplicate or unordered date " + label);
    previous = day.date;
    seen.add(day.date);
    if (
      state.break &&
      day.date >= state.break.start &&
      day.date <= state.break.end
    )
      fail("task scheduled in rest window: " + label);
    if (!weeks.some((w) => w.id === day.week))
      fail("unknown week for " + label);
    for (const field of ["title", "outcome"])
      if (!text(day[field])) fail("missing " + label + " " + field);
    const blocks = Array.isArray(day.blocks) ? day.blocks : [];
    if (
      blocks.filter((b) => b.kind === "algorithm").length !== 1 ||
      blocks.filter((b) => b.kind === "output").length !== 1 ||
      !blocks.some((b) => ["watch", "read", "code", "check"].includes(b.kind))
    )
      fail("day must have three focuses: " + label);
    if (
      !Number.isInteger(day.minutes) ||
      day.minutes < 1 ||
      day.minutes > 300 ||
      blocks.reduce((sum, b) => sum + b.minutes, 0) !== day.minutes
    )
      fail("invalid daily time budget: " + label);
    const ids = new Set();
    for (const b of blocks) {
      for (const field of ["id", "title", "task", "done"])
        if (!text(b[field])) fail("missing block " + field + " in " + label);
      if (ids.has(b.id)) fail("duplicate block ID in " + label);
      ids.add(b.id);
      if (!kinds.has(b.kind) || !Number.isInteger(b.minutes) || b.minutes < 1)
        fail("invalid block kind or minutes in " + label);
      refs(
        b.sources,
        label + "/" + b.id,
        b.kind === "watch" || b.kind === "read",
      );
    }
    if (!text(day.question?.prompt)) fail("missing question in " + label);
    refs(day.question?.sources, label + " question", true);
  }
  if (!days.some((d) => d.date === state.current?.date))
    fail("current state has no detailed day plan");
  const units = Array.isArray(plan.curriculum) ? plan.curriculum : [];
  for (const id of ["a1", "a2", "a3", "a4", "a5", "guests"])
    if (units.filter((u) => u.id === id).length !== 1)
      fail("missing or duplicate curriculum " + id);
  for (const u of units) {
    for (const f of [
      "title",
      "lectures",
      "period",
      "budget",
      "summary",
      "finish",
    ])
      if (!text(u[f])) fail("missing curriculum " + f);
    if (
      !https(u.url) ||
      !Array.isArray(u.steps) ||
      !u.steps.length ||
      u.steps.some((s) => !text(s))
    )
      fail("invalid curriculum sources or steps");
  }
  return errors;
}
