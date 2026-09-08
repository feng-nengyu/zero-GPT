"use client";
import { useState } from "react";
import { ContentCard } from "@/components/content-card";
import { LabIcon } from "./lab-icon";
import type { ContentDocument } from "@/lib/content";
export function ContentIndex({
  eyebrow,
  title,
  description,
  documents,
}: {
  eyebrow: string;
  title: string;
  description: string;
  documents: ContentDocument[];
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("全部");
  const tags = ["全部", ...new Set(documents.flatMap((d) => d.tags))];
  const filtered = documents.filter(
    (d) =>
      (tag === "全部" || d.tags.includes(tag)) &&
      [d.title, d.summary, d.body, ...d.tags]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <div className="shell page-shell">
      <header className="page-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {documents.length > 0 && (
        <>
          <div className="index-tools">
            <label className="search-input">
              <LabIcon name="search" size={18} />
              <input
                aria-label="搜索文章"
                placeholder="找一篇文章、一个知识点…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <span aria-live="polite">{filtered.length} 篇记录</span>
          </div>
          <div className="filter-row" aria-label="文章标签">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                aria-pressed={tag === t}
              >
                {t === "全部" ? t : "# " + t}
              </button>
            ))}
          </div>
        </>
      )}
      {filtered.length ? (
        <div className="content-grid content-grid-index">
          {filtered.map((d) => (
            <ContentCard document={d} key={d.kind + "-" + d.slug} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {documents.length
            ? "没有匹配的内容，换个词试试。"
            : "第一篇文章还在生长，聊完就可以从这里开始。"}
        </div>
      )}
    </div>
  );
}
