import Link from "next/link";
import { getAllContent, getCurrentState, getExplore } from "@/lib/content";
import { QuestionCard } from "@/components/question-card";
import { FocusBoard } from "@/components/focus-board";
import { FragmentCard } from "@/components/fragment-card";
import { ReadingCard } from "@/components/reading-card";
import { DeskArt } from "@/components/desk-art";
import { StatusPill } from "@/components/status-pill";
import { LabIcon } from "@/components/lab-icon";
import { formatDate } from "@/lib/format";
export default function HomePage() {
  const state = getCurrentState(),
    explore = getExplore();
  const notes = getAllContent("notes")
    .filter((n) => !n.legacy)
    .slice(0, 2);
  const blog = getAllContent("blog")[0];
  return (
    <div className="shell desk-shell">
      <div className="desk-topline">
        <span>
          <span className="presence-dot" /> 一间持续生长的 Learning Lab
        </span>
        <Link href="/write">
          <LabIcon name="pen" size={16} /> 写下一个想法
        </Link>
      </div>
      <section className="welcome-card">
        <div className="welcome-copy">
          <p className="eyebrow">HELLO, CURIOUS MIND.</p>
          <h1>
            学一点，做一点，
            <br />
            <span>世界就大一点。</span>
          </h1>
          <p>
            我是 Nengyu。在这里学大模型、做实验，
            <br className="desktop-break" />
            也收集那些让人忍不住说「原来如此」的瞬间。
          </p>
          <div className="welcome-tags">
            <span>⌘ Karpathy → CS336</span>
            <span>◌ 保持好奇，持续构建</span>
          </div>
        </div>
        <DeskArt />
        <span className="art-caption">a small corner for big ideas</span>
      </section>
      <div className="desk-main-grid">
        <FocusBoard state={state} />
        <div className="desk-side-stack">
          <FragmentCard fragments={explore.fragments} />
          <div className="rest-note">
            <span>☁</span>
            <p>
              <strong>跑步，也是今天的一部分。</strong>
              <br />
              每天留 1 小时锻炼。9.19–29 暂歇，
              <br />
              暂定 9.30 回来，国庆在校学习。
            </p>
          </div>
        </div>
      </div>
      <QuestionCard question={state.question} />
      <section className="desk-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">GROWING IN MY GARDEN</p>
            <h2>慢慢沉淀，成为自己的。</h2>
          </div>
          <Link className="text-link" href="/blog">
            所有博客 <LabIcon name="arrow" size={16} />
          </Link>
        </div>
        <div className="garden-grid">
          {blog && (
            <Link className="journal-card" href={`/blog/${blog.slug}`}>
              <div className="journal-art" aria-hidden="true">
                <span className="notebook">
                  ideas
                  <br />
                  <i>
                    & little
                    <br />
                    steps.
                  </i>
                  <span>✳</span>
                </span>
                <span className="journal-spark">✦</span>
              </div>
              <div className="journal-copy">
                <span className="entry-label">
                  我的博客 · {formatDate(blog.date)}
                </span>
                <h3>{blog.title}</h3>
                <p>{blog.summary}</p>
                <span className="text-link">翻开这一页 ↗</span>
              </div>
            </Link>
          )}
          <div className="note-stack">
            {notes.map((note) => (
              <Link
                className="note-row"
                key={note.slug}
                href={`/notes/${note.slug}`}
              >
                <div className="note-row-top">
                  <span>知识笔记</span>
                  <StatusPill
                    status={
                      note.status === "planned"
                        ? "planned"
                        : note.mastery || note.status
                    }
                  />
                </div>
                <h3>{note.title}</h3>
                <p>{note.summary}</p>
                <span className="note-row-arrow">↗</span>
              </Link>
            ))}
            <Link className="all-notes" href="/notes">
              查看知识笔记 <span>学过和掌握，分别记录 →</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="desk-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">A LITTLE DETOUR</p>
            <h2>累了？去别处看看。</h2>
          </div>
          <Link className="text-link" href="/explore">
            逛逛书架 <LabIcon name="arrow" size={16} />
          </Link>
        </div>
        <div className="reading-grid home-readings">
          {[explore.readings[0], explore.readings[1], explore.readings[5]]
            .filter(Boolean)
            .map((item) => (
              <ReadingCard item={item} compact key={item.id} />
            ))}
        </div>
      </section>
      <Link className="roadmap-ribbon" href="/roadmap">
        <span className="ribbon-icon">
          <LabIcon name="roadmap" size={24} />
        </span>
        <div>
          <strong>半马前，争取走进 CS336。</strong>
          <p>L5 → L6 → Build GPT → CS336 L1 / A1 切片</p>
        </div>
        <span>看看地图 ↗</span>
      </Link>
    </div>
  );
}
