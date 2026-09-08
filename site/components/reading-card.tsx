import type { Reading } from "@/lib/explore-types";
export function ReadingCard({
  item,
  compact = false,
}: {
  item: Reading;
  compact?: boolean;
}) {
  return (
    <article className={`reading-card ${compact ? "reading-compact" : ""}`}>
      <div className="reading-meta">
        <span>
          {item.type} · {item.topic}
        </span>
        <span>先读 {item.minutes} min</span>
      </div>
      <h3>
        <a href={item.url} target="_blank" rel="noreferrer">
          {item.title}
          <span aria-hidden="true"> ↗</span>
        </a>
      </h3>
      <p>{item.summary}</p>
      {!compact && (
        <div className="reading-start">
          <strong>从这里开始</strong>
          <p>{item.start}</p>
        </div>
      )}
      <span className="reading-author">{item.author}</span>
    </article>
  );
}
