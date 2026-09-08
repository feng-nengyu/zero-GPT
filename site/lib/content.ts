import type { StudyPlan } from "./study-plan";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type { ExploreData } from "./explore-types";

export type ContentKind = "daily" | "notes" | "blog" | "projects";

export type GoalStatus = "planned" | "in-progress" | "done" | "carried";

export interface DailyGoal {
  id: string;
  lane: string;
  text: string;
  status: GoalStatus;
  carried_from?: string | null;
  evidence?: string | null;
}

export interface ContentDocument {
  slug: string;
  kind: ContentKind;
  title: string;
  date: string;
  summary: string;
  track: string;
  tags: string[];
  status: string;
  mastery?: string;
  evidence: string[];
  featured?: boolean;
  links?: Record<string, string>;
  goals?: DailyGoal[];
  body: string;
  legacy?: boolean;
}

export interface CurrentState {
  site: {
    title: string;
    short_title: string;
    description: string;
    github: string;
  };
  current: {
    date: string;
    greeting: string;
    headline: string;
    phase: string;
    checkpoint: string;
    study_hours: string;
  };
  today: {
    intent: string;
    goals: Array<{
      id: string;
      lane: string;
      text: string;
      status: GoalStatus;
    }>;
  };
  break: { start: string; end: string; resume: string; tentative: boolean };
  question: {
    title: string;
    prompt: string;
    references: Array<{ title: string; url: string; hint: string }>;
  };
  metrics: Array<{ label: string; value: string }>;
  notice: { title: string; text: string };
}

export interface RoadmapTrack {
  id: string;
  title: string;
  label: string;
  progress: number;
  color: string;
  summary: string;
  next: string;
}

export interface RoadmapPhase {
  period: string;
  title: string;
  focus: string;
}

export interface RoadmapData {
  sprint: {
    title: string;
    capacity: string;
    rhythm: string;
    target: string;
    fallback: string;
    checkpoints: Array<{
      period: string;
      title: string;
      result: string;
      stretch: string;
    }>;
  };
  break: {
    start: string;
    end: string;
    resume: string;
    tentative: boolean;
    note: string;
  };
  tracks: RoadmapTrack[];
  phases: RoadmapPhase[];
}

const siteRoot = process.cwd();
const contentRoot = path.join(siteRoot, "content");
const legacyNotesRoot = path.resolve(siteRoot, "..", "notes");

function readYaml<T>(filePath: string): T {
  return yaml.load(fs.readFileSync(filePath, "utf8"), {
    schema: yaml.JSON_SCHEMA,
  }) as T;
}

export function getCurrentState(): CurrentState {
  return readYaml<CurrentState>(path.join(contentRoot, "state.yml"));
}

export function getRoadmap(): RoadmapData {
  return readYaml<RoadmapData>(path.join(contentRoot, "roadmap.yml"));
}

function titleFromBody(body: string, fallback: string): string {
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || fallback;
}

function dateFromFile(filePath: string): string {
  const modified = fs.statSync(filePath).mtime;
  return Number.isNaN(modified.valueOf())
    ? "2026-09-04"
    : modified.toISOString().slice(0, 10);
}

function normalizeDate(value: unknown, fallback: string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return fallback;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return value ? [String(value)] : [];
}

function readDocument(
  filePath: string,
  kind: ContentKind,
  legacy = false,
): ContentDocument {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const slug = path.basename(filePath).replace(/\.mdx?$/, "");
  const fallbackTitle = slug
    .replace(/^P(\d+)-/i, "P$1 · ")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    slug,
    kind,
    title: String(
      parsed.data.title || titleFromBody(parsed.content, fallbackTitle),
    ),
    date: normalizeDate(parsed.data.date, dateFromFile(filePath)),
    summary: String(
      parsed.data.summary ||
        (legacy
          ? "从现有学习仓库接入的技术笔记，等待下一次掌握检查。"
          : "学习过程与技术理解记录。"),
    ),
    track: String(parsed.data.track || (legacy ? "karpathy" : "meta")),
    tags: toArray(parsed.data.tags),
    status: String(parsed.data.status || (legacy ? "checking" : "learning")),
    mastery: parsed.data.mastery
      ? String(parsed.data.mastery)
      : legacy
        ? "checking"
        : undefined,
    evidence: toArray(parsed.data.evidence),
    featured: Boolean(parsed.data.featured),
    links: parsed.data.links as Record<string, string> | undefined,
    goals: parsed.data.goals as DailyGoal[] | undefined,
    body: parsed.content,
    legacy,
  };
}

function markdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => path.join(directory, file));
}

export function getAllContent(kind: ContentKind): ContentDocument[] {
  const authored = markdownFiles(path.join(contentRoot, kind)).map((file) =>
    readDocument(file, kind),
  );

  const legacy =
    kind === "notes"
      ? markdownFiles(legacyNotesRoot)
          .filter((file) => !path.basename(file).startsWith("TEMPLATE-"))
          .map((file) => readDocument(file, kind, true))
      : [];

  return [...authored, ...legacy].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    return byDate || a.title.localeCompare(b.title, "zh-CN");
  });
}

export function getContentBySlug(
  kind: ContentKind,
  slug: string,
): ContentDocument | undefined {
  return getAllContent(kind).find((document) => document.slug === slug);
}

export const kindLabels: Record<ContentKind, string> = {
  daily: "Daily",
  notes: "Notes",
  blog: "Blog",
  projects: "Projects",
};

export const trackLabels: Record<string, string> = {
  karpathy: "Karpathy",
  cs336: "CS336",
  algorithms: "Algorithms",
  "rag-eval": "RAG & Eval",
  vla: "VLA",
  meta: "Learning System",
};

export function getExplore(): ExploreData {
  return readYaml<ExploreData>(path.join(contentRoot, "explore.yml"));
}

export function getStudyPlan(): StudyPlan {
  return readYaml<StudyPlan>(path.join(contentRoot, "study-plan.yml"));
}
