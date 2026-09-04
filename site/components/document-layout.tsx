import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { StatusPill } from "@/components/status-pill";
import type { ContentDocument } from "@/lib/content";
import { kindLabels, trackLabels } from "@/lib/content";
import { formatDate } from "@/lib/format";

export function DocumentLayout({ document }: { document: ContentDocument }) {
  return (
    <article className="shell document-shell">
      <Link className="back-link" href={`/${document.kind}`}>
        ← 返回 {kindLabels[document.kind]}
      </Link>
      <header className="document-header">
        <div className="document-meta">
          <span>{formatDate(document.date)}</span>
          <span>{trackLabels[document.track] || document.track}</span>
          <StatusPill status={document.mastery || document.status} />
        </div>
        <h1>{document.title}</h1>
        <p>{document.summary}</p>
        <div className="tag-row">
          {document.legacy ? <span className="tag">从现有仓库接入</span> : null}
          {document.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>
      {document.legacy ? (
        <aside className="mastery-callout">
          <strong>这份笔记正在等待掌握检查</strong>
          <p>它已经记录了学习过程；通过知识点与最小代码验收后，才会升级为“已掌握”。</p>
        </aside>
      ) : null}
      <Markdown>{document.body}</Markdown>
    </article>
  );
}
