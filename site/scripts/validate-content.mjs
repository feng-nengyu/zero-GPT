import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";

const siteRoot = process.cwd();
const contentRoot = path.join(siteRoot, "content");
const legacyNotesRoot = path.resolve(siteRoot, "..", "notes");
const errors = [];

const goalStatuses = new Set(["planned", "in-progress", "done", "carried"]);
const learningStatuses = new Set([
  "planned",
  "learning",
  "checking",
  "mastered",
  "published",
]);
const masteryStatuses = new Set(["learning", "checking", "mastered"]);
const tracks = new Set([
  "karpathy",
  "cs336",
  "algorithms",
  "rag-eval",
  "vla",
  "meta",
]);
const secretPatterns = [
  [/\bsk-[A-Za-z0-9_-]{20,}\b/g, "OpenAI-style API key"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/g, "GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/g, "AWS access key"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, "private key"],
];

function readYaml(file) {
  try {
    return yaml.load(fs.readFileSync(file, "utf8"), {
      schema: yaml.JSON_SCHEMA,
    });
  } catch (error) {
    errors.push(
      `${path.relative(siteRoot, file)}: cannot parse YAML (${error.message})`,
    );
    return {};
  }
}

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => path.join(directory, name));
}

function requireString(data, field, file) {
  if (typeof data[field] !== "string" || !data[field].trim()) {
    errors.push(`${file}: missing non-empty '${field}'`);
  }
}

function scanSecrets(file, raw) {
  for (const [pattern, label] of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(raw))
      errors.push(`${file}: possible ${label}; remove it before publishing`);
  }
}

function hasEvidenceKind(evidence, kind) {
  return (
    Array.isArray(evidence) &&
    evidence.some(
      (item) =>
        typeof item === "string" &&
        item
          .trim()
          .toLowerCase()
          .startsWith(kind + ":"),
    )
  );
}

const state = readYaml(path.join(contentRoot, "state.yml"));
if (
  !state.today ||
  !Array.isArray(state.today.goals) ||
  state.today.goals.length !== 3
) {
  errors.push(
    "content/state.yml: today.goals must contain exactly three goals",
  );
} else {
  const lanes = new Set(state.today.goals.map((goal) => goal.id));
  for (const id of ["main", "algorithm", "output"]) {
    if (!lanes.has(id))
      errors.push(`content/state.yml: missing '${id}' daily focus`);
  }
  for (const goal of state.today.goals) {
    if (!goalStatuses.has(goal.status)) {
      errors.push(`content/state.yml: invalid goal status '${goal.status}'`);
    }
  }
}

const roadmap = readYaml(path.join(contentRoot, "roadmap.yml"));
if (!Array.isArray(roadmap.tracks) || roadmap.tracks.length !== 5) {
  errors.push("content/roadmap.yml: expected five learning tracks");
}

for (const kind of ["daily", "notes", "blog", "projects"]) {
  const slugs = new Set();
  const files = markdownFiles(path.join(contentRoot, kind));
  if (kind === "notes") files.push(...markdownFiles(legacyNotesRoot));

  for (const absoluteFile of files) {
    const relativeFile = path
      .relative(siteRoot, absoluteFile)
      .replaceAll("\\", "/");
    const slug = path.basename(absoluteFile).replace(/\.mdx?$/, "");
    if (slug.startsWith("TEMPLATE-")) continue;
    if (slugs.has(slug))
      errors.push(`${relativeFile}: duplicate slug '${slug}' in ${kind}`);
    slugs.add(slug);

    const raw = fs.readFileSync(absoluteFile, "utf8");
    scanSecrets(relativeFile, raw);
    const document = matter(raw);
    const isLegacy = !absoluteFile.startsWith(contentRoot);
    if (isLegacy) continue;

    for (const field of ["title", "summary", "track", "status"]) {
      requireString(document.data, field, relativeFile);
    }
    if (!tracks.has(document.data.track)) {
      errors.push(`${relativeFile}: invalid track '${document.data.track}'`);
    }
    if (!learningStatuses.has(document.data.status)) {
      errors.push(
        `${relativeFile}: invalid learning status '${document.data.status}'`,
      );
    }

    if (kind === "daily") {
      const goals = document.data.goals;
      if (!Array.isArray(goals) || goals.length !== 3) {
        errors.push(
          `${relativeFile}: daily goals must contain exactly three items`,
        );
      } else {
        for (const goal of goals) {
          if (!goalStatuses.has(goal.status)) {
            errors.push(
              `${relativeFile}: invalid daily goal status '${goal.status}'`,
            );
          }
        }
      }
    }

    if (kind === "notes") {
      if (!masteryStatuses.has(document.data.mastery)) {
        errors.push(
          `${relativeFile}: notes require mastery: learning | checking | mastered`,
        );
      }
      if (!Array.isArray(document.data.evidence)) {
        errors.push(`${relativeFile}: notes require an evidence array`);
      }
      if (document.data.mastery === "mastered") {
        const evidence = document.data.evidence;
        if (!hasEvidenceKind(evidence, "conceptual")) {
          errors.push(
            `${relativeFile}: mastered note is missing 'conceptual:' evidence`,
          );
        }
        if (!hasEvidenceKind(evidence, "practical")) {
          errors.push(
            `${relativeFile}: mastered note is missing 'practical:' evidence`,
          );
        }
      }
    }
  }
}

// Curated resources are references, never learner mastery evidence.
function requireHttps(value, file) {
  try {
    if (new URL(value).protocol !== "https:") throw new Error("scheme");
  } catch {
    errors.push(file + ": expected an absolute HTTPS source link");
  }
}
const explorePath = path.join(contentRoot, "explore.yml");
const explore = readYaml(explorePath);
if (!/^\d{4}-\d{2}-\d{2}$/.test(explore.checked || ""))
  errors.push("explore.yml: missing checked date");
for (const [collection, fields] of [
  ["readings", ["id", "title", "author", "type", "topic", "summary", "start"]],
  ["fragments", ["id", "topic", "question", "answer", "source_title"]],
]) {
  const items = explore[collection];
  if (!Array.isArray(items) || !items.length) {
    errors.push("explore.yml: expected non-empty " + collection);
    continue;
  }
  const ids = new Set();
  for (const item of items) {
    const label = "explore.yml:" + collection + ":" + item.id;
    for (const field of fields) requireString(item, field, label);
    if (ids.has(item.id)) errors.push(label + ": duplicate ID");
    ids.add(item.id);
    requireHttps(collection === "readings" ? item.url : item.source, label);
    if (collection === "readings") {
      if (!["博客", "论文", "教程", "项目"].includes(item.type))
        errors.push(label + ": invalid type");
      if (!Number.isInteger(item.minutes) || item.minutes < 1)
        errors.push(label + ": invalid minutes");
    }
  }
}
for (const file of ["state.yml", "roadmap.yml", "explore.yml"]) {
  scanSecrets(file, fs.readFileSync(path.join(contentRoot, file), "utf8"));
}
if (
  !state.question ||
  !state.question.prompt ||
  !Array.isArray(state.question.references) ||
  !state.question.references.length
) {
  errors.push("state.yml: current question requires reference readings");
} else {
  for (const ref of state.question.references) {
    requireString(ref, "title", "state.yml:question");
    requireString(ref, "hint", "state.yml:question");
    requireHttps(ref.url, "state.yml:question");
  }
}
if (!state.break || !roadmap.break) {
  errors.push("state.yml/roadmap.yml: missing break window");
} else {
  for (const field of ["start", "end", "resume"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(state.break[field] || ""))
      errors.push("state.yml: invalid break date");
    if (state.break[field] !== roadmap.break[field])
      errors.push("state.yml/roadmap.yml: break dates disagree");
  }
  if (
    state.break.start > state.break.end ||
    state.break.resume <= state.break.end
  ) {
    errors.push("state.yml: invalid break order");
  }
}
const currentDaily = path.join(
  contentRoot,
  "daily",
  state.current.date + ".md",
);
if (!fs.existsSync(currentDaily)) {
  errors.push("state.yml: current date must link to an existing daily entry");
} else {
  const goals = matter(fs.readFileSync(currentDaily, "utf8")).data.goals || [];
  if (
    goals.length !== 3 ||
    goals.some(
      (g) =>
        !state.today.goals.some(
          (s) => s.id === g.id && s.text === g.text && s.status === g.status,
        ),
    )
  ) {
    errors.push("state.yml: today's goals must match the current daily entry");
  }
}

if (errors.length) {
  console.error("Learning Lab content validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Learning Lab content is valid.");
