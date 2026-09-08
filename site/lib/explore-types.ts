export interface Reading {
  id: string;
  title: string;
  author: string;
  type: "博客" | "论文" | "教程" | "项目";
  topic: string;
  minutes: number;
  url: string;
  summary: string;
  start: string;
}
export interface Fragment {
  id: string;
  topic: string;
  question: string;
  answer: string;
  source: string;
  source_title: string;
}
export interface ExploreData {
  checked: string;
  readings: Reading[];
  fragments: Fragment[];
}
