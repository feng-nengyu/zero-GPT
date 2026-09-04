import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";

const siteRoot = process.cwd();
const contentRoot = path.join(siteRoot, "content");
const legacyNotesRoot = path.resolve(siteRoot, "..", "notes");
const errors = [];

const goalStatuses = new Set(["planned", "in-progress", "done", "carried"]);
const learningStatuses = new Set(["planned", "learning", "checking", "mastered", "published"]);
const tracks = new Set(["karpathy", "cs336", "algorithms", "rag-eval", "vla", "meta"]);
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
    errors.push(`${path.relative(siteRoot, file)}: cannot parse YAML (${error.message})`);
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
    if (pattern.test(raw)) errors.push(`${file}: possible ${label}; remove it before publishing`);
  }
}

const state = readYaml(path.join(contentRoot, "state.yml"));
if (!state.today || !Array.isArray(state.today.goals) || state.today.goals.length !== 3) {
  errors.push("content/state.yml: today.goals must contain exactly three goals");
} else {
  const lanes = new Set(state.today.goals.map((goal) => goal.id));
  for (const id of ["main", "algorithm", "output"]) {
    if (!lanes.has(id)) errors.push(`content/state.yml: missing '${id}' daily focus`);
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
    const relativeFile = path.relative(siteRoot, absoluteFile).replaceAll("\\", "/");
    const slug = path.basename(absoluteFile).replace(/\.mdx?$/, "");
    if (slug.startsWith("TEMPLATE-")) continue;
    if (slugs.has(slug)) errors.push(`${relativeFile}: duplicate slug '${slug}' in ${kind}`);
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
      errors.push(`${relativeFile}: invalid learning status '${document.data.status}'`);
    }

    if (kind === "daily") {
      const goals = document.data.goals;
      if (!Array.isArray(goals) || goals.length !== 3) {
        errors.push(`${relativeFile}: daily goals must contain exactly three items`);
      } else {
        for (const goal of goals) {
          if (!goalStatuses.has(goal.status)) {
            errors.push(`${relativeFile}: invalid daily goal status '${goal.status}'`);
          }
        }
      }
    }

    if (kind === "notes" && document.data.mastery === "mastered") {
      const evidence = document.data.evidence;
      if (!Array.isArray(evidence) || evidence.length < 2) {
        errors.push(`${relativeFile}: mastered notes require conceptual and practical evidence`);
      }
    }
  }
}

if (errors.length) {
  console.error("Learning Lab content validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Learning Lab content is valid.");
