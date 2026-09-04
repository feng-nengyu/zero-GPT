import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { ProgressBar } from "@/components/progress-bar";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { getAllContent, getCurrentState, getRoadmap } from "@/lib/content";
import { formatDate } from "@/lib/format";

export default function HomePage() {
  const state = getCurrentState();
  const roadmap = getRoadmap();
  const notes = getAllContent("notes").slice(0, 3);
  const blog = getAllContent("blog")[0];
  const project = getAllContent("projects").find((item) => item.featured);

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            {formatDate(state.current.date)} · {state.current.greeting}
          </p>
          <h1>
            正在学习，
            <span>也正在构建。</span>
          </h1>
          <p className="hero-lead">{state.current.headline}</p>
          <div className="hero-meta">
            <span>{state.current.phase}</span>
            <span>{state.current.checkpoint}</span>
            <span>{state.current.study_hours}</span>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href="/roadmap">
              查看当前路线 <span aria-hidden="true">↗</span>
            </Link>
            <Link className="button button-ghost" href="/daily/2026-09-04">
              今天的记录
            </Link>
          </div>
        </div>

        <aside className="today-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Today · 3 Focuses</p>
              <h2>今天只推进三件事</h2>
            </div>
            <span className="live-dot">live</span>
          </div>
          <p className="panel-intent">{state.today.intent}</p>
          <ol className="focus-list">
            {state.today.goals.map((goal, index) => (
              <li key={goal.id}>
                <span className="focus-number">0{index + 1}</span>
                <div>
                  <div className="focus-line">
                    <strong>{goal.lane}</strong>
                    <StatusPill status={goal.status} />
                  </div>
                  <p>{goal.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="metric-strip">
        <div className="shell metric-grid">
          {state.metrics.map((metric) => (
            <div key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
          <div className="metric-note">
            <span>{state.notice.title}</span>
            <strong>{state.notice.text}</strong>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeading
          eyebrow="Learning Map"
          title="五条路线，一条能力主线"
          description="主线负责建立深度，副线负责把能力转化为研究、项目和面试表现。"
          href="/roadmap"
          action="完整 Roadmap"
        />
        <div className="track-grid">
          {roadmap.tracks.map((track) => (
            <article className={`track-card track-${track.color}`} key={track.id}>
              <div className="track-topline">
                <span>{track.label}</span>
                <strong>{track.progress}%</strong>
              </div>
              <h3>{track.title}</h3>
              <p>{track.summary}</p>
              <ProgressBar value={track.progress} color={track.color} />
              <div className="track-next">
                <span>Next</span>
                <p>{track.next}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell">
          <SectionHeading
            eyebrow="Knowledge Base"
            title="最近正在形成的理解"
            description="“已学习”和“已掌握”分开记录。真正掌握需要概念回答与代码证据。"
            href="/notes"
            action="查看全部 Notes"
          />
          {notes.length ? (
            <div className="content-grid">
              {notes.map((note) => (
                <ContentCard document={note} key={note.slug} />
              ))}
            </div>
          ) : (
            <div className="empty-state">第一篇掌握笔记会在下一次学习检查后出现。</div>
          )}
        </div>
      </section>

      <section className="section shell two-column-showcase">
        {project ? (
          <article className="featured-project">
            <p className="eyebrow">Featured Project</p>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <div className="project-orbit" aria-hidden="true">
              <span>autograd</span>
              <span>makemore</span>
              <span>GPT</span>
              <span>systems</span>
            </div>
            <Link className="text-link" href={`/projects/${project.slug}`}>
              打开项目档案 <span aria-hidden="true">↗</span>
            </Link>
          </article>
        ) : null}

        {blog ? (
          <article className="latest-letter">
            <p className="eyebrow">Latest Field Note</p>
            <p className="letter-date">{formatDate(blog.date)}</p>
            <h2>{blog.title}</h2>
            <p>{blog.summary}</p>
            <Link className="text-link" href={`/blog/${blog.slug}`}>
              阅读这篇记录 <span aria-hidden="true">→</span>
            </Link>
          </article>
        ) : null}
      </section>
    </>
  );
}
