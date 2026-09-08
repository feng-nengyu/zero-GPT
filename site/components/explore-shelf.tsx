"use client";
import { useState } from "react";
import type { Reading } from "@/lib/explore-types";
import { ReadingCard } from "./reading-card";
import { LabIcon } from "./lab-icon";
export function ExploreShelf({ readings }: { readings: Reading[] }) {
  const [topic, setTopic] = useState("全部");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Reading | null>(null);
  const topics = ["全部", ...new Set(readings.map((r) => r.topic))];
  const visible = readings.filter(
    (r) =>
      (topic === "全部" || r.topic === topic) &&
      [r.title, r.topic, r.summary, r.author]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  function pick() {
    const pool = visible.filter((r) => r.id !== picked?.id);
    const candidates = pool.length ? pool : visible;
    setPicked(
      candidates[Math.floor(Math.random() * candidates.length)] || null,
    );
  }
  return (
    <>
      <div className="shelf-tools">
        <label className="search-input">
          <LabIcon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(null);
            }}
            placeholder="搜一个好奇的词…"
            aria-label="搜索阅读书架"
          />
        </label>
        <button
          className="button button-primary"
          onClick={pick}
          disabled={!visible.length}
        >
          <LabIcon name="shuffle" size={17} /> 帮我挑一篇
        </button>
      </div>
      <div className="filter-row" aria-label="阅读主题">
        {topics.map((t) => (
          <button
            key={t}
            aria-pressed={topic === t}
            onClick={() => {
              setTopic(t);
              setPicked(null);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {picked && (
        <aside className="picked-reading" aria-live="polite">
          <p className="eyebrow">这次，试试这一篇</p>
          <ReadingCard item={picked} />
          <button className="text-button" onClick={() => setPicked(null)}>
            收起推荐
          </button>
        </aside>
      )}
      <div className="reading-grid">
        {visible.map((r) => (
          <ReadingCard key={r.id} item={r} />
        ))}
      </div>
      {!visible.length && (
        <p className="empty-state">书架里暂时没有这个词。换一个关键词试试。</p>
      )}
    </>
  );
}
