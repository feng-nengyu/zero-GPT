import type { Metadata } from "next";
import Link from "next/link";
import { getRoadmap } from "@/lib/content";
export const metadata: Metadata = { title: "学习地图" };
export default function RoadmapPage() {
  const roadmap = getRoadmap();
  return (
    <div className="shell page-shell">
      <header className="page-intro">
        <p className="eyebrow">A FOCUSED PATH</p>
        <h1>把主线走紧，把基础学实。</h1>
        <p>
          Karpathy → CS336，按知识依赖衔接。国庆前专心课程，RAG
          评测暂缓，休息期不补学习债。
        </p>
      </header>
      <section className="sprint-panel">
        <p className="eyebrow">NEXT CHECKPOINT · 09 / 18</p>
        <h2>{roadmap.sprint.title}</h2>
        <p>{roadmap.sprint.target}</p>
        <div className="sprint-capacity">
          <span>{roadmap.sprint.capacity}</span>
          <span>{roadmap.sprint.rhythm}</span>
        </div>
        <div className="sprint-steps">
          {roadmap.sprint.checkpoints.map((c) => (
            <article key={c.period}>
              <span>{c.period}</span>
              <h3>{c.title}</h3>
              <p>{c.result}</p>
              <details>
                <summary>有余力再做</summary>
                <p>{c.stretch}</p>
              </details>
            </article>
          ))}
        </div>
        <p className="sprint-fallback">{roadmap.sprint.fallback}</p>
        <Link className="text-link" href="/notes/cs336-course-map">
          进入条件、作业完成标准与版本说明 ↗
        </Link>
      </section>
      <aside className="roadmap-rest">☁ {roadmap.break.note}</aside>
      <section className="phase-section">
        <p className="eyebrow">AN AMBITIOUS, ADJUSTABLE TIMELINE</p>
        <h2>接下来，逐个完成。</h2>
        <div className="phase-list">
          {roadmap.phases.map((phase, i) => (
            <article key={phase.period}>
              <div className="phase-marker">
                <span>{i + 1}</span>
              </div>
              <div>
                <p className="phase-period">{phase.period}</p>
                <h3>{phase.title}</h3>
                <p>{phase.focus}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="roadmap-tracks">
        <p className="eyebrow">WHERE EACH THREAD STANDS</p>
        {roadmap.tracks.map((track, i) => (
          <article className="roadmap-row" key={track.id}>
            <span className="roadmap-index">0{i + 1}</span>
            <div className="roadmap-copy">
              <div className="roadmap-titleline">
                <div>
                  <span className="roadmap-label">{track.label}</span>
                  <h2>{track.title}</h2>
                </div>
              </div>
              <p>{track.summary}</p>
              <div className="roadmap-next">
                <span>下一步</span>
                <p>{track.next}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
