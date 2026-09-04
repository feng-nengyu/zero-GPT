import type { Metadata } from "next";
import { ProgressBar } from "@/components/progress-bar";
import { getRoadmap } from "@/lib/content";

export const metadata: Metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  const roadmap = getRoadmap();

  return (
    <div className="shell page-shell">
      <header className="page-intro page-intro-wide">
        <p className="eyebrow">Roadmap · 2026 → 2027</p>
        <h1>从基础理解，到可证明的技术能力</h1>
        <p>
          Karpathy 建立实现直觉，CS336 补齐系统训练能力；算法、RAG 评测和 VLA
          把这些能力连接到面试、工程与研究。
        </p>
      </header>

      <section className="roadmap-tracks">
        {roadmap.tracks.map((track, index) => (
          <article className="roadmap-row" key={track.id}>
            <span className="roadmap-index">0{index + 1}</span>
            <div className="roadmap-copy">
              <div className="roadmap-titleline">
                <div>
                  <span className="roadmap-label">{track.label}</span>
                  <h2>{track.title}</h2>
                </div>
                <strong>{track.progress}%</strong>
              </div>
              <p>{track.summary}</p>
              <ProgressBar value={track.progress} color={track.color} />
              <div className="roadmap-next">
                <span>当前下一步</span>
                <p>{track.next}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="phase-section">
        <p className="eyebrow">Milestones</p>
        <h2>阶段安排</h2>
        <div className="phase-list">
          {roadmap.phases.map((phase, index) => (
            <article key={phase.period}>
              <div className="phase-marker">
                <span>{index + 1}</span>
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
    </div>
  );
}
