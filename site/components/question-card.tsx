import Link from "next/link";
import type { CurrentState } from "@/lib/content";
export function QuestionCard({
  question,
}: {
  question: CurrentState["question"];
}) {
  if (!question) return null;
  return (
    <section className="question-card">
      <div className="question-marker" aria-hidden="true">
        ?
      </div>
      <div className="question-content">
        <p className="eyebrow">{question.title} · 等待你的想法</p>
        <h2>{question.prompt}</h2>
        <p className="question-hint">
          先用自己的话想一想。卡住了也没关系，参考就在下面。
        </p>
        <details className="question-references">
          <summary>
            想过了，看看参考 <span>↗</span>
          </summary>
          <div className="reference-list">
            {question.references.map((r) => (
              <a href={r.url} key={r.url} target="_blank" rel="noreferrer">
                <strong>{r.title} ↗</strong>
                <span>{r.hint}</span>
              </a>
            ))}
          </div>
          <p className="micro-copy">
            看完可以把理解发给我，或写进草稿；阅读本身不会变更掌握状态。
          </p>
        </details>
        <div className="question-actions">
          <Link href="/write">记下我的理解 →</Link>
          <Link href="/notes/activation-initialization-batchnorm">
            查看这道题的学习记录 ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
