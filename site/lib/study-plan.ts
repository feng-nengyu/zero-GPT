export interface StudyBlock {
  id: string;
  kind: "watch" | "read" | "code" | "check" | "algorithm" | "output";
  minutes: number;
  title: string;
  task: string;
  done: string;
  sources: string[];
}
export interface StudyDay {
  date: string;
  week: string;
  title: string;
  outcome: string;
  minutes: number;
  blocks: StudyBlock[];
  question: { prompt: string; sources: string[] };
}
export interface StudyPlan {
  curriculum: {
    id: string;
    title: string;
    lectures: string;
    period: string;
    budget: string;
    summary: string;
    steps: string[];
    finish: string;
    url: string;
  }[];
  updated: string;
  version: string;
  timing_note: string;
  boundary: string;
  hardware: string;
  sources: Record<string, { title: string; url: string }>;
  weeks: {
    id: string;
    label: string;
    period: string;
    target: string;
    note: string;
  }[];
  days: StudyDay[];
}
export function minutesLabel(minutes: number) {
  const hours = Math.floor(minutes / 60),
    rest = minutes % 60;
  return hours ? `${hours}h${rest ? ` ${rest}m` : ""}` : `${rest} 分钟`;
}
