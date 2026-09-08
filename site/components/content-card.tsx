import Link from "next/link";
import type { ContentDocument } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/status-pill";

export function ContentCard({ document }: { document: ContentDocument }) {
  return (
    <Link className="content-card" href={`/${document.kind}/${document.slug}`}>
      <div className="content-card-topline">
        <span>{formatDate(document.date)}</span>
        <StatusPill
          status={
            document.status === "planned"
              ? "planned"
              : document.mastery || document.status
          }
        />
      </div>
      <h3>{document.title}</h3>
      <p>{document.summary}</p>
      <div className="tag-row">
        {document.legacy ? <span className="tag">现有笔记</span> : null}
        {document.tags.slice(0, 3).map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
