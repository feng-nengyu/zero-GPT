import { ContentCard } from "@/components/content-card";
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
  return (
    <div className="shell page-shell">
      <header className="page-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {documents.length ? (
        <div className="content-grid content-grid-index">
          {documents.map((document) => (
            <ContentCard document={document} key={`${document.kind}-${document.slug}`} />
          ))}
        </div>
      ) : (
        <div className="empty-state">内容会在下一次学习对话后出现在这里。</div>
      )}
    </div>
  );
}
