import Link from "next/link";
import type { StudyPlan } from "@/lib/study-plan";
export function CourseCurriculum({ plan }: { plan: StudyPlan }) {
  return (
    <section className="study-curriculum">
      <p className="eyebrow">CS336 · THE WHOLE COURSE</p>
      <h2>19 讲，5 个作业，逐块完成。</h2>
      <p>
        下周的动作已经拆到每日；后续每个作业按“课程 → 实现 → 实验 →
        检查”推进。这里的日期与工时是自学预算，按本人实际结果每周校准。
      </p>
      <Link className="text-link" href="/daily#2026-09-14">
        打开下周逐日清单 →
      </Link>
      <div className="curriculum-list">
        {plan.curriculum.map((unit, i) => (
          <details className="curriculum-unit" key={unit.id} open={i === 0}>
            <summary>
              <span className="curriculum-code">
                {unit.id === "guests" ? "+" : unit.id.toUpperCase()}
              </span>
              <span className="curriculum-title">
                <strong>{unit.title}</strong>
                <small>
                  {unit.period} · {unit.budget}
                </small>
              </span>
              <span>展开 ↗</span>
            </summary>
            <div className="curriculum-detail">
              <p>
                <strong>{unit.lectures}</strong>
              </p>
              <p>{unit.summary}</p>
              <ol>
                {unit.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="step-result">
                <strong>完成标准</strong>
                <span>{unit.finish}</span>
              </div>
              <div className="study-links">
                <a href={unit.url} target="_blank" rel="noreferrer">
                  官方课程 / 作业入口 ↗
                </a>
                <Link href="/notes/cs336-course-map">
                  版本、算力与证据说明 →
                </Link>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
