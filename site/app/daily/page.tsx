import type { Metadata } from "next";
import Link from "next/link";
import { getAllContent, getCurrentState } from "@/lib/content";
import { FocusBoard } from "@/components/focus-board";
import { QuestionCard } from "@/components/question-card";
import { formatDate } from "@/lib/format";
export const metadata: Metadata = { title: "每日待办" };
export default function DailyPage() {
  const state = getCurrentState(),
    entries = getAllContent("daily");
  return (
    <div className="shell page-shell">
      <header className="page-intro">
        <p className="eyebrow">ONE DAY AT A TIME</p>
        <h1>今天，从一小步开始。</h1>
        <p>主线学习、一点算法、留下自己的记录。国庆前，专心把基础学扎实。</p>
      </header>
      <div className="daily-board">
        <FocusBoard state={state} />
      </div>
      <QuestionCard question={state.question} />
      <section className="daily-history">
        <div className="section-top">
          <h2>走过的日子</h2>
          <span className="micro-copy">只记实际发生的学习，不补空白日期</span>
        </div>
        {entries.map((d) => (
          <Link href={`/daily/${d.slug}`} className="daily-entry" key={d.slug}>
            <time>{formatDate(d.date)}</time>
            <div>
              <h3>{d.title}</h3>
              <p>{d.summary}</p>
            </div>
            <span>↗</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
