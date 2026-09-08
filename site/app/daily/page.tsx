import type { Metadata } from "next";
import Link from "next/link";
import { getAllContent, getCurrentState, getStudyPlan } from "@/lib/content";
import { StudyPlanner } from "@/components/study-planner";
import { formatDate } from "@/lib/format";
export const metadata: Metadata = { title: "每日待办" };
export default function DailyPage() {
  const state = getCurrentState(),
    entries = getAllContent("daily");
  return (
    <div className="shell page-shell daily-shell">
      <header className="page-intro">
        <p className="eyebrow">LITTLE STEPS, REAL PROGRESS</p>
        <h1>小鱼，今天这样学。</h1>
        <p>看哪节、学多久、接着做什么，都放在这里。选一天，按顺序开始。</p>
      </header>
      <StudyPlanner plan={getStudyPlan()} state={state} />
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
